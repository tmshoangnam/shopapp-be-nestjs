/**
 * Chat Admin - Admin dashboard functionality
 */

class ChatAdmin {
    constructor() {
        this.currentUserId = null;
        this.currentPartnerId = null;
        this.users = [];
        this.messages = new Map();
        this.onlineUsers = 0;
        this.pendingChats = 0;
        this.activeChats = 0;
        this.isTyping = false;
        this.typingTimer = null;
        
        // DOM elements
        this.elements = {
            // Navigation
            onlineUsers: null,
            pendingChats: null,
            activeChats: null,
            adminName: null,
            adminAvatar: null,
            
            // Sidebar
            usersList: null,
            searchInput: null,
            filterTabs: null,
            
            // Chat area
            welcomeScreen: null,
            chatWindow: null,
            messagesList: null,
            messagesContainer: null,
            typingIndicator: null,
            
            // Input
            messageInput: null,
            sendBtn: null,
            templateBtn: null,
            
            // Partner info
            partnerName: null,
            partnerAvatar: null,
            partnerStatus: null,
            
            // Quick actions
            quickReplies: null,
            
            // Modals
            templatesModal: null,
            userInfoModal: null
        };
        
        this.init();
    }
    
    /**
     * Initialize admin dashboard
     */
    async init() {
        try {
            this.initElements();
            this.setupEventListeners();
            this.loadAdminData();
            await this.connectToServer();
            this.setupKeyboardShortcuts();
            
            console.log('Chat admin initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chat admin:', error);
            Utils.Notification.showToast('Khởi tạo admin thất bại', 'error');
        }
    }
    
    /**
     * Initialize DOM elements
     */
    initElements() {
        this.elements = {
            // Navigation
            onlineUsers: document.getElementById('onlineUsers'),
            pendingChats: document.getElementById('pendingChats'),
            activeChats: document.getElementById('activeChats'),
            adminName: document.getElementById('adminName'),
            adminAvatar: document.getElementById('adminAvatar'),
            
            // Sidebar
            usersList: document.getElementById('usersList'),
            searchInput: document.getElementById('searchInput'),
            filterTabs: document.querySelectorAll('.filter-tab'),
            
            // Chat area
            welcomeScreen: document.getElementById('welcomeScreen'),
            chatWindow: document.getElementById('chatWindow'),
            messagesList: document.getElementById('messagesList'),
            messagesContainer: document.querySelector('.messages-container'),
            typingIndicator: document.getElementById('typingIndicator'),
            
            // Input
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            templateBtn: document.getElementById('templateBtn'),
            
            // Partner info
            partnerName: document.getElementById('partnerName'),
            partnerAvatar: document.getElementById('partnerAvatar'),
            partnerStatus: document.getElementById('partnerStatus'),
            
            // Quick actions
            quickReplies: document.getElementById('quickReplies'),
            
            // Modals
            templatesModal: document.getElementById('templatesModal'),
            userInfoModal: document.getElementById('userInfoModal')
        };
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Message input events
        this.elements.messageInput?.addEventListener('input', this.handleMessageInput.bind(this));
        this.elements.messageInput?.addEventListener('keydown', this.handleMessageKeydown.bind(this));
        this.elements.sendBtn?.addEventListener('click', this.handleSendMessage.bind(this));
        
        // Template events
        this.elements.templateBtn?.addEventListener('click', this.showTemplates.bind(this));
        
        // Search events
        this.elements.searchInput?.addEventListener('input', this.handleSearch.bind(this));
        
        // Filter tabs
        this.elements.filterTabs.forEach(tab => {
            tab.addEventListener('click', this.handleFilterTab.bind(this));
        });
        
        // Quick replies
        this.elements.quickReplies?.addEventListener('click', this.handleQuickReply.bind(this));
        
        // Socket events
        SocketManager.on('messageReceived', this.handleMessageReceived.bind(this));
        SocketManager.on('messageSent', this.handleMessageSent.bind(this));
        SocketManager.on('userConnected', this.handleUserConnected.bind(this));
        SocketManager.on('userDisconnected', this.handleUserDisconnected.bind(this));
        SocketManager.on('userTyping', this.handleUserTyping.bind(this));
        SocketManager.on('user-online', this.handleUserOnline.bind(this));
        SocketManager.on('user-offline', this.handleUserOffline.bind(this));
        SocketManager.on('connected', this.handleConnected.bind(this));
        SocketManager.on('disconnected', this.handleDisconnected.bind(this));
        
        // Modal events
        document.getElementById('closeTemplatesModal')?.addEventListener('click', this.closeTemplatesModal.bind(this));
        document.getElementById('closeUserInfoModal')?.addEventListener('click', this.closeUserInfoModal.bind(this));
        
        // Action buttons
        document.getElementById('userHistoryBtn')?.addEventListener('click', this.showUserHistory.bind(this));
        document.getElementById('transferBtn')?.addEventListener('click', this.transferChat.bind(this));
        document.getElementById('blockBtn')?.addEventListener('click', this.blockUser.bind(this));
        document.getElementById('resolveBtn')?.addEventListener('click', this.resolveChat.bind(this));
        
        // Quick action buttons
        document.getElementById('broadcastBtn')?.addEventListener('click', this.showBroadcast.bind(this));
        document.getElementById('exportChatsBtn')?.addEventListener('click', this.exportChats.bind(this));
        document.getElementById('refreshBtn')?.addEventListener('click', this.refreshData.bind(this));
    }
    
    /**
     * Load admin data
     */
    loadAdminData() {
        const adminData = Utils.Storage.getItem('adminData', {
            id: 'a48bd9f5-655b-4dd5-b627-4b435eed66f3',
            name: 'Admin User',
            email: 'admin@example.com',
            avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmNTkzNzUiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
        });
        
        this.currentUserId = adminData.id;
        
        // Update UI
        if (this.elements.adminName) {
            this.elements.adminName.textContent = adminData.name;
        }
        if (this.elements.adminAvatar) {
            this.elements.adminAvatar.src = adminData.avatar;
        }
        
        // Load users
        this.loadUsers();
    }
    
    /**
     * Connect to server
     */
    async connectToServer() {
        try {
            await SocketManager.connect({
                serverUrl: 'http://localhost:4001',
                authToken: this.getAuthToken(),
                isAdmin: false
            });
        } catch (error) {
            console.error('Failed to connect to server:', error);
            throw error;
        }
    }
    
    /**
     * Get auth token
     */
    getAuthToken() {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDhiZDlmNS02NTViLTRkZDUtYjYyNy00YjQzNWVlZDY2ZjMiLCJlbWFpbCI6ImFkbWluQHNob3BhcHAuY29tIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiZmlyc3ROYW1lIjoiU3VwZXIiLCJsYXN0TmFtZSI6IkFkbWluIiwiaWF0IjoxNzU5ODA5MDk3LCJleHAiOjE3NjA0MTM4OTd9.E3zXXJxivq11jer4RmdKmXDnr400Ga09m8WiwD3t-JU';
    }
    
    /**
     * Load users from API or localStorage
     */
    async loadUsers() {
        try {
            // Try to load from API first
            const response = await fetch('http://localhost:4001/api/v1/chat/admin/online-users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.users = data.onlineUsers.map(user => ({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`.trim(),
                    email: user.email,
                    avatar: user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    lastMessage: 'Đang chờ hỗ trợ...',
                    lastMessageTime: user.lastSeen || new Date().toISOString(),
                    unreadCount: 0,
                    isOnline: user.isOnline || true,
                    status: 'pending'
                }));
            } else {
                throw new Error('Failed to load users from API');
            }
        } catch (error) {
            console.error('Error loading users from API:', error);
            // Fallback to mock data
            const mockUsers = [
                {
                    id: 'user-1',
                    name: 'Nguyễn Văn A',
                    email: 'user1@example.com',
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    lastMessage: 'Tôi cần hỗ trợ về đơn hàng',
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 2,
                    isOnline: true,
                    status: 'pending'
                },
                {
                    id: 'user-2',
                    name: 'Trần Thị B',
                    email: 'user2@example.com',
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    lastMessage: 'Cảm ơn bạn đã hỗ trợ',
                    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                    unreadCount: 0,
                    isOnline: false,
                    status: 'resolved'
                },
                {
                    id: 'user-3',
                    name: 'Lê Văn C',
                    email: 'user3@example.com',
                    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                    lastMessage: 'Tôi có câu hỏi về sản phẩm',
                    lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
                    unreadCount: 1,
                    isOnline: true,
                    status: 'active'
                }
            ];
            
            this.users = mockUsers;
        }
        
        this.updateStats();
        this.renderUsers();
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        this.onlineUsers = this.users.filter(user => user.isOnline).length;
        this.pendingChats = this.users.filter(user => user.status === 'pending').length;
        this.activeChats = this.users.filter(user => user.status === 'active').length;
        
        // Update UI
        if (this.elements.onlineUsers) {
            this.elements.onlineUsers.textContent = this.onlineUsers;
        }
        if (this.elements.pendingChats) {
            this.elements.pendingChats.textContent = this.pendingChats;
        }
        if (this.elements.activeChats) {
            this.elements.activeChats.textContent = this.activeChats;
        }
    }
    
    /**
     * Render users list
     */
    renderUsers(filter = 'all') {
        if (!this.elements.usersList) return;
        
        this.elements.usersList.innerHTML = '';
        
        let filteredUsers = this.users;
        
        // Apply filter
        switch (filter) {
            case 'online':
                filteredUsers = this.users.filter(user => user.isOnline);
                break;
            case 'pending':
                filteredUsers = this.users.filter(user => user.status === 'pending');
                break;
            case 'resolved':
                filteredUsers = this.users.filter(user => user.status === 'resolved');
                break;
        }
        
        filteredUsers.forEach(user => {
            const userElement = this.createUserElement(user);
            this.elements.usersList.appendChild(userElement);
        });
    }
    
    /**
     * Create user element
     */
    createUserElement(user) {
        const element = Utils.DOM.createElement('div', `user-item ${user.status}`, {
            'data-user-id': user.id
        });
        
        element.innerHTML = `
            <div class="user-avatar">
                <img src="${user.avatar}" alt="${user.name}">
                <div class="status-indicator ${user.isOnline ? 'online' : 'offline'}"></div>
            </div>
            <div class="user-details">
                <div class="user-name">${user.name}</div>
                <div class="user-last-message">${Utils.String.truncate(user.lastMessage, 25)}</div>
                <div class="user-meta">
                    <span class="user-time">${Utils.Time.getRelativeTime(user.lastMessageTime)}</span>
                    ${user.unreadCount > 0 ? `<span class="user-badge">${user.unreadCount}</span>` : ''}
                </div>
            </div>
        `;
        
        // Add click handler
        element.addEventListener('click', () => {
            this.selectUser(user);
        });
        
        return element;
    }
    
    /**
     * Select user
     */
    selectUser(user) {
        console.log('Selecting user:', user);
        this.currentPartnerId = user.id;
        localStorage.setItem('admin-currentPartnerId', user.id);
        
        // Update UI
        this.showChatWindow();
        this.updatePartnerInfo(user);
        this.loadMessages(user.id);
        
        // Update active state
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-user-id="${user.id}"]`);
        selectedItem?.classList.add('active');
        
        // Clear unread count
        user.unreadCount = 0;
        this.renderUsers();
        this.updateStats();
    }
    
    /**
     * Show chat window
     */
    showChatWindow() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.style.display = 'none';
        }
        if (this.elements.chatWindow) {
            this.elements.chatWindow.style.display = 'flex';
        }
    }
    
    /**
     * Update partner info
     */
    updatePartnerInfo(user) {
        if (this.elements.partnerName) {
            this.elements.partnerName.textContent = user.name;
        }
        if (this.elements.partnerAvatar) {
            this.elements.partnerAvatar.src = user.avatar;
        }
        if (this.elements.partnerStatus) {
            this.elements.partnerStatus.innerHTML = `
                <i class="fas fa-circle"></i>
                ${user.isOnline ? 'Đang hoạt động' : 'Offline'}
            `;
        }
    }
    
    /**
     * Load messages for user
     */
    loadMessages(userId) {
        // Mock data - replace with actual API call
        const mockMessages = [
            {
                id: 'msg-1',
                senderId: userId,
                content: 'Xin chào! Tôi cần hỗ trợ về đơn hàng #12345',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                status: 'read'
            },
            {
                id: 'msg-2',
                senderId: this.currentUserId,
                content: 'Chào bạn! Tôi sẽ kiểm tra đơn hàng của bạn ngay.',
                timestamp: new Date(Date.now() - 240010).toISOString(),
                status: 'read'
            },
            {
                id: 'msg-3',
                senderId: userId,
                content: 'Cảm ơn bạn rất nhiều!',
                timestamp: new Date(Date.now() - 180000).toISOString(),
                status: 'read'
            }
        ];
        
        this.messages.set(userId, mockMessages);
        this.renderMessages(mockMessages);
    }
    
    /**
     * Render messages
     */
    renderMessages(messages) {
        if (!this.elements.messagesList) return;
        
        this.elements.messagesList.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.elements.messagesList.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }
    
    /**
     * Create message element
     */
    createMessageElement(message) {
        const isOwnMessage = message.senderId === this.currentUserId;
        const element = Utils.DOM.createElement('div', `message ${isOwnMessage ? 'sent' : 'received'}`, {
            'data-message-id': message.id
        });
        
        element.innerHTML = `
            <div class="message-content">
                <div class="message-text">${Utils.String.escapeHtml(message.content)}</div>
                <div class="message-time">
                    ${Utils.Time.formatTimeOnly(message.timestamp)}
                    ${isOwnMessage ? this.createStatusIcon(message.status) : ''}
                </div>
            </div>
        `;
        
        return element;
    }
    
    /**
     * Create status icon
     */
    createStatusIcon(status) {
        const icons = {
            sent: '<i class="fas fa-check"></i>',
            delivered: '<i class="fas fa-check-double"></i>',
            read: '<i class="fas fa-check-double" style="color: var(--primary-color)"></i>'
        };
        
        return icons[status] || icons.sent;
    }
    
    /**
     * Handle message input
     */
    handleMessageInput(event) {
        const input = event.target;
        
        // Auto resize textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        
        // Handle typing indicator
        if (input.value.trim()) {
            this.sendTypingIndicator(true);
        } else {
            this.sendTypingIndicator(false);
        }
    }
    
    /**
     * Handle message keydown
     */
    handleMessageKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSendMessage();
        }
    }
    
    /**
     * Handle send message
     */
    handleSendMessage() {
        const input = this.elements.messageInput;
        if (!input || !input.value.trim()) return;
        
        const content = input.value.trim();
        input.value = '';
        input.style.height = 'auto';
        
        // Stop typing indicator
        this.sendTypingIndicator(false);
        
        // Create temporary message for immediate display
        const tempMessage = {
            id: 'temp-' + Date.now(),
            senderId: this.currentUserId,
            content: content,
            timestamp: new Date().toISOString(),
            status: 'sending'
        };
        console.log('Current tempMessage:', tempMessage);
        
        // Add message immediately to UI
        this.addMessage(tempMessage);
        
        // Send message
        const success = SocketManager.sendMessage({
            receiverId: this.currentPartnerId || localStorage.getItem('admin-currentPartnerId'),
            content: content,
            messageType: 'TEXT'
        });
        
        if (!success) {
            Utils.Notification.showToast('Không thể gửi tin nhắn', 'error');
            // Remove temporary message if send failed
            this.removeMessage(tempMessage.id);
        }
    }
    
    /**
     * Send typing indicator
     */
    sendTypingIndicator(isTyping) {
        if (this.isTyping === isTyping) return;
        
        this.isTyping = isTyping;
        
        if (isTyping) {
            SocketManager.sendTyping({
                receiverId: this.currentPartnerId,
                isTyping: true
            });
            
            // Auto stop after 3 seconds
            this.typingTimer = setTimeout(() => {
                this.sendTypingIndicator(false);
            }, 3000);
        } else {
            if (this.typingTimer) {
                clearTimeout(this.typingTimer);
                this.typingTimer = null;
            }
            
            SocketManager.sendTyping({
                receiverId: this.currentPartnerId,
                isTyping: false
            });
        }
    }
    
    /**
     * Handle message received
     */
    handleMessageReceived(message) {
        console.log('Admin received message:', message);
        
        // Add message to current conversation if it's from current partner
        if (this.currentPartnerId === message.senderId) {
            this.addMessage(message);
        }
        
        // Update user list
        this.updateUserLastMessage(message);
    }
    
    /**
     * Handle message sent confirmation
     */
    handleMessageSent(data) {
        console.log('Admin message sent confirmation:', data);
        if (data.success && data.message) {
            this.addMessage(data.message);
        } else {
            console.error('Message send failed:', data);
        }
    }
    
    /**
     * Add message to current conversation
     */
    addMessage(message) {
        console.log('Adding message to admin chat:', message, 'currentPartnerId:', this.currentPartnerId);
        
        if (!this.currentPartnerId) {
            console.warn('No current partner selected, cannot add message');
            return;
        }
        
        const messages = this.messages.get(this.currentPartnerId || localStorage.getItem('admin-currentPartnerId')) || [];
        messages.push(message);
        this.messages.set(this.currentPartnerId, messages);
        
        const messageElement = this.createMessageElement(message);
        this.elements.messagesList.appendChild(messageElement);
        
        this.scrollToBottom();
    }
    
    /**
     * Remove message from current conversation
     */
    removeMessage(messageId) {
        if (!this.currentPartnerId || !localStorage.getItem('admin-currentPartnerId')) return;
        
        const messages = this.messages.get(this.currentPartnerId || localStorage.getItem('admin-currentPartnerId')) || [];
        const filteredMessages = messages.filter(msg => msg.id !== messageId);
        this.messages.set(this.currentPartnerId, filteredMessages);
        
        // Remove from UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
    }
    
    /**
     * Handle user connected
     */
    handleUserConnected(userData) {
        // Update user status
        const user = this.users.find(u => u.id === userData.userId);
        if (user) {
            user.isOnline = true;
            this.updateStats();
            this.renderUsers();
        }
    }
    
    /**
     * Handle user online
     */
    handleUserOnline(data) {
        console.log('User online:', data);
        const user = this.users.find(u => u.id === data.userId);
        if (user) {
            user.isOnline = true;
            user.lastSeen = data.timestamp;
        } else if (data.userInfo) {
            // Add new user to list
            const newUser = {
                id: data.userId,
                name: `${data.userInfo.firstName} ${data.userInfo.lastName}`.trim(),
                email: data.userInfo.email,
                avatar: data.userInfo.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                lastMessage: 'Đang chờ hỗ trợ...',
                lastMessageTime: data.timestamp,
                unreadCount: 0,
                isOnline: true,
                status: 'pending'
            };
            this.users.unshift(newUser);
        }
        this.updateStats();
        this.renderUsers();
    }
    
    /**
     * Handle user offline
     */
    handleUserOffline(data) {
        console.log('User offline:', data);
        const user = this.users.find(u => u.id === data.userId);
        if (user) {
            user.isOnline = false;
            user.lastSeen = data.timestamp;
            this.updateStats();
            this.renderUsers();
        }
    }
    
    /**
     * Handle user disconnected
     */
    handleUserDisconnected(userData) {
        // Update user status
        const user = this.users.find(u => u.id === userData.userId);
        if (user) {
            user.isOnline = false;
            this.updateStats();
            this.renderUsers();
        }
    }
    
    /**
     * Handle user typing
     */
    handleUserTyping(data) {
        if (data.userId === this.currentPartnerId) {
            if (data.isTyping) {
                this.elements.typingIndicator.style.display = 'flex';
            } else {
                this.elements.typingIndicator.style.display = 'none';
            }
        }
    }
    
    /**
     * Handle connected
     */
    handleConnected() {
        console.log('Admin connected to server');
    }
    
    /**
     * Handle disconnected
     */
    handleDisconnected() {
        console.log('Admin disconnected from server');
    }
    
    /**
     * Handle search
     */
    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        
        // Filter users
        this.users.forEach(user => {
            const element = document.querySelector(`[data-user-id="${user.id}"]`);
            if (element) {
                const matches = user.name.toLowerCase().includes(query) ||
                              user.lastMessage.toLowerCase().includes(query);
                element.style.display = matches ? 'flex' : 'none';
            }
        });
    }
    
    /**
     * Handle filter tab
     */
    handleFilterTab(event) {
        const tab = event.target;
        const filter = tab.dataset.filter;
        
        // Update active tab
        this.elements.filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Render filtered users
        this.renderUsers(filter);
    }
    
    /**
     * Handle quick reply
     */
    handleQuickReply(event) {
        const button = event.target;
        if (!button.classList.contains('quick-reply')) return;
        
        const template = button.dataset.template;
        const templates = {
            greeting: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
            help: 'Tôi sẽ hỗ trợ bạn ngay. Vui lòng cho tôi biết chi tiết vấn đề.',
            wait: 'Vui lòng chờ một chút, tôi đang kiểm tra thông tin cho bạn.',
            thanks: 'Cảm ơn bạn đã liên hệ! Chúc bạn một ngày tốt lành!'
        };
        
        const content = templates[template];
        if (content && this.elements.messageInput) {
            this.elements.messageInput.value = content;
            this.elements.messageInput.focus();
        }
    }
    
    /**
     * Show templates modal
     */
    showTemplates() {
        this.elements.templatesModal?.classList.add('show');
        this.loadTemplates();
    }
    
    /**
     * Close templates modal
     */
    closeTemplatesModal() {
        this.elements.templatesModal?.classList.remove('show');
    }
    
    /**
     * Load message templates
     */
    loadTemplates() {
        const templatesList = document.getElementById('templatesList');
        if (!templatesList) return;
        
        const templates = [
            { title: 'Chào hỏi', content: 'Chào bạn! Tôi có thể giúp gì cho bạn?' },
            { title: 'Hỗ trợ', content: 'Tôi sẽ hỗ trợ bạn ngay. Vui lòng cho tôi biết chi tiết vấn đề.' },
            { title: 'Chờ đợi', content: 'Vui lòng chờ một chút, tôi đang kiểm tra thông tin cho bạn.' },
            { title: 'Cảm ơn', content: 'Cảm ơn bạn đã liên hệ! Chúc bạn một ngày tốt lành!' }
        ];
        
        templatesList.innerHTML = '';
        
        templates.forEach(template => {
            const element = Utils.DOM.createElement('div', 'template-item');
            element.innerHTML = `
                <div class="template-title">${template.title}</div>
                <div class="template-content">${template.content}</div>
            `;
            
            element.addEventListener('click', () => {
                if (this.elements.messageInput) {
                    this.elements.messageInput.value = template.content;
                    this.elements.messageInput.focus();
                }
                this.closeTemplatesModal();
            });
            
            templatesList.appendChild(element);
        });
    }
    
    /**
     * Show user history
     */
    showUserHistory() {
        // TODO: Implement user history
        Utils.Notification.showToast('Tính năng lịch sử đang phát triển', 'info');
    }
    
    /**
     * Transfer chat
     */
    transferChat() {
        // TODO: Implement chat transfer
        Utils.Notification.showToast('Tính năng chuyển tiếp đang phát triển', 'info');
    }
    
    /**
     * Block user
     */
    blockUser() {
        if (this.currentPartnerId) {
            if (confirm('Bạn có chắc chắn muốn chặn người dùng này?')) {
                // TODO: Implement user blocking
                Utils.Notification.showToast('Đã chặn người dùng', 'success');
            }
        }
    }
    
    /**
     * Resolve chat
     */
    resolveChat() {
        if (this.currentPartnerId) {
            const user = this.users.find(u => u.id === this.currentPartnerId);
            if (user) {
                user.status = 'resolved';
                this.updateStats();
                this.renderUsers();
                Utils.Notification.showToast('Cuộc trò chuyện đã được giải quyết', 'success');
            }
        }
    }
    
    /**
     * Show broadcast
     */
    showBroadcast() {
        // TODO: Implement broadcast
        Utils.Notification.showToast('Tính năng thông báo chung đang phát triển', 'info');
    }
    
    /**
     * Export chats
     */
    exportChats() {
        // TODO: Implement chat export
        Utils.Notification.showToast('Tính năng xuất chat đang phát triển', 'info');
    }
    
    /**
     * Refresh data
     */
    async refreshData() {
        await this.loadUsers();
        Utils.Notification.showToast('Đã làm mới dữ liệu', 'success');
    }
    
    /**
     * Stop auto refresh (replaced by realtime events)
     */
    stopAutoRefresh() {
        // Auto refresh is now handled by socket events
        console.log('Auto refresh disabled - using realtime socket events');
    }
    
    /**
     * Update user last message
     */
    updateUserLastMessage(message) {
        const user = this.users.find(u => 
            u.id === message.senderId || u.id === message.receiverId
        );
        
        if (user) {
            user.lastMessage = message.content;
            user.lastMessageTime = message.createdAt || new Date().toISOString();
            
            if (message.senderId !== this.currentUserId) {
                user.unreadCount++;
            }
            
            this.renderUsers();
            this.updateStats();
        }
    }
    
    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        if (this.elements.messagesContainer) {
            Utils.DOM.scrollToBottom(this.elements.messagesContainer);
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + K to focus search
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                this.elements.searchInput?.focus();
            }
            
            // Escape to close modals
            if (event.key === 'Escape') {
                this.closeTemplatesModal();
                this.closeUserInfoModal();
            }
        });
    }
    
    /**
     * Close user info modal
     */
    closeUserInfoModal() {
        this.elements.userInfoModal?.classList.remove('show');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ChatAdmin = new ChatAdmin();
});
