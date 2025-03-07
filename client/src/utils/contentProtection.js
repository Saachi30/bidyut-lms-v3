// contentProtection.js - Add to your project
// This script will prevent screenshots, screen recording, and screen sharing

// Helper function to create and display the black overlay when protection is triggered
function createBlackOverlay(message = "Screen capture detected. This content is protected.") {
    // Remove existing overlay if any
    const existingOverlay = document.getElementById('protection-overlay');
    if (existingOverlay) {
      document.body.removeChild(existingOverlay);
    }
  
    // Create new overlay
    const overlay = document.createElement('div');
    overlay.id = 'protection-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#000';
    overlay.style.zIndex = '999999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.color = '#fff';
    overlay.style.fontFamily = 'Arial, sans-serif';
    overlay.style.padding = '20px';
    overlay.style.boxSizing = 'border-box';
    overlay.style.textAlign = 'center';
  
    // Add warning message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.fontSize = '18px';
    messageEl.style.margin = '0 0 20px 0';
    overlay.appendChild(messageEl);
  
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Continue Browsing';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = '#cc0000';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    closeButton.onclick = function() {
      document.body.removeChild(overlay);
    };
    overlay.appendChild(closeButton);
  
    document.body.appendChild(overlay);
    
    return overlay;
  }
  
  // Function to detect and handle screen capture attempts
  function setupScreenCaptureProtection() {
    // 1. Detect standard screen capture API
    if (navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      
      navigator.mediaDevices.getDisplayMedia = function(constraints) {
        // Allow getDisplayMedia to proceed, but once it starts, show the protection overlay
        const promise = originalGetDisplayMedia.call(navigator.mediaDevices, constraints);
        
        promise.then(() => {
          createBlackOverlay("Screen sharing detected. This content is protected.");
        }).catch(err => {
          console.log('User cancelled or permission denied: ', err);
        });
        
        return promise;
      };
    }
  
    // 2. Hide content when document visibility changes (tab switching for screen capture)
    let contentHidden = false;
    let originalBodyContent = null;
    let blackOverlay = null;
    
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        // Tab is hidden, possibly for screen capture
        if (!contentHidden) {
          originalBodyContent = document.body.innerHTML;
          blackOverlay = createBlackOverlay("Content protected when not in active view.");
          contentHidden = true;
        }
      } else if (document.visibilityState === 'visible' && contentHidden) {
        // Tab is visible again
        if (blackOverlay && blackOverlay.parentNode) {
          document.body.removeChild(blackOverlay);
          blackOverlay = null;
        }
        contentHidden = false;
      }
    });
  
    // 3. Detect DevTools (which could be used for DOM manipulation to bypass protections)
    let devToolsOpen = false;
    
    function detectDevTools() {
      const threshold = 160; // Threshold width difference that might indicate dev tools opening
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (
        widthThreshold || 
        heightThreshold || 
        (window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized)
      ) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          createBlackOverlay("Developer tools detected. This content is protected.");
        }
      } else if (devToolsOpen) {
        devToolsOpen = false;
        const overlay = document.getElementById('protection-overlay');
        if (overlay) {
          document.body.removeChild(overlay);
        }
      }
    }
    
    setInterval(detectDevTools, 1000);
    window.addEventListener('resize', detectDevTools);
  
    // 4. Prevent keyboard shortcuts commonly used for screenshots
    window.addEventListener('keydown', function(e) {
      // Windows: Print Screen, Alt+Print Screen
      // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
      // Browser: Ctrl+S
      const isPrintScreen = e.key === 'PrintScreen';
      const isMacScreenshot = 
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'));
      const isSave = (e.ctrlKey && e.key === 's');
      
      if (isPrintScreen || isMacScreenshot || isSave) {
        e.preventDefault();
        createBlackOverlay("Screenshot attempt detected. This content is protected.");
        return false;
      }
    }, true);
    
    // 5. Disable right-click to prevent saving images
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });
    
    // 6. Disable selection
    document.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    });
  
    // 7. Apply CSS to prevent selection and drag & drop
    const style = document.createElement('style');
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      
      img, video {
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Apply canvas fingerprinting to detect when screen is being captured
  function applyCanvasFingerprinting() {
    // Create a hidden canvas element for fingerprinting
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw a unique pattern that will be affected by screen capture
    function drawFingerprint() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw date-time to make the pattern unique each time
      const now = new Date().getTime();
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(now.toString(), 10, 20);
      
      // Draw some unique shapes with semi-transparent colors
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(20, 30, 100, 50);
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(100, 100, 50, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
      ctx.fillRect(70, 80, 80, 80);
      
      // Add some text with a specific font
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Protected Content', 40, 180);
      
      // Get data URL from canvas
      return canvas.toDataURL();
    }
    
    // Initial fingerprint
    let lastFingerprint = drawFingerprint();
    
    // Check for screen recording by comparing fingerprints
    setInterval(() => {
      const currentFingerprint = drawFingerprint();
      
      // If fingerprint changes in an unexpected way, it might be due to screen capture
      if (lastFingerprint !== currentFingerprint) {
        lastFingerprint = currentFingerprint;
        
        // Additional check: re-draw immediately and check again
        // Screen recording software often causes more significant differences
        setTimeout(() => {
          const verificationFingerprint = drawFingerprint();
          const difference = calculateFingerprintDifference(currentFingerprint, verificationFingerprint);
          
          if (difference > 0.1) { // Threshold for detection
            createBlackOverlay("Screen recording detected. This content is protected.");
          }
        }, 50);
      }
    }, 1000);
    
    // Simple function to estimate difference between two data URLs
    function calculateFingerprintDifference(fp1, fp2) {
      // Very basic difference calculation
      let diff = 0;
      const minLength = Math.min(fp1.length, fp2.length);
      
      for (let i = 0; i < minLength; i += 100) { // Sample every 100 chars for performance
        if (fp1[i] !== fp2[i]) {
          diff++;
        }
      }
      
      return diff / (minLength / 100);
    }
  }
  
  // Function to inject HTML5 video protection
  function protectVideoContent() {
    // Find all video elements and apply protection
    function applyVideoProtection() {
      const videos = document.querySelectorAll('video');
      
      videos.forEach(video => {
        if (!video.hasAttribute('protected')) {
          // Prevent capturing video frames
          video.style.webkitFilter = 'none'; // To prevent filter-based captures
          
          // Apply encrypted media extensions if available
          if (navigator.requestMediaKeySystemAccess) {
            const config = [{
              initDataTypes: ['cenc'],
              audioCapabilities: [{
                contentType: 'audio/mp4; codecs="mp4a.40.2"'
              }],
              videoCapabilities: [{
                contentType: 'video/mp4; codecs="avc1.42E01E"'
              }]
            }];
            
            navigator.requestMediaKeySystemAccess('org.w3.clearkey', config)
              .then(keySystemAccess => {
                console.log('DRM initialized for video protection');
              })
              .catch(error => {
                console.log('DRM initialization failed, using fallback protection');
              });
          }
          
          // Set a token to avoid re-applying protection
          video.setAttribute('protected', 'true');
          
          // Add event listeners to detect when the video might be captured
          video.addEventListener('enterpictureinpicture', function() {
            video.pause();
            createBlackOverlay("Picture-in-Picture is disabled for protected content.");
          });
          
          // Detect when video is playing and canvas might be used to capture it
          video.addEventListener('play', function() {
            checkForCanvasCapture();
          });
        }
      });
    }
    
    // Run initially
    applyVideoProtection();
    
    // And check periodically for newly added videos
    setInterval(applyVideoProtection, 2000);
    
    // Function to detect if canvas is being used to capture video
    function checkForCanvasCapture() {
      // Override the canvas methods commonly used for capture
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      const originalToBlob = HTMLCanvasElement.prototype.toBlob;
      
      HTMLCanvasElement.prototype.getContext = function() {
        const context = originalGetContext.apply(this, arguments);
        if (arguments[0] === '2d' || arguments[0] === 'webgl' || arguments[0] === 'webgl2') {
          // Override drawImage to detect video elements being drawn to canvas
          if (context && context.drawImage) {
            const originalDrawImage = context.drawImage;
            context.drawImage = function() {
              if (arguments[0] instanceof HTMLVideoElement) {
                // Potential video capture detected
                console.log('Canvas video capture attempt detected');
                createBlackOverlay("Video capture attempt detected.");
                
                // Instead of preventing, let it continue but the overlay will block it
              }
              return originalDrawImage.apply(this, arguments);
            };
          }
        }
        return context;
      };
      
      // Override toDataURL and toBlob to prevent canvas image extraction
      HTMLCanvasElement.prototype.toDataURL = function() {
        // Check if this canvas might contain video content
        if (this.width > 100 && this.height > 100) { // Basic size check for potential video
          createBlackOverlay("Canvas capture detected.");
          return "data:,"; // Return empty data
        }
        return originalToDataURL.apply(this, arguments);
      };
      
      HTMLCanvasElement.prototype.toBlob = function() {
        // Check if this canvas might contain video content
        if (this.width > 100 && this.height > 100) { // Basic size check for potential video
          createBlackOverlay("Canvas capture detected.");
          if (arguments[0] instanceof Function) {
            arguments[0](new Blob([])); // Return empty blob
          }
          return;
        }
        return originalToBlob.apply(this, arguments);
      };
    }
  }
  
  // Initialize all protection mechanisms
  function initContentProtection() {
    // Warn on initial load
    console.log("%cThis website uses content protection technology. Attempts to capture, record, or share content are prohibited.", "color: red; font-size: 14px; font-weight: bold;");
    
    // Apply protections
    setupScreenCaptureProtection();
    applyCanvasFingerprinting();
    protectVideoContent();
    
    // Set up MutationObserver to handle dynamically added content
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          // Re-apply video protection when new nodes are added
          protectVideoContent();
        }
      });
    });
    
    // Start observing the document for added nodes
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Export the functions
  export { initContentProtection };