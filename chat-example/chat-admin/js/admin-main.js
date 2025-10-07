/**
 * Admin Main Application
 * Entry point for admin dashboard application
 */

// ============================================
// Admin Application State
// ============================================

class AdminApp {
    constructor() {
        this.isInitialized = false;
        this.chatAdmin = null;
        this.socketManager = null;
        this.config = {
            serverUrl: 'http://localhost:4001',
            reconnectAttempts: 5,
            reconnectDelay: 1000,
            messageRetryAttempts: 3,
            autoRefreshInterval: 30000
        };
        this.refreshTimer = null;
    }
    
    /**
     * Initialize admin application
     */
    async init() {
        try {
            console.log('Initializing admin application...');
            
            // Check if already initialized
            if (this.isInitialized) {
                console.warn('Admin application already initialized');
                return;
            }
            
            // Show loading
            Utils.Notification.showLoading('Đang khởi tạo admin dashboard...');
            
            // Initialize components
            await this.initializeComponents();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup auto refresh
            this.setupAutoRefresh();
            
            // Mark as initialized
            this.isInitialized = true;
            
            // Hide loading
            Utils.Notification.hideLoading();
            
            console.log('Admin application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize admin application:', error);
            Utils.Notification.hideLoading();
            Utils.Notification.showToast('Khởi tạo admin dashboard thất bại', 'error');
            throw error;
        }
    }
    
    /**
     * Initialize components
     */
    async initializeComponents() {
        // Initialize socket manager
        this.socketManager = SocketManager;
        
        // Initialize chat admin
        this.chatAdmin = new ChatAdmin();
        
        // Wait for chat admin to be ready
        await this.waitForChatAdmin();
    }
    
    /**
     * Wait for chat admin to be ready
     */
    async waitForChatAdmin() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Chat admin initialization timeout'));
            }, 10000);
            
            // Check if chat admin is ready
            const checkReady = () => {
                if (this.chatAdmin && this.socketManager) {
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
        console.error('Admin application error:', error);
        
        // Show user-friendly message
        Utils.Notification.showToast('Đã xảy ra lỗi không mong muốn', 'error');
        
        // Report error to analytics
        this.reportError(error);
    }
    
    /**
     * Handle socket errors
     */
    handleSocketError(error) {
        console.error('Socket error:', error);
        Utils.Notification.showToast('Lỗi kết nối với máy chủ', 'error');
    }
    
    /**
     * Handle connection errors
     */
    handleConnectionError(error) {
        console.error('Connection error:', error);
        Utils.Notification.showToast('Đang kết nối lại...', 'warning');
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Admin dashboard loaded in ${loadTime.toFixed(2)}ms`);
            
            // Report performance metrics
            this.reportPerformanceMetrics({
                loadTime: loadTime,
                domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
                firstContentfulPaint: this.getFirstContentfulPaint()
            });
        });
        
        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memoryInfo = {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
                
                console.log('Admin memory usage:', memoryInfo);
            }, 30000);
        }
    }
    
    /**
     * Setup auto refresh
     */
    setupAutoRefresh() {
        // Auto refresh disabled - using realtime socket events instead
        console.log('Auto refresh disabled - using realtime socket events');
        if (this.chatAdmin) {
            this.chatAdmin.stopAutoRefresh();
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
        console.log('Reporting admin error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            userType: 'admin'
        });
    }
    
    /**
     * Report performance metrics
     */
    reportPerformanceMetrics(metrics) {
        console.log('Reporting admin performance metrics:', metrics);
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            chatAdmin: !!this.chatAdmin,
            socketManager: !!this.socketManager,
            connectionStatus: this.socketManager?.getConnectionStatus(),
            timestamp: new Date().toISOString(),
            userType: 'admin'
        };
    }
    
    /**
     * Reinitialize application
     */
    async reinitialize() {
        console.log('Reinitializing admin application...');
        
        // Reset state
        this.isInitialized = false;
        
        // Clear refresh timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
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
        console.log('Cleaning up admin application...');
        
        // Clear refresh timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        // Disconnect socket
        if (this.socketManager) {
            this.socketManager.disconnect();
        }
        
        this.isInitialized = false;
    }
}

// ============================================
// Global Admin Application Instance
// ============================================

window.AdminApp = new AdminApp();

// ============================================
// Admin Application Lifecycle
// ============================================

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ensure AdminApp is properly initialized
        if (!window.AdminApp || typeof window.AdminApp.init !== 'function') {
            throw new Error('AdminApp is not properly initialized');
        }
        
        await window.AdminApp.init();
    } catch (error) {
        console.error('Failed to start admin application:', error);
        
        // Show error page
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                <h1 style="color: #ef4444; margin-bottom: 1rem;">Lỗi Khởi Tạo Admin Dashboard</h1>
                <p style="color: #64748b; margin-bottom: 2rem;">Không thể khởi tạo admin dashboard. Vui lòng thử lại sau.</p>
                <button onclick="window.location.reload()" style="background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
                    Tải Lại Trang
                </button>
            </div>
        `;
    }
});

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
    AdminApp.cleanup();
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Admin tab hidden - pausing some operations');
    } else {
        console.log('Admin tab visible - resuming operations');
        // Refresh data when tab becomes visible
        if (AdminApp.chatAdmin && AdminApp.isInitialized) {
            AdminApp.chatAdmin.refreshData();
        }
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Admin connection restored');
    Utils.Notification.showToast('Kết nối internet đã được khôi phục', 'success');
    
    // Attempt to reconnect
    if (AdminApp.socketManager) {
        AdminApp.socketManager.reconnect();
    }
});

window.addEventListener('offline', () => {
    console.log('Admin connection lost');
    Utils.Notification.showToast('Mất kết nối internet', 'warning');
});

// ============================================
// Admin Development Tools
// ============================================

// Add development tools to global scope
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AdminDevTools = {
        // Get application status
        getStatus: () => AdminApp.getStatus(),
        
        // Reinitialize application
        reinit: () => AdminApp.reinitialize(),
        
        // Test socket connection
        testSocket: () => {
            console.log('Testing admin socket connection...');
            if (AdminApp.socketManager) {
                return AdminApp.socketManager.ping();
            }
            return false;
        },
        
        // Clear localStorage
        clearStorage: () => {
            Utils.Storage.clear();
            console.log('Admin localStorage cleared');
        },
        
        // Simulate user message
        simulateUserMessage: (content = 'Test user message', userId = 'user-test') => {
            if (AdminApp.chatAdmin) {
                AdminApp.chatAdmin.handleMessageReceived({
                    id: 'test-' + Date.now(),
                    senderId: userId,
                    content: content,
                    timestamp: new Date().toISOString(),
                    status: 'sent'
                });
            }
        },
        
        // Add test user
        addTestUser: (name = 'Test User') => {
            if (AdminApp.chatAdmin) {
                const testUser = {
                    id: 'test-user-' + Date.now(),
                    name: name,
                    email: 'test@example.com',
                    avatar: 'https://via.placeholder.com/32',
                    lastMessage: 'Test message',
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 1,
                    isOnline: true,
                    status: 'pending'
                };
                
                AdminApp.chatAdmin.users.push(testUser);
                AdminApp.chatAdmin.updateStats();
                AdminApp.chatAdmin.renderUsers();
            }
        },
        
        // Show notification
        notify: (message, type = 'info') => {
            Utils.Notification.showToast(message, type);
        },
        
        // Get user stats
        getUserStats: () => {
            if (AdminApp.chatAdmin) {
                return {
                    totalUsers: AdminApp.chatAdmin.users.length,
                    onlineUsers: AdminApp.chatAdmin.onlineUsers,
                    pendingChats: AdminApp.chatAdmin.pendingChats,
                    activeChats: AdminApp.chatAdmin.activeChats
                };
            }
            return null;
        },
        
        // Force refresh
        forceRefresh: () => {
            if (AdminApp.chatAdmin) {
                AdminApp.chatAdmin.refreshData();
            }
        }
    };
    
    console.log('Admin development tools available at window.AdminDevTools');
}

// ============================================
// Admin Service Worker Registration
// ============================================

// Service Worker registration - only register if running on HTTPS or localhost
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/admin-sw.js')
            .then(registration => {
                console.log('Admin SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('Admin SW registration failed: ', registrationError);
            });
    });
} else {
    console.log('Service Worker not supported or not running on HTTPS/localhost');
}
