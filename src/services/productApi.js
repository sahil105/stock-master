/**
 * Product API Service
 * 
 * API Endpoint: POST /api/products
 * 
 * Request Payload:
 * {
 *   "name": "string",
 *   "sku": "string",
 *   "category_id": 0,
 *   "uom": "string",
 *   "reorder_level": 0
 * }
 */

// TODO: Replace with actual API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

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
        // TODO: Add authentication token if needed
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all products
 * @returns {Promise<Object>} API response with products list
 */
export const getProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: error.message };
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add authentication token if needed
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
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
        // TODO: Add authentication token if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};

