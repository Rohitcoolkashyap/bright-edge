import React, { useState } from 'react';
import { Container, Box, Typography, CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import SearchBar from './components/SearchBar';
import DataTable from './components/DataTable';
import MultiURLInput from './components/MultiURLInput';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [multiUrlMode, setMultiUrlMode] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Chrome UX Report Analyzer
          </Typography>
          
          {multiUrlMode ? (
            <MultiURLInput
              setData={setData}
              setError={setError}
              setLoading={setLoading}
              setMultiUrlMode={setMultiUrlMode}
            />
          ) : (
            <SearchBar
              setData={setData}
              setError={setError}
              setLoading={setLoading}
              setMultiUrlMode={setMultiUrlMode}
            />
          )}
          
          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          
          {data && <DataTable data={data} multiUrl={multiUrlMode} />}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
