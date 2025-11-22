/**
 * Adjustment API Service
 * Handles stock adjustment operations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Create a new adjustment
 * @param {Object} payload - Adjustment data
 * @returns {Promise<Object>} API response
 */
export const createAdjustment = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/adjustments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle 401 Unauthorized
    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
      };
    }

    // Handle 422 Validation Error
    if (response.status === 422) {
      return {
        success: false,
        statusCode: 422,
        message: data.detail || data.message || 'Validation error',
        errors: data.errors || [],
        meta: data.meta,
      };
    }

    // Handle success
    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        data: data,
      };
    }

    // Handle other errors
    return {
      success: false,
      statusCode: response.status,
      message: data.detail || data.message || `HTTP error! status: ${response.status}`,
      errors: data.errors || [],
    };
  } catch (error) {
    console.error('Error creating adjustment:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get all adjustments
 * @param {Object} params - Query parameters (skip, limit, etc.)
 * @returns {Promise<Object>} API response with adjustments list
 */
export const getAdjustments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page && params.limit) {
      const skip = (params.page - 1) * params.limit;
      queryParams.append('skip', skip);
      queryParams.append('limit', params.limit);
    } else if (params.limit) {
      queryParams.append('limit', params.limit);
    } else {
      queryParams.append('limit', params.limit || 100);
    }
    
    const url = `${API_BASE_URL}/adjustments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    // Handle 401 Unauthorized
    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
        data: [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    // Backend returns direct array, not wrapped in data/meta
    const adjustmentsArray = Array.isArray(data) ? data : (data.data || []);
    const total = adjustmentsArray.length;
    
    return { 
      success: true, 
      data: adjustmentsArray,
      meta: {
        total: total,
        page: params.page || 1,
        limit: params.limit || 100
      }
    };
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
      meta: { total: 0, page: 1, limit: 100 },
    };
  }
};

