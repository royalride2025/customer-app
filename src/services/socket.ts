import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://app.royalride.qa'; // Your backend socket URL

class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  private constructor() {
    // Auto-connect when service is instantiated
    this.connect();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token?: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('Socket connection already in progress');
      return;
    }

    console.log('🔌 Connecting to socket...', SOCKET_URL);
    this.isConnecting = true;

    try {
      this.socket = io(SOCKET_URL, {
        // Allow fallback transports
        transports: ['websocket', 'polling'],
        
        // Connection options
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        
        // Auth (if token provided)
        auth: token ? { 
          token: token,
          // Alternative auth formats you might need:
          // authorization: `Bearer ${token}`,
          // accessToken: token,
        } : undefined,
        
        // Additional options that might be needed
        forceNew: false,
        autoConnect: true,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully:', this.socket?.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnecting = false;
        
        // Handle different disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, need to reconnect manually
          console.log('Server disconnected, will try to reconnect...');
          setTimeout(() => this.reconnect(), 2000);
        }
      });

      this.socket.on('connect_error', (error: any) => {
        console.log('🚫 Socket connection error:', error.message || error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('❌ Max reconnection attempts reached');
          this.disconnect();
        }
      });

      this.socket.on('reconnect', (attemptNumber: number) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
      });

      this.socket.on('reconnect_error', (error: any) => {
        console.log('🔄❌ Socket reconnection error:', error.message || error);
      });

      this.socket.on('reconnect_failed', () => {
        console.log('💀 Socket reconnection failed completely');
        this.disconnect();
      });

    } catch (error) {
      console.log('🚫 Error creating socket:', error);
      this.isConnecting = false;
    }
  }

  public reconnect(token?: string) {
    console.log('🔄 Attempting to reconnect socket...');
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 1000);
  }

  public disconnect() {
    if (this.socket) {
      console.log('🔌❌ Disconnecting socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn('⚠️ Cannot add listener: Socket not initialized');
      return;
    }
    
    console.log('👂 Adding listener for event:', event);
    this.socket.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) {
      console.warn('⚠️ Cannot remove listener: Socket not initialized');
      return;
    }
    
    console.log('👂❌ Removing listener for event:', event);
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  public emit(event: string, ...args: any[]) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot emit event: Socket not connected');
      console.log('Attempting to reconnect...');
      this.reconnect();
      return false;
    }
    
    console.log('📤 Emitting event:', event, 'with data:', args);
    this.socket.emit(event, ...args);
    return true;
  }

  // Utility methods
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getSocketId(): string | undefined {
    return this.socket?.id;
  }

  public getConnectionState(): string {
    if (!this.socket) return 'not_initialized';
    if (this.isConnecting) return 'connecting';
    if (this.socket.connected) return 'connected';
    return 'disconnected';
  }

  // For debugging
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
const socketService = SocketService.getInstance();
export default socketService;

// Alternative named export for explicit imports
export { socketService };