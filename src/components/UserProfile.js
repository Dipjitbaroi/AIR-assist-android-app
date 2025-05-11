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
