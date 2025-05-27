/**
 * Main Content Script - Entry point for YouTube Comment Sentiment Analyzer
 * Coordinates all modules and handles YouTube navigation
 */

(function() {
  'use strict';
  
  console.log('YouTube Comment Sentiment Analyzer - Content Script Loaded');
  
  let uiInjector = null;
  let isInitialized = false;
  let themeObserver = null;
    /**
   * Initialize the extension on a YouTube video page
   */
  async function initialize() {
    if (isInitialized) {
      console.debug('🔄 Extension already initialized');
      return;
    }
    
    try {
      console.log('🎯 Initializing YouTube Comment Sentiment Analyzer...');
      
      // Check if we're on a valid page
      if (!YouTubeDetector.isVideoPage()) {
        console.debug('❌ Not a video page, skipping initialization');
        return;
      }
      
      console.log('✅ Video page confirmed, creating UI injector...');
      
      // Create UI injector
      uiInjector = new UIInjector();
      console.log('✅ UI injector created');
      
      // Inject the analyze button
      console.log('🔧 Injecting analyze button...');
      await uiInjector.injectAnalyzeButton();
      console.log('✅ Analyze button injected');
      
      // Set up theme monitoring
      setupThemeMonitoring();
      console.log('✅ Theme monitoring set up');
      
      isInitialized = true;
      console.log('🎉 Extension initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize extension:', error);
      ErrorHandler.gracefulFallback(error, 'initialization', {
        logLevel: ErrorHandler.LOG_LEVELS.ERROR
      });
    }
  }
  
  /**
   * Clean up the extension
   */
  function cleanup() {
    if (!isInitialized) return;
    
    console.log('Cleaning up extension...');
    
    try {
      // Clean up UI elements
      if (uiInjector) {
        uiInjector.cleanup();
        uiInjector = null;
      }
      
      // Clean up theme observer
      if (themeObserver) {
        themeObserver.disconnect();
        themeObserver = null;
      }
      
      isInitialized = false;
      console.log('Extension cleaned up');
      
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
  
  /**
   * Set up theme monitoring to update UI when YouTube theme changes
   */
  function setupThemeMonitoring() {
    if (themeObserver) {
      themeObserver.disconnect();
    }
    
    themeObserver = YouTubeDetector.onThemeChange((theme) => {
      console.debug(`Theme changed to: ${theme}`);
      if (uiInjector) {
        uiInjector.updateTheme(theme);
      }
    });
  }
  
  /**
   * Handle YouTube navigation events
   */
  function handleNavigation() {
    console.debug('YouTube navigation detected');
    
    // Clean up current instance
    cleanup();
    
    // Wait a bit for page to settle, then reinitialize if needed
    setTimeout(() => {
      if (YouTubeDetector.isVideoPage()) {
        initialize();
      }
    }, 1000);
  }
  
  /**
   * Set up navigation listeners
   */
  function setupNavigationListeners() {
    // Listen for YouTube's custom navigation events
    YouTubeDetector.onNavigate(DOMHelpers.debounce(handleNavigation, 500));
    
    // Also listen for standard navigation events as fallback
    window.addEventListener('popstate', DOMHelpers.debounce(handleNavigation, 500));
    
    // Monitor for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && YouTubeDetector.isVideoPage()) {
        // Reinitialize if button is missing
        setTimeout(() => {
          if (!document.querySelector('.sentiment-analyze-btn')) {
            initialize();
          }
        }, 1000);
      }
    });
  }
  
  /**
   * Enhanced error handling wrapper
   */
  function safeExecute(fn, context) {
    return ErrorHandler.wrapAsync(fn, context, {
      logLevel: ErrorHandler.LOG_LEVELS.WARN,
      showUser: false
    });
  }
  
  /**
   * Wait for required dependencies to load
   */  async function waitForDependencies() {
    const requiredClasses = [
      'YouTubeDetector',
      'DOMHelpers', 
      'ErrorHandler',
      'CommentCollector',
      'SentimentAnalyzer',
      'PieChartRenderer',
      'UIInjector'
    ];
    
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();
    
    console.log('📦 Checking for required classes:', requiredClasses);
    
    while (Date.now() - startTime < maxWait) {
      const loadedClasses = [];
      const missingClasses = [];
      
      requiredClasses.forEach(className => {
        if (window[className]) {
          loadedClasses.push(className);
        } else {
          missingClasses.push(className);
        }
      });
      
      if (missingClasses.length === 0) {
        console.log('✅ All classes loaded:', loadedClasses);
        return true;
      }
      
      if (Date.now() - startTime > 5000) { // Log missing classes after 5 seconds
        console.log('⏳ Still waiting for:', missingClasses);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final check and detailed error
    const finalMissing = requiredClasses.filter(className => !window[className]);
    throw new Error(`Required dependencies failed to load: ${finalMissing.join(', ')}`);
  }
    /**
   * Main initialization function
   */
  async function main() {
    try {
      console.log('🚀 Starting YouTube Comment Sentiment Analyzer...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 Is video page:', YouTubeDetector?.isVideoPage?.() || 'YouTubeDetector not available');
      
      // Wait for all dependencies to load
      console.log('⏳ Waiting for dependencies...');
      await waitForDependencies();
      console.log('✅ All dependencies loaded');
      
      // Set up navigation listeners
      setupNavigationListeners();
      console.log('✅ Navigation listeners set up');
      
      // Initialize on current page if it's a video page
      if (YouTubeDetector.isVideoPage()) {
        console.log('🎬 Video page detected, initializing...');
        await initialize();
      } else {
        console.log('📄 Not a video page, waiting for navigation...');
      }
      
    } catch (error) {
      console.error('❌ Failed to start extension:', error);
      ErrorHandler.gracefulFallback(error, 'main-initialization');
    }
  }
  
  /**
   * Extension lifecycle management
   */
  
  // Handle page unload
  window.addEventListener('beforeunload', cleanup);
  
  // Handle extension disable/enable
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onSuspend?.addListener(cleanup);
  }
  
  // Start the extension when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    // DOM is already ready
    main();
  }
  
  // Global error handler for unhandled errors
  window.addEventListener('error', (event) => {
    if (event.filename?.includes('sentiment') || 
        event.message?.includes('sentiment')) {
      ErrorHandler.gracefulFallback(
        new Error(event.message), 
        'global-error-handler',
        { showUser: false }
      );
    }
  });
  
  // Expose main functions for debugging
  if (typeof window !== 'undefined') {
    window.SentimentAnalyzer_Debug = {
      initialize,
      cleanup,
      isInitialized: () => isInitialized,
      getUIInjector: () => uiInjector
    };
  }
  
})();
