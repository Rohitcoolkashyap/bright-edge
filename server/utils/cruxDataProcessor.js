/**
 * Process CrUX data to extract relevant metrics
 * @param {Object} data - Raw CrUX API response
 * @returns {Object} Processed metrics
 */
const processCruxData = (data) => {
  try {
    if (!data || !data.record || !data.record.metrics) {
      throw new Error('Invalid CrUX data format');
    }

    const { metrics } = data.record;
    const processedData = {};

    // Process Core Web Vitals
    if (metrics.largest_contentful_paint) {
      processedData.lcp = {
        good: metrics.largest_contentful_paint.histogram[0].density,
        needsImprovement: metrics.largest_contentful_paint.histogram[1].density,
        poor: metrics.largest_contentful_paint.histogram[2].density,
        percentile: metrics.largest_contentful_paint.percentiles.p75,
      };
    }

    if (metrics.cumulative_layout_shift) {
      processedData.cls = {
        good: metrics.cumulative_layout_shift.histogram[0].density,
        needsImprovement: metrics.cumulative_layout_shift.histogram[1].density,
        poor: metrics.cumulative_layout_shift.histogram[2].density,
        percentile: metrics.cumulative_layout_shift.percentiles.p75,
      };
    }

    if (metrics.first_input_delay) {
      processedData.fid = {
        good: metrics.first_input_delay.histogram[0].density,
        needsImprovement: metrics.first_input_delay.histogram[1].density,
        poor: metrics.first_input_delay.histogram[2].density,
        percentile: metrics.first_input_delay.percentiles.p75,
      };
    } else {
      // FID has been deprecated in favor of INP
      console.log('FID metric is no longer available from CrUX API');
    }

    if (metrics.interaction_to_next_paint) {
      processedData.inp = {
        good: metrics.interaction_to_next_paint.histogram[0].density,
        needsImprovement: metrics.interaction_to_next_paint.histogram[1].density,
        poor: metrics.interaction_to_next_paint.histogram[2].density,
        percentile: metrics.interaction_to_next_paint.percentiles.p75,
      };
    }

    if (metrics.first_contentful_paint) {
      processedData.fcp = {
        good: metrics.first_contentful_paint.histogram[0].density,
        needsImprovement: metrics.first_contentful_paint.histogram[1].density,
        poor: metrics.first_contentful_paint.histogram[2].density,
        percentile: metrics.first_contentful_paint.percentiles.p75,
      };
    }

    return processedData;
  } catch (error) {
    console.error('Error processing CrUX data:', error);
    return { error: 'Failed to process CrUX data' };
  }
};

/**
 * Generate insights based on CrUX data
 * @param {Object} processedData - Processed CrUX metrics
 * @returns {Object} Insights and recommendations
 */
const generateInsights = (processedData) => {
  if (processedData.error) {
    return { error: processedData.error };
  }

  const insights = {
    summary: 'Performance analysis based on Chrome UX Report',
    issues: [],
    recommendations: [],
  };

  // LCP (Largest Contentful Paint) insights
  if (processedData.lcp) {
    if (processedData.lcp.percentile > 2500) {
      insights.issues.push('Slow Largest Contentful Paint (LCP)');
      insights.recommendations.push('Optimize LCP by improving server response times, render-blocking resources, or resource load times');
    }
  }

  // CLS (Cumulative Layout Shift) insights
  if (processedData.cls) {
    if (processedData.cls.percentile > 0.1) {
      insights.issues.push('High Cumulative Layout Shift (CLS)');
      insights.recommendations.push('Improve CLS by using size attributes on images and videos, avoiding inserting content above existing content');
    }
  }

  // FID (First Input Delay) insights - only include if data exists
  if (processedData.fid && processedData.fid.percentile > 100) {
    insights.issues.push('Slow First Input Delay (FID)');
    insights.recommendations.push('Improve FID by breaking up long tasks, optimizing JavaScript execution, and reducing JavaScript execution time');
  }

  // INP (Interaction to Next Paint) insights
  if (processedData.inp) {
    if (processedData.inp.percentile > 200) {
      insights.issues.push('Slow Interaction to Next Paint (INP)');
      insights.recommendations.push('Improve INP by optimizing event handlers, reducing main thread work, and ensuring efficient JS execution');
    }
  }

  // FCP (First Contentful Paint) insights
  if (processedData.fcp) {
    if (processedData.fcp.percentile > 1800) {
      insights.issues.push('Slow First Contentful Paint (FCP)');
      insights.recommendations.push('Improve FCP by reducing render-blocking resources, minimizing critical request chains, and optimizing server response times');
    }
  }

  // Overall performance score
  let performanceScore = 0;
  let metricsCount = 0;

  if (processedData.lcp) {
    performanceScore += processedData.lcp.good * 100;
    metricsCount++;
  }
  
  if (processedData.cls) {
    performanceScore += processedData.cls.good * 100;
    metricsCount++;
  }
  
  if (processedData.fid) {
    performanceScore += processedData.fid.good * 100;
    metricsCount++;
  }
  
  if (processedData.inp) {
    performanceScore += processedData.inp.good * 100;
    metricsCount++;
  }

  if (metricsCount > 0) {
    insights.performanceScore = Math.round(performanceScore / metricsCount);
  }

  return insights;
};

/**
 * Process batch data for multiple URLs
 * @param {Array} batchResults - Array of CrUX API responses for multiple URLs
 * @returns {Object} Processed metrics and comparative analysis
 */
const processBatchData = (batchResults) => {
  try {
    const processed = batchResults.map(result => {
      if (result.error) {
        return {
          url: result.url,
          error: result.error
        };
      }
      
      const processedData = processCruxData(result.data);
      const insights = generateInsights(processedData);
      
      return {
        url: result.url,
        metrics: processedData,
        insights
      };
    });

    // Calculate averages for comparative analysis
    const validResults = processed.filter(result => !result.error);
    
    if (validResults.length > 0) {
      const aggregates = {
        lcp: { total: 0, count: 0 },
        cls: { total: 0, count: 0 },
        fid: { total: 0, count: 0 },
        inp: { total: 0, count: 0 },
        fcp: { total: 0, count: 0 },
        performanceScore: { total: 0, count: 0 }
      };
      
      validResults.forEach(result => {
        if (result.metrics.lcp) {
          aggregates.lcp.total += result.metrics.lcp.percentile;
          aggregates.lcp.count++;
        }
        
        if (result.metrics.cls) {
          aggregates.cls.total += result.metrics.cls.percentile;
          aggregates.cls.count++;
        }
        
        if (result.metrics.fid) {
          aggregates.fid.total += result.metrics.fid.percentile;
          aggregates.fid.count++;
        }
        
        if (result.metrics.inp) {
          aggregates.inp.total += result.metrics.inp.percentile;
          aggregates.inp.count++;
        }
        
        if (result.metrics.fcp) {
          aggregates.fcp.total += result.metrics.fcp.percentile;
          aggregates.fcp.count++;
        }
        
        if (result.insights.performanceScore) {
          aggregates.performanceScore.total += result.insights.performanceScore;
          aggregates.performanceScore.count++;
        }
      });
      
      const averages = {};
      Object.keys(aggregates).forEach(key => {
        if (aggregates[key].count > 0) {
          averages[key] = aggregates[key].total / aggregates[key].count;
        }
      });
      
      return {
        results: processed,
        summary: {
          totalUrls: batchResults.length,
          validResults: validResults.length,
          averages
        }
      };
    }
    
    return {
      results: processed,
      summary: {
        totalUrls: batchResults.length,
        validResults: validResults.length
      }
    };
  } catch (error) {
    console.error('Error processing batch data:', error);
    return { error: 'Failed to process batch data' };
  }
};

module.exports = {
  processCruxData,
  generateInsights,
  processBatchData
}; 