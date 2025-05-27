/**
 * UI Injector - Handles button injection and results panel rendering
 */
class UIInjector {
  constructor() {
    this.analyzeButton = null;
    this.resultsPanel = null;
    this.chart = null;
    this.isAnalyzing = false;
    
    // Button injection selectors (try multiple locations)
    this.buttonContainerSelectors = [
      '#actions',
      '#menu-container',
      '.ytd-menu-renderer',
      '#top-level-buttons-computed',
      '#actions-inner',
      '.ytd-video-primary-info-renderer #menu'
    ];
  }

  /**
   * Inject the analyze button into YouTube's UI
   */
  async injectAnalyzeButton() {
    try {
      // Remove existing button if present
      this.removeAnalyzeButton();
      
      // Wait for video page to load
      await YouTubeDetector.waitForNavigation();
      
      // Find container for the button
      const container = await this.findButtonContainer();
      if (!container) {
        throw new Error('Could not find suitable container for analyze button');
      }
      
      // Create and inject button
      this.analyzeButton = this.createAnalyzeButton();
      container.appendChild(this.analyzeButton);
      
      console.log('Analyze button injected successfully');
      
    } catch (error) {
      console.error('Failed to inject analyze button:', error);
      throw error;
    }
  }

  /**
   * Find suitable container for the analyze button
   * @returns {Promise<Element>}
   */
  async findButtonContainer() {
    // Try to find container with multiple selectors
    for (const selector of this.buttonContainerSelectors) {
      try {
        const container = await DOMHelpers.waitForElement(selector, 5000);
        if (container && this.isValidContainer(container)) {
          return container;
        }
      } catch (error) {
        console.debug(`Container selector failed: ${selector}`);
      }
    }
    
    // Fallback: create our own container
    return this.createFallbackContainer();
  }

  /**
   * Check if container is valid for button placement
   * @param {Element} container - Container element
   * @returns {boolean}
   */
  isValidContainer(container) {
    return container && 
           container.offsetParent && 
           !container.hidden && 
           container.offsetHeight > 0;
  }

  /**
   * Create fallback container if standard containers not found
   * @returns {Element}
   */
  createFallbackContainer() {
    const videoTitle = document.querySelector('#container h1, .ytd-video-primary-info-renderer h1');
    if (!videoTitle) {
      throw new Error('Could not find video title for fallback container');
    }
    
    const container = DOMHelpers.createElement('div', {
      className: 'sentiment-fallback-container',
      style: 'margin: 12px 0; display: flex; align-items: center;'
    });
    
    videoTitle.parentNode.insertBefore(container, videoTitle.nextSibling);
    return container;
  }

  /**
   * Create the analyze button element
   * @returns {Element}
   */
  createAnalyzeButton() {
    const button = DOMHelpers.createElement('button', {
      className: 'sentiment-analyze-btn',
      title: 'Analyze comment sentiment',
      'aria-label': 'Analyze YouTube comment sentiment'
    });
    
    button.innerHTML = `
      <span class="sentiment-btn-icon">🧠</span>
      <span class="sentiment-btn-text">Analyze Comments</span>
    `;
    
    // Add click handler
    button.addEventListener('click', () => this.handleAnalyzeClick());
    
    return button;
  }

  /**
   * Handle analyze button click
   */
  async handleAnalyzeClick() {
    if (this.isAnalyzing) {
      return; // Prevent multiple concurrent analyses
    }
    
    try {
      this.setButtonState('loading');
      this.isAnalyzing = true;
      
      // Hide existing results
      this.hideResultsPanel();
      
      // Collect and analyze comments
      const collector = new YouTubeCommentCollector();
      const analyzer = new SentimentAnalyzer();
      
      const comments = await collector.collectComments(50);
      
      if (comments.length === 0) {
        throw new Error('No comments found to analyze');
      }
      
      const results = await analyzer.analyzeComments(comments);
      
      // Show results
      this.showResultsPanel(results);
      this.setButtonState('success');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      ErrorHandler.gracefulFallback(error, 'comment-analysis', {
        fallback: () => this.setButtonState('error')
      });
    } finally {
      this.isAnalyzing = false;
      // Reset button state after delay
      setTimeout(() => {
        if (this.analyzeButton) {
          this.setButtonState('default');
        }
      }, 3000);
    }
  }

  /**
   * Set button state (default, loading, success, error)
   * @param {string} state - Button state
   */
  setButtonState(state) {
    if (!this.analyzeButton) return;
    
    const icon = this.analyzeButton.querySelector('.sentiment-btn-icon');
    const text = this.analyzeButton.querySelector('.sentiment-btn-text');
    
    // Reset classes
    this.analyzeButton.classList.remove('loading', 'success', 'error');
    this.analyzeButton.disabled = false;
    
    switch (state) {
      case 'loading':
        this.analyzeButton.classList.add('loading');
        this.analyzeButton.disabled = true;
        icon.innerHTML = '<div class="sentiment-spinner"></div>';
        text.textContent = 'Analyzing...';
        break;
        
      case 'success':
        this.analyzeButton.classList.add('success');
        icon.innerHTML = '✅';
        text.textContent = 'Analysis Complete';
        break;
        
      case 'error':
        this.analyzeButton.classList.add('error');
        icon.innerHTML = '❌';
        text.textContent = 'Analysis Failed';
        break;
        
      default: // 'default'
        icon.innerHTML = '🧠';
        text.textContent = 'Analyze Comments';
        break;
    }
  }

  /**
   * Show results panel with analysis data
   * @param {Object} results - Analysis results
   */
  showResultsPanel(results) {
    // Remove existing panel
    this.hideResultsPanel();
    
    // Create panel
    this.resultsPanel = this.createResultsPanel(results);
    document.body.appendChild(this.resultsPanel);
    
    // Focus management for accessibility
    this.resultsPanel.setAttribute('tabindex', '-1');
    this.resultsPanel.focus();
  }

  /**
   * Create results panel element
   * @param {Object} results - Analysis results
   * @returns {Element}
   */
  createResultsPanel(results) {
    const panel = DOMHelpers.createElement('div', {
      className: 'sentiment-results-panel',
      role: 'dialog',
      'aria-labelledby': 'sentiment-panel-title',
      'aria-modal': 'true'
    });
    
    panel.innerHTML = `
      <div class="sentiment-panel-header">
        <h3 id="sentiment-panel-title" class="sentiment-panel-title">Comment Sentiment Analysis</h3>
        <button class="sentiment-close-btn" aria-label="Close panel">×</button>
      </div>
      <div class="sentiment-panel-content">
        ${this.createSummarySection(results)}
        ${this.createChartSection()}
        ${this.createCommentsSection(results)}
      </div>
    `;
    
    // Add event listeners
    const closeBtn = panel.querySelector('.sentiment-close-btn');
    closeBtn.addEventListener('click', () => this.hideResultsPanel());
    
    // Close on Escape key
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideResultsPanel();
      }
    });
    
    // Close on outside click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        this.hideResultsPanel();
      }
    });
    
    return panel;
  }

  /**
   * Create summary statistics section
   * @param {Object} results - Analysis results
   * @returns {string} HTML content
   */
  createSummarySection(results) {
    return `
      <div class="sentiment-summary">
        <div class="sentiment-stat">
          <div class="sentiment-stat-number" style="color: #4CAF50;">${results.summary.positive}</div>
          <div class="sentiment-stat-label">Positive</div>
        </div>
        <div class="sentiment-stat">
          <div class="sentiment-stat-number" style="color: #F44336;">${results.summary.negative}</div>
          <div class="sentiment-stat-label">Negative</div>
        </div>
        <div class="sentiment-stat">
          <div class="sentiment-stat-number" style="color: #9E9E9E;">${results.summary.neutral}</div>
          <div class="sentiment-stat-label">Neutral</div>
        </div>
      </div>
    `;
  }

  /**
   * Create chart section
   * @returns {string} HTML content
   */
  createChartSection() {
    return `
      <div class="sentiment-chart-container">
        <canvas class="sentiment-chart" width="200" height="200" aria-label="Sentiment distribution pie chart"></canvas>
      </div>
    `;
  }

  /**
   * Create comments section
   * @param {Object} results - Analysis results
   * @returns {string} HTML content
   */
  createCommentsSection(results) {
    const topPositive = results.positive.slice(0, 3);
    const topNegative = results.negative.slice(0, 3);
    
    return `
      ${topPositive.length > 0 ? `
        <div class="sentiment-comments-section">
          <h4 class="sentiment-section-title">
            <span style="color: #4CAF50;">😊</span> Top Positive Comments
          </h4>
          ${topPositive.map(comment => this.createCommentItem(comment, 'positive')).join('')}
        </div>
      ` : ''}
      
      ${topNegative.length > 0 ? `
        <div class="sentiment-comments-section">
          <h4 class="sentiment-section-title">
            <span style="color: #F44336;">😞</span> Top Negative Comments
          </h4>
          ${topNegative.map(comment => this.createCommentItem(comment, 'negative')).join('')}
        </div>
      ` : ''}
    `;
  }

  /**
   * Create individual comment item
   * @param {Object} comment - Comment data
   * @param {string} type - 'positive' or 'negative'
   * @returns {string} HTML content
   */
  createCommentItem(comment, type) {
    const confidence = Math.round(comment.sentiment.confidence * 100);
    const maxLength = 150;
    const truncatedText = comment.text.length > maxLength 
      ? comment.text.substring(0, maxLength) + '...'
      : comment.text;
    
    return `
      <div class="sentiment-comment-item ${type}">
        <div class="sentiment-comment-author">${DOMHelpers.escapeHtml(comment.author)}</div>
        <div class="sentiment-comment-text">${DOMHelpers.escapeHtml(truncatedText)}</div>
        <div class="sentiment-comment-meta">
          <span class="sentiment-likes">👍 ${comment.likes}</span>
          <span class="sentiment-confidence">${confidence}% confidence</span>
        </div>
      </div>
    `;
  }

  /**
   * Render chart after panel is created
   * @param {Object} results - Analysis results
   */
  renderChart(results) {
    const canvas = this.resultsPanel?.querySelector('.sentiment-chart');
    if (!canvas) return;
    
    // Clean up existing chart
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Create new chart
    this.chart = PieChartRenderer.create(canvas, {
      positive: results.summary.positive,
      negative: results.summary.negative,
      neutral: results.summary.neutral
    });
  }

  /**
   * Hide results panel
   */
  hideResultsPanel() {
    if (this.resultsPanel) {
      // Clean up chart
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      
      this.resultsPanel.remove();
      this.resultsPanel = null;
      
      // Return focus to analyze button
      if (this.analyzeButton) {
        this.analyzeButton.focus();
      }
    }
  }

  /**
   * Remove analyze button
   */
  removeAnalyzeButton() {
    if (this.analyzeButton) {
      this.analyzeButton.remove();
      this.analyzeButton = null;
    }
  }

  /**
   * Update theme when YouTube theme changes
   * @param {string} theme - 'dark' or 'light'
   */
  updateTheme(theme) {
    if (this.resultsPanel) {
      this.resultsPanel.setAttribute('data-theme', theme);
    }
  }

  /**
   * Clean up all UI elements
   */
  cleanup() {
    this.hideResultsPanel();
    this.removeAnalyzeButton();
  }
}

// Add HTML escaping utility to DOMHelpers
if (window.DOMHelpers) {
  DOMHelpers.escapeHtml = function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
}

// Export for use in other modules
window.UIInjector = UIInjector;
