import { useEffect, useState } from 'react';
import { Alert, Backdrop, Box, CircularProgress, Paper, Snackbar, Stack, Typography } from '@mui/material';

import { subscribeApiActivity } from '../../services';

export const AppRequestFeedback = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => subscribeApiActivity((event) => {
    if (event.type === 'loading') {
      setPendingRequests(event.pendingRequests);
      return;
    }

    setToastMessage(event.message);
  }), []);

  return (
    <>
      <Backdrop
        open={pendingRequests > 0}
        sx={{
          backdropFilter: 'blur(5px)',
          backgroundColor: 'rgba(15, 23, 42, 0.34)',
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 2,
            minWidth: 260,
            px: 4,
            py: 3,
            textAlign: 'center',
          }}
        >
          <Stack alignItems="center" gap={2}>
            <Box sx={{ position: 'relative' }}>
              <CircularProgress size={54} thickness={4} />
              <CircularProgress
                color="secondary"
                size={34}
                sx={{ left: 10, position: 'absolute', top: 10 }}
                thickness={5}
              />
            </Box>
            <Box>
              <Typography fontWeight={900}>Processando</Typography>
              <Typography color="text.secondary" variant="body2">Aguarde a comunicacao terminar.</Typography>
            </Box>
          </Stack>
        </Paper>
      </Backdrop>

      <Snackbar
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        autoHideDuration={5000}
        open={Boolean(toastMessage)}
        onClose={() => setToastMessage('')}
      >
        <Alert severity="error" sx={{ width: '100%' }} variant="filled" onClose={() => setToastMessage('')}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
