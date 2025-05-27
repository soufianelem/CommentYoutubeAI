/**
 * Centralized error handling and graceful fallback utilities
 */
class ErrorHandler {
  static ERROR_TYPES = {
    DOM_ERROR: 'DOM_ERROR',
    ANALYSIS_ERROR: 'ANALYSIS_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  static LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  };

  /**
   * Handle errors gracefully with user-friendly messages
   * @param {Error} error - The error object
   * @param {string} context - Context where error occurred
   * @param {Object} options - Additional options
   */
  static gracefulFallback(error, context = 'Unknown', options = {}) {
    const errorInfo = this.categorizeError(error, context);
    
    // Log the error for debugging
    this.logError(errorInfo, options.logLevel || this.LOG_LEVELS.ERROR);
    
    // Show user-friendly message if UI is available
    if (options.showUser !== false) {
      this.showUserMessage(errorInfo);
    }
    
    // Execute fallback function if provided
    if (options.fallback && typeof options.fallback === 'function') {
      try {
        options.fallback(errorInfo);
      } catch (fallbackError) {
        this.logError({
          type: this.ERROR_TYPES.UNKNOWN_ERROR,
          message: 'Fallback function failed',
          error: fallbackError,
          context: `${context} - fallback`
        });
      }
    }
    
    return errorInfo;
  }

  /**
   * Categorize error based on type and message
   * @param {Error} error - The error object
   * @param {string} context - Context where error occurred
   * @returns {Object} Categorized error info
   */
  static categorizeError(error, context) {
    let type = this.ERROR_TYPES.UNKNOWN_ERROR;
    let userMessage = 'Something went wrong. Please try again.';
    
    const errorMessage = error.message || error.toString();
    
    // DOM related errors
    if (errorMessage.includes('querySelector') || 
        errorMessage.includes('Element not found') ||
        errorMessage.includes('appendChild')) {
      type = this.ERROR_TYPES.DOM_ERROR;
      userMessage = 'Unable to find comments on this page. Try refreshing or waiting for comments to load.';
    }
    
    // Analysis related errors
    else if (context.includes('sentiment') || context.includes('analysis')) {
      type = this.ERROR_TYPES.ANALYSIS_ERROR;
      userMessage = 'Failed to analyze comments. Please try again with a different video.';
    }
    
    // Network related errors
    else if (errorMessage.includes('fetch') || 
             errorMessage.includes('network') ||
             errorMessage.includes('CORS')) {
      type = this.ERROR_TYPES.NETWORK_ERROR;
      userMessage = 'Network error occurred. Please check your connection and try again.';
    }
    
    // Permission related errors
    else if (errorMessage.includes('permission') || 
             errorMessage.includes('denied') ||
             errorMessage.includes('blocked')) {
      type = this.ERROR_TYPES.PERMISSION_ERROR;
      userMessage = 'Permission denied. Please check browser settings and reload the page.';
    }
    
    // Timeout related errors
    else if (errorMessage.includes('timeout') || 
             errorMessage.includes('exceeded')) {
      type = this.ERROR_TYPES.TIMEOUT_ERROR;
      userMessage = 'Operation took too long. Please try again.';
    }
    
    return {
      type,
      message: errorMessage,
      userMessage,
      context,
      timestamp: new Date().toISOString(),
      error
    };
  }

  /**
   * Log error with appropriate level
   * @param {Object} errorInfo - Categorized error information
   * @param {string} level - Log level
   */
  static logError(errorInfo, level = this.LOG_LEVELS.ERROR) {
    const logMessage = `[${errorInfo.type}] ${errorInfo.context}: ${errorInfo.message}`;
    
    switch (level) {
      case this.LOG_LEVELS.ERROR:
        console.error(logMessage, errorInfo.error);
        break;
      case this.LOG_LEVELS.WARN:
        console.warn(logMessage, errorInfo.error);
        break;
      case this.LOG_LEVELS.INFO:
        console.info(logMessage);
        break;
      case this.LOG_LEVELS.DEBUG:
        console.debug(logMessage, errorInfo);
        break;
    }
  }

  /**
   * Show user-friendly error message
   * @param {Object} errorInfo - Categorized error information
   */
  static showUserMessage(errorInfo) {
    // Remove any existing error messages
    const existingError = document.querySelector('.sentiment-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Find the analyze button or create a temporary container
    let container = document.querySelector('.sentiment-analyze-btn');
    if (!container) {
      container = document.body;
    }
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'sentiment-error-message';
    errorElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: "Roboto", Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    
    errorElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>${errorInfo.userMessage}</span>
        <button style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: 8px;" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(errorElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 5000);
  }

  /**
   * Wrap async function with error handling
   * @param {Function} asyncFn - Async function to wrap
   * @param {string} context - Context for error handling
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped function
   */
  static wrapAsync(asyncFn, context, options = {}) {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        return this.gracefulFallback(error, context, options);
      }
    };
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Result of successful execution
   */
  static async retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Create a timeout promise
   * @param {Promise} promise - Promise to add timeout to
   * @param {number} timeoutMs - Timeout in milliseconds
   * @param {string} timeoutMessage - Timeout error message
   * @returns {Promise} Promise with timeout
   */
  static withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Safe JSON parse with error handling
   * @param {string} jsonString - JSON string to parse
   * @param {*} defaultValue - Default value if parsing fails
   * @returns {*} Parsed object or default value
   */
  static safeJSONParse(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      this.logError({
        type: this.ERROR_TYPES.UNKNOWN_ERROR,
        message: 'JSON parse error',
        context: 'safeJSONParse',
        error
      }, this.LOG_LEVELS.WARN);
      return defaultValue;
    }
  }

  /**
   * Check if error is recoverable
   * @param {Object} errorInfo - Error information
   * @returns {boolean} Whether error is recoverable
   */
  static isRecoverable(errorInfo) {
    const recoverableTypes = [
      this.ERROR_TYPES.NETWORK_ERROR,
      this.ERROR_TYPES.TIMEOUT_ERROR,
      this.ERROR_TYPES.DOM_ERROR
    ];
    
    return recoverableTypes.includes(errorInfo.type);
  }
}

// Export for use in other modules
window.ErrorHandler = ErrorHandler;
