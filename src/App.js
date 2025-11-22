import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductsPage from './pages/ProductsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import DeliveryPage from './pages/DeliveryPage';
import MoveHistoryPage from './pages/MoveHistoryPage';
import WarehousesPage from './pages/WarehousesPage';
import LocationsPage from './pages/LocationsPage';
import StockPage from './pages/StockPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#253494' },
          secondary: { main: '#ff7a18' },
          background: { default: '#f5f7fb', paper: '#ffffff' },
        },
        typography: {
          fontFamily: ['Inter', 'Segoe UI', 'system-ui'].join(','),
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/move-history" element={<MoveHistoryPage />} />
          <Route path="/warehouses" element={<WarehousesPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
