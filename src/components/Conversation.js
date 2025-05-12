/**
 * Conversation Component
 * 
 * Displays the conversation history between the user and the AI assistant.
 * Includes message bubbles for both user and AI messages.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

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
import { typography } from '../styles/typography';
import { layout } from '../styles/layout';

/**
 * Message Bubble Component
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.message - Message object containing text, isUser, and type
 * @returns {React.ReactElement} Rendered component
 */
const MessageBubble = ({ message }) => {
  /**
   * Get container styles based on message type and sender
   * 
   * @returns {Array} Array of style objects
   */
  const getContainerStyles = () => {
    const containerStyles = [styles.messageBubble];
    
    if (message.isUser) {
      containerStyles.push(styles.userMessage);
    } else {
      containerStyles.push(styles.aiMessage);
      
      if (message.type === 'system') {
        containerStyles.push(styles.systemMessage);
      }
    }
    
    return containerStyles;
  };
  
  /**
   * Get text styles based on message type and sender
   * 
   * @returns {Array} Array of style objects
   */
  const getTextStyles = () => {
    const textStyles = [styles.messageText];
    
    if (message.isUser) {
      textStyles.push(styles.userMessageText);
    } else {
      textStyles.push(styles.aiMessageText);
      
      if (message.type === 'system') {
        textStyles.push(styles.systemMessageText);
      }
    }
    
    return textStyles;
  };
  
  /**
   * Get icon for message based on type
   * 
   * @returns {React.ReactElement|null} Icon component or null
   */
  const getMessageIcon = () => {
    if (message.type === 'system') {
      return (
        <Icon
          name="info"
          size={16}
          color={colors.info}
          style={styles.messageIcon}
        />
      );
    }
    
    return null;
  };
  
  return (
    <View style={[styles.messageContainer, message.isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
      <View style={getContainerStyles()}>
        {getMessageIcon()}
        <Text style={getTextStyles()}>{message.text}</Text>
      </View>
    </View>
  );
};

/**
 * Timestamp Component
 * 
 * @param {Object} props - Component properties
 * @param {number} props.timestamp - Message timestamp in milliseconds
 * @returns {React.ReactElement} Rendered component
 */
const Timestamp = ({ timestamp }) => {
  /**
   * Format timestamp to readable string
   * 
   * @param {number} timestamp - Timestamp in milliseconds
   * @returns {string} Formatted timestamp
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
  };
  
  return <Text style={styles.timestamp}>{formatTimestamp(timestamp)}</Text>;
};

/**
 * Conversation Component
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.messages - List of message objects
 * @param {Function} props.onClearConversation - Function to call when clearing conversation
 * @returns {React.ReactElement} Rendered component
 */
const Conversation = forwardRef(({ messages, onClearConversation }, ref) => {
  /**
   * Check if we should show timestamp for a message
   * 
   * @param {number} index - Message index
   * @returns {boolean} True if timestamp should be shown
   */
  const shouldShowTimestamp = (index) => {
    if (index === 0) {
      return true;
    }
    
    const currentMessage = messages[index];
    const previousMessage = messages[index - 1];
    
    // Show timestamp if more than 5 minutes between messages
    return (currentMessage.timestamp - previousMessage.timestamp) > 5 * 60 * 1000;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Conversation</Text>
        
        {messages.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearConversation}
          >
            <Icon name="delete" size={20} color={colors.error} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView
        ref={ref}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="chat" size={48} color={colors.border} />
            <Text style={styles.emptyText}>
              No conversation yet. Start by speaking or typing.
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View key={message.id || index}>
              {shouldShowTimestamp(index) && (
                <Timestamp timestamp={message.timestamp} />
              )}
              <MessageBubble message={message} />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
});

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: layout.spacing.xs,
    marginBottom: layout.spacing.xs,
  },
  
  headerText: {
    ...typography.h5,
    color: colors.textPrimary,
  },
  
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.spacing.xs,
  },
  
  clearButtonText: {
    ...typography.body,
    color: colors.error,
    marginLeft: layout.spacing.xxs,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollViewContent: {
    paddingVertical: layout.spacing.medium,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: layout.spacing.medium,
    textAlign: 'center',
  },
  
  messageContainer: {
    marginBottom: layout.spacing.medium,
    flexDirection: 'row',
  },
  
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  
  messageBubble: {
    borderRadius: 16,
    padding: layout.spacing.medium,
    maxWidth: '85%',
    ...layout.shadows.small,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  userMessage: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  
  aiMessage: {
    backgroundColor: colors.backgroundLight,
    borderBottomLeftRadius: 4,
  },
  
  systemMessage: {
    backgroundColor: colors.backgroundDark,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  messageText: {
    ...typography.body,
  },
  
  userMessageText: {
    color: colors.textLight,
  },
  
  aiMessageText: {
    color: colors.textPrimary,
  },
  
  systemMessageText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  
  messageIcon: {
    marginRight: layout.spacing.xs,
    marginTop: 2,
  },
  
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: layout.spacing.small,
  },
});

export default Conversation;
