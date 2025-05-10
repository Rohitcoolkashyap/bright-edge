import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TableSortLabel,
  Chip,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';

const getMetricName = (key) => {
  const metricNames = {
    lcp: 'Largest Contentful Paint',
    cls: 'Cumulative Layout Shift',
    fid: 'First Input Delay',
    inp: 'Interaction to Next Paint',
    fcp: 'First Contentful Paint'
  };
  
  return metricNames[key] || key;
};

const getStatusColor = (metric, value) => {
  const thresholds = {
    lcp: { good: 2500, needsImprovement: 4000 }, 
    cls: { good: 0.1, needsImprovement: 0.25 },
    fid: { good: 100, needsImprovement: 300 }, 
    inp: { good: 200, needsImprovement: 500 }, 
    fcp: { good: 1800, needsImprovement: 3000 } 
  };
  
  const threshold = thresholds[metric];
  
  if (!threshold) return 'default';
  
  if (value <= threshold.good) return 'success';
  if (value <= threshold.needsImprovement) return 'warning';
  return 'error';
};

const formatPercentile = (metric, value) => {
  if (value === null || value === undefined || typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  
  if (metric === 'cls') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
};

const SingleURLDataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterValue, setFilterValue] = useState('all');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getFilteredData = () => {
    if (!data || !data.metrics) return [];
    
    const metrics = Object.keys(data.metrics)
      .filter(key => !data.metrics[key].error)
      .map(key => ({
        metric: key,
        name: getMetricName(key),
        percentile: data.metrics[key].percentile,
        good: data.metrics[key].good,
        needsImprovement: data.metrics[key].needsImprovement,
        poor: data.metrics[key].poor
      }));
    
    if (filterValue === 'all') return metrics;
    
    return metrics.filter(item => {
      const color = getStatusColor(item.metric, item.percentile);
      if (filterValue === 'good' && color === 'success') return true;
      if (filterValue === 'needsImprovement' && color === 'warning') return true;
      if (filterValue === 'poor' && color === 'error') return true;
      return false;
    });
  };

  const getSortedData = () => {
    const filteredData = getFilteredData();
    
    if (sortConfig.key === null) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData();

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Results for: {data.url}
      </Typography>
      
      {data.insights && data.insights.performanceScore !== undefined && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Performance Score: 
          </Typography>
          <Chip 
            label={`${data.insights.performanceScore}%`} 
            color={
              data.insights.performanceScore >= 90 ? 'success' :
              data.insights.performanceScore >= 50 ? 'warning' :
              'error'
            }
          />
        </Box>
      )}
      
      <Box sx={{ mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All Metrics</MenuItem>
            <MenuItem value="good">Good</MenuItem>
            <MenuItem value="needsImprovement">Needs Improvement</MenuItem>
            <MenuItem value="poor">Poor</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'name'}
                  direction={sortConfig.key === 'name' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Metric
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'percentile'}
                  direction={sortConfig.key === 'percentile' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('percentile')}
                >
                  75th Percentile
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'good'}
                  direction={sortConfig.key === 'good' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('good')}
                >
                  Good (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'needsImprovement'}
                  direction={sortConfig.key === 'needsImprovement' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('needsImprovement')}
                >
                  Needs Improvement (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'poor'}
                  direction={sortConfig.key === 'poor' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('poor')}
                >
                  Poor (%)
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <TableRow key={item.metric}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatPercentile(item.metric, item.percentile)}</TableCell>
                  <TableCell>{typeof item.good === 'number' ? (item.good * 100).toFixed(1) : 'N/A'}%</TableCell>
                  <TableCell>{typeof item.needsImprovement === 'number' ? (item.needsImprovement * 100).toFixed(1) : 'N/A'}%</TableCell>
                  <TableCell>{typeof item.poor === 'number' ? (item.poor * 100).toFixed(1) : 'N/A'}%</TableCell>
                  <TableCell>
                    <Chip 
                      label={
                        getStatusColor(item.metric, item.percentile) === 'success' ? 'Good' :
                        getStatusColor(item.metric, item.percentile) === 'warning' ? 'Needs Improvement' :
                        'Poor'
                      } 
                      color={getStatusColor(item.metric, item.percentile)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {data.insights && data.insights.issues && data.insights.issues.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Insights & Recommendations
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Issues Detected:
            </Typography>
            <ul>
              {data.insights.issues.map((issue, index) => (
                <li key={index}>
                  <Typography variant="body2">{issue}</Typography>
                </li>
              ))}
            </ul>
            
            <Typography variant="subtitle1" gutterBottom>
              Recommendations:
            </Typography>
            <ul>
              {data.insights.recommendations.map((recommendation, index) => (
                <li key={index}>
                  <Typography variant="body2">{recommendation}</Typography>
                </li>
              ))}
            </ul>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

const MultiURLDataTable = ({ data }) => {
  const [tabValue, setTabValue] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filterUrl, setFilterUrl] = useState('');
  const [filterMetric, setFilterMetric] = useState('all');
  const [filterThreshold, setFilterThreshold] = useState('all');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getAllMetrics = () => {
    if (!data || !data.results) return [];
    
    const metrics = new Set();
    
    data.results.forEach(result => {
      if (result.metrics) {
        Object.keys(result.metrics).forEach(key => {
          metrics.add(key);
        });
      }
    });
    
    return Array.from(metrics);
  };

  const getFilteredResults = () => {
    if (!data || !data.results) return [];
    
    let results = data.results;
    
    if (filterUrl) {
      results = results.filter(result => 
        result.url.toLowerCase().includes(filterUrl.toLowerCase())
      );
    }
    
    return results;
  };

  const getComparisonData = () => {
    const results = getFilteredResults();
    if (results.length === 0) return [];
    
    const allMetrics = getAllMetrics();
    const comparisonData = [];
    
    results.forEach(result => {
      if (!result.metrics) return;
      
      allMetrics.forEach(metric => {
        if (result.metrics[metric]) {
          if (filterMetric !== 'all' && metric !== filterMetric) return;
          
          const metricData = result.metrics[metric];
          const percentile = metricData.percentile;
          const status = getStatusColor(metric, percentile);
          
          if (filterThreshold === 'good' && status !== 'success') return;
          if (filterThreshold === 'needsImprovement' && status !== 'warning') return;
          if (filterThreshold === 'poor' && status !== 'error') return;
          
          comparisonData.push({
            url: result.url,
            metric,
            metricName: getMetricName(metric),
            percentile,
            good: metricData.good,
            needsImprovement: metricData.needsImprovement,
            poor: metricData.poor,
            status
          });
        }
      });
    });
    
    if (sortConfig.key) {
      comparisonData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return comparisonData;
  };

  const comparisonData = getComparisonData();
  const filteredResults = getFilteredResults();
  const allMetrics = getAllMetrics();

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Multiple URLs Analysis
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Comparison Table" />
        <Tab label="Individual Results" />
        {data.summary && <Tab label="Summary & Averages" />}
      </Tabs>
      
      {tabValue === 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Filter by URL"
              variant="outlined"
              size="small"
              value={filterUrl}
              onChange={(e) => setFilterUrl(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Metric</InputLabel>
              <Select
                value={filterMetric}
                onChange={(e) => setFilterMetric(e.target.value)}
                label="Filter by Metric"
              >
                <MenuItem value="all">All Metrics</MenuItem>
                {allMetrics.map(metric => (
                  <MenuItem key={metric} value={metric}>{getMetricName(metric)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterThreshold}
                onChange={(e) => setFilterThreshold(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="needsImprovement">Needs Improvement</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'url'}
                      direction={sortConfig.key === 'url' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('url')}
                    >
                      URL
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'metricName'}
                      direction={sortConfig.key === 'metricName' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('metricName')}
                    >
                      Metric
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'percentile'}
                      direction={sortConfig.key === 'percentile' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('percentile')}
                    >
                      75th Percentile
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'good'}
                      direction={sortConfig.key === 'good' ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort('good')}
                    >
                      Good (%)
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonData.length > 0 ? (
                  comparisonData.map((item, index) => (
                    <TableRow key={`${item.url}-${item.metric}-${index}`}>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.url}
                      </TableCell>
                      <TableCell>{item.metricName}</TableCell>
                      <TableCell>{formatPercentile(item.metric, item.percentile)}</TableCell>
                      <TableCell>{typeof item.good === 'number' ? (item.good * 100).toFixed(1) : 'N/A'}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            item.status === 'success' ? 'Good' :
                            item.status === 'warning' ? 'Needs Improvement' :
                            'Poor'
                          } 
                          color={item.status}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {tabValue === 1 && (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Filter by URL"
              variant="outlined"
              size="small"
              value={filterUrl}
              onChange={(e) => setFilterUrl(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
          
          {filteredResults.map((result, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {result.url}
              </Typography>
              
              {result.error ? (
                <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
                  <Typography color="error">
                    Error: {result.error}
                  </Typography>
                </Paper>
              ) : (
                <>
                  {result.insights && result.insights.performanceScore !== undefined && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 2 }}>
                        Performance Score: 
                      </Typography>
                      <Chip 
                        label={`${result.insights.performanceScore}%`} 
                        color={
                          result.insights.performanceScore >= 90 ? 'success' :
                          result.insights.performanceScore >= 50 ? 'warning' :
                          'error'
                        }
                        size="small"
                      />
                    </Box>
                  )}
                  
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>75th Percentile</TableCell>
                          <TableCell>Good (%)</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.metrics ? (
                          Object.keys(result.metrics).map(metric => {
                            const metricData = result.metrics[metric];
                            if (metricData.error) return null;
                            
                            return (
                              <TableRow key={metric}>
                                <TableCell>{getMetricName(metric)}</TableCell>
                                <TableCell>{formatPercentile(metric, metricData.percentile)}</TableCell>
                                <TableCell>{typeof metricData.good === 'number' ? (metricData.good * 100).toFixed(1) : 'N/A'}%</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={
                                      getStatusColor(metric, metricData.percentile) === 'success' ? 'Good' :
                                      getStatusColor(metric, metricData.percentile) === 'warning' ? 'Needs Improvement' :
                                      'Poor'
                                    } 
                                    color={getStatusColor(metric, metricData.percentile)}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              No metrics data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {result.insights && result.insights.recommendations && result.insights.recommendations.length > 0 && (
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Recommendations:</strong>
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                        {result.insights.recommendations.map((recommendation, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{recommendation}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Paper>
                  )}
                </>
              )}
            </Box>
          ))}
        </>
      )}
      
      {tabValue === 2 && data.summary && (
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            
            <Typography variant="body2" paragraph>
              Total URLs analyzed: {data.summary.totalUrls}
            </Typography>
            
            <Typography variant="body2" paragraph>
              URLs with valid data: {data.summary.validResults}
            </Typography>
            
            {data.summary.averages && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Average Metrics
                </Typography>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell>Average 75th Percentile</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(data.summary.averages).filter(key => key !== 'performanceScore').map(key => {
                        const value = data.summary.averages[key];
                        return (
                          <TableRow key={key}>
                            <TableCell>{getMetricName(key)}</TableCell>
                            <TableCell>{formatPercentile(key, value)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={
                                  getStatusColor(key, value) === 'success' ? 'Good' :
                                  getStatusColor(key, value) === 'warning' ? 'Needs Improvement' :
                                  'Poor'
                                } 
                                color={getStatusColor(key, value)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {data.summary.averages.performanceScore && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      Average Performance Score: 
                    </Typography>
                    <Chip 
                      label={`${Math.round(data.summary.averages.performanceScore)}%`} 
                      color={
                        data.summary.averages.performanceScore >= 90 ? 'success' :
                        data.summary.averages.performanceScore >= 50 ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

const DataTable = ({ data, multiUrl }) => {
  return (
    <Box>
      {multiUrl ? (
        <MultiURLDataTable data={data} />
      ) : (
        <SingleURLDataTable data={data} />
      )}
    </Box>
  );
};

export default DataTable; 