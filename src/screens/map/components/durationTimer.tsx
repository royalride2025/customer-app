import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleGuide } from '../../../../StyleGuide';

interface DurationTimerProps {
  isActive: boolean;
  durationHours: number;
  bookingId: string;
  onTimerExpired?: () => void;
}

interface TimerState {
  isActive: boolean;
  startTime: number;
  totalDuration: number; // in milliseconds
  remainingTime: number; // in milliseconds
  isExpired: boolean; // track if timer has expired
}

const DurationTimer: React.FC<DurationTimerProps> = ({
  isActive,
  durationHours,
  bookingId,
  onTimerExpired
}) => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log('⏰ DurationTimer component mounted:', { 
      isActive, 
      durationHours, 
      bookingId,
      timestamp: new Date().toLocaleTimeString()
    });
    
    return () => {
      console.log('⏰ DurationTimer component unmounting:', { 
        hadTimerState: !!timerState,
        timestamp: new Date().toLocaleTimeString()
      });
    };
  }, []);

  // Format time utility function
  const formatTime = useCallback((milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Save timer state to AsyncStorage
  const saveTimerState = useCallback(async (timerData: TimerState) => {
    try {
      const key = `durationTimer_${bookingId}`;
      await AsyncStorage.setItem(key, JSON.stringify(timerData));
      console.log('💾 Timer state saved to storage:', timerData);
    } catch (error) {
      console.error('❌ Failed to save timer state:', error);
    }
  }, [bookingId]);

  // Load timer state from AsyncStorage
  const loadTimerState = useCallback(async () => {
    try {
      const key = `durationTimer_${bookingId}`;
      const savedTimer = await AsyncStorage.getItem(key);
      
      if (savedTimer) {
        const timerData = JSON.parse(savedTimer);
        const now = Date.now();
        const elapsed = now - timerData.startTime;
        const remaining = Math.max(0, timerData.totalDuration - elapsed);
        
        if (remaining > 0) {
          // Timer is still valid, restore it
          const restoredTimer = {
            ...timerData,
            remainingTime: remaining,
            isExpired: false
          };
          setTimerState(restoredTimer);
          console.log('⏰ Timer restored from storage:', { 
            remaining, 
            total: timerData.totalDuration,
            elapsed: elapsed / 1000 / 60, // in minutes
            startTime: new Date(timerData.startTime).toLocaleTimeString()
          });
          return true;
        } else {
          // Timer expired, but keep it visible with expired state
          const expiredTimer = {
            ...timerData,
            remainingTime: 0,
            isExpired: true
          };
          setTimerState(expiredTimer);
          console.log('⏰ Timer expired, showing expired state');
          if (onTimerExpired) {
            onTimerExpired();
          }
          return true; // Return true to prevent starting new timer
        }
      } else {
        console.log('⏰ No existing timer found in storage');
      }
    } catch (error) {
      console.error('❌ Failed to load timer state:', error);
    }
    return false;
  }, [bookingId, onTimerExpired]);

  // Clear timer state from AsyncStorage
  const clearTimerState = useCallback(async () => {
    try {
      const key = `durationTimer_${bookingId}`;
      await AsyncStorage.removeItem(key);
      console.log('🗑️ Timer state cleared from storage');
    } catch (error) {
      console.error('❌ Failed to clear timer state:', error);
    }
  }, [bookingId]);

  // Start duration timer
  const startDurationTimer = useCallback(async () => {
    // Don't start if timer is already active
    if (timerState?.isActive) {
      console.log('⏰ Timer already active, not starting new one');
      return;
    }
    
    const totalDurationMs = durationHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const startTime = Date.now();
    
    const timerData: TimerState = {
      isActive: true,
      startTime,
      totalDuration: totalDurationMs,
      remainingTime: totalDurationMs,
      isExpired: false
    };
    
    setTimerState(timerData);
    
    // Save timer state to AsyncStorage for persistence
    await saveTimerState(timerData);
    
    console.log('⏰ Duration timer started:', { durationHours, totalDurationMs, startTime });
  }, [durationHours, saveTimerState, timerState?.isActive]);

  // Stop duration timer
  const stopDurationTimer = useCallback(async () => {
    setTimerState(null);
    // Clear timer state from AsyncStorage
    await clearTimerState();
    console.log('⏰ Duration timer stopped');
  }, [clearTimerState]);

  // Effect to load timer state when component mounts or isActive changes
  useEffect(() => {
    console.log('⏰ DurationTimer useEffect triggered:', { isActive, hasTimerState: !!timerState });
    
    if (isActive) {
      // First try to load existing timer state
      loadTimerState().then((hasExistingTimer) => {
        console.log('⏰ Timer restoration result:', { hasExistingTimer });
        // Only start a new timer if no existing timer was found
        if (!hasExistingTimer) {
          console.log('⏰ Starting new timer - no existing timer found');
          startDurationTimer();
        } else {
          console.log('⏰ Using existing timer - no new timer needed');
        }
      });
    } else if (timerState?.isActive) {
      // Don't stop the timer completely, just pause it
      // This way the state is preserved in AsyncStorage
      console.log('⏰ Pausing timer - isActive became false (preserving state)');
      // We don't call stopDurationTimer() here to preserve the timer state
    }
  }, [isActive, loadTimerState, startDurationTimer, stopDurationTimer, timerState?.isActive]);

  // Timer countdown effect - updates every second
  useEffect(() => {
    if (timerState?.isActive && timerState.remainingTime > 0) {
      const timerInterval = setInterval(() => {
        setTimerState(prev => {
          if (!prev) return null;
          
          const newRemaining = Math.max(0, prev.remainingTime - 1000);
          
                  if (newRemaining <= 0) {
          // Timer expired
          console.log('⏰ Duration timer expired!');
          if (onTimerExpired) {
            onTimerExpired();
          }
          
          // Mark timer as expired instead of clearing it
          const expiredState = {
            ...prev,
            remainingTime: 0,
            isExpired: true
          };
          
          // Save expired state to AsyncStorage
          saveTimerState(expiredState);
          
          return expiredState;
        }
          
          // Save updated state
          const updatedState = {
            ...prev,
            remainingTime: newRemaining
          };
          saveTimerState(updatedState);
          
          return updatedState;
        });
      }, 1000);
      
      return () => clearInterval(timerInterval);
    }
  }, [timerState?.isActive, timerState?.remainingTime, saveTimerState, clearTimerState, onTimerExpired]);

  // Don't render anything if timer is not active and not expired
  if (!timerState?.isActive && !timerState?.isExpired) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      timerState.isExpired && styles.expiredContainer
    ]}>
      <Text style={[
        styles.label,
        timerState.isExpired && styles.expiredLabel
      ]}>
        {timerState.isExpired ? 'Time Status' : 'Remaining Time'}
      </Text>
      <Text style={[
        styles.timer,
        timerState.isExpired && styles.expiredTimer
      ]}>
        {timerState.isExpired ? 'TIME OVER' : formatTime(timerState.remainingTime)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:20
   
  },
  expiredContainer: {
    backgroundColor: '#ff4444', // Red background for expired state
  },
  label: {
    color: StyleGuide.color.primary,
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.semiBold,
    marginBottom: 4,
  },
  expiredLabel: {
    color: StyleGuide.color.white,
  },
  timer: {
    color: 'red',
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  expiredTimer: {
    color: StyleGuide.color.white,
    fontWeight: 'bold',
  },
});

export default DurationTimer;
