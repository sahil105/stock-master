/**
 * Authentication API Service
 * Handles login, register, OTP, and user profile operations
 */

import { setAuthToken, setUser, getAuthHeaders, removeAuthToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

/**
 * Request password reset (forgot password)
 * @param {Object} payload - { email }
 * @returns {Promise<Object>} API response
 */
export const forgotPassword = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Failed to send password reset',
      };
    }

    return {
      success: true,
      message: data.message || 'Password reset link sent to email',
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Login user
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} API response with token
 */
export const login = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Login failed',
      };
    }

    // Store token and user data
    // Backend returns: { data: { token, user: { id, name, email, role } } }
    if (data.data && data.data.token) {
      setAuthToken(data.data.token);
      if (data.data.user) {
        setUser(data.data.user);
      }
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Reset password using token
 * @param {Object} payload - { token, email, password }
 * @returns {Promise<Object>} API response
 */
export const resetPassword = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Failed to reset password',
      };
    }

    return {
      success: true,
      message: data.message || 'Password reset successfully',
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} API response
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Logout failed',
      };
    }

    // Clear token and user data
    removeAuthToken();

    return {
      success: true,
      message: data.message || 'Logged out successfully',
    };
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear token anyway
    removeAuthToken();
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Refresh JWT token
 * @returns {Promise<Object>} API response with new token
 */
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Token refresh failed',
      };
    }

    // Store new token
    if (data.data && data.data.token) {
      setAuthToken(data.data.token);
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Register a new user
 * Note: Backend doesn't have a register endpoint yet, so this is a placeholder
 * @param {Object} payload - { email, password, user_id? }
 * @returns {Promise<Object>} API response
 */
export const register = async (payload) => {
  try {
    // TODO: Update this when backend adds /api/v1/auth/register endpoint
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Registration failed',
      };
    }

    // Store token and user data if registration returns auth info
    if (data.data && data.data.token) {
      setAuthToken(data.data.token);
      if (data.data.user) {
        setUser(data.data.user);
      }
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Request OTP for password reset
 * Note: Backend uses token-based reset, but this function adapts to OTP flow
 * @param {Object} payload - { email }
 * @returns {Promise<Object>} API response
 */
export const requestOTP = async (payload) => {
  try {
    // Use forgot password endpoint which generates a reset token
    // In development, the token might be printed to console
    const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || 'Failed to send OTP',
      };
    }

    return {
      success: true,
      message: data.message || 'OTP sent successfully',
      // Note: In development, check console for reset token if OTP is needed
    };
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Verify OTP for password reset
 * Note: This is now handled by resetPassword which verifies OTP when resetting password
 * @param {Object} payload - { email, otp }
 * @returns {Promise<Object>} API response
 * @deprecated Use resetPassword instead - OTP verification happens during password reset
 */
export const verifyOTP = async (payload) => {
  // This function is kept for backward compatibility
  // OTP verification now happens in resetPassword endpoint
  if (!payload.otp || payload.otp.length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: 'OTP is required',
    };
  }
  return {
    success: true,
    message: 'OTP format is valid. Please proceed to reset password.',
  };
};

