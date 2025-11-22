import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import ProductFormDialog from '../components/ProductFormDialog';
import PaginationControls from '../components/PaginationControls';
import { DataGrid } from '@mui/x-data-grid';
import { createProduct, getProducts } from '../services/productApi';
import { getCategories } from '../services/categoryApi';
import { getWarehouses } from '../services/warehouseApi';

// Static products data - in real app this would come from API
const initialProducts = [
  { id: 1, name: 'Steel Rods', sku: 'STL-001', category_id: 1, category_name: 'Raw Materials', uom: 'kg' },
  { id: 2, name: 'Frame Bolts', sku: 'BLT-101', category_id: 3, category_name: 'Fasteners', uom: 'pcs' },
  { id: 3, name: 'Panel Sheets', sku: 'PNL-302', category_id: 2, category_name: 'Components', uom: 'sqm' },
  { id: 4, name: 'Desk', sku: 'DESK001', category_id: 5, category_name: 'Furniture', uom: 'unit' },
  { id: 5, name: 'Table', sku: 'TBL001', category_id: 5, category_name: 'Furniture', uom: 'unit' },
];

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsMeta, setProductsMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  // Fetch categories and warehouses on component mount
  useEffect(() => {
    fetchCategories();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [productsMeta.page, productsMeta.limit]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await getProducts({ page: productsMeta.page, limit: productsMeta.limit });
      
      if (response.success) {
        // Get categories if not already loaded
        let categoriesData = categories;
        if (categories.length === 0) {
          const catResponse = await getCategories();
          if (catResponse.success) {
            categoriesData = catResponse.data || [];
            setCategories(categoriesData);
          }
        }

        // Map API data to include category_name for display
        const productsWithCategoryNames = response.data.map((product) => {
          const category = categoriesData.find((cat) => cat.id === product.category_id);
          return {
            ...product,
            category_name: category?.name || 'Unknown Category',
          };
        });
        
        setProducts(productsWithCategoryNames);
        setProductsMeta(response.meta || { total: 0, page: 1, limit: 25 });
      } else {
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to load products.',
            severity: 'error',
          });
        }
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading products.',
        severity: 'error',
      });
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        console.error('Error fetching categories:', response.message);
        // Keep empty array on error, will show in form
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      const response = await getWarehouses();
      if (response.success) {
        setWarehouses(response.data || []);
      } else {
        console.error('Error fetching warehouses:', response.message);
        // Keep empty array on error, will show in form
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setWarehousesLoading(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category_name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const columns = [
    { field: 'name', headerName: 'Product name', flex: 1.6 },
    { field: 'sku', headerName: 'SKU / Code', flex: 1 },
    {
      field: 'category_name',
      headerName: 'Category',
      flex: 1.2,
      valueGetter: (params) => params?.row?.category_name || '',
    },
    { field: 'uom', headerName: 'Unit', flex: 0.8 },
    {
      field: 'reorder_level',
      headerName: 'Reorder Level',
      flex: 1,
      valueGetter: (params) => {
        const value = params.row?.reorder_level;
        return value !== undefined && value !== null ? value : 0;
      },
    },
  ];

  const handleViewChange = (_event, next) => {
    if (next) setViewMode(next);
  };

  // Handle save from dialog
  const handleSaveProduct = async (apiPayload, formValues) => {
    try {
      // Call API
      const response = await createProduct(apiPayload);
      
      if (response.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: selectedProduct ? 'Product updated successfully!' : 'Product created successfully!',
          severity: 'success',
        });
        
        // Close dialog
        setDialogOpen(false);
        setSelectedProduct(null);
        
        // Refresh products list from API
        fetchProducts();
      } else {
        // Handle 401 Unauthorized
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
          // TODO: Redirect to login page if needed
          // navigate('/login');
          return;
        }

        // Handle 422 Validation Error
        if (response.statusCode === 422 && response.errors && response.errors.length > 0) {
          // Format validation errors
          const errorMessages = response.errors.map((err) => {
            const field = err.field || 'field';
            return `${field}: ${err.message}`;
          }).join(', ');
          
          setSnackbar({
            open: true,
            message: `Validation error: ${errorMessages}`,
            severity: 'error',
          });
          // Keep dialog open to allow user to fix errors
          return;
        }

        // Handle other errors
        setSnackbar({
          open: true,
          message: response.message || 'Failed to save product. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      // Show error message
      setSnackbar({
        open: true,
        message: 'An error occurred while saving the product. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenDialog = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  const handlePageChange = (newPage) => {
    setProductsMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setProductsMeta((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Products
          </Typography>
          <Typography color="text.secondary">
            Create/update products with SKU/code, category, unit of measure, and optional initial stock so availability is tracked per
            warehouse.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Product name, SKU, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
              <ToggleButton value="list">List</ToggleButton>
              <ToggleButton value="kanban">Kanban</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={() => {
              setSearchQuery('');
              fetchProducts();
            }}>
              Refresh list
            </Button>
            <Button variant="contained" onClick={handleOpenDialog}>
              New
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Product register / list view
          </Typography>
          {viewMode === 'list' ? (
            <Box sx={{ height: 320 }}>
              {!productsLoading && filteredProducts.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Try adjusting your search or create a new product.' : 'Create a new product to get started.'}
                  </Typography>
                </Box>
              ) : (
                <DataGrid 
                  rows={filteredProducts} 
                  columns={columns} 
                  hideFooter 
                  density="compact" 
                  disableRowSelectionOnClick
                  loading={productsLoading}
                />
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', minHeight: 320 }}>
              {productsLoading ? (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 320,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Loading products...
                  </Typography>
                </Box>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <Paper
                    key={product.id}
                    elevation={3}
                    sx={{
                      width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)', lg: 'calc(25% - 12px)' },
                      minWidth: 220,
                      maxWidth: 280,
                      p: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                      },
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {product.sku || 'N/A'}
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>
                      {product.name || 'Unnamed Product'}
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 'auto', pt: 1 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <strong>Category:</strong> {product.category_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <strong>Unit:</strong> {product.uom || 'N/A'}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        <strong>Reorder Level:</strong> {(product.reorder_level !== undefined && product.reorder_level !== null) ? Number(product.reorder_level) : 0} {product.uom || ''}
                      </Typography>
                    </Stack>
                  </Paper>
                ))
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 320,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No products found. Try adjusting your search or create a new product.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          <PaginationControls
            meta={productsMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={productsLoading}
          />
        </Paper>

      </Stack>
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        product={selectedProduct}
        onSave={handleSaveProduct}
        categories={categories}
        warehouses={warehouses}
        loading={categoriesLoading || warehousesLoading}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default ProductsPage;

