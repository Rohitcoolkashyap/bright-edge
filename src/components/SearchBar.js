import React, { useState } from 'react';
import { Box, TextField, Button, Paper, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';

const SearchBar = ({ setData, setError, setLoading, setMultiUrlMode }) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [loading, setIsLoading] = useState(false);

  const validateUrl = (value) => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(value);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setIsValidUrl(value === '' || validateUrl(value));
  };

  const handleSearch = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post('/api/crux/report', { url });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.data) {
        setError(error.response.data.error || 'Failed to fetch CrUX data');
      } else {
        setError('Failed to connect to the server');
      }
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleMultiUrlMode = () => {
    setMultiUrlMode(true);
    setData(null);
    setError(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enter URL to analyze:
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 1, width: '100%' }}>
          <TextField
            fullWidth
            label="URL"
            variant="outlined"
            value={url}
            onChange={handleInputChange}
            error={!isValidUrl}
            helperText={!isValidUrl ? 'Please enter a valid URL' : ''}
            placeholder="https://example.com"
            disabled={loading}
          />
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!url || !isValidUrl || loading}
          sx={{ height: 56, minWidth: 100 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
        </Button>
      </Box>
      
      <Box sx={{ textAlign: 'right' }}>
        <Button color="secondary" onClick={handleMultiUrlMode}>
          Switch to Multi-URL Mode
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchBar; 