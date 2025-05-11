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
