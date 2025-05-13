/**
 * Styles Index
 * 
 * Centralizes and exports all styling-related modules.
 * This allows for easier imports in components.
 * 
 * @author AIR-assist Development Team
 * @version 1.0.0
 */

import theme, { createTheme } from './theme';
import commonStyles from './commonStyles';

export {
  theme as default,
  createTheme,
  commonStyles,
};
