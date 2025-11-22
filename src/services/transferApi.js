/**
 * Transfer API Service
 * Handles inter-warehouse transfer operations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Create a new transfer
 * @param {Object} payload - Transfer data
 * @returns {Promise<Object>} API response
 */
export const createTransfer = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        statusCode: 422,
        message: data.detail || data.message || 'Validation error',
        errors: data.errors || [],
      };
    }

    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        data: data.data || data,
      };
    }

    return {
      success: false,
      statusCode: response.status,
      message: data.detail || data.message || `HTTP error! status: ${response.status}`,
      errors: data.errors || [],
    };
  } catch (error) {
    console.error('Error creating transfer:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get all transfers
 * @param {Object} params - Query parameters (page, limit, search, warehouse_from, warehouse_to, status)
 * @returns {Promise<Object>} API response with transfers list
 */
export const getTransfers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.warehouse_from) queryParams.append('warehouse_from', params.warehouse_from);
    if (params.warehouse_to) queryParams.append('warehouse_to', params.warehouse_to);
    if (params.status) queryParams.append('status', params.status);
    
    const url = `${API_BASE_URL}/transfers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

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

    return { 
      success: true, 
      data: data.data || [],
      meta: data.meta || { total: 0, page: 1, limit: 25 }
    };
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
      meta: { total: 0, page: 1, limit: 25 },
    };
  }
};

/**
 * Get a single transfer by ID
 * @param {number} transferId - Transfer ID
 * @returns {Promise<Object>} API response with transfer data
 */
export const getTransfer = async (transferId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        statusCode: 404,
        message: data.detail || data.message || 'Transfer not found',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('Error fetching transfer:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Update a transfer
 * @param {number} transferId - Transfer ID
 * @param {Object} payload - Updated transfer data
 * @returns {Promise<Object>} API response
 */
export const updateTransfer = async (transferId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
        errors: [],
      };
    }

    if (response.status === 422) {
      return {
        success: false,
        statusCode: 422,
        message: data.detail || data.message || 'Validation error',
        errors: data.errors || [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
      };
    }

    return { success: true, data: data.data || data };
  } catch (error) {
    console.error('Error updating transfer:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};
