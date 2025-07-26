# Socket Implementation Guide

This document explains how to use the socket functionality in the Royal Ride app.

## Overview

The app now includes real-time socket functionality for:
- Booking updates and status changes
- Driver location tracking
- Real-time chat between customer and driver
- Trip status notifications

## Files Added

1. **`src/services/socketService.ts`** - Main socket service class
2. **`src/hooks/useSocket.ts`** - Custom hook for easy socket usage
3. **`SOCKET_IMPLEMENTATION.md`** - This documentation

## How to Use

### 1. Basic Socket Usage

```typescript
import { useSocket } from '../hooks/useSocket';

const MyComponent = () => {
  const { isConnected, socketService } = useSocket();
  
  // Check if socket is connected
  console.log('Socket connected:', isConnected);
  
  // Join a booking room for real-time updates
  socketService.joinBookingRoom('booking_id_123');
  
  // Leave booking room when done
  socketService.leaveBookingRoom('booking_id_123');
};
```

### 2. Listening to Events

```typescript
import { useEffect } from 'react';
import socketService from '../services/socketService';

const MyComponent = () => {
  useEffect(() => {
    // Listen for driver assignment
    socketService.on('driver:assigned', (data) => {
      console.log('Driver assigned:', data);
      // Update UI with driver info
    });
    
    // Listen for driver location updates
    socketService.on('driver:location', (data) => {
      console.log('Driver location:', data);
      // Update map with driver location
    });
    
    // Listen for trip status changes
    socketService.on('trip:started', (data) => {
      console.log('Trip started:', data);
      // Update UI for trip in progress
    });
    
    // Clean up listeners
    return () => {
      socketService.off('driver:assigned');
      socketService.off('driver:location');
      socketService.off('trip:started');
    };
  }, []);
};
```

### 3. Sending Messages (Chat)

```typescript
import { useSocket } from '../hooks/useSocket';

const ChatComponent = () => {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  
  const handleSendMessage = (message: string) => {
    sendMessage('booking_id_123', message);
  };
  
  const handleTypingStart = () => {
    startTyping('booking_id_123');
  };
  
  const handleTypingStop = () => {
    stopTyping('booking_id_123');
  };
};
```

### 4. Updating User Location

```typescript
import { useSocket } from '../hooks/useSocket';

const MapComponent = () => {
  const { updateUserLocation } = useSocket();
  
  const handleLocationUpdate = (latitude: number, longitude: number) => {
    updateUserLocation({ latitude, longitude });
  };
};
```

## Available Events

### Booking Events
- `booking:created` - When a new booking is created
- `booking:updated` - When booking status changes
- `booking:cancelled` - When booking is cancelled
- `driver:assigned` - When a driver is assigned to booking
- `driver:location` - Real-time driver location updates
- `driver:arrived` - When driver arrives at pickup location
- `trip:started` - When trip begins
- `trip:completed` - When trip is completed

### Chat Events
- `message:received` - When a new message is received
- `message:sent` - When a message is sent successfully
- `typing:started` - When someone starts typing
- `typing:stopped` - When someone stops typing

### Connection Events
- `connect` - When socket connects
- `disconnect` - When socket disconnects
- `error` - When socket encounters an error

## Configuration

### Socket Server URL
Update the `SOCKET_URL` in `src/services/socketService.ts`:

```typescript
private readonly SOCKET_URL = 'https://your-socket-server.com';
```

### Authentication
The socket automatically uses the auth token from Redux store for authentication.

## Integration Points

### 1. Login Screen
- Socket is initialized after successful login
- Connection is established with user's auth token

### 2. Booking Flow
- Join booking room when booking is created
- Listen for driver assignment and location updates
- Leave booking room when trip is completed

### 3. Chat Screens
- Use socket for real-time messaging
- Handle typing indicators
- Send and receive messages

### 4. Map Screen
- Update driver location in real-time
- Handle trip status changes
- Show notifications for important events

## Error Handling

The socket service includes automatic reconnection with exponential backoff:
- Max 5 reconnection attempts
- Increasing delay between attempts
- Automatic reconnection on connection loss

## Testing

To test socket functionality:

1. Ensure your socket server is running
2. Update the `SOCKET_URL` in the service
3. Login to the app
4. Create a booking to test real-time updates
5. Check console logs for socket events

## Troubleshooting

### Common Issues

1. **Socket not connecting**
   - Check if auth token is available
   - Verify socket server URL is correct
   - Check network connectivity

2. **Events not firing**
   - Ensure you're listening to the correct event names
   - Check if you're in the correct booking room
   - Verify socket is connected

3. **Messages not sending**
   - Check if socket is connected
   - Verify booking ID is correct
   - Check server-side message handling

### Debug Mode

Enable debug logging by checking console logs:
- Socket connection status
- Event emissions and receptions
- Error messages

## Future Enhancements

- Add offline message queuing
- Implement message delivery status
- Add push notifications for socket events
- Implement socket connection status indicator in UI 