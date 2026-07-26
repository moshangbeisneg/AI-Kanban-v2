const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.author = 'AI Kanban Team';
pptx.title = 'AI Kanban - 智能任务管理平台 商业计划书';
pptx.subject = '课程项目商业计划书';

const BLUE = '4F46E5';
const DARK = '1A1D23';
const GRAY = '6B7280';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'F4F5F7';

// === Slide 1: Cover ===
const slide1 = pptx.addSlide();
slide1.background = { fill: BLUE };
slide1.addText('AI Kanban', {
  x: 1, y: 1.8, w: 8, h: 1.2,
  fontSize: 48, fontFace: 'Arial', color: WHITE, bold: true, align: 'center',
});
slide1.addText('智能任务管理平台', {
  x: 1, y: 3.0, w: 8, h: 0.8,
  fontSize: 24, fontFace: 'Arial', color: WHITE, align: 'center',
});
slide1.addText('—— 基于 AI 的团队协作工具', {
  x: 1, y: 3.8, w: 8, h: 0.6,
  fontSize: 16, fontFace: 'Arial', color: 'C7D2FE', align: 'center',
});
slide1.addText('课程项目 · 商业计划书\n2026年7月', {
  x: 1, y: 5.2, w: 8, h: 0.8,
  fontSize: 14, fontFace: 'Arial', color: 'EEF2FF', align: 'center',
});

// === Slide 2: Problem & Solution ===
const slide2 = pptx.addSlide();
slide2.background = { fill: WHITE };
slide2.addText('问题与解决方案', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide2.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

// Problem
slide2.addText('痛点', {
  x: 0.6, y: 1.5, w: 4, h: 0.5,
  fontSize: 18, fontFace: 'Arial', color: DARK, bold: true,
});
const problems = [
  '团队任务分散管理，信息不透明',
  '优先级混乱，重要任务常被延误',
  '缺乏智能分析，决策靠感觉',
  '跨平台工具碎片化，学习成本高',
];
slide2.addText(problems.join('\n'), {
  x: 0.6, y: 2.1, w: 4.2, h: 2.5,
  fontSize: 13, fontFace: 'Arial', color: GRAY, lineSpacing: 22,
});

// VS
slide2.addText('VS', {
  x: 5.0, y: 2.6, w: 1, h: 0.5,
  fontSize: 20, fontFace: 'Arial', color: BLUE, bold: true, align: 'center',
});

// Solution
slide2.addText('我们的方案', {
  x: 6.0, y: 1.5, w: 4, h: 0.5,
  fontSize: 18, fontFace: 'Arial', color: BLUE, bold: true,
});
const solutions = [
  '统一看板，实时同步任务状态',
  'AI 自动优先级排序与风险预警',
  '智能工作负载分析与建议',
  '极简 UI，零学习成本上手',
];
slide2.addText(solutions.join('\n'), {
  x: 6.0, y: 2.1, w: 4.2, h: 2.5,
  fontSize: 13, fontFace: 'Arial', color: DARK, lineSpacing: 22,
});

// === Slide 3: Market Opportunity ===
const slide3 = pptx.addSlide();
slide3.background = { fill: WHITE };
slide3.addText('市场机会', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide3.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

const markets = [
  { label: '全球项目管理软件市场', value: '约 150 亿美元 (2026)', growth: '年增长率 12%' },
  { label: '目标用户群', value: '中小企业、创业团队、远程团队', growth: '5 亿潜在用户' },
  { label: 'AI + 项目管理', value: '新兴蓝海市场', growth: '复合年增长 25%' },
];

markets.forEach((m, i) => {
  const y = 1.6 + i * 1.5;
  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: y, w: 8.8, h: 1.2,
    fill: { color: LIGHT_BG },
    rectRadius: 6,
  });
  slide3.addText(m.label, {
    x: 1.0, y: y + 0.1, w: 3.5, h: 0.4,
    fontSize: 14, fontFace: 'Arial', color: BLUE, bold: true,
  });
  slide3.addText(m.value, {
    x: 1.0, y: y + 0.5, w: 3.5, h: 0.3,
    fontSize: 13, fontFace: 'Arial', color: DARK,
  });
  slide3.addText(m.growth, {
    x: 5.0, y: y + 0.3, w: 4, h: 0.4,
    fontSize: 13, fontFace: 'Arial', color: GRAY,
  });
});

// === Slide 4: Product Features ===
const slide4 = pptx.addSlide();
slide4.background = { fill: WHITE };
slide4.addText('产品功能', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide4.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

const features = [
  { title: '可视化看板', desc: '拖拽式任务管理，三列（待办/进行中/已完成）流程清晰' },
  { title: '智能优先级', desc: 'AI 自动分析任务紧急程度，智能排序建议' },
  { title: '风险预警', desc: '自动检测超期与即将到期任务，提前预警' },
  { title: '工作负载分析', desc: '团队工作量可视化，合理分配任务' },
  { title: '标签分类', desc: '灵活的任务标签系统，支持多维筛选' },
];

features.forEach((f, i) => {
  const y = 1.5 + i * 0.95;
  slide4.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: y, w: 8.8, h: 0.8,
    fill: { color: i % 2 === 0 ? LIGHT_BG : WHITE },
    rectRadius: 4,
  });
  slide4.addText(f.title, {
    x: 1.0, y: y + 0.1, w: 2.5, h: 0.5,
    fontSize: 13, fontFace: 'Arial', color: BLUE, bold: true,
  });
  slide4.addText(f.desc, {
    x: 3.5, y: y + 0.1, w: 5.5, h: 0.5,
    fontSize: 12, fontFace: 'Arial', color: DARK,
  });
});

// === Slide 5: AI Technology ===
const slide5 = pptx.addSlide();
slide5.background = { fill: WHITE };
slide5.addText('AI 技术亮点', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide5.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

slide5.addText('1. 智能任务分析引擎', {
  x: 0.6, y: 1.5, w: 8.8, h: 0.4,
  fontSize: 16, fontFace: 'Arial', color: DARK, bold: true,
});
slide5.addText('基于任务属性（优先级、截止日期、标签）的多维度分析，自动识别高风险项与瓶颈。', {
  x: 0.6, y: 2.0, w: 8.8, h: 0.5,
  fontSize: 13, fontFace: 'Arial', color: GRAY,
});

slide5.addText('2. 实时风险预警系统', {
  x: 0.6, y: 2.7, w: 8.8, h: 0.4,
  fontSize: 16, fontFace: 'Arial', color: DARK, bold: true,
});
slide5.addText('自动检测超期任务、临近截止任务，并提供可操作的处理建议。', {
  x: 0.6, y: 3.2, w: 8.8, h: 0.5,
  fontSize: 13, fontFace: 'Arial', color: GRAY,
});

slide5.addText('3. 工作负载平衡建议', {
  x: 0.6, y: 3.9, w: 8.8, h: 0.4,
  fontSize: 16, fontFace: 'Arial', color: DARK, bold: true,
});
slide5.addText('分析各列任务分布，自动建议任务分配优化方案。', {
  x: 0.6, y: 4.4, w: 8.8, h: 0.5,
  fontSize: 13, fontFace: 'Arial', color: GRAY,
});

// === Slide 6: Business Model ===
const slide6 = pptx.addSlide();
slide6.background = { fill: WHITE };
slide6.addText('商业模式', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide6.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

const models = [
  { tier: '免费版', price: '¥0', target: '个人用户 / 学生', features: '基础看板、5 个项目、基础 AI 分析' },
  { tier: '专业版', price: '¥29/月', target: '小型团队（2-10人）', features: '无限项目、高级 AI 分析、团队协作' },
  { tier: '企业版', price: '¥99/月', target: '中型企业（10-50人）', features: '全部功能、API 接入、私有部署、专属支持' },
];

models.forEach((m, i) => {
  const y = 1.5 + i * 1.5;
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: y, w: 8.8, h: 1.3,
    fill: { color: i === 1 ? 'EEF2FF' : LIGHT_BG },
    line: { color: i === 1 ? BLUE : 'E2E4E8', width: i === 1 ? 2 : 1 },
    rectRadius: 8,
  });
  slide6.addText(m.tier, {
    x: 1.0, y: y + 0.1, w: 2, h: 0.4,
    fontSize: 16, fontFace: 'Arial', color: BLUE, bold: true,
  });
  slide6.addText(m.price, {
    x: 1.0, y: y + 0.5, w: 2, h: 0.4,
    fontSize: 20, fontFace: 'Arial', color: DARK, bold: true,
  });
  slide6.addText(m.target, {
    x: 3.5, y: y + 0.1, w: 2.5, h: 0.4,
    fontSize: 13, fontFace: 'Arial', color: DARK,
  });
  slide6.addText(m.features, {
    x: 3.5, y: y + 0.5, w: 5.5, h: 0.5,
    fontSize: 12, fontFace: 'Arial', color: GRAY,
  });
});

// === Slide 7: Team ===
const slide7 = pptx.addSlide();
slide7.background = { fill: WHITE };
slide7.addText('团队介绍', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide7.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

slide7.addText('我们是一支充满激情的创业团队，致力于用 AI 技术提升团队协作效率。', {
  x: 0.6, y: 1.6, w: 8.8, h: 0.5,
  fontSize: 14, fontFace: 'Arial', color: GRAY,
});

const members = [
  { name: '项目经理', role: '产品规划 & 用户研究' },
  { name: '前端工程师', role: 'UI/UX 设计与前端开发' },
  { name: '后端工程师', role: '后端架构与 AI 算法' },
];

members.forEach((m, i) => {
  const y = 2.5 + i * 1.0;
  slide7.addShape(pptx.ShapeType.roundRect, {
    x: 1 + i * 2.8, y: y, w: 2.5, h: 0.8,
    fill: { color: LIGHT_BG },
    rectRadius: 6,
  });
  slide7.addText(m.name, {
    x: 1 + i * 2.8, y: y + 0.05, w: 2.5, h: 0.35,
    fontSize: 14, fontFace: 'Arial', color: DARK, bold: true, align: 'center',
  });
  slide7.addText(m.role, {
    x: 1 + i * 2.8, y: y + 0.4, w: 2.5, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: GRAY, align: 'center',
  });
});

// === Slide 8: Roadmap ===
const slide8 = pptx.addSlide();
slide8.background = { fill: WHITE };
slide8.addText('发展路线图', {
  x: 0.6, y: 0.4, w: 8.8, h: 0.7,
  fontSize: 28, fontFace: 'Arial', color: DARK, bold: true,
});
slide8.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.1, w: 1.2, h: 0.06, fill: { color: BLUE } });

const phases = [
  { phase: 'Phase 1（当前）', period: '2026 Q3', goals: 'MVP 上线 · 核心看板功能 · AI 基础分析' },
  { phase: 'Phase 2', period: '2026 Q4', goals: '多项目支持 · 团队协作 · 实时同步' },
  { phase: 'Phase 3', period: '2027 Q1', goals: 'AI 增强 · 数据看板 · 第三方集成 API' },
  { phase: 'Phase 4', period: '2027 Q2', goals: '移动端 App · 企业版 · 商业化' },
];

phases.forEach((p, i) => {
  const y = 1.6 + i * 1.1;
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.6, y: y, w: 8.8, h: 0.9,
    fill: { color: i === 0 ? 'EEF2FF' : LIGHT_BG },
    line: { color: i === 0 ? BLUE : 'E2E4E8', width: i === 0 ? 2 : 1 },
    rectRadius: 6,
  });
  slide8.addText(p.phase, {
    x: 1.0, y: y + 0.1, w: 3, h: 0.35,
    fontSize: 14, fontFace: 'Arial', color: BLUE, bold: true,
  });
  slide8.addText(p.period, {
    x: 1.0, y: y + 0.45, w: 2.5, h: 0.3,
    fontSize: 11, fontFace: 'Arial', color: GRAY,
  });
  slide8.addText(p.goals, {
    x: 4.0, y: y + 0.15, w: 5, h: 0.5,
    fontSize: 12, fontFace: 'Arial', color: DARK,
  });
});

// === Slide 9: Contact ===
const slide9 = pptx.addSlide();
slide9.background = { fill: BLUE };
slide9.addText('谢谢！', {
  x: 1, y: 2.0, w: 8, h: 1.0,
  fontSize: 44, fontFace: 'Arial', color: WHITE, bold: true, align: 'center',
});
slide9.addText('欢迎体验 AI Kanban 智能任务管理平台', {
  x: 1, y: 3.2, w: 8, h: 0.6,
  fontSize: 18, fontFace: 'Arial', color: 'C7D2FE', align: 'center',
});
slide9.addText('GitHub: https://github.com/your-org/ai-kanban', {
  x: 1, y: 4.5, w: 8, h: 0.5,
  fontSize: 14, fontFace: 'Arial', color: 'EEF2FF', align: 'center',
});

// Output
const outPath = path.join(__dirname, '..', 'docs', 'AI-Kanban-商业计划书.pptx');
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log('PPT generated: ' + outPath);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
