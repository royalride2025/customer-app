import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://app.royalride.qa'; // TODO: Replace with your backend socket URL

class SocketService {
  private static instance: SocketService;
  public socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token?: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: token ? { token } : undefined,
      });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  public off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  public emit(event: string, ...args: any[]) {
    this.socket?.emit(event, ...args);
  }
}

export default SocketService.getInstance(); 