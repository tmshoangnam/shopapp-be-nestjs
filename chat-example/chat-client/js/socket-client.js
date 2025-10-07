/**
 * Socket.IO Client Manager
 * Handles WebSocket connection and communication
 */

class SocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.messageQueue = [];
        this.isConnecting = false;
        this.lastConnectTime = 0;
        
        // Configuration
        this.config = {
            serverUrl: 'http://localhost:4001',
            authToken: '', // Will be set during connect
            isAdmin: false,
            reconnect: true,
            timeout: 10000,
            reconnectionAttempts: 3,
            reconnectionDelay: 2000
        };
    }
    
    /**
     * Check if server is available
     */
    async checkServerAvailability() {
        try {
            const response = await fetch(`${this.config.serverUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.log('Server not available:', error);
            return false;
        }
    }
    
    /**
     * Initialize socket connection
     */
    async connect(config = {}) {
        this.config = { ...this.config, ...config };
        
        // Prevent multiple simultaneous connections
        if (this.isConnecting) {
            console.log('Connection already in progress, skipping...');
            return;
        }
        
        // Debounce rapid reconnections
        const now = Date.now();
        if (now - this.lastConnectTime < 1000) {
            console.log('Too soon to reconnect, debouncing...');
            return;
        }
        
        this.isConnecting = true;
        this.lastConnectTime = now;
        
        try {
            // Show loading
            Utils.Notification.showLoading('Đang kết nối...');
            
            // Check server availability first
            const serverAvailable = await this.checkServerAvailability();
            if (!serverAvailable) {
                console.warn('Server not available, but attempting connection anyway...');
                Utils.Notification.showToast('Máy chủ không khả dụng, đang thử kết nối...', 'warning');
            }
            
            // Create socket connection
            this.socket = io(this.config.serverUrl, {
                auth: {
                    token: this.config.authToken
                },
                query: {
                    admin: this.config.isAdmin ? 'true' : 'false'
                },
                timeout: this.config.timeout,
                transports: ['websocket', 'polling'],
                reconnection: this.config.reconnect,
                reconnectionAttempts: this.config.reconnectionAttempts,
                reconnectionDelay: this.config.reconnectionDelay,
                autoConnect: true,
                forceNew: false
            });
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Wait for connection
            await this.waitForConnection();
            
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            
            // Process queued messages
            this.processMessageQueue();
            
            // Hide loading and show success
            Utils.Notification.hideLoading();
            Utils.Notification.showToast('Đã kết nối thành công', 'success');
            
        } catch (error) {
            console.error('Socket connection failed:', error);
            this.isConnecting = false;
            Utils.Notification.hideLoading();
            Utils.Notification.showToast('Kết nối thất bại', 'error');
            throw error;
        }
    }
    
    /**
     * Setup socket event listeners
     */
    setupEventListeners() {
        if (!this.socket) return;
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
            Utils.Notification.showToast('Đã kết nối thành công', 'success');
        });
        
        this.socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
            Utils.Notification.showToast('Đã kết nối lại thành công', 'success');
        });
        
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt', attemptNumber);
            Utils.Notification.showToast(`Đang thử kết nối lại... (${attemptNumber})`, 'warning');
        });
        
        this.socket.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
            Utils.Notification.showToast('Lỗi kết nối lại', 'error');
        });
        
        this.socket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            Utils.Notification.showToast('Không thể kết nối lại', 'error');
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', this.socket.id, reason);
            this.isConnected = false;
            this.emit('disconnected', reason);
            
            // Don't manually reconnect if it's a server disconnect
            // Let socket.io handle reconnection automatically
            if (reason === 'io server disconnect') {
                console.log('Server disconnected, waiting for automatic reconnection...');
                Utils.Notification.showToast('Mất kết nối với máy chủ', 'warning');
            } else if (reason === 'io client disconnect') {
                console.log('Client disconnected manually');
            } else if (reason === 'transport close' || reason === 'transport error') {
                console.log('Connection lost, socket.io will handle reconnection...');
                Utils.Notification.showToast('Mất kết nối, đang thử kết nối lại...', 'warning');
            } else {
                console.log('Connection lost, attempting reconnection...');
            }
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.isConnected = false;
            this.emit('connectionError', error);
            
            // Don't manually handle reconnection, let socket.io handle it
            console.log('Connection error occurred, socket.io will handle reconnection');
            Utils.Notification.showToast('Lỗi kết nối, đang thử kết nối lại...', 'error');
        });
        
        // Chat events
        this.socket.on('new-message', (message) => {
            console.log('New message received:', message);
            this.emit('messageReceived', message);
        });
        
        this.socket.on('message-sent', (data) => {
            console.log('Message sent confirmation:', data);
            this.emit('messageSent', data);
        });
        
        this.socket.on('user-connected', (userData) => {
            console.log('User connected:', userData);
            this.emit('userConnected', userData);
        });
        
        this.socket.on('user-disconnected', (userData) => {
            console.log('User disconnected:', userData);
            this.emit('userDisconnected', userData);
        });
        
        this.socket.on('user-reconnected', (userData) => {
            console.log('User reconnected:', userData);
            this.emit('userReconnected', userData);
        });
        
        this.socket.on('user-typing', (data) => {
            console.log('User typing:', data);
            this.emit('userTyping', data);
        });
        
        this.socket.on('admin-connected', (data) => {
            console.log('Admin connected:', data);
            this.emit('adminConnected', data);
        });
        
        this.socket.on('unread-count', (data) => {
            console.log('Unread count:', data);
            this.emit('unreadCount', data);
        });
        
        // Error events
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('error', error);
        });
    }
    
    /**
     * Wait for connection to be established
     */
    waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, this.config.timeout);
            
            if (this.socket.connected) {
                clearTimeout(timeout);
                resolve();
                return;
            }
            
            this.socket.on('connect', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            this.socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    
    /**
     * Handle reconnection
     */
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            Utils.Notification.showToast('Mất kết nối với máy chủ', 'error');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.socket.connect();
            }
        }, delay);
    }
    
    /**
     * Send message
     */
    sendMessage(messageData) {
        if (!this.isConnected) {
            // Queue message for later
            this.messageQueue.push({
                event: 'send-message',
                data: messageData
            });
            Utils.Notification.showToast('Đang kết nối lại...', 'warning');
            return false;
        }
        
        try {
            this.socket.emit('send-message', messageData);
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            this.emit('sendError', error);
            return false;
        }
    }
    
    /**
     * Join room
     */
    joinRoom(roomId) {
        if (!this.isConnected) {
            Utils.Notification.showToast('Chưa kết nối', 'warning');
            return false;
        }
        
        try {
            this.socket.emit('join-room', { roomId });
            return true;
        } catch (error) {
            console.error('Error joining room:', error);
            return false;
        }
    }
    
    /**
     * Leave room
     */
    leaveRoom(roomId) {
        if (!this.isConnected) return false;
        
        try {
            this.socket.emit('leave-room', { roomId });
            return true;
        } catch (error) {
            console.error('Error leaving room:', error);
            return false;
        }
    }
    
    /**
     * Mark messages as read
     */
    markAsRead(messageIds) {
        if (!this.isConnected) return false;
        
        try {
            this.socket.emit('mark-as-read', { messageIds });
            return true;
        } catch (error) {
            console.error('Error marking as read:', error);
            return false;
        }
    }
    
    /**
     * Send typing indicator
     */
    sendTyping(data) {
        if (!this.isConnected) return false;
        
        try {
            this.socket.emit('typing', data);
            return true;
        } catch (error) {
            console.error('Error sending typing:', error);
            return false;
        }
    }
    
    /**
     * Process queued messages
     */
    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const queuedMessage = this.messageQueue.shift();
            this.socket.emit(queuedMessage.event, queuedMessage.data);
        }
    }
    
    /**
     * Event emitter functionality
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.eventHandlers.get(event);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }
    
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Update auth token
     */
    updateAuthToken(token) {
        this.config.authToken = token;
        
        if (this.socket) {
            this.socket.auth = { token };
        }
    }
    
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length
        };
    }
    
    /**
     * Disconnect socket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.eventHandlers.clear();
        this.messageQueue = [];
    }
    
    /**
     * Reconnect socket
     */
    async reconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        
        await this.connect(this.config);
    }
    
    /**
     * Send ping to check connection
     */
    ping() {
        if (this.isConnected) {
            this.socket.emit('ping');
            return true;
        }
        return false;
    }
    
    /**
     * Force reconnect (for testing)
     */
    forceReconnect() {
        console.log('Forcing reconnect...');
        if (this.socket) {
            this.socket.disconnect();
            // Use setTimeout to ensure disconnect is processed first
            setTimeout(() => {
                this.connect(this.config);
            }, 100);
        }
    }
    
    /**
     * Get connection info
     */
    getConnectionInfo() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length,
            socketConnected: this.socket?.connected || false
        };
    }
}

// Create global instance
window.SocketManager = new SocketClient();
