import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSocketReconnection } from './useSocketReconnection';

// Example 1: Basic usage
export const BasicSocketExample = () => {
  const { isConnected, reconnect, disconnect, emitEvent } = useSocketReconnection();

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={reconnect}>
        <Text style={styles.buttonText}>Reconnect</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={disconnect}>
        <Text style={styles.buttonText}>Disconnect</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => emitEvent('testEvent', { message: 'Hello from component!' })}
      >
        <Text style={styles.buttonText}>Send Test Event</Text>
      </TouchableOpacity>
    </View>
  );
};

// Example 2: With custom callbacks
export const AdvancedSocketExample = () => {
  const { 
    isConnected, 
    isConnecting, 
    reconnectAttempts,
    addEventListener,
    removeEventListener 
  } = useSocketReconnection({
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    onConnect: () => {
      console.log('🎉 Custom connect callback!');
      // Add your custom logic here
    },
    onDisconnect: () => {
      console.log('😞 Custom disconnect callback!');
      // Add your custom logic here
    },
    onError: (error) => {
      console.log('💥 Custom error callback:', error);
      // Add your custom error handling here
    }
  });

  React.useEffect(() => {
    // Add custom event listener
    const handleCustomEvent = (data: any) => {
      console.log('📨 Custom event received:', data);
    };

    if (isConnected) {
      addEventListener('customEvent', handleCustomEvent);
    }

    return () => {
      removeEventListener('customEvent', handleCustomEvent);
    };
  }, [isConnected, addEventListener, removeEventListener]);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      {isConnecting && (
        <Text style={styles.connecting}>
          Connecting... (Attempt {reconnectAttempts + 1})
        </Text>
      )}
    </View>
  );
};

// Example 3: Chat component with socket events
export const ChatSocketExample = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  const { isConnected, emitEvent, addEventListener, removeEventListener } = useSocketReconnection();

  React.useEffect(() => {
    const handleNewMessage = (data: any) => {
      setMessages(prev => [...prev, data.message]);
    };

    const handleUserJoined = (data: any) => {
      setMessages(prev => [...prev, `${data.userName} joined the chat`]);
    };

    if (isConnected) {
      addEventListener('newMessage', handleNewMessage);
      addEventListener('userJoined', handleUserJoined);
    }

    return () => {
      removeEventListener('newMessage', handleNewMessage);
      removeEventListener('userJoined', handleUserJoined);
    };
  }, [isConnected, addEventListener, removeEventListener]);

  const sendMessage = (message: string) => {
    emitEvent('sendMessage', { message });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>
        Chat Status: {isConnected ? 'Connected' : 'Disconnected'}
      </Text>
      <View style={styles.messages}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.message}>{msg}</Text>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => sendMessage('Hello from chat!')}
      >
        <Text style={styles.buttonText}>Send Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connecting: {
    fontSize: 14,
    color: 'orange',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messages: {
    maxHeight: 200,
    marginVertical: 10,
  },
  message: {
    padding: 5,
    backgroundColor: 'white',
    marginVertical: 2,
    borderRadius: 4,
  },
});

export default {
  BasicSocketExample,
  AdvancedSocketExample,
  ChatSocketExample,
}; 