class ZedAI {
    constructor() {
        this.conversations = JSON.parse(localStorage.getItem('zed_conversations')) || [];
        this.currentConversationId = null;
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadConversations();
        
        // 如果没有对话，创建一个新的
        if (this.conversations.length === 0) {
            this.createNewConversation();
        } else {
            this.loadConversation(this.conversations[0].id);
        }
    }

    initializeElements() {
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            chatContainer: document.getElementById('chatContainer'),
            chatHistory: document.getElementById('chatHistory'),
            newChatBtn: document.getElementById('newChatBtn'),
            clearBtn: document.getElementById('clearBtn'),
            exportBtn: document.getElementById('exportBtn'),
            chatTitle: document.getElementById('chatTitle'),
            statusText: document.getElementById('statusText'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };
    }

    bindEvents() {
        // 发送消息
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 自动调整输入框高度
        this.elements.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // 新对话
        this.elements.newChatBtn.addEventListener('click', () => this.createNewConversation());

        // 清除对话
        this.elements.clearBtn.addEventListener('click', () => this.clearCurrentConversation());

        // 导出对话
        this.elements.exportBtn.addEventListener('click', () => this.exportConversation());

        // 建议chip点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip')) {
                const text = e.target.dataset.text;
                this.elements.messageInput.value = text;
                this.sendMessage();
            }
        });
    }

    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    createNewConversation() {
        const conversation = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.unshift(conversation);
        this.saveConversations();
        this.loadConversations();
        this.loadConversation(conversation.id);
    }

    loadConversations() {
        const historyContainer = this.elements.chatHistory;
        historyContainer.innerHTML = '';

        this.conversations.forEach(conv => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${conv.id === this.currentConversationId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-item-title">${conv.title}</div>
                <div class="chat-item-preview">${this.getConversationPreview(conv)}</div>
            `;
            chatItem.addEventListener('click', () => this.loadConversation(conv.id));
            historyContainer.appendChild(chatItem);
        });
    }

    getConversationPreview(conversation) {
        if (conversation.messages.length === 0) return '开始新对话...';
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
    }

    loadConversation(conversationId) {
        this.currentConversationId = conversationId;
        const conversation = this.conversations.find(c => c.id === conversationId);
        
        if (!conversation) return;

        this.elements.chatTitle.textContent = conversation.title;
        this.renderMessages(conversation.messages);
        this.loadConversations(); // 更新侧边栏活跃状态
    }

    renderMessages(messages) {
        this.elements.chatContainer.innerHTML = '';

        if (messages.length === 0) {
            this.showWelcomeMessage();
            return;
        }

        messages.forEach(message => {
            this.addMessageToUI(message.role, message.content, false);
        });

        this.scrollToBottom();
    }

    showWelcomeMessage() {
        this.elements.chatContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>欢迎使用 Zed AI</h2>
                <p>我是你的AI助手，可以帮你解答问题、协助工作或进行有趣的对话。</p>
                <div class="suggestion-chips">
                    <button class="chip" data-text="介绍一下你自己">介绍一下你自己</button>
                    <button class="chip" data-text="帮我写一首诗">帮我写一首诗</button>
                    <button class="chip" data-text="解释什么是人工智能">解释什么是人工智能</button>
                    <button class="chip" data-text="推荐一些学习资源">推荐一些学习资源</button>
                </div>
            </div>
        `;
    }

    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isLoading) return;

        // 添加用户消息
        this.addMessage('user', message);
        this.addMessageToUI('user', message);
        
        // 清空输入框
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();

        // 显示加载状态
        this.showLoading();

        try {
            // 模拟AI响应
            const aiResponse = await this.getAIResponse(message);
            this.addMessage('assistant', aiResponse);
            this.addMessageToUI('assistant', aiResponse);
            
            // 更新对话标题（如果是第一条消息）
            this.updateConversationTitle(message);
        } catch (error) {
            console.error('发送消息失败:', error);
            this.addMessageToUI('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
        } finally {
            this.hideLoading();
        }
    }

    addMessage(role, content) {
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation) return;

        conversation.messages.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });

        this.saveConversations();
    }

    addMessageToUI(role, content, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = role === 'assistant' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        if (animate) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(20px)';
        }

        this.elements.chatContainer.appendChild(messageDiv);

        if (animate) {
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'all 0.5s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            });
        }

        this.scrollToBottom();
    }

    formatMessage(content) {
        // 简单的markdown格式化
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    async getAIResponse(userMessage) {
        // 模拟AI响应延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // 模拟AI响应逻辑
        const responses = this.generateAIResponse(userMessage);
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('你好') || message.includes('hello')) {
            return [
                '你好！我是Zed AI，很高兴为你服务。有什么我可以帮助你的吗？',
                '嗨！欢迎使用Zed AI。我可以帮你解答问题、协助工作或进行有趣的对话。',
                '你好！我是你的AI助手，随时准备为你提供帮助。'
            ];
        }

        if (message.includes('介绍') || message.includes('你是谁')) {
            return [
                '我是**Zed AI**，一个智能对话助手。我可以帮你：\\n\\n• 回答各种问题\\n• 协助创作和写作\\n• 提供学习建议\\n• 进行有趣的对话\\n\\n有什么特别想了解的吗？',
                '我是Zed AI，专为提供智能对话和协助而设计。我具备广泛的知识，可以在多个领域为你提供帮助，包括技术、创作、学习等。'
            ];
        }

        if (message.includes('诗') || message.includes('诗歌')) {
            return [
                '好的，我来为你创作一首诗：\\n\\n**数字时代**\\n\\n键盘敲击声声响，\\n屏幕光影舞飞扬。\\n智慧如流水般淌，\\n连接你我两相望。\\n\\n代码编织新世界，\\n算法描绘未来篇。\\n人机携手创奇迹，\\n科技温暖每一天。',
                '让我为你写一首关于AI的诗：\\n\\n**智能之光**\\n\\n零一交织成思维，\\n算法深处有诗意。\\n虽无血肉之躯体，\\n却能理解人心意。\\n\\n与君对话如春风，\\n答疑解惑乐无穷。\\n科技之花今盛开，\\n智慧之光照前程。'
            ];
        }

        if (message.includes('人工智能') || message.includes('ai')) {
            return [
                '**人工智能**（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统。\\n\\nAI的主要特点包括：\\n• **学习能力** - 从数据中学习和改进\\n• **推理能力** - 分析信息并得出结论\\n• **感知能力** - 理解和处理感官输入\\n• **语言理解** - 处理和生成自然语言\\n\\n目前AI广泛应用于搜索引擎、推荐系统、自动驾驶、医疗诊断等领域。',
                'AI是模拟人类智能的技术。它包含机器学习、深度学习、自然语言处理等分支。现代AI系统能够：识别图像、理解语言、下棋、驾驶汽车等。虽然AI很强大，但仍在发展中，距离真正的通用人工智能还有距离。'
            ];
        }

        if (message.includes('学习') || message.includes('资源')) {
            return [
                '以下是一些优质的学习资源推荐：\\n\\n**编程学习**\\n• GitHub - 开源代码学习\\n• Stack Overflow - 编程问答\\n• Coursera/edX - 在线课程\\n\\n**AI/机器学习**\\n• Kaggle - 数据科学竞赛\\n• Fast.ai - 深度学习课程\\n• Papers with Code - 最新研究论文\\n\\n**通用学习**\\n• Khan Academy - 免费教育\\n• TED Talks - 知识分享\\n• Medium - 技术文章',
                '推荐这些学习平台：\\n\\n1. **在线课程**：Coursera、Udemy、中国大学MOOC\\n2. **编程练习**：LeetCode、牛客网、CodePen\\n3. **开源项目**：GitHub、GitLab\\n4. **技术社区**：Stack Overflow、CSDN、掘金\\n5. **文档资源**：MDN、官方文档\\n\\n选择适合自己水平的开始，持续学习是关键！'
            ];
        }

        // 默认响应
        return [
            '这是一个很有趣的问题！虽然我现在只是一个演示版本，但我正在努力学习如何更好地理解和回应你的需求。',
            '谢谢你的消息！作为一个AI助手，我很乐意与你交流。有什么特别想讨论的话题吗？',
            '我理解你的意思。虽然我还在不断改进中，但我会尽力为你提供有帮助的回应。',
            '这确实值得深入思考。如果你想了解更多关于某个特定主题的信息，我很乐意为你详细解释。',
            '好问题！我正在处理你的请求，希望我的回答能对你有所帮助。'
        ];
    }

    updateConversationTitle(firstMessage) {
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation || conversation.messages.length > 2) return;

        // 生成简短标题
        let title = firstMessage.substring(0, 20);
        if (firstMessage.length > 20) title += '...';

        conversation.title = title;
        this.elements.chatTitle.textContent = title;
        this.saveConversations();
        this.loadConversations();
    }

    clearCurrentConversation() {
        if (!confirm('确定要清除当前对话吗？')) return;

        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation) return;

        conversation.messages = [];
        conversation.title = '新对话';
        
        this.saveConversations();
        this.showWelcomeMessage();
        this.elements.chatTitle.textContent = '新对话';
        this.loadConversations();
    }

    exportConversation() {
        const conversation = this.conversations.find(c => c.id === this.currentConversationId);
        if (!conversation || conversation.messages.length === 0) {
            alert('当前对话为空，无法导出。');
            return;
        }

        let exportText = `Zed AI 对话导出\\n`;
        exportText += `标题: ${conversation.title}\\n`;
        exportText += `日期: ${new Date(conversation.createdAt).toLocaleString()}\\n`;
        exportText += `${'='.repeat(50)}\\n\\n`;

        conversation.messages.forEach((message, index) => {
            const role = message.role === 'user' ? '用户' : 'AI助手';
            const time = new Date(message.timestamp).toLocaleTimeString();
            exportText += `[${time}] ${role}:\\n${message.content}\\n\\n`;
        });

        // 创建下载链接
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zed-ai-chat-${conversation.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showLoading() {
        this.isLoading = true;
        this.elements.sendBtn.disabled = true;
        this.elements.statusText.textContent = 'AI正在思考...';
        this.elements.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.isLoading = false;
        this.elements.sendBtn.disabled = false;
        this.elements.statusText.textContent = '准备就绪';
        this.elements.loadingOverlay.style.display = 'none';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
        }, 100);
    }

    saveConversations() {
        localStorage.setItem('zed_conversations', JSON.stringify(this.conversations));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ZedAI();
});

// 添加一些实用工具函数
window.ZedUtils = {
    // 复制文本到剪贴板
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    },

    // 格式化时间
    formatTime: (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
        return date.toLocaleDateString();
    },

    // 检测是否为移动设备
    isMobile: () => {
        return window.innerWidth <= 768;
    }
};