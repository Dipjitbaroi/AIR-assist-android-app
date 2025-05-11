// Here's the complete React Native Android App for AIR-assist
// This project connects to Bluetooth earpieces and interfaces with an AI assistant via WebSockets
// The app allows for real-time voice interaction with the AI assistant

// File Structure:
// 1. App.js - Main application component
// 2. /src/context/ - Context providers for app state
//    - AppContext.js - Main app state and websocket management
//    - BluetoothContext.js - Bluetooth device management
// 3. /src/services/ - Service classes
//    - AudioService.js - Audio recording and playback
//    - BluetoothService.js - Bluetooth device connection
//    - PermissionsService.js - Handling permissions
//    - WebSocketService.js - WebSocket communication
//    - StorageService.js - Data persistence
// 4. /src/components/ - UI components
//    - Conversation.js - Display conversation
//    - Header.js - App header
//    - MessageItem.js - Individual message
//    - StatusPanel.js - Connection status
//    - UserProfile.js - User information
// 5. /src/screens/ - App screens
//    - HomeScreen.js - Main screen
//    - SettingsScreen.js - Settings screen
// 6. /src/utils/ - Utility functions
//    - constants.js - App constants
//    - helpers.js - Helper functions
//    - deviceInfo.js - Device information

// App.js
import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, LogBox, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppProvider } from './src/context/AppContext';
import { BluetoothProvider } from './src/context/BluetoothContext';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/styles/colors';
import { PermissionsService } from './src/services/PermissionsService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
  'Non-serializable values were found in the navigation state',
  'componentWillReceiveProps has been renamed',
  'Require cycle:'
]);

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Request permissions when the app starts
    const requestInitialPermissions = async () => {
      try {
        if (Platform.OS === 'android') {
          await PermissionsService.requestAndroidPermissions();
        } else if (Platform.OS === 'ios') {
          await PermissionsService.requestIOSPermissions();
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };

    requestInitialPermissions();
  }, []);

  return (
    <AppProvider>
      <BluetoothProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary}
          />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: 'AIRAssist' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </BluetoothProvider>
    </AppProvider>
  );
};

export default App;

// src/context/AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocketService } from '../services/WebSocketService';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(AppState.currentState);
  const [isOnline, setIsOnline] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscription, setLastTranscription] = useState('');

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    const loadPendingMessages = async () => {
      try {
        const savedPendingMessages = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_MESSAGES);
        if (savedPendingMessages) {
          setPendingMessages(JSON.parse(savedPendingMessages));
        }
      } catch (error) {
        console.error('Error loading pending messages:', error);
      }
    };

    const loadConversationHistory = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATION_HISTORY);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    };

    loadSettings();
    loadPendingMessages();
    loadConversationHistory();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [settings]);

  // Save pending messages to AsyncStorage when they change
  useEffect(() => {
    const savePendingMessages = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_MESSAGES, JSON.stringify(pendingMessages));
      } catch (error) {
        console.error('Error saving pending messages:', error);
      }
    };

    savePendingMessages();
  }, [pendingMessages]);

  // Save conversation history to AsyncStorage when messages change
  useEffect(() => {
    const saveConversationHistory = async () => {
      try {
        // Only keep the last 100 messages to prevent storage overflow
        const messagesToSave = messages.slice(-100);
        await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATION_HISTORY, JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving conversation history:', error);
      }
    };

    saveConversationHistory();
  }, [messages]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        WebSocketService.checkConnection();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initWebSocket = async () => {
      try {
        WebSocketService.init(settings.wsServerUrl);
        WebSocketService.onConnect(() => {
          setWsConnected(true);
          addMessage('Connected to AI assistant', false, 'system');
        });
        
        WebSocketService.onDisconnect(() => {
          setWsConnected(false);
          if (isOnline) {
            addMessage('Disconnected from AI assistant', false, 'system');
          }
        });
        
        WebSocketService.onMessage(handleWebSocketMessage);
        WebSocketService.onError((error) => {
          console.error('WebSocket error:', error);
          addMessage('Error connecting to AI assistant', false, 'system');
        });
      } catch (error) {
        console.error('WebSocket initialization error:', error);
        setWsConnected(false);
      }
    };

    initWebSocket();

    return () => {
      WebSocketService.disconnect();
    };
  }, [settings.wsServerUrl]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'aiResponse') {
        // Update last user message with transcription if available
        if (data.transcription && data.messageId) {
          setLastTranscription(data.transcription);
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === data.messageId
                ? { ...msg, text: data.transcription }
                : msg
            )
          );
        }
        
        // Add AI response to messages
        const aiResponseId = addMessage(data.text, false);
        setIsSpeaking(true);

        // Play audio if available
        if (data.audioBase64) {
          // AudioService would handle this
          // After playback finishes, set isSpeaking to false
          setTimeout(() => {
            setIsSpeaking(false);
          }, 1000); // This would be replaced with actual audio completion callback
        } else {
          setIsSpeaking(false);
        }

        setIsProcessingAudio(false);
      } else if (data.type === 'pong') {
        // Handle pong message - keep connection alive
      } else if (data.type === 'error') {
        addMessage(`Error: ${data.message}`, false, 'system');
        setIsProcessingAudio(false);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  };

  // Add a message to the conversation
  const addMessage = (text, isUser, type = 'normal', id = Date.now().toString()) => {
    const newMessage = {
      id,
      text,
      isUser,
      type,
      timestamp: Date.now(),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    return newMessage.id;
  };

  // Send audio to the WebSocket server
  const sendAudioToServer = async (audioBase64, transcription = '') => {
    try {
      setIsProcessingAudio(true);
      const messageId = Date.now().toString();
      
      // If we have a transcription, use it, otherwise show processing
      const displayText = transcription || 'Listening...';
      const userMessageId = addMessage(displayText, true);

      if (wsConnected) {
        WebSocketService.send(JSON.stringify({
          type: 'audioMessage',
          audio: audioBase64,
          transcription: transcription,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        }));
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
        setIsProcessingAudio(false);
      }

      return userMessageId;
    } catch (error) {
      console.error('Error sending audio to server:', error);
      addMessage('Error: Could not process audio. Please try again.', false, 'system');
      setIsProcessingAudio(false);
      return null;
    }
  };

  // Send text to the WebSocket server (for typing)
  const sendTextToServer = async (text) => {
    try {
      const messageId = Date.now().toString();
      const userMessageId = addMessage(text, true);

      if (wsConnected) {
        WebSocketService.send(JSON.stringify({
          type: 'textMessage',
          text: text,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: Date.now(),
          messageId: userMessageId,
        }));
        
        return userMessageId;
      } else {
        // Store for later sending
        setPendingMessages(prev => [...prev, {
          text,
          isText: true,
          timestamp: Date.now(),
          messageId: userMessageId,
        }]);

        addMessage('I\'m currently offline. I\'ll process your message when I reconnect.', false, 'system');
        return userMessageId;
      }
    } catch (error) {
      console.error('Error sending text to server:', error);
      addMessage('Error: Could not send your message. Please try again.', false, 'system');
      return null;
    }
  };

  // Process any pending messages
  const processPendingMessages = async () => {
    if (!wsConnected || pendingMessages.length === 0) return;

    try {
      addMessage('Processing your offline messages...', false, 'system');

      // Only process the first pending message to avoid overloading
      const [firstPending, ...remainingPending] = pendingMessages;
      setPendingMessages(remainingPending);

      // Send the message to the server
      if (firstPending.isText) {
        WebSocketService.send(JSON.stringify({
          type: 'textMessage',
          text: firstPending.text,
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        }));
      } else {
        WebSocketService.send(JSON.stringify({
          type: 'audioMessage',
          audio: firstPending.audioBase64,
          transcription: firstPending.transcription || '',
          userId: settings.userId || 'guest',
          userName: settings.userName,
          voice: settings.aiVoice,
          timestamp: firstPending.timestamp,
          messageId: firstPending.messageId,
        }));
      }

      setIsProcessingAudio(true);
    } catch (error) {
      console.error('Error processing pending messages:', error);
    }
  };

  // Update connection status when WebSocket connection changes
  useEffect(() => {
    if (wsConnected && pendingMessages.length > 0) {
      processPendingMessages();
    }
  }, [wsConnected, pendingMessages]);

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        isOnline,
        wsConnected,
        settings,
        messages,
        isProcessingAudio,
        isSpeaking,
        pendingMessages,
        lastTranscription,
        updateSettings,
        addMessage,
        sendAudioToServer,
        sendTextToServer,
        clearConversation,
        processPendingMessages,
        setIsProcessingAudio,
        setIsSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// src/context/BluetoothContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { BluetoothService } from '../services/BluetoothService';
import { PermissionsService } from '../services/PermissionsService';
import { STORAGE_KEYS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BluetoothContext = createContext();

export const BluetoothProvider = ({ children }) => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [connectAttempts, setConnectAttempts] = useState(0);
  const [savedDevices, setSavedDevices] = useState([]);

  // Initialize Bluetooth service
  useEffect(() => {
    const initBluetooth = async () => {
      try {
        await BluetoothService.init();
        
        BluetoothService.onStateChange((state) => {
          setIsBluetoothEnabled(state === 'PoweredOn');
        });

        const initialState = await BluetoothService.getState();
        setIsBluetoothEnabled(initialState === 'PoweredOn');
        
        // Load saved devices
        const loadSavedDevices = async () => {
          try {
            const savedDevicesString = await AsyncStorage.getItem(STORAGE_KEYS.BLUETOOTH_DEVICES);
            if (savedDevicesString) {
              const parsedDevices = JSON.parse(savedDevicesString);
              setSavedDevices(parsedDevices);
              
              // Try to reconnect to the last device if available
              const lastConnectedDevice = parsedDevices.find(device => device.lastConnected);
              if (lastConnectedDevice && initialState === 'PoweredOn') {
                setTimeout(() => {
                  connectToDevice(lastConnectedDevice);
                }, 1000); // Delay to ensure Bluetooth is ready
              }
            }
          } catch (error) {
            console.error('Error loading saved devices:', error);
          }
        };
        
        loadSavedDevices();
      } catch (error) {
        console.error('Bluetooth initialization error:', error);
        setError('Failed to initialize Bluetooth');
      }
    };

    initBluetooth();

    return () => {
      BluetoothService.stopScan();
      if (connectedDevice) {
        BluetoothService.disconnect(connectedDevice.id);
      }
    };
  }, []);

  // Save devices when they change
  useEffect(() => {
    const saveBleDevices = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.BLUETOOTH_DEVICES, JSON.stringify(savedDevices));
      } catch (error) {
        console.error('Error saving BLE devices:', error);
      }
    };

    saveBleDevices();
  }, [savedDevices]);

  // Start scanning for devices
  const startScan = async () => {
    try {
      // Check for necessary permissions first
      if (Platform.OS === 'android') {
        const hasPermissions = await PermissionsService.checkAndroidBluetoothPermissions();
        if (!hasPermissions) {
          await PermissionsService.requestAndroidBluetoothPermissions();
        }
      }

      if (!isBluetoothEnabled) {
        setError('Bluetooth is not enabled');
        return false;
      }

      setIsScanning(true);
      setConnectionState('scanning');
      setDevices([]);
      setScanAttempts(prev => prev + 1);

      BluetoothService.startScan((device) => {
        setDevices(prevDevices => {
          // Only add device if it doesn't already exist in the list
          const exists = prevDevices.some(d => d.id === device.id);
          if (!exists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      });

      // Stop scan after 10 seconds to save battery
      setTimeout(() => {
        BluetoothService.stopScan();
        setIsScanning(false);
        
        if (devices.length === 0) {
          setConnectionState('no_devices_found');
        } else {
          setConnectionState('devices_found');
        }
      }, 10000);

      return true;
    } catch (error) {
      console.error('Error starting scan:', error);
      setError(`Failed to scan for devices: ${error.message}`);
      setIsScanning(false);
      setConnectionState('error');
      return false;
    }
  };

  // Connect to a device
  const connectToDevice = async (device) => {
    try {
      setConnectionState('connecting');
      setConnectAttempts(prev => prev + 1);
      
      const connected = await BluetoothService.connect(device.id);
      
      if (connected) {
        setConnectedDevice(device);
        setConnectionState('connected');
        
        // Save the device as last connected
        const updatedSavedDevices = savedDevices.map(d => ({
          ...d,
          lastConnected: d.id === device.id
        }));
        
        // Add the device if it doesn't exist in savedDevices
        if (!savedDevices.some(d => d.id === device.id)) {
          updatedSavedDevices.push({
            ...device,
            lastConnected: true
          });
        }
        
        setSavedDevices(updatedSavedDevices);
        
        return true;
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      setError(`Failed to connect: ${error.message}`);
      setConnectionState('error');
      
      // Retry connection if less than 3 attempts
      if (connectAttempts < 3) {
        setTimeout(() => {
          connectToDevice(device);
        }, 1000);
      } else {
        setConnectAttempts(0);
        return false;
      }
    }
  };

  // Disconnect from device
  const disconnectDevice = async () => {
    try {
      if (connectedDevice) {
        await BluetoothService.disconnect(connectedDevice.id);
        setConnectedDevice(null);
        setConnectionState('disconnected');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setError(`Failed to disconnect: ${error.message}`);
      return false;
    }
  };

  // Forget device
  const forgetDevice = async (deviceId) => {
    try {
      // Disconnect if connected
      if (connectedDevice && connectedDevice.id === deviceId) {
        await disconnectDevice();
      }
      
      // Remove from saved devices
      setSavedDevices(prev => prev.filter(device => device.id !== deviceId));
      
      return true;
    } catch (error) {
      console.error('Error forgetting device:', error);
      return false;
    }
  };

  // Check if Bluetooth is supported
  const isBluetoothSupported = BluetoothService.isSupported();

  return (
    <BluetoothContext.Provider
      value={{
        isBluetoothSupported,
        isBluetoothEnabled,
        isScanning,
        devices,
        savedDevices,
        connectedDevice,
        connectionState,
        error,
        startScan,
        connectToDevice,
        disconnectDevice,
        forgetDevice,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

// src/services/AudioService.js
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import Voice from '@react-native-community/voice';
import RNFS from 'react-native-fs';
import { PermissionsService } from './PermissionsService';
import { AUDIO_SETTINGS, MAX_RECORDING_DURATION } from '../utils/constants';

// Enable playback in silent mode
Sound.setCategory('Playback');

class AudioServiceClass {
  constructor() {
    this.isRecording = false;
    this.audioFile = null;
    this.sound = null;
    this.recordingPath = `${RNFS.CachesDirectoryPath}/recording.wav`;
    this.audioData = [];
    this.visualizerCallback = null;
    this.silenceDetectionActive = false;
    this.silenceThreshold = 15;
    this.silenceCounter = 0;
    this.onSilenceDetected = null;
    this.recordingTimer = null;
    this.maxRecordingDuration = MAX_RECORDING_DURATION;
    this.speechResultsCallback = null;
    this.lastTranscription = '';
    
    this.init();
  }

  /**
   * Initialize the audio service
   */
  async init() {
    try {
      // Configure audio recorder
      const options = {
        sampleRate: AUDIO_SETTINGS.SAMPLE_RATE,
        channels: AUDIO_SETTINGS.CHANNELS,
        bitsPerSample: AUDIO_SETTINGS.BIT_DEPTH,
        wavFile: 'recording.wav',
        audioSource: 6, // MIC for Android
      };
      
      await AudioRecord.init(options);
      
      // Initialize voice recognition
      Voice.onSpeechResults = this.onSpeechResults.bind(this);
      Voice.onSpeechError = this.onSpeechError.bind(this);
      Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
      
      // Add event listener for audio data (for visualizer)
      const audioRecordEmitter = new NativeEventEmitter(NativeModules.AudioRecord);
      
      audioRecordEmitter.addListener('audioData', (data) => {
        // Add data to the buffer for silence detection
        this.audioData.push(data);
        
        // If we have a visualizer callback, call it with the audio data
        if (this.visualizerCallback) {
          this.visualizerCallback(data);
        }
        
        // Check for silence if enabled
        if (this.silenceDetectionActive) {
          this.detectSilence(data);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing AudioService:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(options = {}) {
    try {
      // Request permissions if not already granted
      const hasPermission = await PermissionsService.checkAudioPermission();
      if (!hasPermission) {
        const granted = await PermissionsService.requestAudioPermission();
        if (!granted) {
          throw new Error('Audio recording permission denied');
        }
      }
      
      if (this.isRecording) {
        await this.stopRecording();
      }
      
      // Clear previous data
      this.audioData = [];
      this.silenceCounter = 0;
      this.lastTranscription = '';
      
      // Configure silence detection if needed
      if (options.detectSilence) {
        this.silenceDetectionActive = true;
        this.silenceThreshold = options.silenceThreshold || 15;
        this.onSilenceDetected = options.onSilenceDetected;
      } else {
        this.silenceDetectionActive = false;
      }
      
      // Set visualizer callback if provided
      if (options.visualizerCallback) {
        this.visualizerCallback = options.visualizerCallback;
      }
      
      // Set speech results callback
      if (options.speechResultsCallback) {
        this.speechResultsCallback = options.speechResultsCallback;
      }
      
      // Start voice recognition if needed
      if (options.useVoiceRecognition) {
        try {
          await Voice.start('en-US');
        } catch (voiceError) {
          console.warn('Voice recognition error:', voiceError);
          // Continue without voice recognition
        }
      }
      
      // Start recording
      this.isRecording = true;
      AudioRecord.start();
      
      // Set a maximum recording time
      this.recordingTimer = setTimeout(() => {
        this.stopRecording();
      }, this.maxRecordingDuration);
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording audio
   */
  async stopRecording() {
    try {
      if (!this.isRecording) return null;
      
      // Clear the recording timer
      if (this.recordingTimer) {
        clearTimeout(this.recordingTimer);
        this.recordingTimer = null;
      }
      
      // Stop voice recognition if it was started
      try {
        await Voice.stop();
      } catch (voiceError) {
        // Ignore voice errors when stopping
      }
      
      // Stop recording and get audio file
      const audioBase64 = await AudioRecord.stop();
      this.isRecording = false;
      
      // Reset visualizer callback
      this.visualizerCallback = null;
      this.silenceDetectionActive = false;
      
      // Save the recording to a file
      try {
        await RNFS.writeFile(this.recordingPath, audioBase64, 'base64');
        this.audioFile = this.recordingPath;
      } catch (fileError) {
        console.error('Error saving audio file:', fileError);
      }
      
      return { 
        audioBase64,
        transcription: this.lastTranscription
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isRecording = false;
      this.visualizerCallback = null;
      this.silenceDetectionActive = false;
      return null;
    }
  }

  /**
   * Play audio from a base64 string
   */
  async playAudioFromBase64(base64Audio) {
    try {
      // Create a temporary file from the base64 data
      const tempFile = `${RNFS.CachesDirectoryPath}/temp_playback_${Date.now()}.wav`;
      await RNFS.writeFile(tempFile, base64Audio, 'base64');
      
      return await this.playAudioFile(tempFile, true); // true to delete after playing
    } catch (error) {
      console.error('Error playing audio from base64:', error);
      return false;
    }
  }

  /**
   * Play audio from a file
   */
  async playAudioFile(filePath, deleteAfterPlaying = false) {
    try {
      // Stop any currently playing sound
      if (this.sound) {
        this.sound.stop();
        this.sound.release();
      }
      
      return new Promise((resolve, reject) => {
        this.sound = new Sound(filePath, '', (error) => {
          if (error) {
            console.error('Error loading sound:', error);
            reject(error);
            return;
          }
          
          // Play the sound
          this.sound.play((success) => {
            // Clean up after playing
            if (this.sound) {
              this.sound.release();
              this.sound = null;
            }
            
            // Delete the file if requested
            if (deleteAfterPlaying) {
              RNFS.unlink(filePath).catch(e => console.warn('Error deleting temp file:', e));
            }
            
            resolve(success);
          });
        });
      });
    } catch (error) {
      console.error('Error playing audio file:', error);
      return false;
    }
  }
  
  /**
   * Play audio through the connected Bluetooth device
   */
  async playAudioThroughBluetooth(base64Audio) {
    try {
      // The implementation depends on the specific Bluetooth device
      // This is a simplified version that just uses the normal playback
      // In a real implementation, you'd need to handle routing audio specifically to the Bluetooth device
      return await this.playAudioFromBase64(base64Audio);
    } catch (error) {
      console.error('Error playing audio through Bluetooth:', error);
      return false;
    }
  }

  /**
   * Get the recorded audio file path
   */
  getAudioFilePath() {
    return this.audioFile;
  }

  /**
   * Detect silence in audio data
   */
  detectSilence(audioData) {
    try {
      // Simple silence detection based on audio amplitude
      const buffer = Buffer.from(audioData, 'base64');
      let sum = 0;
      
      // Process the buffer in 2-byte chunks (16-bit samples)
      for (let i = 0; i < buffer.length; i += 2) {
        const sample = buffer.readInt16LE(i);
        sum += Math.abs(sample);
      }
      
      // Calculate average amplitude
      const average = sum / (buffer.length / 2);
      
      // Check if below threshold
      if (average < this.silenceThreshold) {
        this.silenceCounter++;
        
        // If silent for more than 1.5 seconds (assuming 20ms chunks)
        if (this.silenceCounter > 75 && this.onSilenceDetected) {
          this.onSilenceDetected();
          this.silenceCounter = 0;
        }
      } else {
        this.silenceCounter = 0;
      }
    } catch (error) {
      console.warn('Error in silence detection:', error);
    }
  }

  /**
   * Speech recognition result handler
   */
  onSpeechResults(event) {
    if (event.value && event.value.length > 0) {
      // Store the transcription
      this.lastTranscription = event.value[0];
      
      // Call the callback if it exists
      if (this.speechResultsCallback) {
        this.speechResultsCallback(this.lastTranscription);
      }
    }
  }

  /**
   * Speech recognition error handler
   */
  onSpeechError(event) {
    console.warn('Speech recognition error:', event);
  }
  
  /**
   * Speech recognition end handler
   */
  onSpeechEnd() {
    console.log('Speech recognition ended');
  }

  /**
   * Get the last transcription
   */
  getLastTranscription() {
    return this.lastTranscription || '';
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.isRecording) {
      this.stopRecording().catch(console.error);
    }
    
    if (this.sound) {
      this.sound.stop();
      this.sound.release();
      this.sound = null;
    }
    
    Voice.destroy().catch(console.error);
  }
}

export const AudioService = new AudioServiceClass();

// src/services/BluetoothService.js
import { Platform, NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';
import { BleManager as BleManagerRNBLE } from 'react-native-ble-plx';
import { BLUETOOTH_SERVICES } from '../utils/constants';

// Use different BLE implementations based on the platform
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Create a BleManagerRNBLE instance for more advanced functionality
const bleManagerRNBLE = new BleManagerRNBLE();

/**
 * Service for managing Bluetooth Low Energy (BLE) connections
 */
class BluetoothServiceClass {
  constructor() {
    this.isInitialized = false;
    this.listeners = [];
    this.connectedDevices = {};
    this.scanTimeout = null;
    this.stateChangeCallback = null;
    this.discoveryCallback = null;
  }

  /**
   * Initialize the Bluetooth service
   */
  async init() {
    try {
      if (this.isInitialized) return true;
      
      // Initialize BleManager
      await BleManager.start({ showAlert: false });
      
      // Add listeners for events
      this.addManagerListeners();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Bluetooth service:', error);
      throw error;
    }
  }

  /**
   * Add event listeners for BleManager
   */
  addManagerListeners() {
    // Listener for BLE state changes
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDidUpdateState', (args) => {
        if (this.stateChangeCallback) {
          this.stateChangeCallback(args.state);
        }
      })
    );

    // Listener for device discovery
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (device) => {
        // Only emit devices with a name
        if (device.name && this.discoveryCallback) {
          const formattedDevice = {
            id: device.id,
            name: device.name || 'Unknown Device',
            rssi: device.rssi,
            manufacturer: device.advertising?.manufacturerData?.bytes || [],
            serviceUUIDs: device.advertising?.serviceUUIDs || [],
          };
          this.discoveryCallback(formattedDevice);
        }
      })
    );

    // Listener for device connections
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerConnectPeripheral', (args) => {
        console.log('Device connected:', args.peripheral);
      })
    );

    // Listener for device disconnections
    this.listeners.push(
      bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (args) => {
        console.log('Device disconnected:', args.peripheral);
        delete this.connectedDevices[args.peripheral];
      })
    );
  }

  /**
   * Remove all event listeners
   */
  removeListeners() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }

  /**
   * Check if Bluetooth is supported on the device
   */
  isSupported() {
    return Platform.OS === 'android' || Platform.OS === 'ios';
  }

  /**
   * Get the current Bluetooth state
   */
  async getState() {
    try {
      const state = await BleManager.checkState();
      return state;
    } catch (error) {
      console.error('Error getting Bluetooth state:', error);
      return 'Unknown';
    }
  }

  /**
   * Register a callback for Bluetooth state changes
   */
  onStateChange(callback) {
    this.stateChangeCallback = callback;
  }

  /**
   * Start scanning for Bluetooth devices
   */
  async startScan(discoveryCallback) {
    try {
      this.discoveryCallback = discoveryCallback;
      
      // Stop any ongoing scans
      await this.stopScan();
      
      // Define services to scan for - common audio services
      const serviceUUIDs = Object.values(BLUETOOTH_SERVICES);
      
      // Start scanning
      await BleManager.scan(serviceUUIDs, 10, true);
      
      // Set timeout to stop scanning after 10 seconds
      this.scanTimeout = setTimeout(() => {
        this.stopScan();
      }, 10000);
      
      return true;
    } catch (error) {
      console.error('Error starting scan:', error);
      throw error;
    }
  }

  /**
   * Stop scanning for Bluetooth devices
   */
  async stopScan() {
    try {
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
      
      await BleManager.stopScan();
      return true;
    } catch (error) {
      console.error('Error stopping scan:', error);
      return false;
    }
  }

  /**
   * Connect to a Bluetooth device
   */
  async connect(deviceId, maxRetries = 3) {
    try {
      let retryCount = 0;
      let connected = false;
      
      while (!connected && retryCount < maxRetries) {
        try {
          // Connect to the device
          await BleManager.connect(deviceId);
          
          // Retrieve services and characteristics
          await BleManager.retrieveServices(deviceId);
          
          // Store connected device
          this.connectedDevices[deviceId] = {
            id: deviceId,
            connected: true,
          };
          
          connected = true;
          
          // Also try to connect using the RNBLE library for advanced functionality
          try {
            await bleManagerRNBLE.connectToDevice(deviceId);
          } catch (rnbleError) {
            console.warn('RNBLE connection failed, using BleManager only:', rnbleError);
          }
          
          return true;
        } catch (error) {
          console.warn(`Connection attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw error;
          }
          
          // Wait before trying again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  /**
   * Disconnect from a Bluetooth device
   */
  async disconnect(deviceId) {
    try {
      await BleManager.disconnect(deviceId);
      delete this.connectedDevices[deviceId];
      
      // Also disconnect using the RNBLE library
      try {
        const device = await bleManagerRNBLE.devices([deviceId]);
        if (device && device.length > 0) {
          await device[0].cancelConnection();
        }
      } catch (rnbleError) {
        console.warn('RNBLE disconnect failed:', rnbleError);
      }
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      throw error;
    }
  }

  /**
   * Check if a device is connected
   */
  isDeviceConnected(deviceId) {
    return this.connectedDevices[deviceId]?.connected || false;
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices() {
    return Object.values(this.connectedDevices);
  }

  /**
   * Clean up the Bluetooth service
   */
  cleanup() {
    this.removeListeners();
    Object.keys(this.connectedDevices).forEach(deviceId => {
      this.disconnect(deviceId).catch(console.error);
    });
    this.isInitialized = false;
  }
}

export const BluetoothService = new BluetoothServiceClass();

// src/services/PermissionsService.js
import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSION_CODES } from '../utils/constants';

class PermissionsServiceClass {
  /**
   * Request all necessary Android permissions
   */
  async requestAndroidPermissions() {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Required for Bluetooth scanning on Android
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );
      
      return allGranted;
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return false;
    }
  }

  /**
   * Request all necessary iOS permissions
   */
  async requestIOSPermissions() {
    // iOS permissions are handled by the respective libraries
    return true;
  }

  /**
   * Check audio permission
   */
  async checkAudioPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        return granted;
      }
      
      // On iOS, the permission check is handled by the audio recording library
      return true;
    } catch (error) {
      console.error('Error checking audio permission:', error);
      return false;
    }
  }

  /**
   * Request audio permission
   */
  async requestAudioPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'AIRAssist Audio Permission',
            message: 'AIRAssist needs access to your microphone to listen to your voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      // On iOS, the permission request is handled by the audio recording library
      return true;
    } catch (error) {
      console.error('Error requesting audio permission:', error);
      return false;
    }
  }

  /**
   * Check Android Bluetooth permissions
   */
  async checkAndroidBluetoothPermissions() {
    try {
      if (Platform.OS !== 'android') return true;
      
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const results = await Promise.all(
        permissions.map(permission => PermissionsAndroid.check(permission))
      );
      
      return results.every(result => result);
    } catch (error) {
      console.error('Error checking Android Bluetooth permissions:', error);
      return false;
    }
  }

  /**
   * Request Android Bluetooth permissions
   */
  async requestAndroidBluetoothPermissions() {
    try {
      if (Platform.OS !== 'android') return true;
      
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      
      // Add Bluetooth permissions for Android 12+
      if (Platform.Version >= 31) { // Android 12
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
      }
      
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );
      
      return allGranted;
    } catch (error) {
      console.error('Error requesting Android Bluetooth permissions:', error);
      return false;
    }
  }
}

export const PermissionsService = new PermissionsServiceClass();

// src/services/WebSocketService.js
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

// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageServiceClass {
  /**
   * Save data to storage
   */
  async saveData(key, value) {
    try {
      if (typeof value === 'object') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, String(value));
      }
      return true;
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Load data from storage
   */
  async loadData(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      
      if (value === null) {
        return defaultValue;
      }
      
      try {
        return JSON.parse(value);
      } catch (parseError) {
        // If parsing fails, return the raw value
        return value;
      }
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from storage
   */
  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export const StorageService = new StorageServiceClass();

// src/screens/HomeScreen.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';
import { AudioService } from '../services/AudioService';
import { colors } from '../styles/colors';
import Conversation from '../components/Conversation';
import StatusPanel from '../components/StatusPanel';
import Header from '../components/Header';

const HomeScreen = ({ navigation }) => {
  const {
    wsConnected,
    settings,
    messages,
    isProcessingAudio,
    isSpeaking,
    sendAudioToServer,
    clearConversation,
    setIsProcessingAudio,
  } = useContext(AppContext);
  
  const {
    isBluetoothEnabled,
    connectedDevice,
    connectionState,
    startScan,
    error: bluetoothError,
  } = useContext(BluetoothContext);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [showBluetoothDevices, setShowBluetoothDevices] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const conversationRef = useRef(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationRef.current && messages.length > 0) {
      setTimeout(() => {
        conversationRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Handle auto-listening after AI response
  useEffect(() => {
    if (settings.autoListen && !isProcessingAudio && !isSpeaking && !isRecording && isListening) {
      const timer = setTimeout(() => {
        handleStartRecording();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessingAudio, isSpeaking, isListening]);
  
  // Start listening when auto-listen is enabled
  useEffect(() => {
    if (settings.autoListen && !isListening && wsConnected && isBluetoothEnabled && connectedDevice) {
      setIsListening(true);
    }
  }, [wsConnected, isBluetoothEnabled, connectedDevice, settings.autoListen]);
  
  // Start recording audio
  const handleStartRecording = async () => {
    try {
      if (isRecording || isProcessingAudio || isSpeaking) return;
      
      setIsRecording(true);
      setTranscription('');
      
      // Configure recording options
      const options = {
        detectSilence: true,
        silenceThreshold: settings.silenceThreshold,
        useVoiceRecognition: true,
        onSilenceDetected: handleStopRecording,
        speechResultsCallback: (text) => {
          setTranscription(text);
        },
      };
      
      // Start recording
      await AudioService.startRecording(options);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start recording. Please check your permissions.');
    }
  };
  
  // Stop recording and process audio
  const handleStopRecording = async () => {
    try {
      if (!isRecording) return;
      
      setIsRecording(false);
      
      // Stop recording and get audio data
      const result = await AudioService.stopRecording();
      
      if (result && result.audioBase64) {
        // Process audio
        await sendAudioToServer(result.audioBase64, result.transcription || transcription);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsProcessingAudio(false);
    }
  };
  
  // Toggle bluetooth device selection
  const toggleBluetoothDevices = () => {
    if (!showBluetoothDevices) {
      startScan().catch(console.error);
    }
    setShowBluetoothDevices(!showBluetoothDevices);
  };
  
  // Toggle auto-listening mode
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      if (!isRecording && !isProcessingAudio && !isSpeaking) {
        handleStartRecording();
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="AIRAssist"
        onSettingsPress={() => navigation.navigate('Settings')}
        connectedDevice={connectedDevice}
        onBluetoothPress={toggleBluetoothDevices}
      />
      
      <StatusPanel 
        wsConnected={wsConnected}
        bluetoothConnected={!!connectedDevice}
        isListening={isListening}
        bluetoothStatus={connectionState}
        showDevices={showBluetoothDevices}
        onClose={() => setShowBluetoothDevices(false)}
      />
      
      <View style={styles.content}>
        <Conversation 
          messages={messages}
          onClearConversation={() => {
            Alert.alert(
              'Clear Conversation',
              'Are you sure you want to clear the conversation?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Clear',
                  onPress: clearConversation,
                  style: 'destructive',
                },
              ]
            );
          }}
          ref={conversationRef}
        />
      </View>
      
      <View style={styles.footer}>
        {isRecording && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionText}>
              {transcription || 'Listening...'}
            </Text>
          </View>
        )}
        
        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.listenButton,
              isListening ? styles.listenButtonActive : null,
            ]}
            onPress={toggleListening}
          >
            <Icon 
              name={isListening ? 'hearing' : 'hearing-disabled'} 
              size={24} 
              color={isListening ? colors.white : colors.textPrimary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording ? styles.recordButtonActive : null,
              (isProcessingAudio || isSpeaking) ? styles.recordButtonDisabled : null,
            ]}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessingAudio || isSpeaking}
          >
            {isProcessingAudio ? (
              <ActivityIndicator color={colors.white} size="large" />
            ) : (
              <Icon 
                name={isRecording ? 'stop' : 'mic'} 
                size={32} 
                color={colors.white} 
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear Conversation',
                'Are you sure you want to clear the conversation?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear',
                    onPress: clearConversation,
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Icon name="clear-all" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transcriptionContainer: {
    backgroundColor: colors.backgroundDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  transcriptionText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordButtonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  listenButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listenButtonActive: {
    backgroundColor: colors.success,
  },
  clearButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default HomeScreen;

// src/screens/SettingsScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppContext } from '../context/AppContext';
import { BluetoothContext } from '../context/BluetoothContext';
import { colors } from '../styles/colors';
import { SILENCE_DETECTION, APP_VERSION } from '../utils/constants';
import { StorageService } from '../services/StorageService';

const SettingsScreen = ({ navigation }) => {
  const { settings, updateSettings, clearConversation } = useContext(AppContext);
  const { savedDevices, forgetDevice } = useContext(BluetoothContext);
  
  const [localSettings, setLocalSettings] = useState({ ...settings });
  
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);
  
  const handleUpdate = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const saveSettings = () => {
    updateSettings(localSettings);
    Alert.alert('Success', 'Settings saved successfully');
  };
  
  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            StorageService.clearAllData().then(() => {
              Alert.alert('Success', 'All settings have been reset. The app will now restart.');
              // In a real app, you'd need to restart the app here
              navigation.goBack();
            });
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={localSettings.userName}
              onChangeText={(text) => handleUpdate('userName', text)}
              placeholder="Enter your name"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>WebSocket URL</Text>
            <TextInput
              style={styles.input}
              value={localSettings.wsServerUrl}
              onChangeText={(text) => handleUpdate('wsServerUrl', text)}
              placeholder="wss://your-websocket-server.com"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Settings</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>AI Voice</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={localSettings.aiVoice}
                onValueChange={(value) => handleUpdate('aiVoice', value)}
                style={styles.picker}
                dropdownIconColor={colors.textPrimary}
              >
                <Picker.Item label="Default" value="default" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Auto-Listen Mode</Text>
            <Switch
              value={localSettings.autoListen}
              onValueChange={(value) => handleUpdate('autoListen', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={localSettings.autoListen ? colors.accent : colors.white}
            />
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>
              Silence Threshold: {localSettings.silenceThreshold}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={SILENCE_DETECTION.MIN_THRESHOLD}
              maximumValue={SILENCE_DETECTION.MAX_THRESHOLD}
              step={1}
              value={localSettings.silenceThreshold}
              onValueChange={(value) => handleUpdate('silenceThreshold', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.accent}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Low (More Sensitive)</Text>
              <Text style={styles.sliderLabel}>High (Less Sensitive)</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Bluetooth Devices</Text>
          {savedDevices.length > 0 ? (
            savedDevices.map((device) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceId}>{device.id}</Text>
                  {device.lastConnected && (
                    <View style={styles.lastConnectedBadge}>
                      <Text style={styles.lastConnectedText}>Last Connected</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.forgetButton}
                  onPress={() => {
                    Alert.alert(
                      'Forget Device',
                      `Are you sure you want to forget ${device.name}?`,
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Forget',
                          onPress: () => forgetDevice(device.id),
                          style: 'destructive',
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="delete" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDevicesText}>No saved devices</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              Alert.alert(
                'Clear Conversation History',
                'Are you sure you want to clear all conversation history?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Clear',
                    onPress: clearConversation,
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>Clear Conversation History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={resetSettings}
          >
            <Text style={styles.buttonText}>Reset All Settings</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.infoText}>AIRAssist v{APP_VERSION}</Text>
          <Text style={styles.infoText}>© 2025 Your Company</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={saveSettings}
          >
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  deviceId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  lastConnectedBadge: {
    backgroundColor: colors.success,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  lastConnectedText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  forgetButton: {
    padding: 8,
  },
  noDevicesText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
});

export default SettingsScreen;

// src/components/Conversation.js
import React, { forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';
import MessageItem from './MessageItem';

const Conversation = forwardRef(({ messages, onClearConversation }, ref) => {
  // Check if there are any messages
  const hasMessages = messages && messages.length > 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Conversation</Text>
        {hasMessages && (
          <TouchableOpacity onPress={onClearConversation} style={styles.clearButton}>
            <Icon name="clear-all" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        ref={ref}
        style={styles.messageList}
        contentContainerStyle={[
          styles.messageListContent,
          !hasMessages && styles.emptyListContent,
        ]}
      >
        {hasMessages ? (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="chat" size={48} color={colors.border} />
            <Text style={styles.emptyStateText}>
              No messages yet. Tap the mic button to start talking with your AI assistant.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundDark,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  clearButton: {
    padding: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
});

export default Conversation;

// src/components/MessageItem.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

const MessageItem = ({ message }) => {
  const { text, isUser, type, timestamp } = message;
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Determine message style based on type and sender
  const getMessageStyle = () => {
    if (type === 'system') {
      return styles.systemMessage;
    }
    return isUser ? styles.userMessage : styles.aiMessage;
  };
  
  // Determine text style based on type and sender
  const getTextStyle = () => {
    if (type === 'system') {
      return styles.systemText;
    }
    return isUser ? styles.userText : styles.aiText;
  };
  
  // Get icon for message
  const getIcon = () => {
    if (type === 'system') {
      return 'info';
    }
    return isUser ? 'person' : 'smart-toy';
  };
  
  return (
    <View style={[styles.container, getMessageStyle()]}>
      <View style={styles.iconContainer}>
        <Icon name={getIcon()} size={24} color={colors.white} />
      </View>
      <View style={styles.content}>
        <Text style={getTextStyle()}>{text}</Text>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    maxWidth: '90%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: colors.backgroundDark,
    maxWidth: '80%',
  },
  iconContainer: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 8,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  userText: {
    color: colors.white,
    fontSize: 16,
  },
  aiText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  systemText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default MessageItem;

// src/components/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

const Header = ({ title, onSettingsPress, connectedDevice, onBluetoothPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Icon name="assistant" size={24} color={colors.white} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onBluetoothPress}>
          <Icon
            name={connectedDevice ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={connectedDevice ? colors.success : colors.white}
          />
          {connectedDevice && (
            <View style={styles.connectionDot} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onSettingsPress}>
          <Icon name="settings" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    color: colors.white,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  connectionDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
});

export default Header;

// src/components/StatusPanel.js
import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';
import { BluetoothContext } from '../context/BluetoothContext';

const StatusPanel = ({ 
  wsConnected, 
  bluetoothConnected, 
  isListening,
  bluetoothStatus,
  showDevices,
  onClose
}) => {
  const { 
    devices, 
    connectedDevice, 
    isScanning, 
    startScan, 
    connectToDevice 
  } = useContext(BluetoothContext);
  
  // Render a device item in the list
  const renderDeviceItem = ({ item }) => {
    const isConnected = connectedDevice && connectedDevice.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.deviceItem,
          isConnected && styles.connectedDeviceItem
        ]}
        onPress={() => {
          if (!isConnected) {
            connectToDevice(item);
          }
        }}
        disabled={isConnected}
      >
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name}</Text>
          <Text style={styles.deviceId}>{item.id}</Text>
        </View>
        <View style={styles.deviceStatus}>
          {isConnected ? (
            <Icon name="bluetooth-connected" size={24} color={colors.success} />
          ) : (
            <Icon name="bluetooth" size={24} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.statusItem}>
        <Icon 
          name={wsConnected ? 'cloud-done' : 'cloud-off'} 
          size={20} 
          color={wsConnected ? colors.success : colors.error} 
        />
        <Text style={styles.statusText}>
          {wsConnected ? 'Connected to server' : 'Disconnected from server'}
        </Text>
      </View>
      
      <View style={styles.statusItem}>
        <Icon 
          name={bluetoothConnected ? 'bluetooth-connected' : 'bluetooth-disabled'} 
          size={20} 
          color={bluetoothConnected ? colors.success : colors.error} 
        />
        <Text style={styles.statusText}>
          {bluetoothConnected 
            ? `Connected to ${connectedDevice.name}` 
            : 'No Bluetooth device connected'}
        </Text>
      </View>
      
      <View style={styles.statusItem}>
        <Icon 
          name={isListening ? 'hearing' : 'hearing-disabled'} 
          size={20} 
          color={isListening ? colors.success : colors.textSecondary} 
        />
        <Text style={styles.statusText}>
          {isListening ? 'Auto-listening enabled' : 'Auto-listening disabled'}
        </Text>
      </View>
      
      <Modal
        visible={showDevices}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bluetooth Devices</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={devices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.listHeaderText}>
                    {isScanning 
                      ? 'Scanning for devices...' 
                      : devices.length > 0 
                        ? 'Available devices:' 
                        : 'No devices found'}
                  </Text>
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Icon name="bluetooth-searching" size={48} color={colors.border} />
                  <Text style={styles.emptyListText}>
                    {isScanning 
                      ? 'Searching for devices...' 
                      : 'No Bluetooth devices found'}
                  </Text>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={startScan}
                  disabled={isScanning}
                >
                  <Text style={styles.scanButtonText}>
                    {isScanning ? 'Scanning...' : 'Scan for Devices'}
                  </Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundDark,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundDark,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  deviceList: {
    maxHeight: 400,
  },
  listHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listHeaderText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  connectedDeviceItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  deviceId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deviceStatus: {
    marginLeft: 8,
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  emptyListText: {
    marginTop: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    padding: 12,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  scanButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default StatusPanel;

// src/components/UserProfile.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

const UserProfile = ({ userName, onPress }) => {
  // Generate initials from the user name
  const getInitials = (name) => {
    if (!name) return 'G';
    
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) return 'G';
    
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(userName)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.userName}>{userName || 'Guest User'}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
});

export default UserProfile;

// src/utils/constants.js
// Default settings
export const DEFAULT_SETTINGS = {
  userName: 'Guest User',
  userId: '',
  autoListen: true,
  silenceThreshold: 15,
  wsServerUrl: 'wss://your-websocket-server.com',
  aiVoice: 'default',
};

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'airassist_settings',
  PENDING_MESSAGES: 'airassist_pending_messages',
  CONVERSATION_HISTORY: 'airassist_conversation_history',
  BLUETOOTH_DEVICES: 'airassist_bluetooth_devices',
  USER_INFO: 'airassist_user_info',
};

// Bluetooth services UUIDs
export const BLUETOOTH_SERVICES = {
  A2DP_SINK: '0000110b-0000-1000-8000-00805f9b34fb',
  A2DP_SOURCE: '0000110a-0000-1000-8000-00805f9b34fb',
  HSP_HFP: '00001108-0000-1000-8000-00805f9b34fb',
  HANDS_FREE_VOICE_GATEWAY: '00001131-0000-1000-8000-00805f9b34fb',
  HANDS_FREE: '0000111e-0000-1000-8000-00805f9b34fb',
  ADVANCED_AUDIO_DISTRIBUTION: '00001132-0000-1000-8000-00805f9b34fb',
  GENERIC_ACCESS: '00001800-0000-1000-8000-00805f9b34fb',
  GENERIC_ATTRIBUTE: '00001801-0000-1000-8000-00805f9b34fb',
};

// WebSocket message types
export const WS_MESSAGE_TYPES = {
  AUDIO: 'audioMessage',
  TEXT: 'textMessage',
  RESPONSE: 'aiResponse',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error',
};

// App version
export const APP_VERSION = '1.0.0';

// Maximum recording duration in milliseconds
export const MAX_RECORDING_DURATION = 30000; // 30 seconds

// Silence detection settings
export const SILENCE_DETECTION = {
  MIN_THRESHOLD: 5,
  MAX_THRESHOLD: 30,
  DEFAULT_THRESHOLD: 15,
  SILENCE_DURATION: 1500, // 1.5 seconds of silence to stop recording
};

// Audio recording settings
export const AUDIO_SETTINGS = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  FORMAT: 'wav',
};

// Permission request codes
export const PERMISSION_CODES = {
  BLUETOOTH: 100,
  AUDIO: 101,
  STORAGE: 102,
};

// src/styles/colors.js
export const colors = {
  primary: '#3f51b5',
  primaryLight: '#757de8',
  primaryDark: '#002984',
  accent: '#4fc3f7',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  background: '#f5f5f5',
  backgroundLight: '#ffffff',
  backgroundDark: '#e0e0e0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  border: '#bdbdbd',
  white: '#ffffff',
  black: '#000000',
};

// src/styles/typography.js
import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
  sizes: {
    small: 12,
    medium: 14,
    regular: 16,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
  },
};

// src/styles/common.js
import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
  },
  title: {
    fontSize: typography.sizes.large,
    fontWeight: typography.fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.sizes.regular,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.fontWeights.medium,
    fontSize: typography.sizes.regular,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    padding: 12,
    fontSize: typography.sizes.regular,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
});

// src/utils/helpers.js
import { Platform } from 'react-native';
import { WS_MESSAGE_TYPES } from './constants';

/**
 * Format a date to a readable string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a time to a readable string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create a WebSocket message
 */
export const createMessage = (type, data) => {
  return JSON.stringify({
    type,
    ...data,
    timestamp: Date.now(),
  });
};

/**
 * Parse a WebSocket message
 */
export const parseMessage = (message) => {
  try {
    return JSON.parse(message);
  } catch (error) {
    console.error('Error parsing message:', error);
    return null;
  }
};

/**
 * Check if a value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Get platform-specific styles
 */
export const getPlatformStyles = (androidStyles, iosStyles) => {
  return Platform.OS === 'ios' ? iosStyles : androidStyles;
};

// src/utils/deviceInfo.js
import { Platform, Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Get device information
export const getDeviceInfo = async () => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceName = await DeviceInfo.getDeviceName();
    const systemVersion = DeviceInfo.getSystemVersion();
    const appVersion = DeviceInfo.getVersion();
    const batteryLevel = await DeviceInfo.getBatteryLevel();
    const isTablet = DeviceInfo.isTablet();
    const manufacturer = await DeviceInfo.getManufacturer();
    const model = await DeviceInfo.getModel();
    
    return {
      deviceId,
      deviceName,
      systemName: Platform.OS,
      systemVersion,
      appVersion,
      batteryLevel,
      isTablet,
      manufacturer,
      model,
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return {
      deviceId: 'unknown',
      deviceName: 'unknown',
      systemName: Platform.OS,
      systemVersion: 'unknown',
      appVersion: 'unknown',
      batteryLevel: -1,
      isTablet: false,
      manufacturer: 'unknown',
      model: 'unknown',
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
    };
  }
};

// Get device network information
export const getNetworkInfo = async () => {
  try {
    const isConnected = await DeviceInfo.isNetworkAvailable();
    const type = await DeviceInfo.getNetworkType();
    
    return {
      isConnected,
      type,
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return {
      isConnected: false,
      type: 'unknown',
    };
  }
};