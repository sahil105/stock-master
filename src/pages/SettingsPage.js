import { Paper, Stack, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';

function SettingsPage() {
  return (
    <MainLayout>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Workspace Settings
        </Typography>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography>
            Configure notifications, user roles, and system-level defaults from here. More actions will be added as
            integrations go live.
          </Typography>
        </Paper>
      </Stack>
    </MainLayout>
  );
}

export default SettingsPage;

