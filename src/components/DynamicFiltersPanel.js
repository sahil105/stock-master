import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';

function DynamicFiltersPanel({
  filters,
  activeFilter,
  setActiveFilter,
  activeStatus,
  setActiveStatus,
}) {
  return (
    <Paper elevation={3} className="dynamic-box" sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Dynamic Filters</Typography>
        <Button size="small">Export View</Button>
      </Stack>
      <Stack gap={1} sx={{ flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Document Type
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filters.documentType.map((type) => (
              <Chip
                key={type}
                label={type}
                variant={activeFilter === type ? 'filled' : 'outlined'}
                color={activeFilter === type ? 'primary' : 'default'}
                onClick={() => setActiveFilter(type)}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filters.status.map((status) => (
              <Chip
                key={status}
                label={status}
                variant={activeStatus === status ? 'filled' : 'outlined'}
                color={activeStatus === status ? 'secondary' : 'default'}
                onClick={() => setActiveStatus(status)}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Warehouse / Location
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filters.location.map((loc) => (
              <Chip key={loc} label={loc} variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Product Category
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {filters.category.map((cat) => (
              <Chip key={cat} label={cat} variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default DynamicFiltersPanel;

