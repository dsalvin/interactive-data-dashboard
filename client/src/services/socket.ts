import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Initialize socket connection
  connect() {
    if (this.socket) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('token') || '',
      },
    });

    // Setup event listeners
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for widget data updates
    this.socket.on('widget-data', (data) => {
      const { widgetId, data: widgetData } = data;
      this.notifyListeners(`widget-${widgetId}`, widgetData);
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a dashboard room to receive updates
  joinDashboard(dashboardId: string) {
    if (this.socket) {
      this.socket.emit('join-dashboard', dashboardId);
    }
  }

  // Leave a dashboard room
  leaveDashboard(dashboardId: string) {
    if (this.socket) {
      this.socket.emit('leave-dashboard', dashboardId);
    }
  }

  // Send data update to server
  sendDataUpdate(dashboardId: string, widgetId: string, data: any) {
    if (this.socket) {
      this.socket.emit('data-update', { dashboardId, widgetId, data });
    }
  }

  // Add event listener for specific widget data updates
  addWidgetListener(widgetId: string, callback: (data: any) => void) {
    const eventName = `widget-${widgetId}`;
    
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    
    this.listeners.get(eventName)?.add(callback);
  }

  // Remove event listener
  removeWidgetListener(widgetId: string, callback: (data: any) => void) {
    const eventName = `widget-${widgetId}`;
    
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName)?.delete(callback);
    }
  }

  // Notify all listeners for a specific event
  private notifyListeners(eventName: string, data: any) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName)?.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket listener for ${eventName}:`, error);
        }
      });
    }
  }
}

// Export as singleton
export default new SocketService();