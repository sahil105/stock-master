import { useState, useMemo } from 'react';
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { stock } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function StockPage() {
  const [rows, setRows] = useState(stock);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stock based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows;
    }
    const query = searchQuery.toLowerCase().trim();
    return rows.filter((row) => row.product?.toLowerCase().includes(query));
  }, [rows, searchQuery]);

  // Handle row update after cell edit
  const processRowUpdate = (newRow) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === newRow.id) {
          return newRow;
        }
        return row;
      })
    );
    return newRow;
  };

  const columns = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      editable: false, // Product name should not be editable
    },
    {
      field: 'perUnitCost',
      headerName: 'per unit cost',
      flex: 1,
      editable: true,
      width: 150,
    },
    {
      field: 'onHand',
      headerName: 'On hand',
      flex: 1,
      editable: true,
      type: 'number',
      width: 120,
    },
    {
      field: 'freeToUse',
      headerName: 'free to Use',
      flex: 1,
      editable: true,
      type: 'number',
      width: 120,
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Stock
          </Typography>
          <Typography color="text.secondary">Manage stock levels and update inventory directly.</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Product..."
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
            <Button variant="outlined" onClick={() => setRows(stock)}>
              Reset
            </Button>
            <Button variant="contained" onClick={() => console.log('Saving stock updates...', rows)}>
              Save Changes
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Stock register / list view
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            User must be able to update the stock from here. Click on editable cells to modify values.
          </Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              hideFooter
              density="compact"
              processRowUpdate={processRowUpdate}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:editable': {
                  backgroundColor: 'rgba(37, 52, 148, 0.05)',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 52, 148, 0.1)',
                  },
                },
                '& .MuiDataGrid-cell:focus': {
                  outline: '2px solid #253494',
                },
              }}
            />
          </Box>
        </Paper>
      </Stack>
    </MainLayout>
  );
}

export default StockPage;

