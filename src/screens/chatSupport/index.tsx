import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import { StyleGuide } from '../../../StyleGuide';
import { 
  getResponsiveSize,
  getResponsiveFontSize,
  isSmallScreen,
  isLargeScreen, } from '../../lib/responsiveStyles';
import Svg from '../../lib/svg';
import { backArrow, sendIcon } from '../../../assets/svgAssets';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppSelector } from '../../redux/reduxHooks';
import { RootState } from '../../redux/store';
import socketService from '../../services/socket';

// Define message type
interface SupportMessage {
  id: string;
  text: string;
  senderId: string;
  senderType: 'customer' | 'support';
  timestamp: Date;
  status: 'sending' | 'delivered' | 'failed';
}

const SupportChat = () => {
  const user = useAppSelector((state: RootState) => state?.auth?.user);
  const userProfile = useAppSelector((state: RootState) => state?.profile?.data);
  console.log('userProfile', userProfile?.profile?.customer_profile?.name);
  const route = useRoute();
  const navigation = useNavigation();
  
  console.log('routes', route);
  console.log('👤 Current user:', user);

  // Support-specific state
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [supportAgentStatus, setSupportAgentStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const flatListRef = useRef<FlatList<SupportMessage> | null>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  
  // Support agent information
  const supportAgent = {
    id: 'support_001',
    name: 'Sarah Johnson',
    role: 'Customer Support Specialist',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    online: true,
    responseTime: '2-5 minutes'
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: '1',
      text: 'Hi! Welcome to Royal Ride Support. We typically reply within 2 hours. How can we help you today?',
      senderId: 'support',
      senderType: 'support',
      timestamp: new Date(),
      status: 'delivered'
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Message identification for support chat
  const isMessageFromCurrentUser = (message) => {
    const currentUserId = user?.id;
    
    if (!currentUserId) {
      console.warn('⚠️ User ID not available for message comparison');
      return false;
    }
    
    return message.senderId === currentUserId || message.senderType === 'customer';
  };
console.log('user=====', user);
  // Socket connection and message handling
  useEffect(() => {
    if (!user?.id) {
      console.log('⏳ Waiting for user to load before setting up socket...');
      return;
    }

    console.log('🔌 Setting up support socket listeners and connection...');
    
    // Socket connection events
    const handleConnect = () => {
      console.log('✅ Support socket connected:', socketService.getSocketId());
      setSocketConnected(true);
      
                // Support chat is ready when connected
          setTimeout(() => {
            if (user && user.role) {
              const userId = user.id;
              console.log('🔐 Support chat ready for user:', { userId, userType: 'customer' });
            }
          }, 100);
    };

    const handleDisconnect = () => {
      console.log('❌ Support socket disconnected');
      setSocketConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.log('🚫 Support socket connection error:', error);
      setSocketConnected(false);
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying support socket connection...');
        if (!socketService.isConnected()) {
          socketService.connect();
        }
      }, 5000);
    };

          // Incoming support reply handler
      const handleSupportReply = (data: any) => {
        console.log('📨 Support reply from admin:', JSON.stringify(data));
        
        const message: SupportMessage = {
          id: data.messageId || data.id || `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: data.text || data.message || data.reply || '',
          senderId: data.senderId || data.adminId || 'support',
          senderType: 'support',
          timestamp: new Date(data.timestamp || data.createdAt || Date.now()),
          status: 'delivered'
        };
        
        // Skip messages from current user to prevent duplicates
        if (message.senderId === user?.id) {
          console.log('🚫 Skipping own support message to prevent duplicate');
          return;
        }
        
        // Add message to state
        setMessages(prev => [...prev, message]);
        console.log('✅ Support reply added to messages:', message);
        
        // Scroll to bottom for new messages
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      };
    
    // Listen for support agent status updates
    const handleAgentStatus = (data: any) => {
      if (data.agentId === supportAgent.id) {
        setSupportAgentStatus(data.status);
        console.log(`👤 Support agent ${data.agentId} status: ${data.status}`);
      }
    };
    
    // Add event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);
    socketService.on('supportReply', handleSupportReply);
    socketService.on('agentStatus', handleAgentStatus);

    // Initial connection attempt
    if (!socketService.isConnected()) {
      console.log('🚀 Initiating support socket connection...');
      socketService.connect();
    } else {
      handleConnect();
    }

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.emit('heartbeat');
        console.log('💓 Support heartbeat sent');
      }
    }, 20000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up support socket listeners...');
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('supportReply', handleSupportReply);
      socketService.off('agentStatus', handleAgentStatus);
      clearInterval(heartbeatInterval);
    };
      }, [user?.id]);

  // Send message function
  const sendMessage = () => {
    if (!inputText.trim() || !user?.id) return;

    const newMessage = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: inputText.trim(),
      senderId: user.id,
      senderType: 'customer',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Emit message via socket
    if (socketService.isConnected()) {
      socketService.emit('supportMessage', {
        text: newMessage.text,
        userId: user.id,
        userRole: 'customer',
        userName: userProfile?.profile?.customer_profile?.name || 'Customer',
        userPhone: userProfile?.user?.phone || ''
      });
      console.log('📤 Support message sent via socket:', newMessage.text);
    }

    // Update message status to delivered after a delay
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 1000);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced render message for support
  const renderMessage = ({ item }: { item: SupportMessage }) => {
    const isFromCurrentUser = isMessageFromCurrentUser(item);
    
    return (
      <View style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.userMessage : styles.supportMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.userBubble : styles.supportBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.userMessageText : styles.supportMessageText
          ]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </Text>
          {isFromCurrentUser && (
            <Text style={[
              styles.status,
              item.status === 'sending' && styles.sendingStatus,
              item.status === 'delivered' && styles.deliveredStatus,
              item.status === 'failed' && styles.failedStatus
            ]}>
              {item.status === 'sending' ? '◐' : item.status === 'failed' ? '✗' : '✓'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.supportMessage]}>
        <View style={[styles.messageBubble, styles.supportBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]} />
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: [0.3, 0.3, 1, 0.3],
                }),
              },
            ]} />
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.66, 1],
                  outputRange: [0.3, 0.3, 1],
                }),
              },
            ]} />
          </View>
        </View>
      </View>
    );
  };

  const getAgentStatusText = () => {
    if (supportAgentStatus === 'online') {
      return 'Online now';
    } else if (supportAgentStatus === 'away') {
      return 'Away';
    } else {
      return 'Offline';
    }
  };

  // Test function to check socket connection
  const testSocketConnection = () => {
    console.log('🧪 Testing socket connection...');
    console.log('Socket connected:', socketService.isConnected());
    console.log('Socket ID:', socketService.getSocketId());
    
    // Test emit
    if (socketService.isConnected()) {
      socketService.emit('test', { message: 'Test message' });
      console.log('✅ Test message emitted');
    } else {
      console.log('❌ Socket not connected');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={StyleGuide.color.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Svg xml={backArrow} rest={{height:20,width:28,style:{marginRight:10}}}/>
          </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarText}>
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', lineHeight: getResponsiveSize(40), fontSize: getResponsiveFontSize(18) }}>S</Text>
              </View>
              <View style={[
                styles.statusDot, 
                supportAgentStatus === 'online' && styles.onlineStatus
              ]} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Support</Text>
              <Text style={styles.headerSubtitle}>
                {getAgentStatusText()}
              </Text>
              <Text style={styles.responseTime}>
                Typically replies within 2 hours
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Chat Container with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        />



        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message to support..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            {inputText.trim() && (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!inputText.trim()}
              >
                <Svg xml={sendIcon} rest={{height:35,width:35}} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
    paddingBottom: getResponsiveSize(20),
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: StyleGuide.color.primary,
    paddingTop: Platform.OS === 'ios' ? getResponsiveSize(10) : getResponsiveSize(20),
    paddingBottom: getResponsiveSize(15),
    paddingRight: getResponsiveSize(20),
    paddingLeft: getResponsiveSize(10),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: getResponsiveSize(12),
  },
  avatarText: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: StyleGuide.color.secondary,
    color: 'white',
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: getResponsiveSize(40),
  },
  statusDot: {
    position: 'absolute',
    bottom: getResponsiveSize(2),
    right: getResponsiveSize(2),
    width: getResponsiveSize(12),
    height: getResponsiveSize(12),
    borderRadius: getResponsiveSize(6),
    backgroundColor: '#6b7280',
    borderWidth: getResponsiveSize(2),
    borderColor: StyleGuide.color.primary,
  },
  onlineStatus: {
    backgroundColor: '#10b981',
  },
  headerInfo: {
    flex: 1,
    marginTop: 10
  },
  headerTitle: {
    color: StyleGuide.color.blackishGrey,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: getResponsiveFontSize(16),
  },
  headerSubtitle: {
    color: StyleGuide.color.grey,
    fontSize: getResponsiveFontSize(11),
    fontFamily: StyleGuide.fontFamily.medium,
    marginTop: getResponsiveSize(2),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: StyleGuide.color.secondary,
    paddingHorizontal: getResponsiveSize(12),
    paddingVertical: getResponsiveSize(6),
    borderRadius: getResponsiveSize(16),
    marginRight: getResponsiveSize(8),
  },
  testButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(12),
    fontFamily: StyleGuide.fontFamily.medium,
  },
  optionsButton: {
    padding: getResponsiveSize(8),
  },
  optionsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: getResponsiveFontSize(20),
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: getResponsiveSize(16),
  },
  messagesContent: {
    paddingVertical: getResponsiveSize(20),
    paddingBottom: getResponsiveSize(10), // Reduced bottom padding
  },
  messageContainer: {
    marginBottom: getResponsiveSize(16),
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: isSmallScreen ? '85%' : isLargeScreen ? '75%' : '80%',
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(12),
    borderRadius: getResponsiveSize(20),
  },
  userBubble: {
    backgroundColor: StyleGuide.color.secondary,
    borderBottomRightRadius: getResponsiveSize(4),
  },
  supportBubble: {
    backgroundColor: StyleGuide.color.white,
    borderBottomLeftRadius: getResponsiveSize(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingBubble: {
    paddingVertical: getResponsiveSize(16),
  },
  messageText: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: StyleGuide.fontFamily.medium,
    lineHeight: getResponsiveSize(20),
  },
  userMessageText: {
    color: 'white',
  },
  supportMessageText: {
    color: StyleGuide.color.grey,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsiveSize(4),
    paddingHorizontal: getResponsiveSize(4),
  },
  timestamp: {
    fontSize: getResponsiveFontSize(11),
    color: StyleGuide.color.lightGrey,
    marginRight: getResponsiveSize(4),
  },
  status: {
    fontSize: getResponsiveFontSize(12),
    fontWeight: 'bold',
  },
  sendingStatus: {
    color: '#9ca3af',
  },
  deliveredStatus: {
    color: '#10b981',
  },
  failedStatus: {
    color: '#ef4444',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: getResponsiveSize(8),
    height: getResponsiveSize(8),
    borderRadius: getResponsiveSize(4),
    backgroundColor: '#6b7280',
    marginHorizontal: getResponsiveSize(2),
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: getResponsiveSize(16),
    paddingTop: getResponsiveSize(12),
    paddingBottom: getResponsiveSize(16), // Reduced from bottom safe area
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    // marginBottom: getResponsiveSize(8),

  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: getResponsiveSize(24),
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(8),
    marginBottom: getResponsiveSize(8),
  },
  textInput: {
    flex: 1,
    fontSize: getResponsiveFontSize(14),
    color: StyleGuide.color.grey,
    maxHeight: getResponsiveSize(100),
    paddingVertical: getResponsiveSize(8),
    fontFamily: StyleGuide.fontFamily.medium,
  },
  sendButton: {
    width: getResponsiveSize(36),
    height: getResponsiveSize(36),
    borderRadius: getResponsiveSize(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: getResponsiveSize(8),
  },
  inputHint: {
    fontSize: getResponsiveFontSize(12),
    color: StyleGuide.color.grey,
    fontFamily: StyleGuide.fontFamily.medium,
    textAlign: 'center',
  },

  categoriesTitle: {
    fontSize: getResponsiveFontSize(14),
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.blackishGrey,
    marginBottom: getResponsiveSize(8),
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  categoryButton: {
    width: '45%', // Adjust as needed for grid layout
    aspectRatio: 1.2,
    borderRadius: getResponsiveSize(12),
    backgroundColor: '#f3f4f6',
    marginVertical: getResponsiveSize(5),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: StyleGuide.color.secondary,
    borderColor: StyleGuide.color.secondary,
  },
  categoryIcon: {
    fontSize: getResponsiveFontSize(24),
    marginBottom: getResponsiveSize(5),
  },
  categoryText: {
    fontSize: getResponsiveFontSize(12),
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.grey,
  },
  categoryTextActive: {
    color: 'white',
  },
  responseTime: {
    fontSize: getResponsiveFontSize(11),
    color: StyleGuide.color.grey,
    marginTop: getResponsiveSize(2),
  },
});

export default SupportChat;