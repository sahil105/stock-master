import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import PaginationControls from '../components/PaginationControls';
import { DataGrid } from '@mui/x-data-grid';
import { getCategories } from '../services/categoryApi';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch categories on component mount and when pagination changes
  useEffect(() => {
    fetchCategories();
  }, [meta.page, meta.limit]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories({ page: meta.page, limit: meta.limit });
      
      if (response.success) {
        setCategories(response.data || []);
        setMeta(response.meta || { total: 0, page: 1, limit: 25 });
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
            message: response.message || 'Failed to load categories.',
            severity: 'error',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading categories.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }
    const query = searchQuery.toLowerCase().trim();
    return categories.filter((category) => category.name?.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const columns = [
    { field: 'id', headerName: 'ID', flex: 0.5, width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      valueGetter: (params) => {
        if (!params.row?.created_at) return 'N/A';
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  ];

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handlePageChange = (newPage) => {
    setMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setMeta((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Product Categories
          </Typography>
          <Typography color="text.secondary">
            Manage product categories and their details.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by category name..."
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
            <Button variant="outlined" onClick={fetchCategories}>
              Refresh
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Categories List
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {meta.total} | Page: {meta.page} | Limit: {meta.limit}
            </Typography>
          </Stack>
          {loading ? (
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Loading categories...</Typography>
            </Box>
          ) : (
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={filteredCategories}
                columns={columns}
                hideFooter
                density="compact"
                disableRowSelectionOnClick
                loading={loading}
              />
            </Box>
          )}
          <PaginationControls
            meta={meta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
          />
        </Paper>
      </Stack>
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

export default CategoriesPage;

