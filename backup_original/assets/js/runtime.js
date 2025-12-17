/**
 * MaxNote Runtime
 * Runtime initialization for the note editor application
 */

(function() {
  'use strict';

  // Runtime configuration
  window.MaxNoteRuntime = {
    version: '1.0.0',
    initialized: false,
    config: null,

    // Initialize the runtime
    init: function() {
      if (this.initialized) {
        return;
      }

      // Get configuration from HTML data attribute
      const htmlElement = document.documentElement;
      const configData = htmlElement.getAttribute('data-config');

      if (configData) {
        try {
          this.config = JSON.parse(configData);
          console.log('[MaxNote Runtime] Configuration loaded:', this.config);
        } catch (e) {
          console.error('[MaxNote Runtime] Failed to parse configuration:', e);
        }
      }

      // Set up React error boundary
      this.setupErrorHandling();

      // Initialize service worker if supported
      this.initServiceWorker();

      this.initialized = true;
      console.log('[MaxNote Runtime] Initialized successfully');
    },

    // Setup error handling
    setupErrorHandling: function() {
      window.addEventListener('error', function(event) {
        console.error('[MaxNote Runtime] Global error:', event.error);
      });

      window.addEventListener('unhandledrejection', function(event) {
        console.error('[MaxNote Runtime] Unhandled promise rejection:', event.reason);
      });
    },

    // Initialize service worker
    initServiceWorker: function() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./config/serviceworker.js')
          .then(function(registration) {
            console.log('[MaxNote Runtime] Service Worker registered:', registration);
          })
          .catch(function(error) {
            console.warn('[MaxNote Runtime] Service Worker registration failed:', error);
          });
      }
    },

    // Get user configuration
    getUserConfig: function() {
      return this.config?.user || null;
    },

    // Get release version
    getRelease: function() {
      return this.config?.release || 'unknown';
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.MaxNoteRuntime.init();
    });
  } else {
    window.MaxNoteRuntime.init();
  }

})();
