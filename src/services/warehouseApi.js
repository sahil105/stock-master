/**
 * Warehouse API Service
 * 
 * API Endpoint: GET /api/v1/warehouses
 * API Endpoint: POST /api/v1/warehouses
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get all warehouses
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} API response with warehouses list
 */
export const getWarehouses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${API_BASE_URL}/warehouses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
    console.error('Error fetching warehouses:', error);
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
 * Create a new warehouse
 * @param {Object} payload - Warehouse data { name: string, code: string, address?: string }
 * @returns {Promise<Object>} API response
 */
export const createWarehouse = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouses`, {
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
    console.error('Error creating warehouse:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get a single warehouse by ID
 * @param {number} warehouseId - Warehouse ID
 * @returns {Promise<Object>} API response with warehouse data
 */
export const getWarehouse = async (warehouseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}`, {
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
        message: data.detail || data.message || 'Warehouse not found',
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
    console.error('Error fetching warehouse:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Update a warehouse
 * @param {number} warehouseId - Warehouse ID
 * @param {Object} payload - Updated warehouse data
 * @returns {Promise<Object>} API response
 */
export const updateWarehouse = async (warehouseId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}`, {
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
    console.error('Error updating warehouse:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Delete a warehouse
 * @param {number} warehouseId - Warehouse ID
 * @returns {Promise<Object>} API response
 */
export const deleteWarehouse = async (warehouseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.detail || data.message || 'Unauthorized access. Please login again.',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};
