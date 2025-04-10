// Image paths
export const propertyPlaceholder = '/images/property-placeholder.jpg';
export const userAvatar = '/images/user-avatar.jpg';

// API endpoints
export const API_ENDPOINTS = {
  PROPERTIES: '/api/properties',
  USER: '/api/user',
  FAVORITES: '/api/user/favorites',
  VERIFICATION: '/api/users/verify/id',
  PASSKEY: '/api/users/passkey',
};

// App settings
export const APP_SETTINGS = {
  ITEMS_PER_PAGE: 10,
  MAX_IMAGES_PER_PROPERTY: 10,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_COMPARABLE_PROPERTIES: 4,
};

// Form validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

// UI Constants
export const UI = {
  NAVBAR_HEIGHT: '4rem',
  SIDEBAR_WIDTH: '260px',
  ANIMATION_DURATION: 300,
};

// Feature flags
export const FEATURES = {
  ENABLE_AI_RECOMMENDATIONS: true,
  ENABLE_CHAT: true,
  ENABLE_PASSKEYS: true,
  ENABLE_NOTIFICATIONS: true,
};

// Authentication
export const AUTH = {
  TOKEN_REFRESH_INTERVAL: 60 * 60 * 1000, // 1 hour
};

// Error messages
export const ERRORS = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
};

export default {
  propertyPlaceholder,
  userAvatar,
  API_ENDPOINTS,
  APP_SETTINGS,
  VALIDATION,
  UI,
  FEATURES,
  AUTH,
  ERRORS,
};