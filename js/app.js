/**
 * Main application entry point.
 * Handles view switching (board / timeline / stats) and nav interactions.
 */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize board
    Board.init();

    // Initialize AI
    AI.init();

    // Setup task form handler
    const form = document.getElementById('taskForm');
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const data = {
          id: document.getElementById('taskId').value,
          columnId: document.getElementById('taskColId').value,
          title: document.getElementById('taskTitle').value.trim(),
          description: document.getElementById('taskDesc').value.trim(),
          priority: document.getElementById('taskPriority').value,
          deadline: document.getElementById('taskDeadline').value,
          tags: document.getElementById('taskTags').value,
        };
        if (!data.title) {
          alert('请输入任务标题');
          return;
        }
        Board.handleFormSubmit(data);
      });
    }

    // View switching
    const viewTitle = document.querySelector('.board-info h2');
    const viewSubtitle = document.getElementById('taskTotal');
    const addBtn = document.getElementById('addTaskBtn');
    const boardContainer = document.getElementById('boardContainer');
    const views = {
      board: document.getElementById('viewBoard'),
      timeline: document.getElementById('viewTimeline'),
      stats: document.getElementById('viewStats'),
    };
    let currentView = 'board';

    // Show a view, hide others
    function switchView(name) {
      currentView = name;
      Object.keys(views).forEach(function(k) {
        if (views[k]) views[k].style.display = (k === name ? '' : 'none');
      });

      // Update header
      const labels = { board: '项目看板', timeline: '时间线视图', stats: '统计概览' };
      if (viewTitle) viewTitle.textContent = labels[name] || '项目看板';

      // Show add button only in board view
      if (addBtn) addBtn.style.display = (name === 'board' ? '' : 'none');

      // Update nav buttons
      document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.view === name);
      });

      // Render view content
      if (name === 'timeline') renderTimeline();
      else if (name === 'stats') renderStats();

      // Update AI
      if (name === 'board' && typeof AI !== 'undefined') AI.analyze();
    }

    // Nav button click handlers
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchView(this.dataset.view);
      });
    });

    // === Timeline View ===
    function renderTimeline() {
      const container = views.timeline;
      if (!container) return;
      const allTasks = [];
      Board.data.columns.forEach(function(col) {
        col.tasks.forEach(function(t) {
          allTasks.push({ task: t, column: col.title });
        });
      });

      if (allTasks.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>暂无任务数据</p></div>';
        return;
      }

      // Sort by deadline (tasks with deadline first, then by deadline)
      allTasks.sort(function(a, b) {
        if (a.task.deadline && !b.task.deadline) return -1;
        if (!a.task.deadline && b.task.deadline) return 1;
        if (a.task.deadline && b.task.deadline) return a.task.deadline.localeCompare(b.task.deadline);
        return a.task.createdAt.localeCompare(b.task.createdAt);
      });

      var html = '<div class="timeline-list">';
      var currentMonth = '';
      allTasks.forEach(function(item) {
        var t = item.task;
        var month = t.deadline ? t.deadline.substring(0, 7) : '未设日期';
        if (month !== currentMonth) {
          currentMonth = month;
          html += '<div class="timeline-month">' + month + '</div>';
        }
        var d = t.deadline ? t.deadline : '--';
        var pClass = t.priority || 'medium';
        html +=
          '<div class="timeline-item">' +
            '<div class="timeline-dot"></div>' +
            '<div class="timeline-card">' +
              '<div class="timeline-card-header">' +
                '<span class="priority-badge priority-' + pClass + '">' + (t.priority || '中') + '</span>' +
                '<span class="timeline-col">' + item.column + '</span>' +
                '<span class="timeline-date">' + d + '</span>' +
              '</div>' +
              '<div class="timeline-card-body">' +
                '<h4>' + Board.escapeHtml(t.title) + '</h4>' +
                (t.description ? '<p>' + Board.escapeHtml(t.description) + '</p>' : '') +
              '</div>' +
              (t.tags && t.tags.length ? '<div class="timeline-tags">' + t.tags.map(function(tag) { return '<span class="tag">' + Board.escapeHtml(tag) + '</span>'; }).join('') + '</div>' : '') +
            '</div>' +
          '</div>';
      });
      html += '</div>';
      container.innerHTML = html;

      if (viewSubtitle) viewSubtitle.textContent = '共 ' + allTasks.length + ' 个任务';
    }

    // === Stats View ===
    function renderStats() {
      var container = views.stats;
      if (!container) return;

      var cols = Board.data.columns;
      var totalTasks = 0;
      var priorityCounts = { high: 0, medium: 0, low: 0 };
      var colCounts = [];
      var doneCount = 0;

      cols.forEach(function(col) {
        colCounts.push({ title: col.title, count: col.tasks.length });
        totalTasks += col.tasks.length;
        if (col.id === 'done') doneCount = col.tasks.length;
        col.tasks.forEach(function(t) {
          var p = t.priority || 'medium';
          if (priorityCounts[p] !== undefined) priorityCounts[p]++;
        });
      });

      var completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

      var html = '<div class="stats-grid">';

      // Summary cards
      var summaryCards = [
        { label: '总任务数', value: totalTasks, color: 'var(--primary)' },
        { label: '已完成', value: doneCount, color: 'var(--success)' },
        { label: '完成率', value: completionRate + '%', color: 'var(--warning)' },
        { label: '待处理', value: totalTasks - doneCount, color: 'var(--danger)' },
      ];
      summaryCards.forEach(function(card) {
        html +=
          '<div class="stat-card">' +
            '<div class="stat-value" style="color:' + card.color + '">' + card.value + '</div>' +
            '<div class="stat-label">' + card.label + '</div>' +
          '</div>';
      });

      // Priority distribution
      html += '<div class="stat-card stat-wide"><div class="stat-chart-title">优先级分布</div><div class="stat-bars">';
      var maxP = Math.max(priorityCounts.high, priorityCounts.medium, priorityCounts.low, 1);
      var bars = [
        { label: '高', count: priorityCounts.high, color: 'var(--danger)' },
        { label: '中', count: priorityCounts.medium, color: 'var(--warning)' },
        { label: '低', count: priorityCounts.low, color: 'var(--low)' },
      ];
      bars.forEach(function(bar) {
        var pct = Math.round((bar.count / maxP) * 100);
        html +=
          '<div class="stat-bar-row">' +
            '<span class="stat-bar-label">' + bar.label + '</span>' +
            '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' + pct + '%;background:' + bar.color + '"></div></div>' +
            '<span class="stat-bar-count">' + bar.count + '</span>' +
          '</div>';
      });
      html += '</div></div>';

      // Column distribution
      html += '<div class="stat-card stat-wide"><div class="stat-chart-title">各列分布</div><div class="stat-bars">';
      var maxC = Math.max.apply(null, colCounts.map(function(c) { return c.count; })) || 1;
      var colColors = ['var(--primary)', 'var(--warning)', 'var(--success)'];
      colCounts.forEach(function(c, i) {
        var pct = Math.round((c.count / maxC) * 100);
        html +=
          '<div class="stat-bar-row">' +
            '<span class="stat-bar-label">' + c.title + '</span>' +
            '<div class="stat-bar-track"><div class="stat-bar-fill" style="width:' + pct + '%;background:' + colColors[i % colColors.length] + '"></div></div>' +
            '<span class="stat-bar-count">' + c.count + '</span>' +
          '</div>';
      });
      html += '</div></div>';

      // Reset demo data button
      html += '<div class="stat-card stat-action">' +
        '<p style="font-size:12px;color:var(--text-muted);margin-bottom:8px">数据不满意？重置为演示数据</p>' +
        '<button class="secondary-btn" onclick="Storage.resetDemoData()">重置演示数据</button></div>';

      html += '</div>';
      container.innerHTML = html;

      if (viewSubtitle) viewSubtitle.textContent = '共 ' + totalTasks + ' 个任务';
    }

    // Export switchView so Board can call it if needed
    window.switchView = switchView;
  });
})();
