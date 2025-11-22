/**
 * Delivery API Service
 * Handles delivery operations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Create a new delivery
 * @param {Object} payload - Delivery data
 * @returns {Promise<Object>} API response
 */
export const createDelivery = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries`, {
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
      // FastAPI validation errors come in data.detail as array of objects
      let errorMessages = [];
      if (Array.isArray(data.detail)) {
        errorMessages = data.detail.map((err) => {
          const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'field';
          return `${field}: ${err.msg || 'Invalid value'}`;
        });
      } else if (typeof data.detail === 'string') {
        errorMessages = [data.detail];
      } else if (data.errors && Array.isArray(data.errors)) {
        errorMessages = data.errors.map((err) => {
          const field = err.field || 'field';
          return `${field}: ${err.message || 'Invalid value'}`;
        });
      }
      
      return {
        success: false,
        statusCode: 422,
        message: errorMessages.length > 0 ? errorMessages.join(', ') : (data.detail || data.message || 'Validation error'),
        errors: Array.isArray(data.detail) ? data.detail : (data.errors || []),
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
    console.error('Error creating delivery:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get all deliveries
 * @param {Object} params - Query parameters (page, limit, search, warehouse_id, status)
 * @returns {Promise<Object>} API response with deliveries list
 */
export const getDeliveries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.status) queryParams.append('status', params.status);
    
    const url = `${API_BASE_URL}/deliveries${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
    console.error('Error fetching deliveries:', error);
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
 * Get a single delivery by ID
 * @param {number} deliveryId - Delivery ID
 * @returns {Promise<Object>} API response with delivery data
 */
export const getDelivery = async (deliveryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}`, {
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
        message: data.detail || data.message || 'Delivery not found',
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
    console.error('Error fetching delivery:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Update a delivery
 * @param {number} deliveryId - Delivery ID
 * @param {Object} payload - Updated delivery data
 * @returns {Promise<Object>} API response
 */
export const updateDelivery = async (deliveryId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/deliveries/${deliveryId}`, {
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
    console.error('Error updating delivery:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};
