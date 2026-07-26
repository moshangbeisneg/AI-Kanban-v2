# AI Kanban - 智能任务管理平台

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-MVP-brightgreen)

> 基于 AI 的智能任务看板，帮助团队高效管理任务、智能排期、风险预警。

## 📋 项目概述

AI Kanban 是一个面向中小团队的任务管理平台，结合可视化看板与 AI 智能分析能力，帮助团队：

- **看板管理**：拖拽式操作，任务流转一目了然
- **智能分析**：AI 自动分析任务优先级、风险预警
- **负载均衡**：合理分配团队工作量
- **效率提升**：减少沟通成本，聚焦高价值任务

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 📊 可视化看板 | 三列布局（待办/进行中/已完成），支持拖拽移动 |
| 🏷️ 优先级管理 | 高/中/低三级，颜色区分 |
| 📅 截止日期 | 自动计算剩余天数，超期告警 |
| 🏷️ 标签系统 | 灵活的自定义标签，多维分类 |
| 🤖 AI 智能分析 | 自动检测超期任务、优先级建议、负载分析 |
| 💾 本地存储 | 数据持久化，关闭页面不丢失 |

## 🛠️ 技术栈

- **前端**：原生 HTML5 + CSS3 + JavaScript (ES6+)
- **存储**：localStorage 客户端持久化
- **AI**：内置智能分析引擎（基于规则）支持扩展 LLM API
- **PPT**：商业计划书 - docs/AI-Kanban-商业计划书.pptx

## 🚀 快速开始

### 方式一：直接打开
直接用浏览器打开 `index.html` 即可使用（推荐 Chrome / Edge）。

### 方式二：HTTP 服务器
```bash
# Python
python3 -m http.server 8080

# 或 Node.js
npx serve .
```

访问 `http://localhost:8080` 即可。

## 🎯 演示指南

1. 打开应用 → 点击「新建任务」添加几个示例任务
2. 设置不同优先级和截止日期
3. 拖拽任务到不同列模拟进度流转
4. 观察右侧 AI 面板的实时分析结果
5. 点击 AI 面板刷新按钮重新分析

## 📂 项目结构

```
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式
├── js/
│   ├── storage.js      # 数据持久化
│   ├── board.js        # 看板核心逻辑
│   ├── ai.js           # AI 分析引擎
│   └── app.js          # 应用入口
├── scripts/
│   └── build-ppt.py    # PPT 生成脚本
├── docs/
│   └── AI-Kanban-商业计划书.pptx  # 商业计划书
├── .gitignore
└── README.md
```

## 📈 发展路线

- [x] MVP：核心看板 + AI 基础分析
- [ ] Phase 2：多项目支持 + 团队协作
- [ ] Phase 3：AI 增强 + API 集成
- [ ] Phase 4：移动端 App + 商业化

## 📄 商业计划书

见 `docs/AI-Kanban-商业计划书.pptx`

---

*课程项目 · 2026年7月*
