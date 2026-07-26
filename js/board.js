const Board = {
  data: null,
  draggedTask: null,
  draggedFrom: null,
  batchMode: false,
 selectedTasks: new Set(),
  selectedTags: new Set(),

 init() {
   this.data = Storage.load();
   var self = this;
   this.data.columns.forEach(function(col) { self.sortColumn(col); });
   this.render();
   this.bindGlobalEvents();
   this.bindBatchEvents();
 },

  bindGlobalEvents() {
    var addBtn = document.getElementById('addTaskBtn');
    if (addBtn) addBtn.addEventListener('click', function() { Board.showTaskModal(); });
    var modal = document.getElementById('taskModal');
   if (modal) {
     modal.addEventListener('click', function(e) { if (e.target === modal) Board.hideTaskModal(); });
   }
    // Global DnD: make entire page a drop target, detect column by mouse position
    document.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    document.addEventListener('drop', function(e) {
      e.preventDefault();
      var tid = e.dataTransfer.getData('text/plain');
      var from = Board.draggedFrom;
      Board.draggedFrom = null;
      if (!tid || !from) return;
      var cols = document.querySelectorAll('.kanban-column');
      var targetId = null;
      cols.forEach(function(el) {
        var r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          targetId = el.dataset.columnId;
        }
      });
      if (!targetId || targetId === from) return;
      Board.moveTask(tid, from, targetId, 999);
    });
    document.getElementById('sortByPriorityBtn')?.addEventListener('click', function() { Board.sortAllColumns(); });
    document.getElementById('searchInput')?.addEventListener('input', function() { Board.filterTasks(); });
    document.querySelectorAll('.filter-chip').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-chip').forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        Board.filterTasks();
      });
    });
    document.getElementById('clearFiltersBtn')?.addEventListener('click', function() {
      document.getElementById('searchInput').value = '';
      Board.selectedTags.clear();
      var ts = document.getElementById('tagSelect'); if (ts) ts.value = '';
      document.querySelectorAll('.filter-chip').forEach(function(b) { b.classList.remove('active'); });
      document.querySelector('.filter-chip[data-priority=""]')?.classList.add('active');
      Board.filterTasks();
    });
    // Export dropdown
    document.querySelector('.export-trigger')?.addEventListener('click', function(e) {
      e.stopPropagation();
      document.querySelector('.export-dropdown')?.classList.toggle('open');
    });
    document.querySelectorAll('.export-menu button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var fmt = this.dataset.format;
        if (fmt === 'json') Board.exportJSON();
        else if (fmt === 'csv') Board.exportCSV();
        else if (fmt === 'pdf') Board.exportPDF();
        document.querySelector('.export-dropdown')?.classList.remove('open');
      });
    });
   document.addEventListener('click', function() {
     document.querySelector('.export-dropdown')?.classList.remove('open');
   });
    // Tag multi-select dropdown
    document.getElementById('tagMultiBtn')?.addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('tagMulti')?.classList.toggle('open');
    });
    document.getElementById('tagMultiMenu')?.addEventListener('click', function(e) {
      e.stopPropagation();
      var cb = e.target.closest('label')?.querySelector('input');
      if (!cb) return;
      var tag = cb.value;
      if (Board.selectedTags.has(tag)) Board.selectedTags.delete(tag);
      else Board.selectedTags.add(tag);
      Board.refreshTagFilter();
      Board.filterTasks();
    });
    document.addEventListener('click', function(ev) {
      var dd = document.getElementById('tagMulti');
      if (dd && !dd.contains(ev.target)) dd.classList.remove('open');
    });
    // Import
    document.getElementById('importBtn')?.addEventListener('click', function() { document.getElementById('importFileInput')?.click(); });
    document.getElementById('importFileInput')?.addEventListener('change', function(e) { Board.importTasks(e); });
 },
 refreshTagFilter() {
    var menu = document.getElementById('tagMultiMenu');
    if (!menu) return;
    var tags = new Set();
    this.data.columns.forEach(function(col) {
      col.tasks.forEach(function(t) { (t.tags || []).forEach(function(tag) { tags.add(tag); }); });
    });
    var sorted = Array.from(tags).sort();
    if (sorted.length === 0) { menu.innerHTML = ''; return; }
    var html = '';
    sorted.forEach(function(tag) {
      var checked = Board.selectedTags.has(tag) ? 'checked' : '';
      html += '<label><input type="checkbox" value="' + tag + '" ' + checked + '> ' + tag + '</label>';
    });
    menu.innerHTML = html;
    var btn = document.getElementById('tagMultiBtn');
    if (btn) btn.textContent = Board.selectedTags.size > 0 ? '标签 (' + Board.selectedTags.size + ') ▾' : '标签 ▾';
  },

  sortColumn(col) {
    var groups = { high: [], medium: [], low: [] };
    col.tasks.forEach(function(t) {
      var p = t.priority || 'medium';
      if (groups[p]) groups[p].push(t);
    });
    col.tasks = groups.high.concat(groups.medium).concat(groups.low);
  },

  sortAllColumns() {
    var self = this;
    this.data.columns.forEach(function(col) { self.sortColumn(col); });
    this.render();
    if (typeof AI !== 'undefined') AI.analyze();
  },

  filterTasks() {
    var cards = document.querySelectorAll('.task-card');
    var text = (document.getElementById('searchInput')?.value || '').toLowerCase();
    var activeChip = document.querySelector('.filter-chip.active');
    var priority = activeChip ? activeChip.dataset.priority : '';
   var hasFilters = text || priority;
    var hasFilters = text || priority || this.selectedTags.size > 0;
    document.getElementById('clearFiltersBtn').style.display = hasFilters ? '' : 'none';
    cards.forEach(function(card) {
      var show = true;
      if (priority && card.dataset.priority !== priority) show = false;
      if (show && text) {
        var title = (card.querySelector('.task-title')?.textContent || '').toLowerCase();
        var desc = (card.querySelector('.task-desc')?.textContent || '').toLowerCase();
        var tags = (card.querySelector('.card-footer')?.textContent || '').toLowerCase();
       if (title.indexOf(text) === -1 && desc.indexOf(text) === -1 && tags.indexOf(text) === -1) show = false;
     }
      if (show && Board.selectedTags.size > 0) {
        var cardTags = []; card.querySelectorAll('.tag').forEach(function(t) { cardTags.push(t.textContent); });
        var allMatch = true; Board.selectedTags.forEach(function(st) { if (cardTags.indexOf(st) === -1) allMatch = false; });
        if (!allMatch) show = false;
      }
     card.classList.toggle('filtered-out', !show);
    });
    document.querySelectorAll('.kanban-column').forEach(function(col) {
      col.style.display = col.querySelectorAll('.task-card:not(.filtered-out)').length > 0 ? '' : 'none';
    });
  },

  // === Batch ===
  bindBatchEvents() {
    var batchBtn = document.getElementById('batchModeBtn');
    var exitBtn = document.getElementById('batchExitBtn');
    var selectAll = document.getElementById('selectAllCheck');
    var delBtn = document.getElementById('batchDeleteBtn');
    var moveBtn = document.getElementById('batchMoveBtn');
    if (batchBtn) batchBtn.addEventListener('click', function() { Board.toggleBatchMode(); });
    if (exitBtn) exitBtn.addEventListener('click', function() { Board.toggleBatchMode(); });
    if (selectAll) selectAll.addEventListener('change', function() { Board.selectAll(this.checked); });
    if (delBtn) delBtn.addEventListener('click', function() { Board.batchDelete(); });
    if (moveBtn) moveBtn.addEventListener('click', function() { Board.batchMove(); });
  },

  toggleBatchMode() {
    this.batchMode = !this.batchMode;
    if (!this.batchMode) this.selectedTasks.clear();
    document.getElementById('batchToolbar').style.display = this.batchMode ? 'flex' : 'none';
    document.getElementById('batchModeBtn').textContent = this.batchMode ? '取消选择' : '批量操作';
    this.render();
    this.updateBatchUI();
  },

  toggleSelectTask(taskId) {
    if (this.selectedTasks.has(taskId)) this.selectedTasks.delete(taskId);
    else this.selectedTasks.add(taskId);
    this.updateBatchUI();
    var cb = document.querySelector('.task-checkbox[data-task-id="' + taskId + '"]');
    if (cb) cb.checked = this.selectedTasks.has(taskId);
  },

  selectAll(checked) {
    var self = this;
    this.selectedTasks.clear();
    if (checked) {
      this.data.columns.forEach(function(col) { col.tasks.forEach(function(t) { self.selectedTasks.add(t.id); }); });
    }
    this.updateBatchUI();
    document.querySelectorAll('.task-checkbox').forEach(function(cb) { cb.checked = self.selectedTasks.has(cb.dataset.taskId); });
  },

  updateBatchUI() {
    var count = this.selectedTasks.size;
    document.getElementById('batchCount').textContent = '已选 ' + count + ' 个';
    document.getElementById('batchDeleteBtn').disabled = count === 0;
    document.getElementById('batchMoveBtn').disabled = count === 0;
    var total = 0; this.data.columns.forEach(function(c) { total += c.tasks.length; });
    var sa = document.getElementById('selectAllCheck');
    sa.checked = count > 0 && count === total;
    sa.indeterminate = count > 0 && count < total;
  },

  batchDelete() {
    if (this.selectedTasks.size === 0) return;
    if (!confirm('确定要删除选中的 ' + this.selectedTasks.size + ' 个任务吗？')) return;
    var self = this;
    this.data.columns.forEach(function(col) { col.tasks = col.tasks.filter(function(t) { return !self.selectedTasks.has(t.id); }); });
    this.selectedTasks.clear();
    this.render();
    this.updateBatchUI();
    if (typeof AI !== 'undefined') AI.analyze();
  },

  batchMove() {
    var select = document.getElementById('batchMoveSelect');
    var toColId = select ? select.value : '';
    if (!toColId || this.selectedTasks.size === 0) return;
    var self = this;
    var tasksToMove = [];
    this.data.columns.forEach(function(col) {
      col.tasks = col.tasks.filter(function(t) { if (self.selectedTasks.has(t.id)) { tasksToMove.push(t); return false; } return true; });
    });
    var target = this.data.columns.find(function(c) { return c.id === toColId; });
    if (target) target.tasks = target.tasks.concat(tasksToMove);
    this.selectedTasks.clear();
    if (select) select.value = '';
    this.render();
    this.updateBatchUI();
    if (typeof AI !== 'undefined') AI.analyze();
  },

 render() {
   var container = document.getElementById('boardContainer');
   if (!container) return;
   container.innerHTML = '';
   var self = this;
   this.data.columns.forEach(function(col) { container.appendChild(self.createColumn(col)); });
    this.refreshTagFilter();
   var count = 0; this.data.columns.forEach(function(c) { count += c.tasks.length; });
   document.getElementById('taskTotal').textContent = '共 ' + count + ' 个任务';
   this.save();
  },

  createColumn(col) {
    var self = this;
    var colEl = document.createElement('div');
    colEl.className = 'kanban-column';
    colEl.dataset.columnId = col.id;
    var header = document.createElement('div');
    header.className = 'column-header';
    var hh = '<div class="column-title-row">';
    if (this.batchMode) { hh += '<label class="col-select-label"><input type="checkbox" class="col-select-all" data-col-id="' + col.id + '"></label>'; }
    hh += '<h3 class="column-title">' + this.escapeHtml(col.title) + '</h3><span class="task-count">' + col.tasks.length + '</span></div>';
    header.innerHTML = hh;
    header.querySelector('.col-select-all')?.addEventListener('change', function() {
      var c = self.data.columns.find(function(x) { return x.id === this.dataset.colId; });
      if (!c) return;
      c.tasks.forEach(function(t) { if (this.checked) self.selectedTasks.add(t.id); else self.selectedTasks.delete(t.id); });
      self.updateBatchUI();
    });
   var taskList = document.createElement('div');
   taskList.className = 'task-list';
   taskList.dataset.columnId = col.id;
   col.tasks.forEach(function(task) { taskList.appendChild(self.createTaskCard(task, col.id)); });
   colEl.appendChild(header);
   colEl.appendChild(taskList);
   return colEl;
  },

  createTaskCard(task, colId) {
    var card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.taskId = task.id;
    card.dataset.priority = task.priority || 'medium';
    card.draggable = true;
    var pc = task.priority || 'medium';
    var dl = this.getDaysLeft(task.deadline);
    var io = dl < 0;
    var tagsHtml = (task.tags || []).map(function(t) { return '<span class="tag">' + Board.escapeHtml(t) + '</span>'; }).join('');
    var dlHtml = task.deadline ? '<span class="deadline ' + (io ? 'overdue' : '') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' + Board.escapeHtml(task.deadline) + (io ? ' (超时' + Math.abs(dl) + '天)' : dl >= 0 ? ' (剩' + dl + '天)' : '') + '</span>' : '';
    var cbHtml = Board.batchMode ? '<label class="batch-checkbox-label"><input type="checkbox" class="task-checkbox" data-task-id="' + task.id + '" ' + (Board.selectedTasks.has(task.id) ? 'checked' : '') + '></label>' : '';
    card.innerHTML =
      '<div class="card-header">' + cbHtml +
        '<span class="priority-badge priority-' + pc + '">' + (task.priority || '中') + '</span>' +
        '<div class="card-actions">' +
          '<button class="icon-btn" title="上移"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg></button>' +
          '<button class="icon-btn" title="下移"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>' +
          '<button class="icon-btn" title="编辑"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
          '<button class="icon-btn" title="删除"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
        '</div></div>' +
      '<div class="card-body"><h4 class="task-title">' + this.escapeHtml(task.title) + '</h4>' + (task.description ? '<p class="task-desc">' + this.escapeHtml(task.description) + '</p>' : '') + '</div>' +
      '<div class="card-footer">' + dlHtml + tagsHtml + '</div>';

    // Action buttons
    var btns = card.querySelectorAll('.card-actions .icon-btn');
    btns[0]?.addEventListener('click', function(e) { e.stopPropagation(); Board.moveTaskUp(task.id, colId); });
    btns[1]?.addEventListener('click', function(e) { e.stopPropagation(); Board.moveTaskDown(task.id, colId); });
    btns[2]?.addEventListener('click', function(e) { e.stopPropagation(); Board.showTaskModal(task, colId); });
   btns[3]?.addEventListener('click', function(e) { e.stopPropagation(); Board.deleteTask(task.id, colId); });
   // Detail click
    card.addEventListener('click', function(e) {
      if (e.target.closest('button') || e.target.closest('.batch-checkbox-label')) return;
      if (Board.batchMode) return;
      var ct = ''; var co = Board.data.columns.find(function(c) { return c.id === colId; }); if (co) ct = co.title;
      Board.showDetailModal(task, ct);
    });
    // Batch checkbox
    card.querySelector('.task-checkbox')?.addEventListener('click', function(e) { e.stopPropagation(); Board.toggleSelectTask(task.id); });
    // Drag
    card.addEventListener('dragstart', function(e) {
      Board.draggedTask = task.id; Board.draggedFrom = colId;
      e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', function() { card.classList.remove('dragging'); });
    return card;
  },

  showDetailModal(task, colTitle) {
    var modal = document.getElementById('detailModal'); var body = document.getElementById('detailBody');
    if (!modal || !body) return;
    var p = task.priority || 'medium'; var pL = { high: '高', medium: '中', low: '低' };
    var tagH = (task.tags || []).map(function(t) { return '<span class="tag">' + Board.escapeHtml(t) + '</span>'; }).join('');
    body.innerHTML =
      '<div class="detail-row"><div class="detail-section"><div class="detail-label">所属列</div><div class="detail-value">' + Board.escapeHtml(colTitle) + '</div></div>' +
      '<div class="detail-section"><div class="detail-label">优先级</div><div class="detail-value"><span class="priority-badge priority-' + p + '">' + (pL[p] || p) + '</span></div></div>' +
      (task.deadline ? '<div class="detail-section"><div class="detail-label">截止日期</div><div class="detail-value">' + task.deadline + '</div></div>' : '') + '</div>' +
      '<div class="detail-section"><div class="detail-label">任务标题</div><div class="detail-value" style="font-size:16px;font-weight:600">' + Board.escapeHtml(task.title) + '</div></div>' +
      (task.description ? '<div class="detail-section"><div class="detail-label">描述</div><div class="detail-value">' + Board.escapeHtml(task.description) + '</div></div>' : '') +
      (tagH ? '<div class="detail-section"><div class="detail-label">标签</div><div class="detail-tags">' + tagH + '</div></div>' : '') +
      (task.createdAt ? '<div class="detail-section"><div class="detail-label">创建时间</div><div class="detail-value">' + task.createdAt + '</div></div>' : '') +
      '<div class="detail-ai-section"><div class="detail-section"><div class="detail-label">AI 智能分析 <button class="ai-analyze-btn" id="aiAnalyzeTaskBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> 重新分析</button></div><div id="taskAiAnalysis"><span class="ai-mini-hint">点击按钮进行 AI 分析</span></div></div></div>';
    modal.classList.add('show');
    setTimeout(function() {
      if (typeof AI !== 'undefined' && AI.analyzeTask) { AI.analyzeTask(task, colTitle || ''); }
    }, 100);
    var analyzeBtn = document.getElementById('aiAnalyzeTaskBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', function() {
        if (typeof AI !== 'undefined' && AI.analyzeTask) { AI.analyzeTask(task, colTitle || ''); }
      });
    }
  },
  hideDetailModal() { document.getElementById('detailModal')?.classList.remove('show'); },

  showTaskModal(task, colId) {
    var modal = document.getElementById('taskModal'); if (!modal) return;
    document.getElementById('modalTitle').textContent = task ? '编辑任务' : '新建任务';
    document.getElementById('taskId').value = task ? task.id : ''; document.getElementById('taskColId').value = task ? colId : 'todo';
    document.getElementById('taskTitle').value = task ? task.title : ''; document.getElementById('taskDesc').value = task ? (task.description || '') : '';
    document.getElementById('taskPriority').value = task ? (task.priority || 'medium') : 'medium';
    document.getElementById('taskDeadline').value = task ? (task.deadline || '') : ''; document.getElementById('taskTags').value = task ? ((task.tags || []).join(', ')) : '';
    modal.classList.add('show');
  },

  hideTaskModal() { document.getElementById('taskModal')?.classList.remove('show'); },

  handleFormSubmit(data) {
    var task = {
      id: data.id || Storage.generateId(), title: data.title, description: data.description || '',
      priority: data.priority || 'medium', deadline: data.deadline || '',
      tags: data.tags ? data.tags.split(',').map(function(t) { return t.trim(); }).filter(Boolean) : [],
      createdAt: data.id ? undefined : new Date().toISOString().split('T')[0],
    };
    if (data.id) {
      var col = this.data.columns.find(function(c) { return c.id === data.columnId; });
      if (col) { var idx = col.tasks.findIndex(function(t) { return t.id === data.id; }); if (idx >= 0) { task.createdAt = col.tasks[idx].createdAt; col.tasks[idx] = task; } }
    } else {
      var col = this.data.columns.find(function(c) { return c.id === data.columnId; });
      if (col) { col.tasks.push(task); this.sortColumn(col); }
    }
    this.render(); this.hideTaskModal();
  },

  deleteTask(taskId, colId) {
    if (!confirm('确定要删除这个任务吗？')) return;
    var col = this.data.columns.find(function(c) { return c.id === colId; });
    if (col) { col.tasks = col.tasks.filter(function(t) { return t.id !== taskId; }); this.render(); }
  },

  moveTask(taskId, fromColId, toColId, insertIndex) {
    var fromCol = this.data.columns.find(function(c) { return c.id === fromColId; });
    var toCol = this.data.columns.find(function(c) { return c.id === toColId; });
    if (!fromCol || !toCol) return;
    var idx = fromCol.tasks.findIndex(function(t) { return t.id === taskId; });
    if (idx === -1) return;
    var task = fromCol.tasks.splice(idx, 1)[0];
    var ti = Math.min(insertIndex || 999, toCol.tasks.length);
    toCol.tasks.splice(ti, 0, task);
    this.sortColumn(toCol); if (fromColId !== toColId) this.sortColumn(fromCol);
    this.render(); if (typeof AI !== 'undefined') AI.analyze();
  },

  moveTaskUp(taskId, colId) {
    var col = this.data.columns.find(function(c) { return c.id === colId; });
    if (!col) return; var idx = col.tasks.findIndex(function(t) { return t.id === taskId; });
    if (idx <= 0) return;
    if ((col.tasks[idx].priority || 'medium') !== (col.tasks[idx-1].priority || 'medium')) return;
    var t = col.tasks[idx]; col.tasks[idx] = col.tasks[idx-1]; col.tasks[idx-1] = t;
    this.render();
  },

  moveTaskDown(taskId, colId) {
    var col = this.data.columns.find(function(c) { return c.id === colId; });
    if (!col) return; var idx = col.tasks.findIndex(function(t) { return t.id === taskId; });
    if (idx < 0 || idx >= col.tasks.length - 1) return;
    if ((col.tasks[idx].priority || 'medium') !== (col.tasks[idx+1].priority || 'medium')) return;
    var t = col.tasks[idx]; col.tasks[idx] = col.tasks[idx+1]; col.tasks[idx+1] = t;
    this.render();
  },

  exportJSON() {
    var blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'kanban-tasks-' + new Date().toISOString().split('T')[0] + '.json'; a.click();
  },

  exportCSV() {
    var BOM = '\uFEFF';
    var rows = [['所属列','标题','描述','优先级','截止日期','标签','创建时间']];
    this.data.columns.forEach(function(col) {
      col.tasks.forEach(function(t) {
        rows.push([col.title, '"'+(t.title||'').replace(/"/g,'""')+'"', '"'+(t.description||'').replace(/"/g,'""')+'"', t.priority||'medium', t.deadline||'', '"'+((t.tags||[]).join('; '))+'"', t.createdAt||'']);
      });
    });
    var csv = BOM + rows.map(function(r) { return r.join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    a.download = 'kanban-tasks-' + new Date().toISOString().split('T')[0] + '.csv'; a.click();
  },

  exportPDF() {
    var w = window.open('', '_blank');
    if (!w) { alert('请允许弹出窗口'); return; }
    var rows = '';
    this.data.columns.forEach(function(col) {
      col.tasks.forEach(function(t) {
        rows += '<tr><td>'+Board.escapeHtml(col.title)+'</td><td>'+Board.escapeHtml(t.title)+'</td><td>'+(t.priority||'')+'</td><td>'+(t.deadline||'')+'</td><td>'+((t.tags||[]).join(', '))+'</td></tr>';
      });
    });
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kanban 导出</title><style>body{font-family:sans-serif;padding:20px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}th,td{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>Kanban 任务列表 - '+new Date().toISOString().split('T')[0]+'</h1><table><thead><tr><th>所属列</th><th>标题</th><th>优先级</th><th>截止日期</th><th>标签</th></tr></thead><tbody>'+rows+'</tbody></table><script>window.print()<\/script></body></html>');
    w.document.close();
  },

  importTasks(e) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader(); var self = this;
    reader.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data.columns) { alert('无效格式'); return; }
        if (!confirm('导入将覆盖当前所有任务，确定？')) return;
        self.data = data; self.render();
        if (typeof AI !== 'undefined') AI.analyze();
        alert('导入成功');
      } catch(err) { alert('导入失败：'+err.message); }
    };
    reader.readAsText(file); e.target.value = '';
  },

  getDaysLeft(d) { if(!d)return null; var t=new Date();t.setHours(0,0,0,0); var dd=new Date(d);dd.setHours(0,0,0,0); return Math.ceil((dd-t)/(1000*60*60*24)); },
  escapeHtml(s) { var d=document.createElement('div'); d.textContent=s; return d.innerHTML; },
  save() { Storage.save(this.data); },
};


