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
import { useNavigation } from '@react-navigation/native';


const CustomerClientChat = ({ clientName = "Usman Virk", clientAvatar = "US", isClientOnline = true }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hi! I saw your listing and I\'m interested. Can you tell me more about it?',
      isUser: false,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: 'delivered'
    },
    {
      id: '2',
      text: 'Hello! Thanks for your interest. I\'d be happy to provide more details. What specific information would you like to know?',
      isUser: true,
      timestamp: new Date(Date.now() - 240000), // 4 minutes ago
      status: 'delivered'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const flatListRef = useRef(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;
const navigation=useNavigation()
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

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

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate message sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    }, 1000);

    // Simulate client response (randomly)
    if (Math.random() > 0.3) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const responses = [
            "That sounds great! When would be a good time to discuss this further?",
            "I appreciate the quick response. Could you share more details about the pricing?",
            "Perfect! I'm definitely interested. What's the next step?",
            "Thanks for the information. I have a few more questions if that's okay.",
            "This looks exactly like what I was looking for. How do we proceed?",
            "I'd like to schedule a call to discuss this in detail. When are you available?",
            "Great! Can you send me some additional photos or documents?",
            "I'm ready to move forward. What information do you need from me?"
          ];
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: randomResponse,
            isUser: false,
            timestamp: new Date(),
            status: 'delivered'
          }]);
        }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
      }, 1500);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.clientMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.clientBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : styles.clientMessageText
        ]}>
          {item.text}
        </Text>
      </View>
      <View style={styles.messageInfo}>
        <Text style={styles.timestamp}>
          {formatTime(item.timestamp)}
        </Text>
        {item.isUser && (
          <Text style={[
            styles.status,
            item.status === 'sending' && styles.sendingStatus,
            item.status === 'delivered' && styles.deliveredStatus
          ]}>
            {item.status === 'sending' ? '◐' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.clientMessage]}>
        <View style={[styles.messageBubble, styles.clientBubble, styles.typingBubble]}>
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
        { text: 'Call Client', onPress: () => Alert.alert('Calling client...') },
        { text: 'View Profile', onPress: () => Alert.alert('Opening profile...') },
        { text: 'Share Location', onPress: () => Alert.alert('Sharing location...') },
        { text: 'Block User', onPress: () => Alert.alert('User blocked') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getLastSeenText = () => {
    if (isClientOnline) {
      return 'Online now';
    } else {
      return 'Last seen 2 hours ago';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={StyleGuide.color.primary} />
      
      {/* Header */}
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
        <TouchableOpacity onPress={()=>navigation.goBack()}>
        <Svg xml={backArrow} rest={{height:20,width:28,style:{marginRight:10}}}/>
      </TouchableOpacity>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{clientAvatar}</Text>
              <View style={[styles.statusDot, isClientOnline && styles.onlineStatus]} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{clientName}</Text>
              <Text style={styles.headerSubtitle}>
                {getLastSeenText()}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.optionsButton} onPress={showOptions}>
            <Text style={styles.optionsText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

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
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
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
            />
            {
              inputText.trim() && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={sendMessage}
                  disabled={!inputText.trim()}
                >
                  <Svg xml={sendIcon} rest={{height:35,width:35}} />
                </TouchableOpacity>
              )
            }
          </View>
          <Text style={styles.inputHint}>
            {isClientOnline ? `${clientName} is online` : `${clientName} was last seen 2 hours ago`}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleGuide.color.backgroundColor,
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
  },
  messageContainer: {
    marginBottom: getResponsiveSize(16),
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  clientMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: isSmallScreen ? '85%' : isLargeScreen ? '75%' : '80%',
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(8),
    borderRadius: getResponsiveSize(20),
  },
  userBubble: {
    backgroundColor: StyleGuide.color.secondary,
    borderBottomRightRadius: getResponsiveSize(4),
  },
  clientBubble: {
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
    fontSize: getResponsiveFontSize(12),
    fontFamily: StyleGuide.fontFamily.medium,
    lineHeight: getResponsiveSize(22),
  },
  userMessageText: {
    color: StyleGuide.color.grey,
    fontSize: getResponsiveFontSize(12),
    fontFamily: StyleGuide.fontFamily.medium
  },
  clientMessageText: {
    color: StyleGuide.color.grey,
    fontSize: getResponsiveFontSize(12),
    fontFamily: StyleGuide.fontFamily.medium
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsiveSize(4),
    paddingHorizontal: getResponsiveSize(4),
  },
  timestamp: {
    fontSize: getResponsiveFontSize(12),
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
    paddingBottom: Platform.OS === 'ios' ? getResponsiveSize(34) : getResponsiveSize(16),
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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