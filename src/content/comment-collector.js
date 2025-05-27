/**
 * YouTube Comment Collector - Robust DOM parsing for comment extraction
 */
class YouTubeCommentCollector {
  static SELECTORS = {
    // Primary selectors for comment content
    commentContent: [
      'ytd-comment-thread-renderer #content-text',
      'yt-formatted-string#content-text',
      '[id="content-text"]',
      'ytd-expander #content',
      '.ytd-comment-renderer #content-text'
    ],
    
    // Comment thread containers
    commentThreads: [
      'ytd-comment-thread-renderer',
      'ytd-comment-renderer',
      '.ytd-comment-thread-renderer'
    ],
    
    // Author information
    authorName: [
      '#author-text',
      '.ytd-comment-renderer #author-text',
      'ytd-comment-renderer #author-text span'
    ],
    
    // Like count
    likeCount: [
      '#vote-count-middle',
      '.ytd-comment-action-buttons-renderer #vote-count-middle',
      '[aria-label*="like"]'
    ],
    
    // Comments section container
    commentsSection: [
      'ytd-comments',
      '#comments',
      '.ytd-comments'
    ],
    
    // Load more button
    loadMoreButton: [
      '#more',
      '.ytd-continuation-item-renderer #button',
      'ytd-continuation-item-renderer paper-button'
    ]
  };

  constructor() {
    this.maxRetries = 3;
    this.loadTimeout = 10000;
    this.observerTimeout = 30000;
  }

  /**
   * Collect comments from YouTube page
   * @param {number} maxCount - Maximum number of comments to collect
   * @param {boolean} waitForLoad - Whether to wait for comments to load
   * @returns {Promise<Array>} Array of comment objects
   */
  async collectComments(maxCount = 50, waitForLoad = true) {
    try {
      console.log('Starting comment collection...');
      
      // Wait for comments section to be available
      if (waitForLoad) {
        await this.waitForCommentsSection();
      }
      
      // Try to load more comments if needed
      await this.ensureEnoughComments(maxCount);
      
      // Extract comment data
      const comments = await this.extractCommentData(maxCount);
      
      console.log(`Collected ${comments.length} comments`);
      return comments;
      
    } catch (error) {
      throw new Error(`Comment collection failed: ${error.message}`);
    }
  }

  /**
   * Wait for comments section to load
   * @returns {Promise<Element>}
   */
  async waitForCommentsSection() {
    console.log('Waiting for comments section...');
    
    return DOMHelpers.waitForElement(
      this.constructor.SELECTORS.commentsSection,
      this.loadTimeout
    );
  }

  /**
   * Ensure enough comments are loaded by triggering load more if needed
   * @param {number} targetCount - Target number of comments
   */
  async ensureEnoughComments(targetCount) {
    const maxLoadAttempts = 5;
    let attempts = 0;
    
    while (attempts < maxLoadAttempts) {
      const currentComments = this.getVisibleComments();
      
      if (currentComments.length >= targetCount) {
        console.log(`Found ${currentComments.length} comments (target: ${targetCount})`);
        break;
      }
      
      // Try to load more comments
      const loaded = await this.loadMoreComments();
      if (!loaded) {
        console.log('No more comments to load');
        break;
      }
      
      attempts++;
      // Wait a bit for comments to render
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Get currently visible comment elements
   * @returns {NodeList}
   */
  getVisibleComments() {
    return DOMHelpers.trySelectorsAll(
      this.constructor.SELECTORS.commentThreads
    );
  }

  /**
   * Attempt to load more comments
   * @returns {Promise<boolean>} Whether more comments were loaded
   */
  async loadMoreComments() {
    const loadMoreButton = DOMHelpers.trySelectors(
      this.constructor.SELECTORS.loadMoreButton
    );
    
    if (!loadMoreButton) {
      return false;
    }
    
    // Check if button is visible and clickable
    if (!loadMoreButton.offsetParent || loadMoreButton.disabled) {
      return false;
    }
    
    try {
      // Scroll button into view
      DOMHelpers.scrollIntoView(loadMoreButton);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Click the button
      loadMoreButton.click();
      
      // Wait for new comments to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.warn('Failed to load more comments:', error);
      return false;
    }
  }

  /**
   * Extract structured data from comment elements
   * @param {number} maxCount - Maximum number of comments to extract
   * @returns {Array} Array of comment objects
   */
  async extractCommentData(maxCount) {
    const commentElements = this.getVisibleComments();
    const comments = [];
    
    for (let i = 0; i < Math.min(commentElements.length, maxCount); i++) {
      const element = commentElements[i];
      
      try {
        const commentData = await this.extractSingleComment(element);
        if (commentData && commentData.text && commentData.text.trim()) {
          comments.push(commentData);
        }
      } catch (error) {
        console.warn(`Failed to extract comment ${i}:`, error);
        // Continue with other comments
      }
    }
    
    return comments;
  }

  /**
   * Extract data from a single comment element
   * @param {Element} element - Comment element
   * @returns {Object} Comment data object
   */
  async extractSingleComment(element) {
    // Extract text content
    const contentElement = DOMHelpers.trySelectors(
      this.constructor.SELECTORS.commentContent,
      element
    );
    
    if (!contentElement) {
      throw new Error('Comment content not found');
    }
    
    const text = DOMHelpers.getCleanText(contentElement);
    
    // Extract author
    const authorElement = DOMHelpers.trySelectors(
      this.constructor.SELECTORS.authorName,
      element
    );
    const author = authorElement ? 
      DOMHelpers.getCleanText(authorElement) : 'Unknown';
    
    // Extract like count
    const likeElement = DOMHelpers.trySelectors(
      this.constructor.SELECTORS.likeCount,
      element
    );
    const likeText = likeElement ? 
      DOMHelpers.getCleanText(likeElement) : '0';
    const likes = this.parseLikeCount(likeText);
    
    // Extract timestamp (if available)
    const timeElement = element.querySelector('a[href*="lc="]');
    const timeAgo = timeElement ? 
      timeElement.textContent.trim() : null;
    
    return {
      text: text,
      author: author,
      likes: likes,
      timeAgo: timeAgo,
      element: element,
      id: this.generateCommentId(text, author)
    };
  }

  /**
   * Parse like count from text (handles K, M suffixes)
   * @param {string} likeText - Like count text
   * @returns {number} Numeric like count
   */
  parseLikeCount(likeText) {
    if (!likeText || likeText === '0') return 0;
    
    const cleanText = likeText.replace(/[^\d.KkMm]/g, '');
    const number = parseFloat(cleanText);
    
    if (isNaN(number)) return 0;
    
    if (cleanText.toLowerCase().includes('k')) {
      return Math.floor(number * 1000);
    } else if (cleanText.toLowerCase().includes('m')) {
      return Math.floor(number * 1000000);
    }
    
    return Math.floor(number);
  }

  /**
   * Generate unique ID for comment
   * @param {string} text - Comment text
   * @param {string} author - Comment author
   * @returns {string} Unique comment ID
   */
  generateCommentId(text, author) {
    const content = text.substring(0, 50) + author;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if comments are available on current page
   * @returns {boolean}
   */
  hasComments() {
    const commentsSection = DOMHelpers.trySelectors(
      this.constructor.SELECTORS.commentsSection
    );
    
    if (!commentsSection) return false;
    
    const comments = this.getVisibleComments();
    return comments.length > 0;
  }

  /**
   * Get estimated total comment count from page
   * @returns {number|null}
   */
  getEstimatedCommentCount() {
    // Try to find comment count in various locations
    const selectors = [
      '.count-text',
      '#count .count-text',
      'ytd-comments-header-renderer #count'
    ];
    
    const countElement = DOMHelpers.trySelectors(selectors);
    if (!countElement) return null;
    
    const countText = DOMHelpers.getCleanText(countElement);
    const match = countText.match(/[\d,]+/);
    
    if (match) {
      return parseInt(match[0].replace(/,/g, ''));
    }
    
    return null;
  }
}

// Export for use in other modules
window.YouTubeCommentCollector = YouTubeCommentCollector;
window.CommentCollector = YouTubeCommentCollector; // Alias for main.js compatibility
