/**
 * AI Kanban - DeepSeek AI Integration
 * Calls DeepSeek API directly from the browser (CORS supported)
 */
const AI = {
  apiKey: '',
  insights: [],
  isAnalyzing: false,
  messages: [],
  chatMode: false,

  // === Init ===
  init() {
     this.apiKey = localStorage.getItem('kanban_ai_key') || this.apiKey;
    this.panel = document.getElementById('aiPanel');
    this.renderPanel();
    if (this.apiKey) {
      this.analyzeBoard();
    }
  },

  getApiKey() {
    if (!this.apiKey) {
      const key = prompt('请输入 DeepSeek API Key（仅保存在浏览器本地，调用时直接发往 DeepSeek）：');
      if (key && key.trim()) {
        this.apiKey = key.trim();
        localStorage.setItem('kanban_ai_key', this.apiKey);
        this.renderPanel();
        this.analyzeBoard();
      }
    }
    return this.apiKey;
  },

  clearApiKey() {
    this.apiKey = '';
    localStorage.removeItem('kanban_ai_key');
    this.renderPanel();
  },

  // === Direct DeepSeek API call ===
  async callDeepSeek(messages) {
    const key = this.apiKey || localStorage.getItem('kanban_ai_key') || '';
    if (!key) {
      this.getApiKey();
      return null;
    }
    try {
      const resp = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });
      const json = await resp.json();
      if (json.error) return { error: json.error.message };
      return { content: json.choices?.[0]?.message?.content || '' };
    } catch (e) {
      return { error: e.message };
    }
  },

  async callDeepSeekJSON(messages) {
    const result = await this.callDeepSeek(messages);
    if (!result || result.error) return result;
    try {
      const cleaned = result.content.replace(/'''json\\n?|'''/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return { raw: result.content };
    }
  },

  // === Board Analysis ===
  async analyzeBoard() {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;
    this.setPanelState('analyzing');

    const boardData = Board.data || { columns: [] };
    const summary = JSON.stringify(boardData).slice(0, 5000);
    const result = await this.callDeepSeekJSON([
      { role: 'system', content: '你是一个智能项目管理助手，分析看板数据后给出有价值的洞察。输出 JSON：{"insights":[{"type":"warning|info|suggestion|success","title":"标题","detail":"分析"}]}' },
      { role: 'user', content: '分析这个看板数据：\\n' + summary }
    ]);
    this.isAnalyzing = false;

    if (result && !result.error && result.insights) {
      this.insights = result.insights;
    } else {
      this.insights = this.fallbackInsights();
      if (result?.error) {
        this.insights.unshift({ type: 'info', title: 'AI 连接提示', detail: '需要配置 API Key 才可使用 AI 智能分析。' + (result.error !== 'API key not configured' ? ' 错误：' + result.error : '') });
      }
    }
    this.renderInsights();
  },

  fallbackInsights() {
    const insights = [];
    const allTasks = [];
    const columns = Board.data?.columns || [];
    columns.forEach(function(col) {
      col.tasks.forEach(function(t) { allTasks.push({ task: t, column: col }); });
    });
    const overdue = allTasks.filter(function(item) { return item.task.deadline && Board.getDaysLeft(item.task.deadline) < 0; });
    if (overdue.length > 0) insights.push({ type: 'warning', title: '已超期任务', detail: overdue.length + ' 个任务已过截止日期' });
    const highTodo = allTasks.filter(function(item) { return item.column.id === 'todo' && item.task.priority === 'high'; });
    if (highTodo.length > 0) insights.push({ type: 'suggestion', title: '高优先级待办', detail: highTodo.length + ' 个高优任务待处理' });
    const total = allTasks.length;
    const doneCol = columns.find(function(c) { return c.id === 'done'; });
    if (doneCol && total > 0) { const r = Math.round((doneCol.tasks.length / total) * 100); insights.push({ type: 'stats', title: '完成率', detail: r + '%（' + doneCol.tasks.length + '/' + total + '）' }); }
    if (insights.length === 0) insights.push({ type: 'success', title: '状态良好', detail: '所有任务状态正常！' });
    return insights;
  },

  // === Task Analysis ===
  async analyzeTask(task, colTitle) {
    const container = document.getElementById('taskAiAnalysis');
    if (!container) return;
    container.innerHTML = '<div class="ai-mini-loading"><div class="ai-spinner"></div><span>AI 分析中...</span></div>';

    const boardSummary = JSON.stringify({
      columns: (Board.data?.columns || []).map(function(c) { return { id: c.id, title: c.title, count: c.tasks.length }; })
    }).slice(0, 2000);

    const result = await this.callDeepSeekJSON([
      { role: 'system', content: '你是一个智能项目管理助手。分析任务，输出 JSON：{"priority":"high|medium|low","priorityReason":"为什么","suggestion":"处理建议","tags":["标签"],"risks":["风险"],"relatedInsights":"关联分析"}' },
      { role: 'user', content: '标题：' + (task.title || '') + '\\n描述：' + (task.description || '') + '\\n当前优先级：' + (task.priority || '') + '\\n截止：' + (task.deadline || '无') + '\\n标签：' + ((task.tags || []).join(', ') || '无') + '\\n\\n看板上下文：' + boardSummary }
    ]);

    if (!result || result.error) {
      container.innerHTML = '<div class="ai-task-error">AI 分析暂不可用' + (result?.error ? '：' + result.error : '') + '</div>';
      return;
    }

    let html = '<div class="ai-task-analysis">';
    if (result.priority) {
      const pClass = result.priority;
      const pLabel = { high: '高优先', medium: '中优先', low: '低优先' };
      html += '<div class="ai-analysis-item"><span class="ai-analysis-label">AI 建议优先级</span><span class="priority-badge priority-' + pClass + '">' + (pLabel[pClass] || pClass) + '</span></div>';
    }
    if (result.priorityReason) html += '<div class="ai-analysis-item"><span class="ai-analysis-label">原因</span><span class="ai-analysis-text">' + this.esc(result.priorityReason) + '</span></div>';
    if (result.suggestion) html += '<div class="ai-analysis-item"><span class="ai-analysis-label">处理建议</span><span class="ai-analysis-text">' + this.esc(result.suggestion) + '</span></div>';
    if (result.relatedInsights) html += '<div class="ai-analysis-item"><span class="ai-analysis-label">关联分析</span><span class="ai-analysis-text">' + this.esc(result.relatedInsights) + '</span></div>';
    if (result.risks && result.risks.length > 0) {
      html += '<div class="ai-analysis-item"><span class="ai-analysis-label">潜在风险</span><ul class="ai-risk-list">';
      result.risks.forEach(function(r) { html += '<li>' + AI.esc(r) + '</li>'; });
      html += '</ul></div>';
    }
    if (result.tags && result.tags.length > 0) {
      html += '<div class="ai-analysis-item"><span class="ai-analysis-label">推荐标签</span><div class="ai-tag-suggestions">';
      result.tags.forEach(function(tag) { html += '<span class="tag tag-suggested">' + AI.esc(tag) + '</span>'; });
      html += '</div></div>';
    }
    html += '</div>';
    container.innerHTML = html;
  },

  // === Chat ===
  toggleChat() {
    this.chatMode = !this.chatMode;
    this.renderPanel();
    if (this.chatMode) { setTimeout(function() { const el = document.getElementById('aiChatInput'); if (el) el.focus(); }, 100); }
  },

  async sendChatMessage() {
    const input = document.getElementById('aiChatInput');
    const container = document.getElementById('aiChatMessages');
    if (!input || !container) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.disabled = true;

    this.messages.push({ role: 'user', content: text });
    this.renderChatMessages();
    container.scrollTop = container.scrollHeight;

    const loading = document.createElement('div');
    loading.className = 'chat-msg chat-ai chat-loading';
    loading.innerHTML = '<div class="chat-bubble"><div class="ai-spinner" style="width:14px;height:14px;border-width:2px"></div></div>';
    container.appendChild(loading);

    const boardSummary = JSON.stringify({
      columns: (Board.data?.columns || []).map(function(c) {
        return { id: c.id, title: c.title, count: c.tasks.length, tasks: c.tasks.map(function(t) { return { title: t.title, priority: t.priority, deadline: t.deadline, tags: t.tags }; }) };
      })
    }).slice(0, 4000);

    const result = await this.callDeepSeek([
      { role: 'system', content: '你是一个嵌入在看板中的 AI 助手，帮助管理任务。回答简洁专业有建设性。' + (boardSummary ? '\\n看板概要：' + boardSummary : '') },
      { role: 'user', content: text }
    ]);
    loading.remove();

    if (result && result.content) {
      this.messages.push({ role: 'assistant', content: result.content });
    } else {
      this.messages.push({ role: 'assistant', content: '抱歉，AI 暂时无法回复。' + (result?.error ? ' 错误：' + result.error : ' 请检查 API Key。') });
    }
    this.renderChatMessages();
    container.scrollTop = container.scrollHeight;
    input.disabled = false;
    input.focus();
  },

  renderChatMessages() {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;
    let html = '';
    this.messages.forEach(function(msg) {
      const cls = msg.role === 'user' ? 'chat-user' : 'chat-ai';
      html += '<div class="chat-msg ' + cls + '"><div class="chat-bubble">' + AI.esc(msg.content).replace(/\\n/g, '<br>') + '</div></div>';
    });
    container.innerHTML = html;
  },

  // === Panel Rendering ===
  renderPanel() {
    if (!this.panel) return;
    const hasKey = !!this.apiKey;

    this.panel.innerHTML =
      '<div class="ai-panel-header">' +
        '<div class="ai-header-left">' +
          '<span class="ai-icon">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/>' +
            '<path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>' +
            '</svg>' +
          '</span>' +
          '<h3>' + (this.chatMode ? 'AI 对话' : 'AI 智能分析') + '</h3>' +
        '</div>' +
        '<div class="ai-header-actions">' +
          '<button class="ai-header-btn" id="aiChatToggleBtn" title="' + (this.chatMode ? '洞察' : '对话') + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            (this.chatMode
              ? '<path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>'
              : '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>') +
            '</svg>' +
          '</button>' +
          (hasKey
            ? '<button class="ai-header-btn" id="aiKeyBtn" title="更换 Key"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg></button>'
            : '<button class="ai-header-btn" id="aiKeyBtn" title="配置 Key"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></button>') +
        '</div>' +
      '</div>' +
      (hasKey && !this.chatMode ? '<div class="ai-key-status"><span class="ai-key-dot"></span>已连接 DeepSeek</div>' : '') +
      (this.chatMode
        ? '<div class="ai-chat-container">' +
            '<div class="ai-chat-messages" id="aiChatMessages"></div>' +
            '<div class="ai-chat-input-row">' +
              '<input type="text" id="aiChatInput" class="ai-chat-input" placeholder="问 AI 关于任务的问题..." autocomplete="off">' +
              '<button class="ai-chat-send" id="aiChatSendBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
            '</div>' +
          '</div>'
        : '<div class="ai-content" id="aiContent"><div class="ai-empty">' + (hasKey ? '点击分析按钮获取洞察' : '请先配置 API Key') + '</div></div>');

    document.getElementById('aiChatToggleBtn')?.addEventListener('click', function() { AI.toggleChat(); });
    document.getElementById('aiKeyBtn')?.addEventListener('click', function() {
      if (AI.apiKey) { if (confirm('清除已保存的 API Key？')) AI.clearApiKey(); }
      else { AI.getApiKey(); }
    });
    if (this.chatMode) {
      this.renderChatMessages();
      const sendBtn = document.getElementById('aiChatSendBtn');
      const chatInput = document.getElementById('aiChatInput');
      if (sendBtn) sendBtn.addEventListener('click', function() { AI.sendChatMessage(); });
      if (chatInput) chatInput.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); AI.sendChatMessage(); } });
    }
  },

  setPanelState(state) {
    const content = document.getElementById('aiContent');
    if (!content) return;
    if (state === 'analyzing') {
      content.innerHTML = '<div class="ai-analyzing"><div class="ai-spinner"></div><p class="ai-thinking-text">AI 正在分析看板数据...</p><div class="ai-progress-bar"><div class="ai-progress-fill"></div></div></div>';
    }
  },

  renderInsights() {
    const content = document.getElementById('aiContent');
    if (!content) return;
    if (!this.insights || this.insights.length === 0) { content.innerHTML = '<div class="ai-empty">暂无分析结果</div>'; return; }
    let html = '<div class="ai-insights-list">';
    this.insights.forEach(function(insight) {
      html += '<div class="ai-insight insight-' + (insight.type || 'info') + '"><div class="insight-body"><div class="insight-title">' + AI.esc(insight.title) + '</div><div class="insight-detail">' + AI.esc(insight.detail) + '</div></div></div>';
    });
    html += '</div>';
    content.innerHTML = html;
    // Add refresh button in header
    var refreshBtn = document.querySelector('#aiPanel .ai-refresh-btn') || document.createElement('button');
    if (!refreshBtn.parentNode) {
      refreshBtn.className = 'ai-refresh-btn';
      refreshBtn.id = 'aiRefreshBtn';
      refreshBtn.title = '重新分析';
      refreshBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
      document.querySelector('.ai-header-actions')?.prepend(refreshBtn);
      refreshBtn.addEventListener('click', function() { AI.analyzeBoard(); });
    }
  },

  esc(s) { if (!s) return ''; var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
};
