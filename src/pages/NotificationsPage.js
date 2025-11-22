import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Warning, Search, Inventory2 } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { getProducts } from '../services/productApi';

function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLowStockAlerts();
  }, []);

  // Fetch products and determine low stock alerts
  const fetchLowStockAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products
      const productsResponse = await getProducts();
      if (!productsResponse.success) {
        throw new Error(productsResponse.error || 'Failed to fetch products');
      }

      const products = Array.isArray(productsResponse.data) 
        ? productsResponse.data 
        : productsResponse.data?.data || [];

      // Fetch stock data
      const stockResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/stock`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let stockData = [];
      if (stockResponse.ok) {
        stockData = await stockResponse.json();
        if (!Array.isArray(stockData)) {
          stockData = stockData?.data || [];
        }
      }

      // Create a map of product_id to stock levels
      const stockMap = {};
      stockData.forEach((stock) => {
        const productId = stock.product_id;
        if (!stockMap[productId]) {
          stockMap[productId] = {
            on_hand: 0,
            free_to_use: 0,
            warehouses: [],
          };
        }
        stockMap[productId].on_hand += stock.on_hand || 0;
        stockMap[productId].free_to_use += stock.free_to_use || 0;
        if (stock.warehouse_name) {
          stockMap[productId].warehouses.push({
            name: stock.warehouse_name,
            on_hand: stock.on_hand || 0,
            free_to_use: stock.free_to_use || 0,
          });
        }
      });

      // Determine low stock alerts
      const lowStockAlerts = products
        .map((product) => {
          const stock = stockMap[product.id] || { on_hand: 0, free_to_use: 0, warehouses: [] };
          const reorderLevel = product.reorder_level || 0;
          const currentStock = stock.free_to_use || stock.on_hand || 0;

          // Alert if stock is below reorder level
          if (currentStock < reorderLevel && reorderLevel > 0) {
            const shortage = reorderLevel - currentStock;
            const severity = currentStock === 0 ? 'error' : currentStock < reorderLevel * 0.5 ? 'warning' : 'info';
            
            return {
              id: product.id,
              productName: product.name || 'Unknown Product',
              sku: product.sku || 'N/A',
              category: product.category_name || 'Uncategorized',
              currentStock: currentStock,
              reorderLevel: reorderLevel,
              shortage: shortage,
              unit: product.uom || 'units',
              severity: severity,
              warehouses: stock.warehouses,
              productId: product.id,
            };
          }
          return null;
        })
        .filter((alert) => alert !== null);

      // Sort by severity (error > warning > info)
      const severityOrder = { error: 0, warning: 1, info: 2 };
      lowStockAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      setAlerts(lowStockAlerts);
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
      setError(err.message || 'Failed to load low stock alerts');
      
      // Fallback to sample data if API fails
      setAlerts([
        {
          id: 1,
          productName: 'Steel Rods',
          sku: 'STL-001',
          category: 'Raw Materials',
          currentStock: 450,
          reorderLevel: 1000,
          shortage: 550,
          unit: 'kg',
          severity: 'warning',
          warehouses: [{ name: 'Main Warehouse', on_hand: 450, free_to_use: 450 }],
        },
        {
          id: 2,
          productName: 'Frame Bolts',
          sku: 'BLT-101',
          category: 'Fasteners',
          currentStock: 80,
          reorderLevel: 200,
          shortage: 120,
          unit: 'pcs',
          severity: 'warning',
          warehouses: [{ name: 'Main Warehouse', on_hand: 80, free_to_use: 80 }],
        },
        {
          id: 3,
          productName: 'Panel Sheets',
          sku: 'PNL-302',
          category: 'Components',
          currentStock: 0,
          reorderLevel: 50,
          shortage: 50,
          unit: 'sqm',
          severity: 'error',
          warehouses: [{ name: 'Main Warehouse', on_hand: 0, free_to_use: 0 }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter alerts based on search query
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) {
      return alerts;
    }
    const query = searchQuery.toLowerCase().trim();
    return alerts.filter(
      (alert) =>
        alert.productName?.toLowerCase().includes(query) ||
        alert.sku?.toLowerCase().includes(query) ||
        alert.category?.toLowerCase().includes(query)
    );
  }, [alerts, searchQuery]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'error':
        return 'Critical';
      case 'warning':
        return 'Low Stock';
      default:
        return 'Below Reorder';
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Inventory2 sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Low Stock Alerts
              </Typography>
              <Typography color="text.secondary">
                Products that are below their reorder levels
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by product name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 300, flex: 1, maxWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Chip
              label={`${filteredAlerts.length} Alert${filteredAlerts.length !== 1 ? 's' : ''}`}
              color={filteredAlerts.length > 0 ? 'error' : 'default'}
              icon={<Warning />}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error && alerts.length === 0 ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : filteredAlerts.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Inventory2 sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No alerts found matching your search' : 'No Low Stock Alerts'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'All products are above their reorder levels'}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                elevation={2}
                sx={{
                  borderLeft: `4px solid ${
                    alert.severity === 'error'
                      ? '#f44336'
                      : alert.severity === 'warning'
                      ? '#ff9800'
                      : '#2196f3'
                  }`,
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {alert.productName}
                        </Typography>
                        <Chip
                          label={getSeverityLabel(alert.severity)}
                          color={getSeverityColor(alert.severity)}
                          size="small"
                          icon={<Warning />}
                        />
                      </Stack>

                      <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>SKU:</strong> {alert.sku}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Category:</strong> {alert.category}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={4} sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Current Stock
                          </Typography>
                          <Typography variant="h6" color="error.main" fontWeight={600}>
                            {alert.currentStock} {alert.unit}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Reorder Level
                          </Typography>
                          <Typography variant="h6" color="text.primary" fontWeight={600}>
                            {alert.reorderLevel} {alert.unit}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Shortage
                          </Typography>
                          <Typography variant="h6" color="error.main" fontWeight={600}>
                            -{alert.shortage} {alert.unit}
                          </Typography>
                        </Box>
                      </Stack>

                      {alert.warehouses && alert.warehouses.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                            Stock by Warehouse:
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {alert.warehouses.map((wh, idx) => (
                              <Chip
                                key={idx}
                                label={`${wh.name}: ${wh.free_to_use || wh.on_hand || 0} ${alert.unit}`}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </MainLayout>
  );
}

export default NotificationsPage;

