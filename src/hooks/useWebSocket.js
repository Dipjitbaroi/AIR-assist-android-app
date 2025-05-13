/**
 * useWebSocket Hook
 * 
 * A custom hook for managing WebSocket connections.
 * Provides a simplified interface for connecting, sending messages, and handling events.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { TIME } from '../config/constants';

/**
 * WebSocket connection hook
 * 
 * @param {Object} options - Hook options
 * @param {string} options.url - WebSocket server URL
 * @param {boolean} [options.autoConnect=true] - Whether to connect automatically
 * @param {boolean} [options.reconnect=true] - Whether to reconnect automatically
 * @param {number} [options.reconnectInterval=5000] - Reconnection interval in milliseconds
 * @param {boolean} [options.keepAlive=true] - Whether to send ping messages to keep the connection alive
 * @param {number} [options.pingInterval=30000] - Ping interval in milliseconds
 * @returns {Object} WebSocket state and functions
 */
const useWebSocket = ({
  url,
  autoConnect = true,
  reconnect = true,
  reconnectInterval = TIME.WEBSOCKET_RECONNECT_INTERVAL,
  keepAlive = true,
  pingInterval = 30000,
} = {}) => {
  // State for WebSocket connection
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // State for messages
  const [lastMessage, setLastMessage] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  
  // Refs for timers and callbacks
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const messageCallbacksRef = useRef([]);
  
  /**
   * Connect to WebSocket server
   * 
   * @returns {Promise<boolean>} Whether connection was successful
   */
  const connect = useCallback(async () => {
    // Don't connect if already connected or connecting
    if (isConnected || isConnecting || !url) {
      return false;
    }
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Create new WebSocket connection
      const newSocket = new WebSocket(url);
      
      // Set up event handlers
      newSocket.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        
        // Start ping interval if keepAlive is true
        if (keepAlive) {
          startPingInterval(newSocket);
        }
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Check for pong messages
          if (data && data.type === 'pong') {
            setLastPingTime(Date.now());
          }
          
          // Call message callbacks
          messageCallbacksRef.current.forEach(callback => {
            try {
              callback(data);
            } catch (callbackError) {
              console.error('Error in message callback:', callbackError);
            }
          });
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };
      
      newSocket.onerror = (event) => {
        setError(`WebSocket error: ${event.message || 'Unknown error'}`);
      };
      
      newSocket.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Reconnect if enabled
        if (reconnect) {
          scheduleReconnect();
        }
      };
      
      setSocket(newSocket);
      
      // Return a promise that resolves when connected
      return new Promise((resolve) => {
        newSocket.onopen = () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          
          // Start ping interval if keepAlive is true
          if (keepAlive) {
            startPingInterval(newSocket);
          }
          
          resolve(true);
        };
        
        newSocket.onerror = (event) => {
          setError(`WebSocket error: ${event.message || 'Unknown error'}`);
          resolve(false);
        };
      });
    } catch (err) {
      setError(`Connection error: ${err.message}`);
      setIsConnecting(false);
      
      // Reconnect if enabled
      if (reconnect) {
        scheduleReconnect();
      }
      
      return false;
    }
  }, [url, isConnected, isConnecting, reconnect, keepAlive]);
  
  /**
   * Disconnect from WebSocket server
   * 
   * @returns {boolean} Whether disconnection was successful
   */
  const disconnect = useCallback(() => {
    // Clear timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Close socket if it exists
    if (socket) {
      try {
        // Remove event handlers to prevent duplicate events
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        
        // Close the connection if it's open
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
        
        setSocket(null);
        setIsConnected(false);
        setIsConnecting(false);
        
        return true;
      } catch (err) {
        setError(`Disconnection error: ${err.message}`);
        return false;
      }
    }
    
    return true;
  }, [socket]);
  
  /**
   * Schedule a reconnection attempt
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  }, [connect, reconnectInterval]);
  
  /**
   * Start the ping interval to keep the connection alive
   * 
   * @param {WebSocket} ws - WebSocket instance
   */
  const startPingInterval = useCallback((ws) => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    setLastPingTime(Date.now());
    
    pingIntervalRef.current = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        // Send ping message
        ws.send(JSON.stringify({ type: 'ping' }));
        
        // Check if we've received a pong recently
        const now = Date.now();
        if (lastPingTime && now - lastPingTime > 60000) {
          console.warn('WebSocket connection seems unresponsive. Reconnecting...');
          disconnect();
          connect();
        }
      }
    }, pingInterval);
  }, [disconnect, connect, pingInterval, lastPingTime]);
  
  /**
   * Send a message through the WebSocket
   * 
   * @param {Object|string} data - Data to send
   * @returns {boolean} Whether message was sent successfully
   */
  const sendMessage = useCallback((data) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Cannot send message, socket not open');
      return false;
    }
    
    try {
      // Convert data to string if it's an object
      const message = typeof data === 'object' ? JSON.stringify(data) : data;
      
      socket.send(message);
      return true;
    } catch (err) {
      setError(`Send message error: ${err.message}`);
      return false;
    }
  }, [socket]);
  
  /**
   * Add a message callback
   * 
   * @param {Function} callback - Function to call when a message is received
   * @returns {Function} Function to remove the callback
   */
  const addMessageCallback = useCallback((callback) => {
    messageCallbacksRef.current.push(callback);
    
    // Return a function to remove the callback
    return () => {
      messageCallbacksRef.current = messageCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);
  
  /**
   * Check if WebSocket connection is active
   * 
   * @returns {boolean} Whether connection is active
   */
  const checkConnection = useCallback(() => {
    // If we think we're connected, but the socket is closed, reconnect
    if (isConnected && (!socket || socket.readyState !== WebSocket.OPEN)) {
      setIsConnected(false);
      connect();
      return false;
    }
    
    return isConnected;
  }, [isConnected, socket, connect]);
  
  // Connect when component mounts if autoConnect is true
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }
    
    // Set up app state change listener for reconnection
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkConnection();
      }
    });
    
    // Clean up when component unmounts
    return () => {
      disconnect();
      subscription.remove();
    };
  }, [url]);
  
  return {
    // State
    isConnected,
    isConnecting,
    error,
    lastMessage,
    
    // Functions
    connect,
    disconnect,
    sendMessage,
    addMessageCallback,
    checkConnection,
  };
};

export default useWebSocket;
