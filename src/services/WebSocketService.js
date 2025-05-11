import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

class WebSocketServiceClass {
  constructor() {
    this.socket = null;
    this.url = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // Start with 2 seconds
    this.lastPingTime = 0;
    this.pingInterval = null;
    this.messageQueue = [];
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.onMessageCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * Initialize the WebSocket connection
   */
  init(url) {
    if (!url) {
      throw new Error('WebSocket URL is required');
    }
    
    this.url = url;
    this.connect();
    
    // Start ping interval to keep the connection alive
    this.startPingInterval();
    
    return true;
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.isConnected || this.isConnecting) return;
    
    this.isConnecting = true;
    
    try {
      // Create a new WebSocket connection
      this.socket = new WebSocket(this.url);
      
      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      this.handleError(error);
    }
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2000;
    
    // Send any queued messages
    this.processMessageQueue();
    
    // Call the connect callback if available
    if (this.onConnectCallback) {
      this.onConnectCallback();
    }
  }

  /**
   * Handle WebSocket message event
   */
  handleMessage(event) {
    // Call the message callback if available
    if (this.onMessageCallback) {
      this.onMessageCallback(event.data);
    }
  }

  /**
   * Handle WebSocket error event
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    
    // Call the error callback if available
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Handle WebSocket close event
   */
  handleClose(event) {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.isConnected = false;
    this.isConnecting = false;
    
    // Call the disconnect callback if available
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback(event);
    }
    
    // Attempt to reconnect if not a clean close
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule a reconnection attempt
   */
  scheduleReconnect() {
    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      BackgroundTimer.clearTimeout(this.reconnectTimeout);
    }
    
    // If we've exceeded the maximum reconnect attempts, stop trying
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached, giving up');
      return;
    }
    
    // Increase the reconnect attempts
    this.reconnectAttempts++;
    
    // Use exponential backoff for reconnect delay
    const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), 30000);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    // Schedule reconnect
    this.reconnectTimeout = BackgroundTimer.setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  /**
   * Start the ping interval to keep the connection alive
   */
  startPingInterval() {
    // Clear any existing ping interval
    if (this.pingInterval) {
      BackgroundTimer.clearInterval(this.pingInterval);
    }
    
    // Send a ping every 30 seconds
    this.pingInterval = BackgroundTimer.setInterval(() => {
      this.ping();
    }, 30000);
  }

  /**
   * Send a ping to the server
   */
  ping() {
    if (this.isConnected) {
      try {
        // Send a ping message
        this.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        this.lastPingTime = Date.now();
      } catch (error) {
        console.warn('Error sending ping:', error);
      }
    }
  }

  /**
   * Process any queued messages
   */
  processMessageQueue() {
    if (!this.isConnected || this.messageQueue.length === 0) return;
    
    // Send all queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.socket.send(message);
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message) {
    if (!this.isConnected) {
      // Queue the message if not connected
      this.messageQueue.push(message);
      this.connect();
      return false;
    }
    
    try {
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      // Queue the message for retry
      this.messageQueue.push(message);
      return false;
    }
  }

  /**
   * Check the WebSocket connection
   */
  checkConnection() {
    if (!this.isConnected && !this.isConnecting) {
      this.connect();
    }
    return this.isConnected;
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    // Clear intervals and timeouts
    if (this.pingInterval) {
      BackgroundTimer.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.reconnectTimeout) {
      BackgroundTimer.clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Close the socket if it exists
    if (this.socket) {
      this.socket.close(1000, 'Client disconnected');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Register a callback for WebSocket connect events
   */
  onConnect(callback) {
    this.onConnectCallback = callback;
  }

  /**
   * Register a callback for WebSocket disconnect events
   */
  onDisconnect(callback) {
    this.onDisconnectCallback = callback;
  }

  /**
   * Register a callback for WebSocket message events
   */
  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  /**
   * Register a callback for WebSocket error events
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }
}

export const WebSocketService = new WebSocketServiceClass();
