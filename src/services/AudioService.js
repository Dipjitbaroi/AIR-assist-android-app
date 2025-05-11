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
