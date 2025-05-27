/**
 * Custom lightweight pie chart renderer using Canvas
 * Replaces heavy charting libraries with ~2KB custom implementation
 */
class PieChartRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      centerX: canvas.width / 2,
      centerY: canvas.height / 2,
      radius: Math.min(canvas.width, canvas.height) / 2 - 20,      colors: {
        positive: '#4CAF50',
        negative: '#F44336',
        neutral: '#9E9E9E',
        other: '#FF9800'
      },
      animation: true,
      animationDuration: 1000,
      showTooltip: true,
      ...options
    };
    
    this.data = null;
    this.animationFrame = 0;
    this.tooltipDiv = null;
    
    this.setupTooltip();
    this.setupInteractions();
  }
  /**
   * Render pie chart with enhanced data including "Other" category
   * @param {Object} data - Chart data with positive, negative, neutral, other counts
   */
  render(data) {
    this.data = {
      positive: data.positive || 0,
      negative: data.negative || 0,
      neutral: data.neutral || 0,
      other: data.other || 0
    };
    
    const total = this.data.positive + this.data.negative + this.data.neutral + this.data.other;
    if (total === 0) {
      this.renderEmptyState();
      return;
    }
    
    // Calculate percentages and angles
    this.segments = [
      {
        label: 'Positive',
        value: this.data.positive,
        percentage: Math.round((this.data.positive / total) * 100),
        angle: (this.data.positive / total) * 2 * Math.PI,
        color: this.options.colors.positive
      },
      {
        label: 'Negative',
        value: this.data.negative,
        percentage: Math.round((this.data.negative / total) * 100),
        angle: (this.data.negative / total) * 2 * Math.PI,
        color: this.options.colors.negative
      },
      {
        label: 'Neutral',
        value: this.data.neutral,
        percentage: Math.round((this.data.neutral / total) * 100),
        angle: (this.data.neutral / total) * 2 * Math.PI,
        color: this.options.colors.neutral
      },
      {
        label: 'Other',
        value: this.data.other,
        percentage: Math.round((this.data.other / total) * 100),
        angle: (this.data.other / total) * 2 * Math.PI,
        color: this.options.colors.other
      }
    ].filter(segment => segment.value > 0);
    
    if (this.options.animation) {
      this.animateChart();
    } else {
      this.drawChart(1.0);
    }
  }

  /**
   * Animate chart rendering
   */
  animateChart() {
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.options.animationDuration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      this.drawChart(easedProgress);
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Draw the chart
   * @param {number} progress - Animation progress (0-1)
   */
  drawChart(progress) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    let currentAngle = -Math.PI / 2; // Start at top
    
    // Draw segments
    for (const segment of this.segments) {
      const segmentAngle = segment.angle * progress;
      
      if (segmentAngle > 0.01) { // Only draw if visible
        this.drawSegment(
          this.options.centerX,
          this.options.centerY,
          this.options.radius,
          currentAngle,
          currentAngle + segmentAngle,
          segment.color,
          segment
        );
      }
      
      currentAngle += segmentAngle;
    }
    
    // Draw center circle for donut effect
    this.drawCenterCircle();
    
    // Draw center text
    this.drawCenterText();
  }

  /**
   * Draw individual pie segment
   */
  drawSegment(centerX, centerY, radius, startAngle, endAngle, color, segment) {
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    this.ctx.lineTo(centerX, centerY);
    this.ctx.closePath();
    
    // Fill segment
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    // Add subtle stroke
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // Store segment bounds for hover detection
    segment.startAngle = startAngle;
    segment.endAngle = endAngle;
    segment.centerX = centerX;
    segment.centerY = centerY;
    segment.radius = radius;
    
    // Draw percentage label if segment is large enough
    if (segment.percentage >= 5) {
      this.drawSegmentLabel(centerX, centerY, radius, startAngle, endAngle, segment);
    }
  }

  /**
   * Draw segment label
   */
  drawSegmentLabel(centerX, centerY, radius, startAngle, endAngle, segment) {
    const midAngle = (startAngle + endAngle) / 2;
    const labelRadius = radius * 0.7;
    const x = centerX + Math.cos(midAngle) * labelRadius;
    const y = centerY + Math.sin(midAngle) * labelRadius;
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 14px Roboto, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Add text shadow for better readability
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    
    this.ctx.fillText(`${segment.percentage}%`, x, y);
    
    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * Draw center circle for donut effect
   */
  drawCenterCircle() {
    const innerRadius = this.options.radius * 0.4;
    
    this.ctx.beginPath();
    this.ctx.arc(this.options.centerX, this.options.centerY, innerRadius, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Draw center text
   */
  drawCenterText() {
    const total = this.data.positive + this.data.negative + this.data.neutral + this.data.other;
    
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 16px Roboto, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.fillText(`${total}`, this.options.centerX, this.options.centerY - 8);
    
    this.ctx.font = '12px Roboto, Arial, sans-serif';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText('Comments', this.options.centerX, this.options.centerY + 8);
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#ccc';
    this.ctx.font = '16px Roboto, Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.fillText(
      'No comments to analyze',
      this.options.centerX,
      this.options.centerY
    );
  }

  /**
   * Setup tooltip for hover interactions
   */
  setupTooltip() {
    if (!this.options.showTooltip) return;
    
    this.tooltipDiv = document.createElement('div');
    this.tooltipDiv.className = 'sentiment-tooltip hidden';
    document.body.appendChild(this.tooltipDiv);
  }

  /**
   * Setup mouse interactions
   */
  setupInteractions() {
    let currentHoverSegment = null;
    
    this.canvas.addEventListener('mousemove', (event) => {
      if (!this.segments) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const hoveredSegment = this.getSegmentAtPoint(x, y);
      
      if (hoveredSegment !== currentHoverSegment) {
        currentHoverSegment = hoveredSegment;
        
        if (hoveredSegment) {
          this.showTooltip(hoveredSegment, event.clientX, event.clientY);
          this.canvas.style.cursor = 'pointer';
        } else {
          this.hideTooltip();
          this.canvas.style.cursor = 'default';
        }
      }
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.hideTooltip();
      this.canvas.style.cursor = 'default';
    });
  }

  /**
   * Get segment at specific point
   */
  getSegmentAtPoint(x, y) {
    if (!this.segments) return null;
    
    const dx = x - this.options.centerX;
    const dy = y - this.options.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Check if point is within pie radius
    if (distance > this.options.radius || distance < this.options.radius * 0.4) {
      return null;
    }
    
    // Calculate angle
    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;
    
    // Adjust for starting position (top of circle)
    angle = (angle + Math.PI / 2) % (2 * Math.PI);
    
    // Find segment
    for (const segment of this.segments) {
      let startAngle = (segment.startAngle + Math.PI / 2) % (2 * Math.PI);
      let endAngle = (segment.endAngle + Math.PI / 2) % (2 * Math.PI);
      
      // Handle wrap-around
      if (startAngle > endAngle) {
        if (angle >= startAngle || angle <= endAngle) {
          return segment;
        }
      } else {
        if (angle >= startAngle && angle <= endAngle) {
          return segment;
        }
      }
    }
    
    return null;
  }

  /**
   * Show tooltip
   */
  showTooltip(segment, x, y) {
    if (!this.tooltipDiv) return;
    
    this.tooltipDiv.innerHTML = `
      <strong>${segment.label}</strong><br>
      ${segment.value} comments (${segment.percentage}%)
    `;
    
    this.tooltipDiv.style.left = x + 10 + 'px';
    this.tooltipDiv.style.top = y - 10 + 'px';
    this.tooltipDiv.classList.remove('hidden');
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    if (this.tooltipDiv) {
      this.tooltipDiv.classList.add('hidden');
    }
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    if (this.tooltipDiv) {
      this.tooltipDiv.remove();
    }
  }

  /**
   * Static method to create and render chart
   */
  static create(canvas, data, options = {}) {
    const chart = new PieChartRenderer(canvas, options);
    chart.render(data);
    return chart;
  }
}

// Export for use in other modules
window.PieChartRenderer = PieChartRenderer;
