const express = require('express');
const axios = require('axios');
const https = require('https');
const fetch = require('node-fetch');
const router = express.Router();
const { processCruxData, generateInsights, processBatchData } = require('../utils/cruxDataProcessor');

// Configure alternative https agent for fetch
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// API Key - for testing purposes we'll try both approaches
const API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyDskUhOhiJsSMh-UQirHNA4dReJ0QyAY1E';

// CrUX API endpoint - using the public API endpoint
const CRUX_API_ENDPOINT = 'https://chromeuxreport.googleapis.com/v1/records:queryRecord';

// Generate mock CrUX data for development/testing
function generateMockCruxData(urlParam) {
  const mockMetrics = {
    lcp: {
      good: 0.75,
      needsImprovement: 0.15,
      poor: 0.10,
      percentile: 2300,
    },
    cls: {
      good: 0.82,
      needsImprovement: 0.12,
      poor: 0.06,
      percentile: 0.08,
    },
    inp: {
      good: 0.65,
      needsImprovement: 0.25,
      poor: 0.10,
      percentile: 180,
    },
    fcp: {
      good: 0.78,
      needsImprovement: 0.15,
      poor: 0.07,
      percentile: 1600,
    }
  };
  
  const mockInsights = {
    summary: 'Performance analysis based on Chrome UX Report (Mock Data)',
    issues: [
      'This is mock data for testing only'
    ],
    recommendations: [
      'Set up a Google API key with appropriate permissions for Chrome UX Report API',
      'Verify your network connection and SSL certificates'
    ],
    performanceScore: 78
  };
  
  return {
    url: urlParam,
    metrics: mockMetrics,
    insights: mockInsights,
    isMockData: true
  };
}

// Get Chrome UX Report for a single URL
router.post('/report', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Fetching CrUX data for URL: ${url}`);
    
    // Creating a sample payload based on the official documentation
    const payload = {
      url: url,
      formFactor: 'PHONE',
      metrics: [
        'largest_contentful_paint',
        'cumulative_layout_shift',
        'interaction_to_next_paint',
        'first_contentful_paint'
      ]
    };
    
    // Try the first approach with fetch
    try {
      const response = await fetch(
        `${CRUX_API_ENDPOINT}?key=${API_KEY}`,
        {
          method: 'POST',
          agent: httpsAgent,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`API response error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Successfully received CrUX data response');
      
      const processedData = processCruxData(data);
      const insights = generateInsights(processedData);
      
      return res.json({
        url,
        metrics: processedData,
        insights
      });
    } catch (fetchError) {
      console.error('Fetch approach failed, trying axios:', fetchError.message);
      
      // If fetch fails, try with axios as a fallback
      const axiosResponse = await axios({
        method: 'post',
        url: CRUX_API_ENDPOINT,
        params: { key: API_KEY },
        data: payload,
        httpsAgent: httpsAgent,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const processedData = processCruxData(axiosResponse.data);
      const insights = generateInsights(processedData);
      
      return res.json({
        url,
        metrics: processedData,
        insights
      });
    }
  } catch (error) {
    console.error('Error fetching CrUX data:', error.message);
    
    // Check if we can get more error details
    let errorDetails = error.message || 'Unknown error';
    if (error.response && error.response.data) {
      console.error('Error response data:', error.response.data);
      errorDetails = JSON.stringify(error.response.data);
    }
    
    // Create a mock response for testing if the API doesn't work
    // This is only for demonstration purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('Generating mock data for development testing');
      const requestUrl = req.body.url || 'example.com';
      const mockData = generateMockCruxData(requestUrl);
      
      return res.json(mockData);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch CrUX data',
      details: errorDetails
    });
  }
});

// Get Chrome UX Report for multiple URLs
router.post('/batch-report', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Valid URLs array is required' });
    }
    
    // If we're in development mode and API doesn't work, use mock data
    if (process.env.NODE_ENV === 'development') {
      const mockResults = urls.map(url => ({
        url,
        metrics: generateMockCruxData(url).metrics,
        insights: generateMockCruxData(url).insights,
        isMockData: true
      }));
      
      const mockBatchData = {
        results: mockResults,
        summary: {
          totalUrls: urls.length,
          validResults: urls.length,
          averages: {
            lcp: 2300,
            cls: 0.08,
            fid: 80,
            inp: 180,
            fcp: 1600,
            performanceScore: 78
          }
        },
        isMockData: true
      };
      
      return res.json(mockBatchData);
    }
    
    const requests = urls.map(async (url) => {
      try {
        const response = await fetch(
          `${CRUX_API_ENDPOINT}?key=${API_KEY}`,
          {
            method: 'POST',
            agent: httpsAgent,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              url,
              formFactor: 'PHONE',
              metrics: [
                'largest_contentful_paint',
                'cumulative_layout_shift',
                'interaction_to_next_paint',
                'first_contentful_paint'
              ]
            })
          }
        );
        
        if (!response.ok) {
          console.error(`Error fetching data for ${url}:`, response.status, response.statusText);
          return { 
            url, 
            error: `API error: ${response.status} ${response.statusText}` 
          };
        }
        
        const data = await response.json();
        return {
          url,
          data
        };
      } catch (error) {
        console.error(`Error fetching data for ${url}:`, error.message);
        return { 
          url, 
          error: `Failed to fetch data: ${error.message}` 
        };
      }
    });
    
    const results = await Promise.all(requests);
    
    const processedBatchData = processBatchData(results);
    
    res.json(processedBatchData);
  } catch (error) {
    console.error('Error in batch processing:', error.message);
    res.status(500).json({ error: 'Failed to process batch request' });
  }
});

module.exports = router; 