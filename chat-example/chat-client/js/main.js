/**
 * Main Client Application
 * Entry point for client-side chat application
 */

// ============================================
// Application State
// ============================================

class ClientApp {
    constructor() {
        this.isInitialized = false;
        this.chatClient = null;
        this.socketManager = null;
        this.config = {
            serverUrl: 'http://localhost:4001',
            reconnectAttempts: 5,
            reconnectDelay: 1000,
            messageRetryAttempts: 3
        };
    }
    
    /**
     * Initialize application
     */
    async init() {
        try {
            console.log('Initializing client application...');
            
            // Check if already initialized
            if (this.isInitialized) {
                console.warn('Application already initialized');
                return;
            }
            
            // Show loading
            Utils.Notification.showLoading('Đang khởi tạo ứng dụng...');
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Hide loading
            Utils.Notification.hideLoading();
            
            console.log('Client application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.Notification.hideLoading();
            Utils.Notification.showToast('Khởi tạo ứng dụng thất bại', 'error');
            throw error;
        }
    }
    
    /**
     * Initialize components
     */
    async initializeComponents() {
        // Initialize socket manager
        this.socketManager = SocketManager;
        
        // Initialize chat client
        this.chatClient = new ChatClient();
        
        // Wait for chat client to be ready
        await this.waitForChatClient();
    }
    
    /**
     * Wait for chat client to be ready
     */
    async waitForChatClient() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Chat client initialization timeout'));
            }, 10000);
            
            // Check if chat client is ready
            const checkReady = () => {
                if (this.chatClient && this.socketManager) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            
            checkReady();
        });
    }
    
    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Uncaught error:', event.error);
            this.handleError(event.error);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
        
        // Handle socket errors
        SocketManager.on('error', (error) => {
            console.error('Socket error:', error);
            this.handleSocketError(error);
        });
        
        SocketManager.on('connectionError', (error) => {
            console.error('Connection error:', error);
            this.handleConnectionError(error);
        });
    }
    
    /**
     * Handle application errors
     */
    handleError(error) {
        // Log error
        console.error('Application error:', error);
        
        // Show user-friendly message
        Utils.Notification.showToast('Đã xảy ra lỗi không mong muốn', 'error');
        
        // Report error to analytics (if available)
        this.reportError(error);
    }
    
    /**
     * Handle socket errors
     */
    handleSocketError(error) {
        console.error('Socket error:', error);
        
        // Show connection error message
        Utils.Notification.showToast('Lỗi kết nối với máy chủ', 'error');
    }
    
    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        console.error('Connection error:', error);
        
        // Show reconnection message
        Utils.Notification.showToast('Đang kết nối lại...', 'warning');
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Report performance metrics
            this.reportPerformanceMetrics({
                loadTime: loadTime,
                domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
                firstContentfulPaint: this.getFirstContentfulPaint()
            });
        });
        
        // Monitor memory usage (if available)
        if (performance.memory) {
            setInterval(() => {
                const memoryInfo = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
                
                // Log memory usage every 30 seconds
                console.log('Memory usage:', memoryInfo);
            }, 30000);
        }
    }
    
    /**
     * Get first contentful paint time
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : 0;
    }
    
    /**
     * Report error to analytics
     */
    reportError(error) {
        // TODO: Implement error reporting to your analytics service
        console.log('Reporting error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });
    }
    
    /**
     * Report performance metrics
     */
    reportPerformanceMetrics(metrics) {
        // TODO: Implement performance reporting to your analytics service
        console.log('Reporting performance metrics:', metrics);
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            chatClient: !!this.chatClient,
            socketManager: !!this.socketManager,
            connectionStatus: this.socketManager?.getConnectionStatus(),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Reinitialize application
     */
    async reinitialize() {
        console.log('Reinitializing application...');
        
        // Reset state
        this.isInitialized = false;
        
        // Disconnect socket
        if (this.socketManager) {
            this.socketManager.disconnect();
        }
        
        // Reinitialize
        await this.init();
    }
    
    /**
     * Cleanup application
     */
    cleanup() {
        console.log('Cleaning up application...');
        
        // Disconnect socket
        if (this.socketManager) {
            this.socketManager.disconnect();
        }
        
        // Clear timers and intervals
        // (Add any cleanup logic here)
        
        this.isInitialized = false;
    }
}

// ============================================
// Global Application Instance
// ============================================

window.ClientApp = new ClientApp();

// ============================================
// Application Lifecycle
// ============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ensure ClientApp is properly initialized
        if (!window.ClientApp || typeof window.ClientApp.init !== 'function') {
            throw new Error('ClientApp is not properly initialized');
        }
        
        await window.ClientApp.init();
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Show error page or fallback UI
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                <h1 style="color: #ef4444; margin-bottom: 1rem;">Lỗi Khởi Tạo Ứng Dụng</h1>
                <p style="color: #64748b; margin-bottom: 2rem;">Không thể khởi tạo ứng dụng chat. Vui lòng thử lại sau.</p>
                <button onclick="window.location.reload()" style="background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                    Tải Lại Trang
                </button>
            </div>
        `;
    }
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    ClientApp.cleanup();
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Tab hidden - pausing some operations');
        // Pause non-essential operations
    } else {
        console.log('Tab visible - resuming operations');
        // Resume operations
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
    Utils.Notification.showToast('Kết nối internet đã được khôi phục', 'success');
    
    // Attempt to reconnect
    if (ClientApp.socketManager) {
        ClientApp.socketManager.reconnect();
    }
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    Utils.Notification.showToast('Mất kết nối internet', 'warning');
});

// ============================================
// Development Tools
// ============================================

// Add development tools to global scope
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DevTools = {
        // Get application status
        getStatus: () => ClientApp.getStatus(),
        
        // Reinitialize application
        reinit: () => ClientApp.reinitialize(),
        
        // Test socket connection
        testSocket: () => {
            console.log('Testing socket connection...');
            if (ClientApp.socketManager) {
                return ClientApp.socketManager.ping();
            }
            return false;
        },
        
        // Test reconnect
        testReconnect: () => {
            console.log('Testing reconnect...');
            if (ClientApp.socketManager) {
                ClientApp.socketManager.forceReconnect();
                return true;
            }
            return false;
        },
        
        // Get connection info
        getConnectionInfo: () => {
            if (ClientApp.socketManager) {
                return ClientApp.socketManager.getConnectionInfo();
            }
            return null;
        },
        
        // Clear localStorage
        clearStorage: () => {
            Utils.Storage.clear();
            console.log('LocalStorage cleared');
        },
        
        // Simulate message
        simulateMessage: (content = 'Test message') => {
            if (ClientApp.chatClient) {
                ClientApp.chatClient.handleMessageReceived({
                    id: 'test-' + Date.now(),
                    senderId: 'admin-1',
                    content: content,
                    timestamp: new Date().toISOString(),
                    status: 'sent'
                });
            }
        },
        
        // Show notification
        notify: (message, type = 'info') => {
            Utils.Notification.showToast(message, type);
        }
    };
    
    console.log('Development tools available at window.DevTools');
}

// ============================================
// Service Worker Registration (Optional)
// ============================================

// Service Worker registration - only register if running on HTTPS or localhost
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} else {
    console.log('Service Worker not supported or not running on HTTPS/localhost');
}
