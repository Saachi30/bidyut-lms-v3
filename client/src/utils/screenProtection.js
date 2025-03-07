// // screenProtection.js - Create this file in your src directory

// /**
//  * Screen Protection Module
//  * Prevents screenshots, screen recording, and screen sharing
//  * Compatible with existing API calls and Spline models
//  */

// const ScreenProtection = {
//     init() {
//       this.setupScreenProtection();
//       this.setupEventListeners();
//     },
  
//     setupScreenProtection() {
//       // Create the overlay element that will be shown when protection is triggered
//       const overlay = document.createElement('div');
//       overlay.id = 'screen-protection-overlay';
//       overlay.style.cssText = `
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background-color: #000;
//         z-index: 999999;
//         display: none;
//         align-items: center;
//         justify-content: center;
//         color: #fff;
//         font-family: 'Roboto', sans-serif;
//         font-size: 24px;
//         text-align: center;
//         pointer-events: none;
//       `;
      
//       const message = document.createElement('div');
//       message.textContent = 'For security reasons, this content cannot be captured.';
//       overlay.appendChild(message);
      
//       document.body.appendChild(overlay);
      
//       // Store reference for later use
//       this.overlay = overlay;
//     },
  
//     setupEventListeners() {
//       // Detect and prevent screenshots via Print Screen
//       document.addEventListener('keyup', (e) => {
//         const keyCode = e.keyCode || e.which;
//         if (keyCode === 44) { // PrintScreen key
//           this.handleCaptureAttempt();
//         }
//       });
  
//       // Detect browser's capture API
//       document.addEventListener('visibilitychange', () => {
//         if (document.visibilityState === 'hidden') {
//           this.showOverlay();
//           // Reset state when user returns
//           setTimeout(() => {
//             if (document.visibilityState === 'visible') {
//               this.hideOverlay();
//             }
//           }, 300);
//         }
//       });
  
//       // Handle potential screen sharing detection
//       /* 
//       // Commented as requested
//       if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
//         const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
//         navigator.mediaDevices.getDisplayMedia = function(constraints) {
//           // Either reject or modify the screen sharing
//           return Promise.reject(new Error('Screen sharing is disabled for security reasons.'));
//         };
//       }
//       */
  
//       // Prevent context menu to stop easy capture methods
//       document.addEventListener('contextmenu', (e) => {
//         e.preventDefault();
//         return false;
//       });
  
//       // Add metadata to prevent web archive services from capturing
//       const meta = document.createElement('meta');
//       meta.name = 'robots';
//       meta.content = 'noarchive';
//       document.head.appendChild(meta);
  
//       // Make page content non-selectable and copy-protected
//       document.body.classList.add('unselectable');
//       document.body.style.cssText += `
//         -webkit-user-select: none;
//         -moz-user-select: none;
//         -ms-user-select: none;
//         user-select: none;
//       `;
  
//       // Monitor for DevTools opening (additional protection layer)
//       this.setupDevToolsMonitoring();
//     },
  
//     handleCaptureAttempt() {
//       this.showOverlay();
      
//       // Make the visible content blank for a moment
//       document.body.style.opacity = '0';
      
//       // Restore content after a short delay
//       setTimeout(() => {
//         document.body.style.opacity = '1';
//         this.hideOverlay();
//       }, 500);
//     },
  
//     showOverlay() {
//       this.overlay.style.display = 'flex';
//     },
  
//     hideOverlay() {
//       this.overlay.style.display = 'none';
//     },
  
//     setupDevToolsMonitoring() {
//       // Create a detection for DevTools (which might be used for screen capture)
//       let devToolsOpen = false;
      
//       // Method 1: Window size monitoring
//       const threshold = 160;
//       const widthThreshold = window.outerWidth - window.innerWidth > threshold;
//       const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
//       if (widthThreshold || heightThreshold) {
//         devToolsOpen = true;
//       }
      
//       // Method 2: Console monitoring
//       const devToolsDetector = () => {
//         const dateStart = new Date();
//         debugger;
//         const dateEnd = new Date();
//         return dateEnd - dateStart > 100;
//       };
      
//       // Only check periodically to avoid performance impact
//       setInterval(() => {
//         if (devToolsDetector()) {
//           if (!devToolsOpen) {
//             // DevTools just opened, take protective action
//             this.showOverlay();
//             devToolsOpen = true;
//           }
//         } else if (devToolsOpen) {
//           // DevTools just closed
//           this.hideOverlay();
//           devToolsOpen = false;
//         }
//       }, 1000);
//     }
//   };
  
//   export default ScreenProtection;




const ScreenProtection = {
    init() {
      // Create black overlay (only visible during screenshot attempts)
      this.createOverlay();
      
      // Set up detection mechanisms
      this.setupScreenshotDetection();
      
      console.log('Screen protection initialized');
    },
    
    createOverlay() {
      // Create black overlay element (hidden by default)
      const overlay = document.createElement('div');
      overlay.id = 'screenshot-protection';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        z-index: 2147483647; /* Highest possible z-index */
        display: none;
        pointer-events: none;
      `;
      
      document.body.appendChild(overlay);
      this.overlay = overlay;
    },
    
    setupScreenshotDetection() {
      // Method 1: PrintScreen key detection
      document.addEventListener('keydown', (e) => {
        if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.key === 44) {
          this.handleScreenshotAttempt();
        }
      });
      
      // Method 2: Clipboard API monitoring
      document.addEventListener('copy', () => {
        // Check if it might be a screenshot attempt
        if (window.getSelection().toString() === '') {
          this.handleScreenshotAttempt();
        }
      });
      
      // Method 3: Blur event (more reliable on some browsers/OS)
      let inFocus = true;
      
      window.addEventListener('blur', () => {
        if (document.hasFocus()) {
          return; // Still has focus somewhere in the document
        }
        inFocus = false;
        
        // Check if this might be a screenshot attempt (different from tab switching)
        const now = Date.now();
        if (!this.lastBlur || now - this.lastBlur > 500) {
          this.handleScreenshotAttempt();
        }
        this.lastBlur = now;
      });
      
      window.addEventListener('focus', () => {
        inFocus = true;
        setTimeout(() => {
          // Only hide overlay if we're sure focus was regained
          if (inFocus) {
            this.hideOverlay();
          }
        }, 100);
      });
      
      // Method 4: For MacOS screenshot functionality (Command+Shift+3/4)
      document.addEventListener('keydown', (e) => {
        // Check for command+shift+3 or command+shift+4 (Mac screenshot)
        if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === 51 || e.key === 52)) {
          this.handleScreenshotAttempt();
        }
      });
      
      // Method 5: Handle browser-specific screenshot APIs
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = function(constraints) {
          ScreenProtection.showOverlay();
          
          const promise = originalGetDisplayMedia.call(this, constraints);
          
          promise.then(() => {
            // Keep overlay visible during screen sharing
          }).catch(() => {
            ScreenProtection.hideOverlay();
          });
          
          return promise;
        };
      }
    },
    
    handleScreenshotAttempt() {
      this.showOverlay();
      
      // Keep the overlay visible briefly to ensure it's captured
      // But remove it quickly enough that users barely notice
      setTimeout(() => {
        this.hideOverlay();
      }, 500);
    },
    
    showOverlay() {
      this.overlay.style.display = 'block';
    },
    
    hideOverlay() {
      this.overlay.style.display = 'none';
    }
  };
  
  export default ScreenProtection;