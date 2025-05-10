# Chrome UX Report Analyzer - Implementation Guide

This document provides detailed instructions for setting up, running, and deploying the Chrome UX Report Analyzer application.

## Development Environment Setup

### Prerequisites

1. **Node.js and npm**
   - Install Node.js (v14 or later) from [nodejs.org](https://nodejs.org/)
   - npm is included with Node.js

2. **Google Cloud Account and API Key**
   - Create a Google Cloud account at [cloud.google.com](https://cloud.google.com/)
   - Enable the Chrome UX Report API
   - Generate an API key (see detailed instructions in README.md)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bright-edge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the `server` directory:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Start only the backend
   npm run server
   
   # Start only the frontend
   npm start
   ```

## Project Structure Details

```
bright-edge/
├── public/                 # Static files
├── server/                 # Backend server
│   ├── routes/             # API routes
│   │   └── crux.js         # Chrome UX Report routes
│   ├── utils/              # Utility functions
│   │   └── cruxDataProcessor.js  # Data processing utilities
│   └── server.js           # Express server setup
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── SearchBar.js    # Single URL input component
│   │   ├── MultiURLInput.js # Multiple URL input component
│   │   └── DataTable.js    # Data display component
│   ├── App.js              # Main App component
│   └── index.js            # Entry point
├── package.json            # Dependencies and scripts
├── README.md               # Project documentation
├── DESIGN.md               # Design documentation
└── IMPLEMENTATION.md       # Implementation guide
```

## Key Implementation Details

### Backend Implementation

1. **Server Setup** (`server/server.js`)
   - Express server configuration
   - CORS setup for local development
   - Route registration
   - Static file serving for production

2. **API Routes** (`server/routes/crux.js`)
   - `/api/crux/report` - Endpoint for single URL analysis
   - `/api/crux/batch-report` - Endpoint for multiple URL analysis
   - Input validation
   - Error handling

3. **Data Processing** (`server/utils/cruxDataProcessor.js`)
   - `processCruxData()` - Process raw API data into standardized format
   - `generateInsights()` - Generate insights based on performance metrics
   - `processBatchData()` - Process data for multiple URLs with summary statistics

### Frontend Implementation

1. **Main Application** (`src/App.js`)
   - Application state management
   - Component switching logic
   - Theme configuration

2. **URL Input Components**
   - `SearchBar.js` - Single URL input with validation
   - `MultiURLInput.js` - Multiple URL input with validation and list management

3. **Data Display Component** (`src/components/DataTable.js`)
   - `SingleURLDataTable` - Display data for single URL
   - `MultiURLDataTable` - Display data for multiple URLs with comparison
   - Filtering and sorting functionality
   - Performance insights display

## API Integration

### Chrome UX Report API

1. **API Endpoint**
   - `https://chromeuxreport.googleapis.com/v1/records:queryRecord`

2. **Request Format**
   ```json
   {
     "url": "https://example.com",
     "formFactor": "PHONE"
   }
   ```

3. **Response Processing**
   - Extract key metrics (LCP, CLS, FID, INP, FCP)
   - Process distribution data (good, needs improvement, poor)
   - Calculate performance scores

4. **Error Handling**
   - Handle 404 errors (no data available)
   - Handle rate limit errors
   - Handle malformed responses

## Testing

1. **Manual Testing Steps**
   - Test single URL input with valid URL
   - Test single URL input with invalid URL
   - Test multiple URL input
   - Test filtering and sorting functionality
   - Test error handling scenarios

2. **API Testing**
   - Use tools like Postman to test API endpoints
   - Verify correct handling of various response types

## Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Prepare for deployment**
   - Ensure `.env` file is properly configured
   - Update CORS settings if necessary in `server.js`

### Deployment Options

1. **Traditional Server Deployment**
   - Deploy to a Node.js hosting service (Heroku, DigitalOcean, etc.)
   - Set environment variables in the hosting platform
   - Start the server with `node server/server.js`

2. **Containerized Deployment**
   - Create a Dockerfile
   - Build and deploy the Docker image
   - Configure environment variables in the container

3. **Serverless Deployment**
   - Separate frontend and backend
   - Deploy frontend to static hosting (Netlify, Vercel, etc.)
   - Deploy backend functions to serverless platform (AWS Lambda, Vercel Functions, etc.)

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify the API key is correctly set in the `.env` file
   - Check that the API key has access to the Chrome UX Report API
   - Ensure the key is not restricted by domain

2. **CORS Issues**
   - Check CORS configuration in `server.js`
   - Verify frontend is connecting to the correct backend URL

3. **Performance Issues**
   - Monitor API rate limits
   - Check for memory leaks in data processing
   - Optimize large dataset handling

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor for Chrome UX Report API changes
   - Update thresholds based on Web Vitals standards changes

2. **Logging and Monitoring**
   - Implement logging for API requests and errors
   - Monitor performance and usage patterns
   - Track API rate limit consumption

## Security Considerations

1. **API Key Protection**
   - Never expose API key in frontend code
   - Use environment variables for sensitive data
   - Consider implementing key rotation

2. **Input Validation**
   - Validate all user input on both client and server
   - Sanitize URL inputs to prevent injection attacks

3. **Error Messages**
   - Use generic error messages for users
   - Log detailed errors server-side for debugging 