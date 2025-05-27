/**
 * YouTube page detection and state management utilities
 */
class YouTubeDetector {
  /**
   * Check if current page is a YouTube video page
   * @returns {boolean}
   */
  static isVideoPage() {
    return window.location.pathname === '/watch' && 
           window.location.search.includes('v=');
  }

  /**
   * Check if current page is YouTube Shorts
   * @returns {boolean}
   */
  static isShortsPage() {
    return window.location.pathname.startsWith('/shorts/');
  }

  /**
   * Get current video ID from URL
   * @returns {string|null}
   */
  static getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  /**
   * Check if comments section is loaded
   * @returns {boolean}
   */
  static areCommentsLoaded() {
    const commentsSection = document.querySelector('ytd-comments');
    return commentsSection && 
           commentsSection.querySelector('ytd-comment-thread-renderer');
  }

  /**
   * Wait for YouTube navigation to complete
   * @returns {Promise<void>}
   */
  static waitForNavigation() {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.querySelector('ytd-watch-flexy') && 
            document.querySelector('#movie_player')) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  /**
   * Listen for YouTube navigation events
   * @param {Function} callback
   */
  static onNavigate(callback) {
    // YouTube uses custom navigation events
    window.addEventListener('yt-navigate-start', callback);
    window.addEventListener('yt-navigate-finish', callback);
    
    // Fallback for URL changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        callback();
      }
    }).observe(document, { subtree: true, childList: true });
  }

  /**
   * Get YouTube's current theme
   * @returns {'dark'|'light'}
   */
  static getTheme() {
    return document.documentElement.hasAttribute('dark') ? 'dark' : 'light';
  }

  /**
   * Listen for theme changes
   * @param {Function} callback
   */
  static onThemeChange(callback) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'dark') {
          callback(this.getTheme());
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dark']
    });
    
    return observer;
  }
}

// Export for use in other modules
window.YouTubeDetector = YouTubeDetector;
