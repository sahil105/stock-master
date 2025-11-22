/**
 * Location API Service
 * 
 * API Endpoint: GET /api/locations
 * API Endpoint: POST /api/locations
 * 
 * POST Request Payload:
 * {
 *   "name": "string",
 *   "code": "string",
 *   "warehouse_id": 1
 * }
 * 
 * POST Response Structure:
 * {
 *   "data": {
 *     "id": 1,
 *     "name": "Main Warehouse",
 *     "code": "Mumbai01",
 *     "warehouse_id": 1,
 *     "created_at": "2025-11-22T07:09:09.162Z"
 *   }
 * }
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Get all locations
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} API response with locations list
 */
export const getLocations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${API_BASE_URL}/locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
      },
    });

    const data = await response.json();

    // Handle 401 Unauthorized
    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.message || 'Unauthorized access. Please login again.',
        errors: [],
        data: [],
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    // Handle paginated response structure
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
 * Create a new location
 * @param {Object} payload - Location data { name: string, code: string, warehouse_id: number }
 * @returns {Promise<Object>} API response
 */
export const createLocation = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Handle 401 Unauthorized
    if (response.status === 401) {
      return {
        success: false,
        statusCode: 401,
        message: data.message || 'Unauthorized access. Please login again.',
        errors: [],
      };
    }

    // Handle 422 Validation Error
    if (response.status === 422) {
      return {
        success: false,
        statusCode: 422,
        message: data.message || 'Validation error',
        errors: data.errors || [],
        meta: data.meta,
      };
    }

    // Handle 201 Created Success
    if (response.status === 201 || response.ok) {
      return {
        success: true,
        statusCode: response.status,
        data: data.data || data,
      };
    }

    // Handle other errors
    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
      };
    }

    return { success: true, data: data.data || data };
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

