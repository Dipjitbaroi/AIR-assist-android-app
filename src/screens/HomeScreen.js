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
