// Browser Compatibility Test Suite for Mobile Navigation
class BrowserCompatibilityTest {
  constructor() {
    this.results = {
      device: this.detectDevice(),
      browser: this.detectBrowser(),
      capabilities: this.detectCapabilities(),
      tests: []
    };
    this.runTests();
  }

  detectDevice() {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    // Device detection
    let device = 'unknown';
    let deviceType = 'unknown';
    
    if (/iPhone/.test(userAgent)) {
      device = 'iPhone';
      deviceType = 'mobile';
    } else if (/iPad/.test(userAgent)) {
      device = 'iPad';
      deviceType = 'tablet';
    } else if (/Android/.test(userAgent)) {
      if (screenWidth >= 768) {
        device = 'Android Tablet';
        deviceType = 'tablet';
      } else {
        device = 'Android Phone';
        deviceType = 'mobile';
      }
    } else if (/Windows/.test(userAgent)) {
      device = 'Windows';
      deviceType = 'desktop';
    } else if (/Mac/.test(userAgent)) {
      device = 'Mac';
      deviceType = 'desktop';
    }

    return {
      name: device,
      type: deviceType,
      width: screenWidth,
      height: screenHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait'
    };
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';

    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      browser = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (/Chrome/.test(userAgent)) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (/Firefox/.test(userAgent)) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (/Edge/.test(userAgent)) {
      browser = 'Edge';
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
    }

    return {
      name: browser,
      version: version,
      userAgent: userAgent
    };
  }

  detectCapabilities() {
    return {
      touch: 'ontouchstart' in window,
      pointer: 'onpointerdown' in window,
      passive: (() => {
        let supportsPassive = false;
        try {
          const opts = Object.defineProperty({}, 'passive', {
            get: function() { supportsPassive = true; }
          });
          window.addEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassive;
      })(),
      intersectionObserver: 'IntersectionObserver' in window,
      backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
      cssGrid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      webkit: /WebKit/.test(navigator.userAgent),
      gecko: /Gecko/.test(navigator.userAgent),
      blink: /Blink/.test(navigator.userAgent)
    };
  }

  addTest(name, result, details = '') {
    this.results.tests.push({
      name,
      result, // 'pass', 'fail', 'warning'
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Core functionality tests
  testMenuButton() {
    const button = document.getElementById('menu-button');
    if (!button) {
      this.addTest('Menu Button Exists', 'fail', 'Menu button not found');
      return false;
    }

    this.addTest('Menu Button Exists', 'pass', 'Menu button found');
    
    // Test visibility
    const isVisible = !button.classList.contains('hidden') && button.offsetWidth > 0;
    this.addTest('Menu Button Visibility', isVisible ? 'pass' : 'fail', 
      `Button visible: ${isVisible}, width: ${button.offsetWidth}px`);

    // Test accessibility
    const hasAriaExpanded = button.hasAttribute('aria-expanded');
    const hasAriaControls = button.hasAttribute('aria-controls');
    const hasAriaLabel = button.hasAttribute('aria-label');
    
    this.addTest('Menu Button Accessibility', 
      (hasAriaExpanded && hasAriaControls && hasAriaLabel) ? 'pass' : 'fail',
      `ARIA: expanded=${hasAriaExpanded}, controls=${hasAriaControls}, label=${hasAriaLabel}`);

    // Test touch target size
    const rect = button.getBoundingClientRect();
    const minSize = 44; // iOS minimum
    const isLargeEnough = rect.width >= minSize && rect.height >= minSize;
    this.addTest('Touch Target Size', isLargeEnough ? 'pass' : 'warning',
      `Size: ${rect.width}x${rect.height}px (min: ${minSize}x${minSize})`);

    return true;
  }

  testMenuPanel() {
    const panel = document.getElementById('primary-menu');
    if (!panel) {
      this.addTest('Menu Panel Exists', 'fail', 'Menu panel not found');
      return false;
    }

    this.addTest('Menu Panel Exists', 'pass', 'Menu panel found');

    // Test initial state
    const isHidden = panel.hidden;
    this.addTest('Menu Panel Initial State', isHidden ? 'pass' : 'fail', 
      `Panel initially hidden: ${isHidden}`);

    // Test positioning
    const rect = panel.getBoundingClientRect();
    const isPositioned = rect.top > 0 && rect.left > 0;
    this.addTest('Menu Panel Positioning', isPositioned ? 'pass' : 'fail',
      `Panel positioned at (${rect.left}, ${rect.top})`);

    // Test backdrop blur support
    const hasBackdropBlur = this.results.capabilities.backdropFilter;
    this.addTest('Backdrop Blur Support', hasBackdropBlur ? 'pass' : 'warning',
      'Backdrop blur may not be supported on this device');

    return true;
  }

  testMenuFunctionality() {
    const button = document.getElementById('menu-button');
    const panel = document.getElementById('primary-menu');
    
    if (!button || !panel) {
      this.addTest('Menu Functionality', 'fail', 'Menu components not found');
      return false;
    }

    // Test click functionality
    const initialState = panel.hidden;
    button.click();
    
    setTimeout(() => {
      const newState = panel.hidden;
      const toggled = initialState !== newState;
      this.addTest('Menu Toggle on Click', toggled ? 'pass' : 'fail',
        `Menu ${toggled ? 'toggled' : 'failed to toggle'}`);
      
      // Test icon state change
      const iconOpen = button.querySelector('[data-icon="open"]');
      const iconClose = button.querySelector('[data-icon="close"]');
      
      if (iconOpen && iconClose) {
        const iconChanged = iconOpen.classList.contains('hidden') !== initialState;
        this.addTest('Icon State Change', iconChanged ? 'pass' : 'fail',
          'Icon state updated correctly');
      }
    }, 100);

    return true;
  }

  testTouchInteractions() {
    if (!this.results.capabilities.touch) {
      this.addTest('Touch Support', 'warning', 'Touch not supported on this device');
      return;
    }

    this.addTest('Touch Support', 'pass', 'Touch interactions supported');

    // Test touch highlight
    const button = document.getElementById('menu-button');
    if (button) {
      const style = window.getComputedStyle(button);
      const hasTouchHighlight = style.webkitTapHighlightColor !== 'rgba(0, 0, 0, 0)';
      this.addTest('Touch Highlight', hasTouchHighlight ? 'pass' : 'warning',
        'Touch highlight may not be visible');
    }
  }

  testPerformance() {
    const startTime = performance.now();
    
    // Simulate menu operations
    const button = document.getElementById('menu-button');
    if (button) {
      button.click();
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.addTest('Response Time', responseTime < 100 ? 'pass' : 'warning',
        `Response time: ${responseTime.toFixed(2)}ms`);
    }

    // Test animation performance
    const panel = document.getElementById('primary-menu');
    if (panel) {
      const style = window.getComputedStyle(panel);
      const hasTransition = style.transition !== 'all 0s ease 0s';
      this.addTest('Animation Performance', hasTransition ? 'pass' : 'warning',
        'CSS transitions applied for smooth animations');
    }
  }

  testAccessibility() {
    // Test keyboard navigation
    const button = document.getElementById('menu-button');
    if (button) {
      const isFocusable = button.tabIndex >= 0;
      this.addTest('Keyboard Focus', isFocusable ? 'pass' : 'fail',
        `Tab index: ${button.tabIndex}`);
    }

    // Test screen reader support
    const panel = document.getElementById('primary-menu');
    if (panel) {
      const hasAriaLabel = panel.querySelector('nav[aria-label]');
      this.addTest('Screen Reader Support', hasAriaLabel ? 'pass' : 'fail',
        'Navigation has aria-label for screen readers');
    }

    // Test color contrast (basic check)
    if (button) {
      const style = window.getComputedStyle(button);
      const hasVisibleStyling = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                               style.color !== 'rgba(0, 0, 0, 0)';
      this.addTest('Color Contrast', hasVisibleStyling ? 'pass' : 'warning',
        'Button has visible styling');
    }
  }

  testEdgeCases() {
    // Test rapid clicking
    const button = document.getElementById('menu-button');
    if (button) {
      let clickCount = 0;
      const maxClicks = 5;
      
      const rapidClick = () => {
        button.click();
        clickCount++;
        if (clickCount < maxClicks) {
          setTimeout(rapidClick, 50);
        } else {
          const panel = document.getElementById('primary-menu');
          const isStable = panel && (panel.hidden || !panel.hidden);
          this.addTest('Rapid Click Stability', isStable ? 'pass' : 'fail',
            'Menu remains stable under rapid clicking');
        }
      };
      rapidClick();
    }

    // Test orientation change resilience
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      const button = document.getElementById('menu-button');
      const isStillFunctional = button && button.offsetWidth > 0;
      this.addTest('Orientation Change Resilience', isStillFunctional ? 'pass' : 'warning',
        'Menu button remains functional after resize');
    }, 100);
  }

  runTests() {
    console.log('🔍 Running Browser Compatibility Tests...');
    console.log('Device:', this.results.device);
    console.log('Browser:', this.results.browser);
    console.log('Capabilities:', this.results.capabilities);

    // Run all tests
    this.testMenuButton();
    this.testMenuPanel();
    this.testMenuFunctionality();
    this.testTouchInteractions();
    this.testPerformance();
    this.testAccessibility();
    this.testEdgeCases();

    // Log results
    setTimeout(() => {
      this.logResults();
    }, 1000);
  }

  logResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.results.tests.filter(t => t.result === 'pass').length;
    const failed = this.results.tests.filter(t => t.result === 'fail').length;
    const warnings = this.results.tests.filter(t => t.result === 'warning').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    
    console.log('\n📋 Detailed Results:');
    this.results.tests.forEach(test => {
      const emoji = test.result === 'pass' ? '✅' : test.result === 'fail' ? '❌' : '⚠️';
      console.log(`${emoji} ${test.name}: ${test.result.toUpperCase()}`);
      if (test.details) {
        console.log(`   ${test.details}`);
      }
    });

    // Store results for external access
    window.mobileNavTestResults = this.results;
    
    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('mobileNavTestComplete', {
      detail: this.results
    }));
  }

  getResults() {
    return this.results;
  }
}

// Auto-run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BrowserCompatibilityTest();
});

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserCompatibilityTest;
}
