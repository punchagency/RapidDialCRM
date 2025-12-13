/**
 * Configuration for API integration
 * Set USE_CUSTOM_BACKEND to true to use the custom backend instead of the original API
 */
export const API_CONFIG = {
 USE_CUSTOM_BACKEND: process.env.REACT_APP_USE_CUSTOM_BACKEND === 'true' || false,
 CUSTOM_BACKEND_URL: process.env.REACT_APP_CUSTOM_BACKEND_URL || 'http://localhost:8000',
 ORIGINAL_API_URL: process.env.REACT_APP_ORIGINAL_API_URL || '',
 ORIGINAL_API_KEY: process.env.REACT_APP_ORIGINAL_API_KEY || '',
};

/**
 * Get the appropriate API client based on configuration
 */
export const getApiClient = () => {
 if (API_CONFIG.USE_CUSTOM_BACKEND) {
  // Use the custom backend API directly
  const { CustomServerApi } = require('./api');
  return CustomServerApi;
 } else {
  // Use the original API client
  const { api } = require('@/integrations/original-api/client');
  return api;
 }
};

/**
 * Get the appropriate database client based on configuration
 */
export const getDatabaseClient = () => {
 if (API_CONFIG.USE_CUSTOM_BACKEND) {
  // Use the custom backend API directly
  const { CustomServerApi } = require('./api');
  return CustomServerApi;
 } else {
  // Use the original API client
  const { api } = require('@/integrations/original-api/client');
  return api;
 }
};
