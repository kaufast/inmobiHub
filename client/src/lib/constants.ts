// Global application constants

// API Endpoints
export const API_ENDPOINTS = {
  // User authentication
  LOGIN: "/api/login",
  REGISTER: "/api/register",
  LOGOUT: "/api/logout",
  USER: "/api/user",
  
  // Properties
  PROPERTIES: "/api/properties",
  PROPERTY_DETAILS: (id: number) => `/api/properties/${id}`,
  FEATURED_PROPERTIES: "/api/properties/featured",
  PROPERTY_SEARCH: "/api/properties/search",
  RECOMMENDED_PROPERTIES: "/api/properties/recommended",
  
  // Favorites
  FAVORITES: "/api/user/favorites",
  FAVORITE_TOGGLE: (propertyId: number) => `/api/user/favorites/${propertyId}`,
  
  // Neighborhoods
  NEIGHBORHOODS: "/api/neighborhoods",
  NEIGHBORHOOD_DETAILS: (id: number) => `/api/neighborhoods/${id}`,
  
  // Property tours
  TOURS: "/api/property-tours",
  TOUR_DETAILS: (id: number) => `/api/property-tours/${id}`,
  USER_TOURS: "/api/user/tours",
  AVAILABLE_SLOTS: (propertyId: number, date: string) => 
    `/api/properties/${propertyId}/tour-slots?date=${date}`,
  
  // Messages
  MESSAGES: "/api/messages",
  MESSAGE_DETAILS: (id: number) => `/api/messages/${id}`,
  USER_MESSAGES: "/api/user/messages",
  
  // Chat
  CHAT_ANALYZE: "/api/chat/analyze",
  CHAT_IMAGE: "/api/chat/analyze-image",
  
  // Verification
  VERIFICATION: "/api/users/verify/id",
  VERIFICATION_STATUS: (userId: number) => `/api/users/${userId}/verification-status`, 
  VERIFIED_USERS: "/api/verified-users",
  VERIFICATION_ADMIN: "/api/admin/verification-requests",
  VERIFICATION_UPDATE: (userId: number) => `/api/admin/users/${userId}/verification`,
};

// Image placeholders
export const propertyPlaceholder = "/images/property-placeholder.jpg";
export const userAvatar = "/images/user-avatar.jpg";

// Application settings
export const APP_SETTINGS = {
  SITE_NAME: "Inmobi®",
  CONTACT_EMAIL: "info@inmobi.mobi",
  CONTACT_PHONE: "+34679680000",
  CONTACT_ADDRESS: "c. de la Ribera 14, 08003 Barcelona",
  COPYRIGHT_YEAR: new Date().getFullYear(),
  DEFAULT_LANGUAGE: "en",
  DEFAULT_CURRENCY: "USD",
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/png"],
};

// UI-related constants
export const UI = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  MAP_DEFAULT_ZOOM: 12,
  MAP_DEFAULT_CENTER: { lat: 40.416775, lng: -3.703790 }, // Madrid, Spain
  PROPERTY_CARD_LIMIT: 6,
  TOAST_DURATION: 5000,
  TOOLTIP_DELAY: 300,
  ITEMS_PER_PAGE: 10,
};

// Feature flags and toggles
export const FEATURES = {
  ENABLE_CHAT: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_TOURS: true,
  ENABLE_FAVORITES: true,
  ENABLE_VERIFICATION: true,
  ENABLE_PREMIUM_FEATURES: true,
  ENABLE_RECOMMENDATIONS: true,
  ENABLE_NEIGHBORHOOD_INSIGHTS: true,
  ENABLE_VOICE_SEARCH: true,
  ENABLE_IMAGE_SEARCH: true,
};

// Authentication related constants
export const AUTH = {
  TOKEN_STORAGE_KEY: "inmobi_token",
  USER_STORAGE_KEY: "inmobi_user",
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  ROLES: {
    USER: "user",
    AGENT: "agent",
    ADMIN: "admin",
  },
  VERIFICATION_STATUSES: {
    NONE: "none",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
  },
  ID_VERIFICATION_TYPES: {
    PASSPORT: "passport",
    DRIVERS_LICENSE: "driver_license",
    NATIONAL_ID: "national_id",
  },
};

// Error messages
export const ERRORS = {
  GENERIC: "Something went wrong. Please try again.",
  UNAUTHORIZED: "You must be logged in to access this feature.",
  FORBIDDEN: "You don't have permission to access this feature.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_FAILED: "Please check your input and try again.",
  SERVER_ERROR: "There was an error on the server. Please try again later.",
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
};