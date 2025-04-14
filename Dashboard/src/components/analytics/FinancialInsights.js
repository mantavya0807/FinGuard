import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { 
  LightBulbIcon, 
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';

const FinancialInsights = ({ data, loading, error, onGenerate, compact = false }) => {
  const [showDetails, setShowDetails] = useState(!compact);
  const [generating, setGenerating] = useState(false);
  
  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };
  
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-64' : 'h-96'}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <div>
          <p className="text-danger-600 dark:text-danger-400 mb-2">Failed to generate insights</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          <button
            className="mt-4 btn btn-primary"
            onClick={handleGenerateInsights}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.insights) {
    return (
      <div className={`flex flex-col items-center justify-center ${compact ? 'h-64' : 'h-96'} text-center`}>
        <LightBulbIcon className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">No financial insights available</p>
        <button
          className="btn btn-primary inline-flex items-center"
          onClick={handleGenerateInsights}
          disabled={generating}
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4 mr-2" />
              Generate Insights
            </>
          )}
        </button>
      </div>
    );
  }
  
  // Clean up insights text by removing AI system text
  const cleanInsightsText = (text) => {
    // Remove any AI system prompts/headers that shouldn't be in the output
    let cleanedText = text
      .replace(/AI-Powered Financial Insights.*?for last 100 transactions/s, '')
      .replace(/getitng this as out put from this pageL$/m, '')
      .replace(/Okay, here's an analysis of the transaction data[,.]/i, '')
      .replace(/I've tried to provide actionable insights with specific recommendations\./i, '')
      .trim();
      
    return cleanedText;
  };
  
  // Extract sections from markdown text
  const extractSections = (markdownText) => {
    const cleanedText = cleanInsightsText(markdownText);
    
    // Split the text into sections based on headers
    const sections = [];
    const lines = cleanedText.split('\n');
    let currentSection = { title: 'Overview', content: [] };
    let inSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this is a header (starts with ## or **)
      if (line.startsWith('##') || (line.startsWith('**') && line.endsWith('**') && !line.includes(' **'))) {
        // If we were already in a section, add it to our sections array
        if (inSection && currentSection.content.length > 0) {
          sections.push({ ...currentSection });
        }
        
        // Start a new section
        const title = line.replace(/^##\s*/, '').replace(/^\*\*|\*\*$/g, '').trim();
        currentSection = { title, content: [] };
        inSection = true;
      } else if (line !== '') {
        // Add non-empty lines to the current section's content
        currentSection.content.push(line);
      }
    }
    
    // Add the last section if it has content
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    return sections;
  };
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const title = compact ? (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h3>
      <button 
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
    </div>
  ) : (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI-Powered Financial Insights</h2>
      <div className="flex items-center mt-2 md:mt-0">
        <button
          className="btn btn-primary inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          onClick={handleGenerateInsights}
          disabled={generating}
        >
          {generating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh Insights
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Process insights into sections
  const insightSections = extractSections(data.insights);

  // Custom components for ReactMarkdown
  const components = {
    h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-md font-semibold my-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-3" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={compact ? 'bg-white dark:bg-dark-800 rounded-xl shadow-md overflow-hidden h-full' : ''}
    >
      <div className={compact ? 'p-4' : 'p-6'}>
        {title}
        
        {/* Generated time */}
        {(!compact || showDetails) && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <SparklesIcon className="h-4 w-4 mr-1" />
            Insights generated at {formatDate(data.generatedAt || new Date())} for {data.timeframe || 'last 100 transactions'}
          </div>
        )}
        
        {/* Insights content */}
        <div className={`${compact && !showDetails ? 'h-48 overflow-hidden' : ''} ${compact && showDetails ? 'max-h-96 overflow-y-auto' : ''}`}>
          {compact && !showDetails ? (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                <p className="font-medium">Top Financial Insight</p>
              </div>
              <p className="text-sm text-indigo-100">
                {insightSections.length > 0 && insightSections[0].content.length > 0 ? 
                  insightSections[0].content[0].split('.')[0] + '.' : 
                  "Generate insights to see tailored financial recommendations."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insightSections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    {section.title}
                  </h3>
                  <div className="bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 rounded-lg p-4">
                    <ReactMarkdown components={components}>
                      {section.content.join('\n')}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Compact mode controls */}
        {compact && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 flex justify-center">
            <button
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium inline-flex items-center"
              onClick={handleGenerateInsights}
              disabled={generating}
            >
              {generating ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh Insights
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FinancialInsights;