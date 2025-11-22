/**
 * API service for communicating with the backend
 * Legacy OTP functions - use authApi.js instead
 */

// Re-export from authApi for backward compatibility
export { requestOTP as sendOTP, verifyOTP } from './authApi';

/**
 * Check if backend API is available
 * @returns {Promise<boolean>}
 */
export const checkAPIHealth = async () => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

