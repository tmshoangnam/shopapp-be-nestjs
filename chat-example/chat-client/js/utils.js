/**
 * Utility Functions
 * Common utility functions for chat application
 */

// ============================================
// Time Utilities
// ============================================

const TimeUtils = {
    /**
     * Format timestamp to readable time
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Vừa xong';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} phút trước`;
        }
        
        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        }
        
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days} ngày trước`;
        }
        
        // More than 7 days - show actual date
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    },
    
    /**
     * Format timestamp to time only
     */
    formatTimeOnly(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Format timestamp to date only
     */
    formatDateOnly(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    /**
     * Get relative time for messages
     */
    getRelativeTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        // Today
        if (date.toDateString() === now.toDateString()) {
            return this.formatTimeOnly(timestamp);
        }
        
        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        }
        
        // This week
        if (diff < 604800000) {
            return date.toLocaleDateString('vi-VN', { weekday: 'short' });
        }
        
        // Older
        return this.formatDateOnly(timestamp);
    }
};

// ============================================
// String Utilities
// ============================================

const StringUtils = {
    /**
     * Truncate string with ellipsis
     */
    truncate(str, length = 50) {
        if (!str || str.length <= length) return str;
        return str.substring(0, length) + '...';
    },
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Detect URLs in text and convert to links
     */
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    }
};

// ============================================
// DOM Utilities
// ============================================

const DOMUtils = {
    /**
     * Create element with classes and attributes
     */
    createElement(tag, className = '', attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        if (className) {
            element.className = className;
        }
        
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    },
    
    /**
     * Add event listener with automatic cleanup
     */
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    },
    
    /**
     * Toggle class on element
     */
    toggleClass(element, className) {
        element.classList.toggle(className);
    },
    
    /**
     * Scroll element to bottom
     */
    scrollToBottom(element, smooth = true) {
        element.scrollTo({
            top: element.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    },
    
    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// ============================================
// Local Storage Utilities
// ============================================

const StorageUtils = {
    /**
     * Set item in localStorage with error handling
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    /**
     * Get item from localStorage with error handling
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    /**
     * Clear all localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// ============================================
// Validation Utilities
// ============================================

const ValidationUtils = {
    /**
     * Validate email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Validate phone number (Vietnamese format)
     */
    isValidPhone(phone) {
        const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8,9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    /**
     * Check if string is empty or whitespace
     */
    isEmpty(str) {
        return !str || str.trim().length === 0;
    },
    
    /**
     * Validate message content
     */
    isValidMessage(message) {
        return !this.isEmpty(message) && message.length <= 1000;
    }
};

// ============================================
// File Utilities
// ============================================

const FileUtils = {
    /**
     * Get file extension
     */
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    },
    
    /**
     * Check if file is image
     */
    isImage(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        return imageExtensions.includes(this.getFileExtension(filename));
    },
    
    /**
     * Check if file is video
     */
    isVideo(filename) {
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        return videoExtensions.includes(this.getFileExtension(filename));
    },
    
    /**
     * Check if file is audio
     */
    isAudio(filename) {
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
        return audioExtensions.includes(this.getFileExtension(filename));
    },
    
    /**
     * Get file icon class
     */
    getFileIcon(filename) {
        const extension = this.getFileExtension(filename);
        
        if (this.isImage(filename)) return 'fas fa-image';
        if (this.isVideo(filename)) return 'fas fa-video';
        if (this.isAudio(filename)) return 'fas fa-music';
        
        switch (extension) {
            case 'pdf': return 'fas fa-file-pdf';
            case 'doc':
            case 'docx': return 'fas fa-file-word';
            case 'xls':
            case 'xlsx': return 'fas fa-file-excel';
            case 'ppt':
            case 'pptx': return 'fas fa-file-powerpoint';
            case 'zip':
            case 'rar': return 'fas fa-file-archive';
            case 'txt': return 'fas fa-file-alt';
            default: return 'fas fa-file';
        }
    },
    
    /**
     * Validate file size
     */
    isValidFileSize(file, maxSizeMB = 10) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    },
    
    /**
     * Validate file type
     */
    isValidFileType(file, allowedTypes = []) {
        if (allowedTypes.length === 0) return true;
        
        const extension = this.getFileExtension(file.name);
        return allowedTypes.includes(extension);
    }
};

// ============================================
// Animation Utilities
// ============================================

const AnimationUtils = {
    /**
     * Fade in element
     */
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Fade out element
     */
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Slide down element
     */
    slideDown(element, duration = 300) {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (targetHeight * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = 'auto';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Slide up element
     */
    slideUp(element, duration = 300) {
        const startHeight = element.offsetHeight;
        const start = performance.now();
        
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.height = (startHeight * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// ============================================
// Notification Utilities
// ============================================

const NotificationUtils = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.getElementById('connectionToast');
        if (!toast) return;
        
        const toastContent = toast.querySelector('.toast-content');
        const icon = toastContent.querySelector('i');
        const messageElement = toastContent.querySelector('span');
        
        // Set message
        messageElement.textContent = message;
        
        // Set icon based on type
        switch (type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                icon.style.color = 'var(--success-color)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                icon.style.color = 'var(--error-color)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                icon.style.color = 'var(--warning-color)';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                icon.style.color = 'var(--info-color)';
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },
    
    /**
     * Show loading overlay
     */
    showLoading(message = 'Đang tải...') {
        const overlay = document.getElementById('loadingOverlay');
        if (!overlay) return;
        
        const messageElement = overlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        overlay.style.display = 'flex';
    },
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
};

// ============================================
// Export utilities for use in other files
// ============================================

window.Utils = {
    Time: TimeUtils,
    String: StringUtils,
    DOM: DOMUtils,
    Storage: StorageUtils,
    Validation: ValidationUtils,
    File: FileUtils,
    Animation: AnimationUtils,
    Notification: NotificationUtils
};
