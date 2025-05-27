# 🔧 Extension Troubleshooting Guide

## Step 1: Verify Extension Installation

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Make sure "Developer mode" is ON (toggle in top right)

2. **Check Extension Status**
   - Find "Comment Insight - YouTube Sentiment Analyzer"
   - Status should be "Enabled" with a blue toggle
   - Note the Extension ID for debugging

## Step 2: Test with Debug Console

1. **Go to a YouTube Video**
   - Open any YouTube video (URL should contain `/watch?v=`)
   - Make sure the video page has loaded completely

2. **Open Browser Console**
   - Press `F12` or right-click → "Inspect"
   - Go to "Console" tab
   - Clear the console (Ctrl+L)

3. **Copy and Paste this Debug Code:**

```javascript
// === EXTENSION DEBUG SCRIPT ===
console.clear();
console.log('🔍 Extension Debug Started');

// Check current page
console.log('📍 Current URL:', window.location.href);
console.log('📍 Is watch page:', window.location.pathname === '/watch');
console.log('📍 Has video ID:', window.location.search.includes('v='));

// Check extension scripts
const requiredClasses = ['YouTubeDetector', 'DOMHelpers', 'ErrorHandler', 'CommentCollector', 'SentimentAnalyzer', 'PieChartRenderer', 'UIInjector'];
console.log('\n📦 Checking Extension Classes:');
requiredClasses.forEach(name => {
    console.log(`${window[name] ? '✅' : '❌'} ${name}`);
});

// Check debug object
if (window.SentimentAnalyzer_Debug) {
    console.log('\n🐛 Debug object available');
    console.log('Is initialized:', window.SentimentAnalyzer_Debug.isInitialized());
} else {
    console.log('\n❌ Debug object not available');
}

// Manual trigger test
setTimeout(() => {
    console.log('\n🚀 Testing manual trigger...');
    if (window.SentimentAnalyzer_Debug) {
        window.SentimentAnalyzer_Debug.initialize().then(() => {
            console.log('✅ Manual initialization successful');
        }).catch(err => {
            console.error('❌ Manual initialization failed:', err);
        });
    }
}, 2000);
```

## Step 3: Check Console Output

After running the debug script, you should see:

### ✅ **SUCCESS Pattern:**
```
🔍 Extension Debug Started
📍 Current URL: https://www.youtube.com/watch?v=...
📍 Is watch page: true
📍 Has video ID: true

📦 Checking Extension Classes:
✅ YouTubeDetector
✅ DOMHelpers
✅ ErrorHandler
✅ CommentCollector
✅ SentimentAnalyzer
✅ PieChartRenderer
✅ UIInjector

🐛 Debug object available
Is initialized: true

🚀 Testing manual trigger...
✅ Manual initialization successful
```

### ❌ **PROBLEM Patterns:**

**Pattern 1: Scripts not loading**
```
❌ YouTubeDetector
❌ DOMHelpers
❌ ErrorHandler
...
```
**→ Solution:** Reload the extension in chrome://extensions/

**Pattern 2: Wrong page type**
```
📍 Is watch page: false
```
**→ Solution:** Make sure you're on a video page (not homepage/search/etc)

**Pattern 3: Extension not active**
```
❌ Debug object not available
```
**→ Solution:** Check if extension is enabled and reload the page

## Step 4: Force Reload Extension

If scripts aren't loading:

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the "Reload" button (🔄)
4. Go back to YouTube video page
5. Refresh the page (F5)
6. Run debug script again

## Step 5: Manual Panel Injection

If everything loads but panel doesn't appear, try this in console:

```javascript
// Force create panel
if (window.UIInjector) {
    const injector = new UIInjector();
    injector.injectAnalyzeButton().then(() => {
        console.log('Panel injected manually');
    }).catch(console.error);
}
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No console output at all | Extension not loaded - check chrome://extensions/ |
| "Missing classes" errors | Script loading failed - reload extension |
| "Not a video page" | Go to a YouTube video (not homepage) |
| Panel appears then disappears | YouTube navigation conflict - refresh page |
| No comments found | Scroll down to load comments first |

## Need More Help?

Run this complete diagnostic:

```javascript
// Complete diagnostic
console.log('=== COMPLETE DIAGNOSTIC ===');
console.log('Extension runtime:', chrome?.runtime?.id || 'Not available');
console.log('Document ready state:', document.readyState);
console.log('YouTube elements found:', {
    primary: !!document.querySelector('#primary'),
    secondary: !!document.querySelector('#secondary'),
    comments: !!document.querySelector('ytd-comments'),
    commentThreads: document.querySelectorAll('ytd-comment-thread-renderer').length
});
```
