import React, { useState } from 'react';
import { Box, TextField, Button, Paper, CircularProgress, Typography, IconButton } from '@mui/material';
import axios from 'axios';

const MultiURLInput = ({ setData, setError, setLoading, setMultiUrlMode }) => {
  const [urlInput, setUrlInput] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setIsLoading] = useState(false);

  const validateUrl = (value) => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    return urlPattern.test(value);
  };

  const handleInputChange = (e) => {
    setUrlInput(e.target.value);
  };

  const handleAddUrl = () => {
    const newUrls = urlInput
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && validateUrl(url));

    if (newUrls.length > 0) {
      setUrls([...new Set([...urls, ...newUrls])]);
      setUrlInput('');
    } else {
      setError('Please enter valid URLs');
    }
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = [...urls];
    updatedUrls.splice(index, 1);
    setUrls(updatedUrls);
  };

  const handleSearch = async () => {
    if (urls.length === 0) {
      setError('Please add at least one URL');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post('/api/crux/batch-report', { urls });
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

  const handleSingleUrlMode = () => {
    setMultiUrlMode(false);
    setData(null);
    setError(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Enter Multiple URLs to analyze:
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Enter URLs (one per line)"
          variant="outlined"
          value={urlInput}
          onChange={handleInputChange}
          multiline
          rows={4}
          placeholder="https://example.com&#10;https://another-example.com"
          disabled={loading}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddUrl}
          disabled={!urlInput || loading}
        >
          Add URLs
        </Button>
        
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleSearch}
          disabled={urls.length === 0 || loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
        </Button>
      </Box>
      
      {urls.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            URLs to analyze ({urls.length}):
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}>
            {urls.map((url, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {url}
                </Typography>
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleRemoveUrl(index)}
                  disabled={loading}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Paper>
        </Box>
      )}
      
      <Box sx={{ textAlign: 'right' }}>
        <Button color="secondary" onClick={handleSingleUrlMode}>
          Switch to Single URL Mode
        </Button>
      </Box>
    </Paper>
  );
};

export default MultiURLInput; 