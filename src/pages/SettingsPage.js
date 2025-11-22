import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Close, Delete, Edit } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { DataGrid } from '@mui/x-data-grid';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryApi';

function SettingsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories({ limit: 100 });
      if (response.success) {
        setCategories(response.data || []);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to load categories.',
          severity: 'error',
        });
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

  const handleOpenDialog = (category = null) => {
    setSelectedCategory(category);
    setCategoryName(category ? category.name : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setCategoryName('');
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setSnackbar({
        open: true,
        message: 'Category name is required.',
        severity: 'error',
      });
      return;
    }

    try {
      let response;
      if (selectedCategory) {
        response = await updateCategory(selectedCategory.id, { name: categoryName.trim() });
      } else {
        response = await createCategory({ name: categoryName.trim() });
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: selectedCategory ? 'Category updated successfully!' : 'Category created successfully!',
          severity: 'success',
        });
        handleCloseDialog();
        fetchCategories();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to save category.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while saving the category.',
        severity: 'error',
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await deleteCategory(categoryId);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Category deleted successfully!',
          severity: 'success',
        });
        fetchCategories();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete category.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while deleting the category.',
        severity: 'error',
      });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Category Name', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      valueGetter: (params) => {
        if (!params.row?.created_at) return 'N/A';
        try {
          // Handle UTC date strings like "2025-11-22T08:28:02"
          const dateStr = params.row.created_at;
          const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'Z');
          if (isNaN(date.getTime())) return 'N/A';
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (e) {
          return 'N/A';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteCategory(params.row.id)}
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Workspace Settings
          </Typography>
          <Typography color="text.secondary">
            Configure notifications, user roles, and system-level defaults from here.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Product Categories
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              Add Category
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage product categories. Categories are used to organize and classify products in the system.
          </Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={categories}
              columns={columns}
              hideFooter
              density="compact"
              disableRowSelectionOnClick
              loading={loading}
            />
          </Box>
        </Paper>
      </Stack>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedCategory ? 'Edit Category' : 'Create Category'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Category Name"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter category name"
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSaveCategory}>
                {selectedCategory ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default SettingsPage;
