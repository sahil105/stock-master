/**
 * Product API Service
 * 
 * API Endpoint: POST /api/v1/products
 * 
 * Request Payload:
 * {
 *   "name": "string",
 *   "sku": "string",
 *   "category_id": 0,
 *   "uom": "string",
 *   "warehouse_id": 0,
 *   "reorder_level": 0
 * }
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Create a new product
 * @param {Object} payload - Product data matching API structure
 * @returns {Promise<Object>} API response
 */
export const createProduct = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
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

    // Handle success (201 Created)
    if (response.ok) {
      return {
        success: true,
        statusCode: response.status,
        data: data.data || data,
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
    console.error('Error creating product:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get a single product by ID
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} API response with product data
 */
export const getProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
      };
    }

    // Handle 404 Not Found
    if (response.status === 404) {
      return {
        success: false,
        statusCode: 404,
        message: data.detail || data.message || 'Product not found',
        errors: [],
      };
    }

    // Handle other errors
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
    console.error('Error fetching product:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get all products
 * @param {Object} params - Query parameters (page, limit, search, warehouse_id)
 * @returns {Promise<Object>} API response with products list
 * 
 * Expected API Response Structure:
 * {
 *   "meta": {
 *     "total": 120,
 *     "page": 1,
 *     "limit": 25
 *   },
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Product Name",
 *       "sku": "SKU-001",
 *       "category_id": 2,
 *       "uom": "kg",
 *       "created_at": "2025-11-22T06:45:07.597Z"
 *     }
 *   ]
 * }
 */
export const getProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    
    const url = `${API_BASE_URL}/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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

    // Handle other errors
    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
      };
    }

    // Backend returns: { data: [...], meta: { total, page, limit } }
    return { 
      success: true, 
      data: data.data || [],
      meta: data.meta || { total: 0, page: 1, limit: 25 }
    };
  } catch (error) {
    console.error('Error fetching products:', error);
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
 * Update a product
 * @param {number} productId - Product ID
 * @param {Object} payload - Updated product data
 * @returns {Promise<Object>} API response
 */
export const updateProduct = async (productId, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PATCH',
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
    console.error('Error updating product:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Delete a product
 * @param {number} productId - Product ID
 * @returns {Promise<Object>} API response
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

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

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get product stock per warehouse
 * @returns {Promise<Object>} API response with stock data
 */
export const getProductStock = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products_stock`, {
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

    return { 
      success: true, 
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching product stock:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
      data: [],
    };
  }
};
