import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import socketService from '../../services/socket';

interface UseSocketReconnectionOptions {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useSocketReconnection = (options: UseSocketReconnectionOptions = {}) => {
  const {
    autoReconnect = true,
    reconnectDelay = 5000,
    maxReconnectAttempts = 10,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const user = useAppSelector((state: RootState) => state.auth.user);
  const token = useAppSelector((state: RootState) => state.auth.token);

  // Handle socket connection
  const handleConnect = useCallback(() => {
    console.log('✅ Socket connected:', socketService.getSocketId());
    setIsConnected(true);
    setReconnectAttempts(0);
    setIsConnecting(false);
    
    // Auto-register when connected (with small delay to ensure socket is ready)
    setTimeout(() => {
      if (user && user.role) {
        const userId = user.id;
        socketService.emit('register', { 
          userId: userId, 
          userType: user.role 
        });
        console.log('🔐 Auto-registered socket:', { userId, userType: user.role });
      }
    }, 100);

    // Call custom onConnect callback
    if (onConnect) {
      onConnect();
    }
  }, [user, onConnect]);

  // Handle socket disconnection
  const handleDisconnect = useCallback(() => {
    console.log('❌ Socket disconnected');
    setIsConnected(false);
    setIsConnecting(false);
    
    // Call custom onDisconnect callback
    if (onDisconnect) {
      onDisconnect();
    }
  }, [onDisconnect]);

  // Handle connection errors
  const handleConnectError = useCallback((error: any) => {
    console.log('🚫 Socket connection error:', error);
    console.log('🚫 Error details:', JSON.stringify(error, null, 2));
    setIsConnected(false);
    setIsConnecting(false);
    
    // Call custom onError callback
    if (onError) {
      onError(error);
    }

    // Auto-reconnect logic
    if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
      setReconnectAttempts(prev => prev + 1);
      console.log(`🔄 Retrying socket connection... (Attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!socketService.isConnected()) {
          setIsConnecting(true);
          socketService.connect(token || undefined);
        }
      }, reconnectDelay);
    } else if (reconnectAttempts >= maxReconnectAttempts) {
      console.log('💀 Max reconnection attempts reached');
    }
  }, [autoReconnect, reconnectAttempts, maxReconnectAttempts, reconnectDelay, token, onError]);

  // Manual reconnection function
  const reconnect = useCallback(() => {
    console.log('🔄 Manually reconnecting socket...');
    setIsConnecting(true);
    setReconnectAttempts(0);
    
    if (token) {
      socketService.connect(token || undefined);
      console.log('🔌 Socket reconnection initiated with token');
    } else {
      console.log('⚠️ No token available for socket reconnection');
      setIsConnecting(false);
    }
  }, [token]);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    console.log('🔌❌ Manually disconnecting socket...');
    socketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setReconnectAttempts(0);
  }, []);

  // Add event listener function
  const addEventListener = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketService.isConnected()) {
      socketService.on(event, callback);
      console.log(`👂 Added ${event} event listener`);
      return true;
    } else {
      console.log(`⚠️ Cannot add ${event} listener: Socket not connected`);
      return false;
    }
  }, []);

  // Remove event listener function
  const removeEventListener = useCallback((event: string, callback?: (...args: any[]) => void) => {
    socketService.off(event, callback);
    console.log(`👂❌ Removed ${event} event listener`);
  }, []);

  // Emit event function
  const emitEvent = useCallback((event: string, ...args: any[]) => {
    if (socketService.isConnected()) {
      socketService.emit(event, ...args);
      console.log(`📤 Emitted ${event} event:`, args);
      return true;
    } else {
      console.log(`⚠️ Cannot emit ${event}: Socket not connected`);
      return false;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    // Add event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);
    
    // Initial connection attempt
    if (!socketService.isConnected()) {
      console.log('🚀 Initiating socket connection...');
      setIsConnecting(true);
      socketService.connect(token || undefined);
    } else {
      // If already connected, trigger the connect handler
      handleConnect();
    }

    // Update connection status
    setIsConnected(socketService.isConnected());

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
    };
  }, [handleConnect, handleDisconnect, handleConnectError, token]);

  return {
    // State
    isConnected,
    isConnecting,
    reconnectAttempts,
    
    // Functions
    reconnect,
    disconnect,
    addEventListener,
    removeEventListener,
    emitEvent,
    
    // Utility functions
    getSocketId: () => socketService.getSocketId(),
    getConnectionState: () => socketService.getConnectionState()
  };
}; 