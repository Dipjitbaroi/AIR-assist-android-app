/**
 * useAudio Hook
 * 
 * A custom hook for managing audio recording and playback.
 * Provides a simplified interface for recording, playing, and processing audio.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import AudioRecord from 'react-native-audio-record';
import Sound from 'react-native-sound';
import Voice from '@react-native-community/voice';
import { PermissionsService } from '../services/PermissionsService';

// Enable Sound playback in silent mode (iOS)
Sound.setCategory('Playback', true);

/**
 * Audio recording and playback hook
 * 
 * @param {Object} options - Hook options
 * @param {boolean} [options.autoInitialize=true] - Whether to initialize automatically
 * @param {boolean} [options.enableVoiceRecognition=true] - Whether to enable voice recognition
 * @param {string} [options.language='en-US'] - Language for voice recognition
 * @returns {Object} Audio state and functions
 */
const useAudio = ({
  autoInitialize = true,
  enableVoiceRecognition = true,
  language = 'en-US',
} = {}) => {
  // State for initialization
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingConfig, setRecordingConfig] = useState({
    sampleRate: 44100,
    channels: 1,
    bitsPerSample: 16,
    audioSource: 6, // MIC source
    wavFile: 'recording.wav'
  });
  
  // State for voice recognition
  const [transcription, setTranscription] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  
  // State for playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState(null);
  
  /**
   * Initialize audio functionality
   * 
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  const initialize = useCallback(async () => {
    try {
      // Check microphone permission
      const hasMicPermission = await PermissionsService.hasMicrophonePermission();
      
      if (!hasMicPermission) {
        throw new Error('Microphone permission not granted');
      }
      
      // Configure Voice recognition
      if (enableVoiceRecognition) {
        Voice.onSpeechStart = () => {
          setIsRecognizing(true);
          setTranscription('');
        };
        
        Voice.onSpeechEnd = () => {
          setIsRecognizing(false);
        };
        
        Voice.onSpeechResults = (event) => {
          if (event.value && event.value.length > 0) {
            setTranscription(event.value[0]);
          }
        };
        
        Voice.onSpeechError = (event) => {
          console.warn('Speech recognition error:', event);
        };
      }
      
      // Configure AudioRecord
      await AudioRecord.init(recordingConfig);
      
      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err) {
      setError(`Initialization error: ${err.message}`);
      setIsInitialized(false);
      return false;
    }
  }, [enableVoiceRecognition, recordingConfig]);
  
  /**
   * Start recording audio
   * 
   * @param {Object} options - Recording options
   * @param {boolean} [options.useVoiceRecognition=true] - Whether to use voice recognition
   * @param {Function} [options.onSilenceDetected] - Callback for silence detection
   * @returns {Promise<boolean>} Whether recording started successfully
   */
  const startRecording = useCallback(async ({
    useVoiceRecognition = true,
    onSilenceDetected,
  } = {}) => {
    try {
      // Initialize if needed
      if (!isInitialized) {
        const initialized = await initialize();
        if (!initialized) {
          return false;
        }
      }
      
      // Don't start if already recording
      if (isRecording) {
        return true;
      }
      
      // Reset transcription
      setTranscription('');
      
      // Start voice recognition if enabled
      if (useVoiceRecognition && enableVoiceRecognition) {
        try {
          await Voice.start(language);
        } catch (err) {
          console.warn('Voice recognition start error:', err);
          // Continue even if voice recognition fails
        }
      }
      
      // Start audio recording
      AudioRecord.start();
      
      // Set up silence detection if callback provided
      if (onSilenceDetected) {
        AudioRecord.on('data', () => {
          // This is a simplified implementation
          // In a real app, we would analyze audio levels to detect silence
        });
      }
      
      setIsRecording(true);
      return true;
    } catch (err) {
      setError(`Start recording error: ${err.message}`);
      return false;
    }
  }, [isInitialized, isRecording, initialize, enableVoiceRecognition, language]);
  
  /**
   * Stop recording audio
   * 
   * @returns {Promise<Object|null>} Recording result or null if error
   */
  const stopRecording = useCallback(async () => {
    if (!isRecording) {
      return null;
    }
    
    try {
      // Stop voice recognition
      if (enableVoiceRecognition) {
        try {
          await Voice.stop();
        } catch (err) {
          console.warn('Voice recognition stop error:', err);
          // Continue even if voice recognition stop fails
        }
      }
      
      // Stop audio recording
      const audioBase64 = await AudioRecord.stop();
      
      setIsRecording(false);
      
      return {
        audioBase64,
        transcription,
      };
    } catch (err) {
      setError(`Stop recording error: ${err.message}`);
      setIsRecording(false);
      return null;
    }
  }, [isRecording, enableVoiceRecognition, transcription]);
  
  /**
   * Play audio from base64 data
   * 
   * @param {string} base64Audio - Base64-encoded audio data
   * @returns {Promise<boolean>} Whether playback started successfully
   */
  const playAudio = useCallback(async (base64Audio) => {
    if (!base64Audio) {
      setError('No audio data provided');
      return false;
    }
    
    try {
      // Stop any current playback
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
      }
      
      // Create a temporary file path
      const filePath = `${Sound.DOCUMENT_PATH}/playback.wav`;
      
      // Write base64 audio to file
      // In a real implementation, we would use RNFS to write the file
      
      // Create and play sound
      return new Promise((resolve) => {
        const sound = new Sound(filePath, '', (error) => {
          if (error) {
            setError(`Sound load error: ${error.message}`);
            resolve(false);
            return;
          }
          
          setCurrentSound(sound);
          setIsPlaying(true);
          
          sound.play((success) => {
            setIsPlaying(false);
            
            // Clean up
            sound.release();
            setCurrentSound(null);
            
            resolve(success);
          });
        });
      });
    } catch (err) {
      setError(`Play audio error: ${err.message}`);
      setIsPlaying(false);
      return false;
    }
  }, [currentSound]);
  
  /**
   * Stop audio playback
   * 
   * @returns {boolean} Whether playback was stopped successfully
   */
  const stopPlayback = useCallback(() => {
    if (!isPlaying || !currentSound) {
      return true;
    }
    
    try {
      currentSound.stop();
      currentSound.release();
      setCurrentSound(null);
      setIsPlaying(false);
      return true;
    } catch (err) {
      setError(`Stop playback error: ${err.message}`);
      return false;
    }
  }, [isPlaying, currentSound]);
  
  /**
   * Update recording configuration
   * 
   * @param {Object} config - New recording configuration
   */
  const updateRecordingConfig = useCallback((config) => {
    setRecordingConfig(prevConfig => ({
      ...prevConfig,
      ...config,
    }));
    
    // Re-initialize with new config if already initialized
    if (isInitialized) {
      AudioRecord.init({
        ...recordingConfig,
        ...config,
      }).catch(err => {
        setError(`Update recording config error: ${err.message}`);
      });
    }
  }, [isInitialized, recordingConfig]);
  
  // Initialize audio when component mounts if autoInitialize is true
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
    
    // Clean up when component unmounts
    return () => {
      if (isRecording) {
        AudioRecord.stop().catch(console.error);
      }
      
      if (currentSound) {
        currentSound.stop();
        currentSound.release();
      }
      
      if (enableVoiceRecognition) {
        Voice.destroy().catch(console.error);
      }
    };
  }, []);
  
  return {
    // State
    isInitialized,
    isRecording,
    isRecognizing,
    isPlaying,
    transcription,
    error,
    recordingConfig,
    
    // Functions
    initialize,
    startRecording,
    stopRecording,
    playAudio,
    stopPlayback,
    updateRecordingConfig,
  };
};

export default useAudio;
