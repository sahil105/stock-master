/**
 * Category API Service
 * 
 * API Endpoint: GET /api/product-categories
 * 
 * Response Structure:
 * {
 *   "meta": {
 *     "total": 120,
 *     "page": 1,
 *     "limit": 25
 *   },
 *   "data": [
 *     {
 *       "id": 2,
 *       "name": "Metals",
 *       "created_at": "2025-11-22T06:45:07.597Z"
 *     }
 *   ]
 * }
 */

// TODO: Replace with actual API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Get all product categories
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} API response with categories list
 */
export const getCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const url = `${API_BASE_URL}/product-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
        // 'Authorization': `Bearer ${getAuthToken()}`,
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

    return { 
      success: true, 
      data: data.data || [], 
      meta: data.meta 
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
    };
  }
};

/**
 * Create a new category
 * @param {Object} payload - Category data { name: string }
 * @returns {Promise<Object>} API response
 */
export const createCategory = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product-categories`, {
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

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

