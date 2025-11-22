import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

function PaginationControls({ meta, onPageChange, onPageSizeChange, loading = false }) {
  const { page = 1, limit = 25, total = 0 } = meta || {};
  const totalPages = Math.ceil(total / limit);
  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  const handlePrevious = () => {
    if (page > 1 && !loading) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages && !loading) {
      onPageChange(page + 1);
    }
  };

  const handlePageSizeChange = (event) => {
    if (!loading) {
      onPageSizeChange(Number(event.target.value));
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Rows per page:
        </Typography>
        <Select
          value={limit}
          onChange={handlePageSizeChange}
          size="small"
          disabled={loading}
          sx={{ minWidth: 80 }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
        <Typography variant="body2" color="text.secondary">
          {total > 0 ? `${startRecord}-${endRecord} of ${total}` : '0-0 of 0'}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          onClick={handlePrevious}
          disabled={page <= 1 || loading}
          startIcon={<ChevronLeft />}
        >
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, textAlign: 'center' }}>
          Page {page} of {totalPages || 1}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleNext}
          disabled={page >= totalPages || loading}
          endIcon={<ChevronRight />}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}

export default PaginationControls;

