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
