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

const CustomerClientChat = ({ clientName = "Usman Virk", clientAvatar = "US", isClientOnline = true }) => {
  const user = useAppSelector((state: RootState) => state?.auth?.user);
  const route = useRoute();
  const navigation = useNavigation();
  // const { driverId, bookingId, driverName, driverImage } = (route.params as any) || {};
  console.log('routes',route)
  console.log("Customer chat params:", { driverId, bookingId, driverName, driverImage });
  console.log('👤 Current customer user:', user);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const currentBooking = useAppSelector((state: RootState) => state.booking.currentBooking);
  // const driverId= currentBooking?.driver_id;
  // const bookingId= currentBooking?.booking_id;
  // const driverName= currentBooking?.driver?.name;
  // const driverImage= currentBooking?.driver?.profile_image;

  const driverId= currentBooking?.driver_id||currentBooking?.driver_id?._id;
  const bookingId= currentBooking?.booking_id||currentBooking?._id;
  const driverName= currentBooking?.driver?.name||currentBooking?.driver_profile?.name;
  const driverImage= currentBooking?.driver?.profile_image||currentBooking?.driver_profile?.driver_img;
  // Initialize with sample messages once user is loaded
  useEffect(() => {
    if (user?.id && driverId && messages.length === 0) {
      console.log('🔄 Initializing customer sample messages with correct IDs');
      const initialMessages = [
       
      ];
      setMessages(initialMessages);
      console.log('✅ Customer sample messages initialized:', initialMessages);
    }
  }, [user?.id, driverId]);

  // Improved message identification function for customer side
  const isMessageFromCurrentUser = (message) => {
    const currentUserId = user?.id;
    
    if (!currentUserId) {
      console.warn('⚠️ Customer User ID not available for message comparison');
      return false;
    }
    
    // Primary check: senderId matches current user
    if (message.senderId === currentUserId) {
      return true;
    }
    
    // Secondary check: senderType is 'customer' and user is customer
    if (message.senderType === 'customer' && user?.role === 'customer') {
      return true;
    }
    
    console.log('🔍 Customer message identification:', {
      messageId: message.id,
      messageSenderId: message.senderId,
      messageSenderType: message.senderType,
      currentUserId: currentUserId,
      userRole: user?.role,
      isFromCurrentUser: false
    });
    
    return false;
  };

  // Socket connection and message handling
  useEffect(() => {
    if (!user?.id) {
      console.log('⏳ Waiting for customer user to load before setting up socket...');
      return;
    }

    console.log('🔌 Setting up customer socket listeners and connection...');
    
    // Socket connection events
    const handleConnect = () => {
      console.log('✅ Customer socket connected:', socketService.getSocketId());
      setSocketConnected(true);
      
      // Auto-register when connected
      setTimeout(() => {
        if (user && user.role) {
          const userId = user.id;
          socketService.emit('register', { 
            userId: userId, 
            userType: user.role 
          });
          console.log('🔐 Customer auto-registered socket:', { userId, userType: user.role });
          
          // Join booking chat room
          socketService.emit('joinBookingChat', { 
            bookingId: bookingId, 
            userId: userId 
          });
          console.log('💬 Customer joined booking chat:', { bookingId: bookingId, userId });
          
          // Get chat history
          socketService.emit('getMessages', { 
            bookingId: bookingId, 
            userId: userId 
          }, (response: any) => {
            if (response.messages && response.messages.length > 0) {
              console.log('📜 Customer chat history received:', response.messages);
              // Format messages to include sender information
              const formattedMessages = response.messages.map((msg: any) => ({
                id: msg.id || `history_${Date.now()}_${Math.random()}`,
                text: msg.message || msg.text || '',
                senderId: msg.senderId || msg.sender_id || '',
                senderType: msg.senderType || (msg.senderId === user?.id ? 'customer' : 'driver'),
                timestamp: new Date(msg.timestamp || msg.createdAt || Date.now()),
                status: 'delivered'
              }));
              
              // Replace sample messages with real history
              setMessages(formattedMessages);
              console.log('✅ Customer messages updated with chat history');
            } else {
              console.log('📜 No customer chat history found, keeping sample messages');
            }
          });
        }
      }, 100);
    };

    const handleDisconnect = () => {
      console.log('❌ Customer socket disconnected');
      setSocketConnected(false);
    };

    const handleConnectError = (error: any) => {
      console.log('🚫 Customer socket connection error:', error);
      setSocketConnected(false);
      
      // Retry connection after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying customer socket connection...');
        if (!socketService.isConnected()) {
          socketService.connect();
        }
      }, 5000);
    };

    // Improved incoming message handler for customer
    const handleNewMessage = (data: any) => {
      console.log('📨 Customer new message received:', data);
      
      // Extract message data with multiple fallbacks
      const messageText = data.messageText || data.message || data.text || data.content || '';
      const messageId = data.messageId || data.id || `received_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const senderId = data.senderId || data.sender_id || data.userId || '';
      
      // IMPORTANT: Skip messages from current user to prevent duplicates
      if (senderId === user?.id) {
        console.log('🚫 Customer skipping own message to prevent duplicate:', {
          messageId,
          senderId,
          currentUserId: user?.id,
          localMessageId: data.localMessageId
        });
        
        // If this is our own message coming back, just update the status of existing message
        if (data.localMessageId) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === data.localMessageId 
                ? { ...msg, status: 'delivered', id: messageId } // Update with server ID
                : msg
            )
          );
        }
        return;
      }
      
      // Improved sender type determination for non-current user messages
      let senderType;
      if (data.senderType) {
        senderType = data.senderType;
      } else if (senderId === driverId) {
        senderType = 'driver';
      } else {
        senderType = 'driver'; // Default to driver for received messages on customer side
      }
      
      const timestamp = data.timestamp || data.createdAt || data.created_at || Date.now();
      
      console.log('📨 Customer processed incoming message:', {
        messageId,
        messageText,
        senderId,
        senderType,
        currentUserId: user?.id,
        driverId,
        timestamp
      });
      
      // Prevent duplicate messages
      setMessages(prev => {
        const messageExists = prev.some(msg => 
          msg.id === messageId ||
          (msg.text === messageText && 
           msg.senderId === senderId && 
           Math.abs(new Date(msg.timestamp).getTime() - new Date(timestamp).getTime()) < 5000)
        );
        
        if (messageExists) {
          console.log('🔄 Customer duplicate message detected, skipping');
          return prev;
        }
        
        const newMessage = {
          id: messageId,
          text: messageText,
          senderId: senderId,
          senderType: senderType,
          timestamp: new Date(timestamp),
          status: 'delivered'
        };
        
        console.log('✅ Customer adding new received message:', newMessage);
        return [...prev, newMessage];
      });
      
      // Scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };
    
    // Listen for user status updates
    const handleUserStatus = (data: any) => {
      const { userId, online, userType } = data;
      setUserStatus(data);
      console.log(`👤 Customer sees user ${userId} (${userType}) is ${online ? 'online' : 'offline'}`);
    };
    
    // Add event listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);
    socketService.on('newMessage', handleNewMessage);
    socketService.on('userStatus', handleUserStatus);

    // Initial connection attempt
    if (!socketService.isConnected()) {
      console.log('🚀 Initiating customer socket connection...');
      socketService.connect();
    } else {
      handleConnect();
    }

    // Set up heartbeat interval
    const heartbeatInterval = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.emit('heartbeat');
        console.log('💓 Customer heartbeat sent');
      }
    }, 20000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up customer socket listeners...');
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userStatus', handleUserStatus);
      clearInterval(heartbeatInterval);
    };
  }, [user?.id, bookingId, driverId]);

  // Dimensions change handler
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Typing animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  // Improved send message function for customer
  const sendMessage = () => {
    if (inputText.trim() === '' || !user?.id) return;

    const messageId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageText = inputText.trim();
    
    const newMessage = {
      id: messageId,
      text: messageText,
      senderId: user.id,
      senderType: 'customer',
      timestamp: new Date(),
      status: 'sending'
    };

    console.log('📤 Customer sending message:', {
      messageId,
      senderId: user.id,
      senderType: 'customer',
      text: messageText
    });

    // Add message to UI immediately
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Send via socket
    if (socketService.isConnected() && user && bookingId) {
      const socketMessage = {
        bookingId: bookingId,
        senderId: user.id,
        receiverId: driverId,
        message: messageText,
        senderType: 'customer',
        localMessageId: messageId // This helps track the message when it comes back
      };
      
      socketService.emit('sendMessage', socketMessage);
      console.log('📤 Customer socket message sent:', socketMessage);
      
      // Update status to delivered immediately (since we're not waiting for server confirmation)
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }, 500);
    } else {
      // If socket not connected, mark as failed
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'failed' }
              : msg
          )
        );
      }, 1000);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Enhanced render message with better debugging for customer
  const renderMessage = ({ item }) => {
    const isFromCurrentUser = isMessageFromCurrentUser(item);
    
    console.log('🎨 Customer rendering message:', {
      id: item.id,
      senderId: item.senderId,
      senderType: item.senderType,
      currentUserId: user?.id,
      isFromCurrentUser,
      text: item.text.substring(0, 30) + (item.text.length > 30 ? '...' : '')
    });
    
    return (
      <View style={[
        styles.messageContainer,
        isFromCurrentUser ? styles.userMessage : styles.driverMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isFromCurrentUser ? styles.userBubble : styles.driverBubble
        ]}>
          <Text style={[
            styles.messageText,
            isFromCurrentUser ? styles.userMessageText : styles.driverMessageText
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
      <View style={[styles.messageContainer, styles.driverMessage]}>
        <View style={[styles.messageBubble, styles.driverBubble, styles.typingBubble]}>
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

  const showOptions = () => {
    Alert.alert(
      'Chat Options',
      'Choose an option',
      [
        { text: 'Call Driver', onPress: () => Alert.alert('Calling driver...') },
        { text: 'View Profile', onPress: () => Alert.alert('Opening profile...') },
        { text: 'Share Location', onPress: () => Alert.alert('Sharing location...') },
        { text: 'Block User', onPress: () => Alert.alert('User blocked') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getLastSeenText = () => {
    if (userStatus?.online) {
      return 'Online now';
    } else {
      return 'Off line';
    }
  };

  // Test function to simulate received message from driver
  const testReceivedMessage = () => {
    const testMessage = {
      messageId: `test_${Date.now()}`,
      message: `Test driver message at ${new Date().toLocaleTimeString()}`,
      senderId: driverId,
      senderType: 'driver',
      timestamp: Date.now()
    };
    
    console.log('🧪 Customer testing received message from driver:', testMessage);
    
    // Simulate socket message
    setMessages(prev => [...prev, {
      id: testMessage.messageId,
      text: testMessage.message,
      senderId: testMessage.senderId,
      senderType: testMessage.senderType,
      timestamp: new Date(testMessage.timestamp),
      status: 'delivered'
    }]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Debug current state
  useEffect(() => {
    console.log('🔍 Customer Current State Debug:');
    console.log('User ID:', user?.id);
    console.log('User Role:', user?.role);
    console.log('Driver ID:', driverId);
    console.log('Messages count:', messages.length);
    console.log('Socket connected:', socketConnected);
    console.log('Messages:', messages.map(msg => ({
      id: msg.id,
      senderId: msg.senderId,
      senderType: msg.senderType,
      isFromMe: msg.senderId === user?.id,
      text: msg.text.substring(0, 20) + '...'
    })));
  }, [user, driverId, messages.length, socketConnected]);

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
              <Image source={{uri:driverImage?driverImage:'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI='}} style={{width:40,height:40,borderRadius:20}} />
              <View style={[styles.statusDot, userStatus?.online && styles.onlineStatus]} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{driverName}</Text>
              <Text style={styles.headerSubtitle}>
                {getLastSeenText()}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
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
              placeholder="Type your message..."
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
  driverMessage: {
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
  driverBubble: {
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
  driverMessageText: {
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
    fontSize: getResponsiveFontSize(16),
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
});

export default CustomerClientChat;