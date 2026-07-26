/**
 * Data persistence layer using localStorage.
 * Manages tasks and board state.
 */
const Storage = {
  KEY: 'kanban-board-data',

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      const data = JSON.parse(raw);
      if (!data.columns || !data.columns[0].tasks) return this.defaults();
      return data;
    } catch {
      return this.defaults();
    }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  defaults() {
    const today = new Date();
    const fmt = function(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    };
    const addDays = function(d, n) {
      const r = new Date(d);
      r.setDate(r.getDate() + n);
      return r;
    };

    return {
      columns: [
        {
          id: 'todo',
          title: '待办事项',
          tasks: [
            {
              id: 'demo_t1',
              title: '用户注册功能开发',
              description: '实现邮箱注册、手机号注册，包含验证码验证流程',
              priority: 'high',
              deadline: fmt(addDays(today, 3)),
              tags: ['后端', '高优先级'],
              createdAt: fmt(addDays(today, -5)),
            },
            {
              id: 'demo_t2',
              title: '数据库性能优化',
              description: '分析慢查询，添加索引，优化JOIN语句',
              priority: 'medium',
              deadline: fmt(addDays(today, 7)),
              tags: ['后端', '性能'],
              createdAt: fmt(addDays(today, -3)),
            },
            {
              id: 'demo_t3',
              title: '用户手册撰写',
              description: '编写产品使用手册，包含截图和操作说明',
              priority: 'low',
              deadline: '',
              tags: ['文档'],
              createdAt: fmt(addDays(today, -2)),
            },
          ],
        },
        {
          id: 'in-progress',
          title: '进行中',
          tasks: [
            {
              id: 'demo_t4',
              title: '首页UI重构',
              description: '根据设计稿重新布局首页，适配移动端',
              priority: 'high',
              deadline: fmt(addDays(today, 1)),
              tags: ['前端', 'UI'],
              createdAt: fmt(addDays(today, -7)),
            },
            {
              id: 'demo_t5',
              title: 'API接口文档',
              description: '使用Swagger生成RESTful API文档',
              priority: 'medium',
              deadline: fmt(addDays(today, 5)),
              tags: ['后端', '文档'],
              createdAt: fmt(addDays(today, -4)),
            },
          ],
        },
        {
          id: 'done',
          title: '已完成',
          tasks: [
            {
              id: 'demo_t6',
              title: '项目初始化与架构搭建',
              description: '创建项目结构，配置构建工具和代码规范',
              priority: 'high',
              deadline: fmt(addDays(today, -10)),
              tags: ['基建'],
              createdAt: fmt(addDays(today, -14)),
            },
            {
              id: 'demo_t7',
              title: '登录页面开发',
              description: '完成登录/注册页面UI和前后端联调',
              priority: 'high',
              deadline: fmt(addDays(today, -8)),
              tags: ['前端'],
              createdAt: fmt(addDays(today, -12)),
            },
            {
              id: 'demo_t8',
              title: '数据库表结构设计',
              description: '设计用户表、任务表、项目表的ER模型',
              priority: 'medium',
              deadline: fmt(addDays(today, -12)),
              tags: ['后端', '数据库'],
              createdAt: fmt(addDays(today, -15)),
            },
          ],
        },
      ],
    };
  },

  generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  },

  resetDemoData() {
    localStorage.removeItem(this.KEY);
    location.reload();
  },
};
