/**
 * Authentication service for managing JWT tokens and user authentication
 */

const TOKEN_KEY = 'stockmaster_token';
const USER_KEY = 'stockmaster_user';

/**
 * Get the stored authentication token
 * @returns {string|null} The JWT token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the authentication token
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token
 */
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get the stored user information
 * @returns {object|null} The user object or null if not found
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

/**
 * Store user information
 * @param {object} user - The user object to store
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Logout the user
 */
export const logout = () => {
  removeAuthToken();
  window.location.href = '/login';
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization header
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
};

