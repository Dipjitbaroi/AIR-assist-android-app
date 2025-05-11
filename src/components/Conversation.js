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
