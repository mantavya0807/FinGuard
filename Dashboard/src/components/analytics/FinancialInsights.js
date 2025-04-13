import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
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
  
  // Process insights text into coherent sections
  const processInsights = (text) => {
    // Clean up any numbered lines that are just digits
    const cleanedText = text.replace(/^\d+\s*$/gm, '').trim();
    
    // Split the text into sections based on headers 
    const sections = [];
    
    // Find the main sections (headers followed by content)
    const headerRegex = /\b([A-Z][A-Za-z\s&]+)(?::|$)/gm;
    let match;
    let lastIndex = 0;
    let mainContent = '';
    
    // Extract the introduction (content before the first header)
    const firstHeaderMatch = headerRegex.exec(cleanedText);
    if (firstHeaderMatch) {
      // If there's content before the first header, add it as main content
      if (firstHeaderMatch.index > 0) {
        mainContent = cleanedText.substring(0, firstHeaderMatch.index).trim();
      }
      // Reset for the full scan
      headerRegex.lastIndex = 0;
    } else {
      // If no headers, all content is main content
      mainContent = cleanedText;
    }
    
    // Add the main content if it exists
    if (mainContent) {
      sections.push({
        type: 'content',
        content: mainContent
      });
    }
    
    // Now find all headers and their content
    while ((match = headerRegex.exec(cleanedText)) !== null) {
      const title = match[1].trim();
      const startIndex = match.index;
      
      // If we've found a previous header
      if (lastIndex > 0) {
        // Get content between the previous header and this one
        const content = cleanedText.substring(lastIndex, startIndex).trim();
        if (content) {
          sections.push({
            type: 'content',
            content: processContent(content)
          });
        }
      }
      
      // Add the header
      sections.push({
        type: 'header',
        title
      });
      
      // Update last index to the end of the header
      lastIndex = match.index + match[0].length;
    }
    
    // Add the final section content after the last header
    if (lastIndex > 0 && lastIndex < cleanedText.length) {
      const content = cleanedText.substring(lastIndex).trim();
      if (content) {
        sections.push({
          type: 'content',
          content: processContent(content)
        });
      }
    }
    
    return sections;
  };
  
  // Process content to handle bullet points and formatting
  const processContent = (content) => {
    // Process bullet points (lines starting with *)
    const lines = content.split('\n');
    
    // Processed content structure
    const processed = [];
    let currentParagraph = [];
    let inBulletList = false;
    let currentBulletList = [];
    
    // Process line by line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        // If we were in a bullet list, add it to processed content
        if (inBulletList && currentBulletList.length > 0) {
          processed.push({
            type: 'bulletList',
            items: [...currentBulletList]
          });
          currentBulletList = [];
          inBulletList = false;
        }
        
        // If we have a paragraph, add it
        if (currentParagraph.length > 0) {
          processed.push({
            type: 'paragraph',
            content: currentParagraph.join(' ')
          });
          currentParagraph = [];
        }
        continue;
      }
      
      // Check if this is a bullet point
      if (line.startsWith('*')) {
        // If we were building a paragraph, add it first
        if (currentParagraph.length > 0) {
          processed.push({
            type: 'paragraph',
            content: currentParagraph.join(' ')
          });
          currentParagraph = [];
        }
        
        // Mark that we're in a bullet list
        inBulletList = true;
        
        // Add the bullet item (remove the * and trim)
        currentBulletList.push(line.substring(1).trim());
      } else {
        // If we were in a bullet list, add it to processed content
        if (inBulletList && currentBulletList.length > 0) {
          processed.push({
            type: 'bulletList',
            items: [...currentBulletList]
          });
          currentBulletList = [];
          inBulletList = false;
        }
        
        // Add to current paragraph
        currentParagraph.push(line);
      }
    }
    
    // Add any remaining content
    if (inBulletList && currentBulletList.length > 0) {
      processed.push({
        type: 'bulletList',
        items: [...currentBulletList]
      });
    }
    
    if (currentParagraph.length > 0) {
      processed.push({
        type: 'paragraph',
        content: currentParagraph.join(' ')
      });
    }
    
    return processed;
  };
  
  // Parse the insight text
  const insightSections = processInsights(data.insights);
  
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
          className="btn btn-primary inline-flex items-center"
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

  // Function to render rich text with formatting
  const renderRichText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Render content block based on type
  const renderContentBlock = (block, index) => {
    if (typeof block === 'string') {
      return <p key={index} className="mb-3">{renderRichText(block)}</p>;
    }
    
    switch (block.type) {
      case 'paragraph':
        return <p key={index} className="mb-3">{renderRichText(block.content)}</p>;
      case 'bulletList':
        return (
          <ul key={index} className="list-disc pl-6 mb-3 space-y-1">
            {block.items.map((item, i) => (
              <li key={i}>{renderRichText(item)}</li>
            ))}
          </ul>
        );
      default:
        return <p key={index} className="mb-3">{block}</p>;
    }
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
            Insights generated at {formatDate(data.generatedAt)} for {data.timeframe}
          </div>
        )}
        
        {/* Insights content */}
        <div className={`${compact && !showDetails ? 'h-48 overflow-hidden' : ''} ${compact ? 'max-h-48 overflow-y-auto' : ''}`}>
          {compact && !showDetails ? (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center mb-2">
                <LightBulbIcon className="h-5 w-5 mr-2" />
                <p className="font-medium">Top Financial Insight</p>
              </div>
              <p className="text-sm text-indigo-100">
                {insightSections[0]?.content?.[0]?.content ? 
                  renderRichText(insightSections[0].content[0].content.split('.')[0]) : 
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
                  {section.type === 'header' ? (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      {section.title}
                    </h3>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 dark:bg-dark-700 dark:border-dark-600">
                      {Array.isArray(section.content) ? 
                        section.content.map((contentBlock, blockIndex) => 
                          renderContentBlock(contentBlock, blockIndex)
                        ) : 
                        <p className="text-gray-800 dark:text-gray-200">{section.content}</p>
                      }
                    </div>
                  )}
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