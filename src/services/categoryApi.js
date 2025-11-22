/**
 * Category API Service
 * 
 * API Endpoint: GET /api/v1/product-categories
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get all product categories
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise<Object>} API response with categories list
 */
export const getCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    
    const url = `${API_BASE_URL}/product-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
 * @param {Object} payload - Category data { name: string, description?: string, is_active?: boolean }
 * @returns {Promise<Object>} API response
 */
export const createCategory = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product-categories`, {
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
    console.error('Error creating category:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get a single category by ID
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} API response with category data
 */
export const getCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
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
        message: data.detail || data.message || 'Category not found',
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
    console.error('Error fetching category:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

/**
 * Update a category
 * @param {number} categoryId - Category ID
 * @param {Object} payload - Updated category data
 * @returns {Promise<Object>} API response
 */
export const updateCategory = async (categoryId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
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
    console.error('Error updating category:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Delete a category
 * @param {number} categoryId - Category ID
 * @returns {Promise<Object>} API response
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/product-categories/${categoryId}`, {
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
    console.error('Error deleting category:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};
