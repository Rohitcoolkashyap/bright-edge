# Chrome UX Report Analyzer

A web application for analyzing website performance using the Chrome UX Report API.

## Features

- Analyze performance metrics for a single URL
- Compare performance metrics for multiple URLs
- Filter and sort performance data
- View performance insights and recommendations
- Summary statistics for batch URL analysis

## Technologies Used

- **Frontend**: React.js, Material UI
- **Backend**: Node.js, Express.js
- **API**: Chrome UX Report API

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Google API Key for Chrome UX Report API

### Installation Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bright-edge
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Create a `.env` file in the `server` directory with your Google API Key:
   ```
   GOOGLE_API_KEY=your_google_api_key
   PORT=5000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Getting a Google API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Chrome UX Report API" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" and select "API Key"
7. Copy the generated API key and add it to your `.env` file

## Usage

### Single URL Analysis

1. Enter a URL in the input field
2. Click "Search" to fetch the Chrome UX Report data
3. View the performance metrics and insights
4. Use the filter to focus on specific metrics by status

### Multi-URL Analysis

1. Click "Switch to Multi-URL Mode"
2. Enter multiple URLs (one per line) and click "Add URLs"
3. Click "Search" to fetch data for all URLs
4. Use the tabs to switch between comparison view, individual results, and summary
5. Apply filters to focus on specific metrics or URLs

## Project Structure

```
bright-edge/
├── public/                 # Static files
├── server/                 # Backend server
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Express server setup
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── App.js              # Main App component
│   └── index.js            # Entry point
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```