/**
 * Chat Client - Main chat functionality for client users
 */

class ChatClient {
    constructor() {
        this.currentUserId = null;
        this.currentPartnerId = null;
        this.messages = new Map();
        this.conversations = [];
        this.unreadCount = 0;
        this.isTyping = false;
        this.typingTimer = null;
        
        // DOM elements
        this.elements = {
            // Main containers
            chatContainer: null,
            sidebar: null,
            chatWindow: null,
            welcomeScreen: null,
            
            // User info
            userName: null,
            userAvatar: null,
            userStatus: null,
            
            // Conversations
            conversationsList: null,
            searchInput: null,
            
            // Messages
            messagesList: null,
            messagesContainer: null,
            typingIndicator: null,
            
            // Input
            messageInput: null,
            sendBtn: null,
            attachBtn: null,
            
            // Partner info
            partnerName: null,
            partnerAvatar: null,
            partnerStatus: null,
            
            // Modals
            fileUploadModal: null,
            fileInput: null,
            uploadArea: null,
            uploadedFiles: null
        };
        
        this.init();
    }
    
    /**
     * Initialize chat client
     */
    async init() {
        try {
            this.initElements();
            this.setupEventListeners();
            this.loadUserData();
            await this.connectToServer();
            this.setupKeyboardShortcuts();
            
            console.log('Chat client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chat client:', error);
            Utils.Notification.showToast('Khởi tạo chat thất bại', 'error');
        }
    }
    
    /**
     * Initialize DOM elements
     */
    initElements() {
        this.elements = {
            chatContainer: document.querySelector('.chat-container'),
            sidebar: document.querySelector('.chat-sidebar'),
            chatWindow: document.getElementById('chatWindow'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            
            userName: document.getElementById('userName'),
            userAvatar: document.getElementById('userAvatar'),
            userStatus: document.getElementById('userStatus'),
            
            conversationsList: document.getElementById('conversationsList'),
            searchInput: document.getElementById('searchInput'),
            
            messagesList: document.getElementById('messagesList'),
            messagesContainer: document.getElementById('messagesContainer'),
            typingIndicator: document.getElementById('typingIndicator'),
            
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            attachBtn: document.getElementById('attachBtn'),
            
            partnerName: document.getElementById('partnerName'),
            partnerAvatar: document.getElementById('partnerAvatar'),
            partnerStatus: document.getElementById('partnerStatus'),
            
            fileUploadModal: document.getElementById('fileUploadModal'),
            fileInput: document.getElementById('fileInput'),
            uploadArea: document.getElementById('uploadArea'),
            uploadedFiles: document.getElementById('uploadedFiles')
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
        
        // Attachment events
        this.elements.attachBtn?.addEventListener('click', this.handleAttachFile.bind(this));
        this.elements.fileInput?.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Upload area events
        this.elements.uploadArea?.addEventListener('click', () => this.elements.fileInput?.click());
        this.elements.uploadArea?.addEventListener('dragover', this.handleDragOver.bind(this));
        this.elements.uploadArea?.addEventListener('drop', this.handleFileDrop.bind(this));
        
        // Search events
        this.elements.searchInput?.addEventListener('input', this.handleSearch.bind(this));
        
        // Socket events
        SocketManager.on('messageReceived', this.handleMessageReceived.bind(this));
        SocketManager.on('messageSent', this.handleMessageSent.bind(this));
        SocketManager.on('userTyping', this.handleUserTyping.bind(this));
        SocketManager.on('unreadCount', this.handleUnreadCount.bind(this));
        SocketManager.on('connected', this.handleConnected.bind(this));
        SocketManager.on('disconnected', this.handleDisconnected.bind(this));
        
        // Modal events
        document.getElementById('closeFileModal')?.addEventListener('click', this.closeFileModal.bind(this));
        document.getElementById('cancelUpload')?.addEventListener('click', this.closeFileModal.bind(this));
        document.getElementById('confirmUpload')?.addEventListener('click', this.confirmUpload.bind(this));
        
        // New chat button
        document.getElementById('newChatBtn')?.addEventListener('click', this.startNewChat.bind(this));
        document.getElementById('startChatBtn')?.addEventListener('click', this.startNewChat.bind(this));
    }
    
    /**
     * Load user data from localStorage or API
     */
    loadUserData() {
        const userData = Utils.Storage.getItem('userData', {
            id: 'user-123',
            name: 'Nguyễn Văn A',
            email: 'user@example.com',
            avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwIDMwQzEwIDI1IDEwIDIwIDIwIDIwQzE1IDIwIDEwIDI1IDEwIDMwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
        });
        
        this.currentUserId = userData.id;
        
        // Update UI
        if (this.elements.userName) {
            this.elements.userName.textContent = userData.name;
        }
        if (this.elements.userAvatar) {
            this.elements.userAvatar.src = userData.avatar;
        }
        
        // Load conversations
        this.loadConversations();
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
     * Get auth token (implement based on your auth system)
     */
    getAuthToken() {
        // Get token from localStorage or use a valid test token
        // const storedToken = Utils.Storage.getItem('accessToken');
        // if (storedToken) {
        //     return storedToken;
        // }
        
        // Use a valid test token for development
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiZDBlMGM1Zi02MzZiLTRlNjUtOTU0Mi1mMmNmMTBjMDdlOTUiLCJlbWFpbCI6IndpbGxpYW0udGF5bG9yQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJmaXJzdE5hbWUiOiJXaWxsaWFtIiwibGFzdE5hbWUiOiJUYXlsb3IiLCJpYXQiOjE3NTk4MDkxNjksImV4cCI6MTc2MDQxMzk2OX0.02GRm1PNPcy22OrPT3PKQI7WArCjCM1pZ9Mbw5njft4';
    }
    
    /**
     * Load conversations from API or localStorage
     */
    loadConversations() {
        // Mock data - replace with actual API call
        const mockConversations = [
            {
                id: 'conv-1',
                partnerId: 'a48bd9f5-655b-4dd5-b627-4b435eed66f3',
                partnerName: 'Admin Support',
                partnerAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmNTkzNzUiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                lastMessage: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 2,
                isOnline: true
            },
            {
                id: 'conv-2',
                partnerId: 'bcf7087a-e8d8-4426-a38d-38960fcdc6d1',
                partnerName: 'Technical Support',
                partnerAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmNTkzNzUiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                lastMessage: 'Vấn đề đã được giải quyết',
                lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: 0,
                isOnline: false
            }
        ];
        
        this.conversations = mockConversations;
        this.renderConversations();
    }
    
    /**
     * Render conversations list
     */
    renderConversations() {
        if (!this.elements.conversationsList) return;
        
        this.elements.conversationsList.innerHTML = '';
        
        this.conversations.forEach(conversation => {
            const conversationElement = this.createConversationElement(conversation);
            this.elements.conversationsList.appendChild(conversationElement);
        });
    }
    
    /**
     * Create conversation element
     */
    createConversationElement(conversation) {
        const element = Utils.DOM.createElement('div', 'conversation-item', {
            'data-conversation-id': conversation.id,
            'data-partner-id': conversation.partnerId
        });
        
        element.innerHTML = `
            <div class="avatar avatar-40">
                <img src="${conversation.partnerAvatar}" alt="${conversation.partnerName}">
            </div>
            <div class="conversation-details">
                <div class="conversation-header">
                    <span class="conversation-name">${conversation.partnerName}</span>
                    <span class="conversation-time">${Utils.Time.getRelativeTime(conversation.lastMessageTime)}</span>
                </div>
                <div class="conversation-preview">
                    <span class="conversation-message">${Utils.String.truncate(conversation.lastMessage, 30)}</span>
                    ${conversation.unreadCount > 0 ? `<span class="conversation-badge">${conversation.unreadCount}</span>` : ''}
                </div>
            </div>
        `;
        
        // Add click handler
        element.addEventListener('click', () => {
            this.selectConversation(conversation);
        });
        
        return element;
    }
    
    /**
     * Select conversation
     */
    async selectConversation(conversation) {
        console.log('Selecting conversation:', conversation);
        this.currentPartnerId = conversation.partnerId;
        localStorage.setItem('currentPartnerId', conversation.partnerId);
        
        // Update UI
        this.showChatWindow();
        this.updatePartnerInfo(conversation);
        await this.loadMessages(conversation.id);
        
        // Update active state
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-conversation-id="${conversation.id}"]`);
        selectedItem?.classList.add('active');
        
        // Clear unread count
        conversation.unreadCount = 0;
        this.renderConversations();
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
    updatePartnerInfo(conversation) {
        if (this.elements.partnerName) {
            this.elements.partnerName.textContent = conversation.partnerName;
        }
        if (this.elements.partnerAvatar) {
            this.elements.partnerAvatar.src = conversation.partnerAvatar;
        }
        if (this.elements.partnerStatus) {
            this.elements.partnerStatus.innerHTML = `
                <i class="fas fa-circle"></i>
                ${conversation.isOnline ? 'Đang hoạt động' : 'Offline'}
            `;
        }
    }
    
    /**
     * Load messages for conversation
     */
    async loadMessages(conversationId) {
        try {
            // Try to load from API first
            const response = await fetch(`http://localhost:4001/api/v1/chat/messages`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.messages.set(conversationId, data.messages || []);
                this.renderMessages(data.messages || []);
                return;
            }
        } catch (error) {
            console.error('Error loading messages from API:', error);
        }
        
        // Fallback to mock data
        const mockMessages = [
            {
                id: 'msg-1',
                senderId: 'admin-1',
                content: 'Chào bạn! Tôi có thể giúp gì cho bạn?',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                status: 'read'
            },
            {
                id: 'msg-2',
                senderId: this.currentUserId,
                content: 'Xin chào! Tôi cần hỗ trợ về đơn hàng',
                timestamp: new Date(Date.now() - 240000).toISOString(),
                status: 'delivered'
            },
            {
                id: 'msg-3',
                senderId: 'admin-1',
                content: 'Vui lòng cho tôi biết số đơn hàng của bạn',
                timestamp: new Date(Date.now() - 180000).toISOString(),
                status: 'read'
            }
        ];
        
        this.messages.set(conversationId, mockMessages);
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
        const element = Utils.DOM.createElement('div', `message ${isOwnMessage ? 'sent' : 'received'}`);
        
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
     * Create status icon for sent messages
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
        const currentPartnerId = this.currentPartnerId || localStorage.getItem('currentPartnerId');
        console.log('Current partner ID:', currentPartnerId);
        // Send message
        const success = SocketManager.sendMessage({
            receiverId: this.currentPartnerId || localStorage.getItem('currentPartnerId'),
            content: content,
            messageType: 'TEXT'
        });
        
        if (!success) {
            Utils.Notification.showToast('Không thể gửi tin nhắn', 'error');
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
                receiverId: this.currentPartnerId || localStorage.getItem('currentPartnerId'),
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
                receiverId: this.currentPartnerId || localStorage.getItem('currentPartnerId'),
                isTyping: false
            });
        }
    }
    
    /**
     * Handle message received
     */
    handleMessageReceived(message) {
        console.log('Message received:', message);
        
        // If no current partner, try to find or create conversation
        const currentPartnerId = this.currentPartnerId || localStorage.getItem('currentPartnerId');
        if (!currentPartnerId && message.senderId) {
            this.ensureConversationExists(message.senderId);
        }
        
        // Add message to current conversation if it's from current partner
        // Only add if it's not from current user (to avoid duplicate from sent confirmation)
        if (currentPartnerId === message.senderId && message.senderId !== this.currentUserId) {
            console.log('Adding message to current conversation:', message);
            this.addMessage(message);
        }
        
        // Update conversation list
        this.updateConversationLastMessage(message);
    }
    
    /**
     * Handle message sent confirmation
     */
    handleMessageSent(data) {
        if (data.success && data.message) {
            this.addMessage(data.message);
        }
    }
    
    /**
     * Add message to current conversation
     */
    addMessage(message) {
        if (!this.currentPartnerId || !localStorage.getItem('currentPartnerId')) return;
        
        const conversationId = this.findConversationByPartnerId(this.currentPartnerId || localStorage.getItem('currentPartnerId'))?.id;
        if (!conversationId) return;
        
        const messages = this.messages.get(conversationId) || [];
        messages.push(message);
        this.messages.set(conversationId, messages);
        
        const messageElement = this.createMessageElement(message);
        this.elements.messagesList.appendChild(messageElement);
        
        this.scrollToBottom();
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
     * Handle unread count
     */
    handleUnreadCount(data) {
        this.unreadCount = data.count;
        // Update unread count in UI if needed
    }
    
    /**
     * Handle connected
     */
    handleConnected() {
        if (this.elements.userStatus) {
            this.elements.userStatus.innerHTML = `
                <i class="fas fa-circle"></i>
                Đang hoạt động
            `;
        }
    }
    
    /**
     * Handle disconnected
     */
    handleDisconnected() {
        if (this.elements.userStatus) {
            this.elements.userStatus.innerHTML = `
                <i class="fas fa-circle offline"></i>
                Mất kết nối
            `;
        }
    }
    
    /**
     * Handle file attachment
     */
    handleAttachFile() {
        this.elements.fileUploadModal?.classList.add('show');
    }
    
    /**
     * Close file modal
     */
    closeFileModal() {
        this.elements.fileUploadModal?.classList.remove('show');
    }
    
    /**
     * Handle file select
     */
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.handleFiles(files);
    }
    
    /**
     * Handle drag over
     */
    handleDragOver(event) {
        event.preventDefault();
        this.elements.uploadArea?.classList.add('dragover');
    }
    
    /**
     * Handle file drop
     */
    handleFileDrop(event) {
        event.preventDefault();
        this.elements.uploadArea?.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.handleFiles(files);
    }
    
    /**
     * Handle files
     */
    handleFiles(files) {
        files.forEach(file => {
            if (Utils.File.isValidFileSize(file, 10)) {
                this.addFileToUpload(file);
            } else {
                Utils.Notification.showToast(`File ${file.name} quá lớn (>10MB)`, 'error');
            }
        });
    }
    
    /**
     * Add file to upload list
     */
    addFileToUpload(file) {
        const fileElement = Utils.DOM.createElement('div', 'uploaded-file');
        
        fileElement.innerHTML = `
            <div class="file-icon">
                <i class="${Utils.File.getFileIcon(file.name)}"></i>
            </div>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${Utils.File.formatFileSize(file.size)}</div>
            </div>
            <button class="file-remove" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove handler
        const removeBtn = fileElement.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => {
            fileElement.remove();
        });
        
        this.elements.uploadedFiles?.appendChild(fileElement);
    }
    
    /**
     * Confirm upload
     */
    confirmUpload() {
        const files = this.elements.uploadedFiles?.querySelectorAll('.uploaded-file');
        if (!files || files.length === 0) {
            Utils.Notification.showToast('Vui lòng chọn file', 'warning');
            return;
        }
        
        // TODO: Implement file upload logic
        Utils.Notification.showToast('Tính năng upload file đang phát triển', 'info');
        this.closeFileModal();
    }
    
    /**
     * Handle search
     */
    handleSearch(event) {
        const query = event.target.value.toLowerCase();
        
        // Filter conversations
        this.conversations.forEach(conversation => {
            const element = document.querySelector(`[data-conversation-id="${conversation.id}"]`);
            if (element) {
                const matches = conversation.partnerName.toLowerCase().includes(query) ||
                              conversation.lastMessage.toLowerCase().includes(query);
                element.style.display = matches ? 'flex' : 'none';
            }
        });
    }
    
    /**
     * Start new chat
     */
    startNewChat() {
        // TODO: Implement new chat logic
        Utils.Notification.showToast('Tính năng chat mới đang phát triển', 'info');
    }
    
    /**
     * Update conversation last message
     */
    updateConversationLastMessage(message) {
        const conversation = this.conversations.find(conv => 
            conv.partnerId === message.senderId || conv.partnerId === message.receiverId
        );
        
        if (conversation) {
            conversation.lastMessage = message.content;
            conversation.lastMessageTime = message.createdAt || new Date().toISOString();
            
            if (message.senderId !== this.currentUserId) {
                conversation.unreadCount++;
            }
            
            this.renderConversations();
        }
    }
    
    /**
     * Find conversation by partner ID
     */
    findConversationByPartnerId(partnerId) {
        return this.conversations.find(conv => conv.partnerId === partnerId);
    }
    
    /**
     * Ensure conversation exists for partner
     */
    ensureConversationExists(partnerId) {
        let conversation = this.findConversationByPartnerId(partnerId);
        
        if (!conversation) {
            // Create new conversation
            conversation = {
                id: `conv-${partnerId}-${Date.now()}`,
                partnerId: partnerId,
                partnerName: 'Admin Support',
                partnerAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNmNTkzNzUiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjRDOCAyMCAxMCAxNiAxNiAxNkMyMiAxNiAyNCAyMCAyNCAyNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                isOnline: true
            };
            
            this.conversations.unshift(conversation);
            this.renderConversations();
        }
        
        // Select this conversation
        this.selectConversation(conversation);
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
                this.closeFileModal();
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ChatClient = new ChatClient();
});
