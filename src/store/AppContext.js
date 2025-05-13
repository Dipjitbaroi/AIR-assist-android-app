/**
 * App Context
 * 
 * Provides global state management for the application.
 * Manages app settings, messages, and connection states.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';

// Hooks
import { useWebSocket, useAudio } from '../hooks';

// Utils
import { storage } from '../utils';
import { DEFAULT_SETTINGS } from '../config/constants';

// Create context
export const AppContext = createContext();

/**
 * App Provider Component
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const AppProvider = ({ children }) => {
  // App state
  const [appState, setAppState] = useState(AppState.currentState);
  const [isOnline, setIsOnline] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [userId, setUserId] = useState(null);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Initialize WebSocket hook
  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    error: wsError,
    lastMessage,
    sendMessage,
    addMessageCallback,
    connect: connectWs,
    disconnect: disconnectWs,
  } = useWebSocket({
    url: settings.wsServerUrl,
    autoConnect: false, // We'll connect manually after settings are loaded
    reconnect: true,
    keepAlive: true,
  });
  
  // Initialize Audio hook
  const {
    isRecording,
    isRecognizing,
    isPlaying,
    transcription,
    error: audioError,
    startRecording,
    stopRecording,
    playAudio,
  } = useAudio({
    autoInitialize: true,
    enableVoiceRecognition: true,
  });
  
  // Derived state
  const isProcessingAudio = isRecognizing || isPlaying;
  
  /**
   * Load settings from storage
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load settings
        const savedSettings = await storage.loadSettings(DEFAULT_SETTINGS);
        setSettings(savedSettings);
        
        // Load or generate user ID
        const id = await storage.getUserId();
        setUserId(id);
        
        // Load conversation history
        const savedMessages = await storage.loadConversationHistory();
        setMessages(savedMessages);
        
        // Load pending messages
        const savedPendingMessages = await storage.loadPendingMessages();
        setPendingMessages(savedPendingMessages);
      } catch (error) {
        console.error('Error loading app data:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  /**
   * Connect to WebSocket when settings are loaded
   */
  useEffect(() => {
    if (settings.wsServerUrl) {
      connectWs();
    }
  }, [settings.wsServerUrl, connectWs]);
  
  /**
   * Save settings when they change
   */
  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);
  
  /**
   * Save conversation history when messages change
   */
  useEffect(() => {
    storage.saveConversationHistory(messages);
  }, [messages]);
  
  /**
   * Save pending messages when they change
   */
  useEffect(() => {
    storage.savePendingMessages(pendingMessages);
  }, [pendingMessages]);
  
  /**
   * Handle app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (wsConnected) {
          // Check WebSocket connection
          connectWs();
        }
      }
      setAppState(nextAppState);
    });
    
    return () => {
      subscription.remove();
    };
  }, [appState, wsConnected, connectWs]);
  
  /**
   * Handle WebSocket messages
   */
  useEffect(() => {
    const handleMessage = (data) => {
      try {
        if (data.type === 'aiResponse') {
          // Update last user message with transcription if available
          if (data.transcription && data.messageId) {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === data.messageId
                  ? { ...msg, text: data.transcription }
                  : msg
              )
            );
          }
          
          // Add AI response to messages
          addMessage(data.text, false);
          
          // Play audio if available
          if (data.audioBase64) {
            setIsSpeaking(true);
            playAudio(data.audioBase64)
              .finally(() => {
                setIsSpeaking(false);
              });
          } else {
            setIsSpeaking(false);
          }
        } else if (data.type === 'error') {
          addMessage(`Error: ${data.message}`, false, 'system');
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };
    
    // Add message callback
    const removeCallback = addMessageCallback(handleMessage);
    
    // Clean up when component unmounts
    return () => {
      removeCallback();
    };
  }, [addMessageCallback, playAudio]);
  
  /**
   * Process pending messages when WebSocket connects
   */
  useEffect(() => {
    if (wsConnected && pendingMessages.length > 0) {
      processPendingMessages();
    }
  }, [wsConnected, pendingMessages]);
  
  /**
   * Add a message to the conversation
   * 
   * @param {string} text - Message text
   * @param {boolean} isUser - Whether the message is from the user
   * @param {string} [type='normal'] - Message type
   * @param {string} [id] - Message ID
   * @returns {string} Message ID
   */
  const addMessage = useCallback((text, isUser, type = 'normal', id = Date.now().toString()) => {
    const newMessage = {
      id,
      text,
      isUser,
      type,
      timestamp: Date.now(),
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  }, []);
  
  /**
   * Send audio to the server
   * 
   * @param {string} audioBase64 - Base64-encoded audio data
   * @param {string} [transcription=''] - Transcription of the audio
   * @returns {Promise<string|null>} Message ID or null if error
   */
  const sendAudioToServer = useCallback(async (audioBase64, transcription = '') => {
    try {
      // If we have a transcription, use it, otherwise show processing
      const displayText = transcription || 'Listening...';
      const userMessageId = addMessage(displayText, true);
      
      if (wsConnected) {
        // Send audio to server
        sendMessage({
          type: 'audioMessage',
          audio: audioBase64,
          transcription: transcription,
          userId: userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        });
      } else {
        // Store for later sending when connection is restored
        setPendingMessages(prev => [...prev, {
          audioBase64,
          transcription,
          timestamp: Date.now(),
          messageId: userMessageId,
        }]);
        
        // Update user message with offline indicator
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === userMessageId
              ? { ...msg, text: transcription || 'Message saved for when connection is restored' }
              : msg
          )
        );
        
        addMessage('I\'m currently offline. I\'ll process your message when I reconnect.', false, 'system');
      }
      
      return userMessageId;
    } catch (error) {
      console.error('Error sending audio to server:', error);
      addMessage('Error: Could not process audio. Please try again.', false, 'system');
      return null;
    }
  }, [wsConnected, addMessage, sendMessage, userId, settings.userName, settings.aiVoice]);
  
  /**
   * Send text to the server
   * 
   * @param {string} text - Text to send
   * @returns {Promise<string|null>} Message ID or null if error
   */
  const sendTextToServer = useCallback(async (text) => {
    try {
      const userMessageId = addMessage(text, true);
      
      if (wsConnected) {
        // Send text to server
        sendMessage({
          type: 'textMessage',
          text: text,
          userId: userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        });
      } else {
        // Store for later sending
        setPendingMessages(prev => [...prev, {
          text,
          isText: true,
          timestamp: Date.now(),
          messageId: userMessageId,
        }]);
        
        addMessage('I\'m currently offline. I\'ll process your message when I reconnect.', false, 'system');
      }
      
      return userMessageId;
    } catch (error) {
      console.error('Error sending text to server:', error);
      addMessage('Error: Could not send your message. Please try again.', false, 'system');
      return null;
    }
  }, [wsConnected, addMessage, sendMessage, userId, settings.userName, settings.aiVoice]);
  
  /**
   * Process pending messages
   */
  const processPendingMessages = useCallback(async () => {
    if (!wsConnected || pendingMessages.length === 0) return;
    
    try {
      addMessage('Processing your offline messages...', false, 'system');
      
      // Only process the first pending message to avoid overloading
      const [firstPending, ...remainingPending] = pendingMessages;
      setPendingMessages(remainingPending);
      
      // Send the message to the server
      if (firstPending.isText) {
        sendMessage({
          type: 'textMessage',
          text: firstPending.text,
          userId: userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        });
      } else {
        sendMessage({
          type: 'audioMessage',
          audio: firstPending.audioBase64,
          transcription: firstPending.transcription || '',
          userId: userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        });
      }
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  }, [wsConnected, pendingMessages, addMessage, sendMessage, userId, settings.userName, settings.aiVoice]);
  
  /**
   * Update settings
   * 
   * @param {Object} newSettings - New settings
   */
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);
  
  /**
   * Clear conversation
   */
  const clearConversation = useCallback(() => {
    setMessages([]);
    storage.clearConversationHistory();
  }, []);
  
  /**
   * Handle recording
   */
  const handleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      const result = await stopRecording();
      if (result && result.audioBase64) {
        await sendAudioToServer(result.audioBase64, result.transcription);
      }
    } else {
      // Start recording
      await startRecording({
        useVoiceRecognition: true,
        onSilenceDetected: async () => {
          if (isRecording) {
            const result = await stopRecording();
            if (result && result.audioBase64) {
              await sendAudioToServer(result.audioBase64, result.transcription);
            }
          }
        },
      });
    }
  }, [isRecording, startRecording, stopRecording, sendAudioToServer]);
  
  // Context value
  const contextValue = {
    // App state
    appState,
    isOnline,
    
    // Connection state
    wsConnected,
    wsConnecting,
    wsError,
    
    // Settings
    settings,
    updateSettings,
    
    // Messages
    messages,
    pendingMessages,
    addMessage,
    clearConversation,
    
    // Audio state
    isRecording,
    isProcessingAudio,
    isSpeaking,
    transcription,
    audioError,
    
    // Audio functions
    handleRecording,
    sendAudioToServer,
    sendTextToServer,
    
    // WebSocket functions
    connectWs,
    disconnectWs,
    
    // Pending messages
    processPendingMessages,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
