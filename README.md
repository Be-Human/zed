# Zed AI - 智能对话界面

一个现代化的AI对话界面，具有优雅的设计和丰富的功能。目前支持模拟对话，后续可集成OpenAI API。

## ✨ 特性

- 🎨 **现代化UI设计** - 采用渐变背景和毛玻璃效果
- 💬 **多对话管理** - 支持创建、切换和管理多个对话
- 🤖 **智能模拟回复** - 内置多样化的AI响应模拟
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 💾 **本地存储** - 对话历史自动保存到浏览器
- 📤 **对话导出** - 支持导出对话记录为文本文件
- ⚡ **流畅交互** - 丰富的动画效果和交互反馈
- 🎯 **快速开始** - 提供建议问题快速开始对话

## 🚀 快速开始

### 在线体验

直接访问 GitHub Pages 部署的版本：[https://be-human.github.io/zed](https://be-human.github.io/zed)

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/Be-Human/zed.git
cd zed
```

2. 使用任意HTTP服务器运行（推荐）
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js的http-server
npx http-server

# 使用PHP
php -S localhost:8000
```

3. 在浏览器中访问 `http://localhost:8000`

> **注意：** 由于使用了现代JavaScript特性，建议直接在浏览器中打开`index.html`，但某些功能可能需要HTTP服务器环境。

## 🛠️ 技术栈

- **前端框架：** 原生JavaScript (ES6+)
- **样式：** CSS3 (Grid, Flexbox, 动画)
- **图标：** Font Awesome 6
- **存储：** LocalStorage
- **部署：** GitHub Pages

## 📁 项目结构

```
zed/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 主要逻辑
├── README.md           # 项目说明
└── .github/
    └── workflows/
        └── deploy.yml  # 自动部署配置
```

## 🎯 功能说明

### 1. 对话管理
- 创建新对话
- 切换历史对话
- 清除当前对话
- 自动保存对话历史

### 2. 消息处理
- 支持多行输入（Shift + Enter）
- 自动调整输入框高度
- 实时状态指示器
- 消息格式化（支持基础Markdown）

### 3. AI模拟响应
当前版本包含智能的模拟响应系统，能够：
- 识别问候语
- 回答关于AI的问题
- 创作诗歌
- 提供学习资源推荐
- 进行自我介绍

### 4. 导出功能
- 导出完整对话历史
- 包含时间戳和格式化
- 支持文本文件下载

## 🔌 API集成准备

项目已为OpenAI API集成做好准备。需要修改 `script.js` 中的 `getAIResponse` 方法：

```javascript
async getAIResponse(userMessage) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${YOUR_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {role: 'user', content: userMessage}
            ]
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}
```

## 🎨 自定义主题

可以通过修改 `style.css` 中的CSS变量来自定义主题：

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --background-color: rgba(255, 255, 255, 0.9);
    --text-color: #333;
    --border-radius: 12px;
}
```

## 📱 移动端适配

项目完全支持移动设备：
- 响应式布局
- 触摸友好的交互
- 自适应侧边栏
- 优化的输入体验

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🚧 后续计划

- [ ] 集成OpenAI API
- [ ] 添加语音输入/输出
- [ ] 支持文件上传
- [ ] 多语言支持
- [ ] 自定义AI角色
- [ ] 对话分享功能
- [ ] 搜索对话历史
- [ ] 主题切换器
- [ ] PWA支持

## 📞 联系

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [https://github.com/Be-Human/zed/issues](https://github.com/Be-Human/zed/issues)
- Email: to.be.herman@gmail.com

---

⭐ 如果这个项目对你有帮助，请给它一个星标！