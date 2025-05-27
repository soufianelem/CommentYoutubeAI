/**
 * DOM helper utilities for robust element selection and manipulation
 */
class DOMHelpers {
  /**
   * Try multiple selectors until one works
   * @param {string[]} selectors - Array of CSS selectors to try
   * @param {Element} root - Root element to search from
   * @returns {Element|null}
   */
  static trySelectors(selectors, root = document) {
    for (const selector of selectors) {
      try {
        const element = root.querySelector(selector);
        if (element) return element;
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`, e);
      }
    }
    return null;
  }

  /**
   * Try multiple selectors for multiple elements
   * @param {string[]} selectors - Array of CSS selectors to try
   * @param {Element} root - Root element to search from
   * @returns {NodeList|Array}
   */
  static trySelectorsAll(selectors, root = document) {
    for (const selector of selectors) {
      try {
        const elements = root.querySelectorAll(selector);
        if (elements && elements.length > 0) return elements;
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`, e);
      }
    }
    return [];
  }

  /**
   * Wait for element to appear in DOM
   * @param {string|string[]} selectors - CSS selector(s) to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @param {Element} root - Root element to search from
   * @returns {Promise<Element>}
   */
  static waitForElement(selectors, timeout = 10000, root = document) {
    return new Promise((resolve, reject) => {
      const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
      
      // Check if element already exists
      const existing = this.trySelectors(selectorArray, root);
      if (existing) {
        resolve(existing);
        return;
      }

      // Set up observer
      const observer = new MutationObserver((mutations) => {
        const element = this.trySelectors(selectorArray, root);
        if (element) {
          observer.disconnect();
          clearTimeout(timeoutId);
          resolve(element);
        }
      });

      // Set up timeout
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element not found: ${selectorArray.join(', ')}`));
      }, timeout);

      // Start observing
      observer.observe(root, {
        childList: true,
        subtree: true
      });
    });
  }

  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string|Element|Array} children - Child content
   * @returns {Element}
   */
  static createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });

    // Add children
    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Element) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Safely remove element from DOM
   * @param {Element|string} elementOrSelector - Element or CSS selector
   */
  static removeElement(elementOrSelector) {
    const element = typeof elementOrSelector === 'string' 
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
    
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function}
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   * @returns {Function}
   */
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Get text content while preserving line breaks
   * @param {Element} element - Element to extract text from
   * @returns {string}
   */
  static getCleanText(element) {
    if (!element) return '';
    
    // Clone the element to avoid modifying original
    const clone = element.cloneNode(true);
    
    // Remove script and style elements
    const scriptsAndStyles = clone.querySelectorAll('script, style');
    scriptsAndStyles.forEach(el => el.remove());
    
    // Replace block elements with line breaks
    const blockElements = clone.querySelectorAll('div, p, br, h1, h2, h3, h4, h5, h6');
    blockElements.forEach(el => {
      if (el.tagName === 'BR') {
        el.replaceWith('\n');
      } else {
        el.insertAdjacentText('afterend', '\n');
      }
    });
    
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  /**
   * Check if element is visible in viewport
   * @param {Element} element - Element to check
   * @returns {boolean}
   */
  static isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Scroll element into view smoothly
   * @param {Element} element - Element to scroll to
   */
  static scrollIntoView(element) {
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }

  /**
   * Create shadow DOM for style isolation
   * @param {Element} host - Host element
   * @returns {ShadowRoot}
   */
  static createShadowDOM(host) {
    if (host.shadowRoot) {
      return host.shadowRoot;
    }
    return host.attachShadow({ mode: 'open' });
  }
}

// Export for use in other modules
window.DOMHelpers = DOMHelpers;
