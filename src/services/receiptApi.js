/**
 * Receipt API Service
 * 
 * API Endpoint: POST /api/receipts
 * 
 * Request Payload:
 * {
 *   "vendor_name": "string",
 *   "warehouse_id": 0,
 *   "items": [
 *     {
 *       "product_id": 0,
 *       "qty": 0
 *     }
 *   ]
 * }
 * 
 * Response Structure (201):
 * {
 *   "meta": {
 *     "total": 120,
 *     "page": 1,
 *     "limit": 25
 *   },
 *   "data": {
 *     "id": 0
 *   }
 * }
 */

// TODO: Replace with actual API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Create a new receipt
 * @param {Object} payload - Receipt data matching API structure
 * @returns {Promise<Object>} API response
 */
export const createReceipt = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
        // 'Authorization': `Bearer ${getAuthToken()}`,
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
    if (response.status === 201) {
      return {
        success: true,
        statusCode: 201,
        data: data.data || {},
        meta: data.meta || {},
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

    return { success: true, data: data.data || data, meta: data.meta };
  } catch (error) {
    console.error('Error creating receipt:', error);
    return {
      success: false,
      statusCode: 0,
      message: error.message || 'Network error. Please check your connection.',
      errors: [],
    };
  }
};

/**
 * Get all receipts
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} API response with receipts list
 */
export const getReceipts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    
    const url = `${API_BASE_URL}/receipts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
    console.error('Error fetching receipts:', error);
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

