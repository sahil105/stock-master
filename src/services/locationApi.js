/**
 * Location API Service
 * 
 * API Endpoint: GET /api/v1/warehouse_locations
 * API Endpoint: POST /api/v1/warehouse_locations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get all warehouse locations
 * @param {Object} params - Query parameters (page, limit, warehouse_id)
 * @returns {Promise<Object>} API response with locations list
 */
export const getLocations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    
    const url = `${API_BASE_URL}/warehouse_locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
    console.error('Error fetching locations:', error);
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
 * Create a new warehouse location
 * @param {Object} payload - Location data { name: string, code: string, warehouse_id: number }
 * @returns {Promise<Object>} API response
 */
export const createLocation = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse_locations`, {
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
    console.error('Error creating location:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get a single warehouse location by ID
 * @param {number} locationId - Location ID
 * @returns {Promise<Object>} API response with location data
 */
export const getLocation = async (locationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse_locations/${locationId}`, {
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
        message: data.detail || data.message || 'Location not found',
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
    console.error('Error fetching location:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Update a warehouse location
 * @param {number} locationId - Location ID
 * @param {Object} payload - Updated location data
 * @returns {Promise<Object>} API response
 */
export const updateLocation = async (locationId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse_locations/${locationId}`, {
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
    console.error('Error updating location:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Delete a warehouse location
 * @param {number} locationId - Location ID
 * @returns {Promise<Object>} API response
 */
export const deleteLocation = async (locationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse_locations/${locationId}`, {
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
    console.error('Error deleting location:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};
