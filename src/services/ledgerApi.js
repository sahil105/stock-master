/**
 * Ledger API Service
 * Handles ledger/stock moves operations
 */

import { getAuthHeaders } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Get ledger entries (stock moves)
 * @param {Object} params - Query parameters (page, limit, product_id, warehouse_id, type)
 * @returns {Promise<Object>} API response with ledger entries
 */
export const getLedger = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.product_id) queryParams.append('product_id', params.product_id);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.type) queryParams.append('type', params.type);
    
    const url = `${API_BASE_URL}/ledger${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
        meta: { total: 0, page: 1, limit: 25 },
      };
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.detail || data.message || `HTTP error! status: ${response.status}`,
        errors: data.errors || [],
        data: [],
        meta: { total: 0, page: 1, limit: 25 },
      };
    }

    return { 
      success: true, 
      data: data.data || [],
      meta: data.meta || { total: 0, page: 1, limit: 25 }
    };
  } catch (error) {
    console.error('Error fetching ledger:', error);
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

