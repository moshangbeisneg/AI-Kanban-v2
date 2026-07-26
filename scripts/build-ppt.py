#!/usr/bin/env python3
"""Generate AI Kanban business plan PPTX."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import os

prs = Presentation()
prs.slide_width = Inches(10)
prs.slide_height = Inches(7.5)

BLUE = RGBColor(0x4F, 0x46, 0xE5)
DARK = RGBColor(0x1A, 0x1D, 0x23)
GRAY = RGBColor(0x6B, 0x72, 0x80)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LIGHT_BG = RGBColor(0xF4, 0xF5, 0xF7)
LIGHT_BLUE = RGBColor(0xEE, 0xF2, 0xFF)
LIGHT_GRAY = RGBColor(0xE2, 0xE4, 0xE8)

def add_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def add_text(slide, text, left, top, width, height, size=14, bold=False, color=DARK, align=PP_ALIGN.LEFT, font='Arial'):
    txBox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.font.name = font
    p.alignment = align
    return txBox

def add_shape(slide, left, top, width, height, fill_color=None, line_color=None, line_width=None):
    from pptx.enum.shapes import MSO_SHAPE
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color or WHITE
    if line_color:
        shape.line.color.rgb = line_color
        if line_width:
            shape.line.width = Pt(line_width)
    else:
        shape.line.fill.background()
    return shape

# === Slide 1: Cover ===
slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank
add_bg(slide, BLUE)
add_text(slide, 'AI Kanban', 1, 1.8, 8, 1.2, size=48, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, '智能任务管理平台', 1, 3.0, 8, 0.8, size=24, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, '—— 基于 AI 的团队协作工具', 1, 3.8, 8, 0.6, size=16, color=RGBColor(0xC7, 0xD2, 0xFE), align=PP_ALIGN.CENTER)
add_text(slide, '课程项目 · 商业计划书\n2026年7月', 1, 5.2, 8, 0.8, size=14, color=RGBColor(0xEE, 0xF2, 0xFF), align=PP_ALIGN.CENTER)

# === Slide 2: Problem & Solution ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '问题与解决方案', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

add_text(slide, '痛点', 0.6, 1.5, 4, 0.5, size=18, bold=True)
problems = '• 团队任务分散管理，信息不透明\n• 优先级混乱，重要任务常被延误\n• 缺乏智能分析，决策靠感觉\n• 跨平台工具碎片化，学习成本高'
add_text(slide, problems, 0.6, 2.1, 4.2, 2.5, size=13, color=GRAY)

add_text(slide, 'VS', 5.0, 2.6, 1, 0.5, size=20, bold=True, color=BLUE, align=PP_ALIGN.CENTER)

add_text(slide, '我们的方案', 6.0, 1.5, 4, 0.5, size=18, bold=True, color=BLUE)
solutions = '• 统一看板，实时同步任务状态\n• AI 自动优先级排序与风险预警\n• 智能工作负载分析与建议\n• 极简 UI，零学习成本上手'
add_text(slide, solutions, 6.0, 2.1, 4.2, 2.5, size=13, color=DARK)

# === Slide 3: Market ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '市场机会', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

markets = [
    ('全球项目管理软件市场', '约 150 亿美元 (2026)', '年增长率 12%'),
    ('目标用户群', '中小企业、创业团队、远程团队', '5 亿潜在用户'),
    ('AI + 项目管理', '新兴蓝海市场', '复合年增长 25%'),
]
for i, (label, value, growth) in enumerate(markets):
    y = 1.6 + i * 1.5
    add_shape(slide, 0.6, y, 8.8, 1.2, fill_color=LIGHT_BG)
    add_text(slide, label, 1.0, y + 0.1, 3.5, 0.4, size=14, bold=True, color=BLUE)
    add_text(slide, value, 1.0, y + 0.5, 3.5, 0.3, size=13, bold=True)
    add_text(slide, growth, 5.0, y + 0.3, 4, 0.4, size=13, color=GRAY)

# === Slide 4: Features ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '产品功能', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

features = [
    ('可视化看板', '拖拽式任务管理，三列（待办/进行中/已完成）流程清晰'),
    ('智能优先级', 'AI 自动分析任务紧急程度，智能排序建议'),
    ('风险预警', '自动检测超期与即将到期任务，提前预警'),
    ('工作负载分析', '团队工作量可视化，合理分配任务'),
    ('标签分类', '灵活的任务标签系统，支持多维筛选'),
]
for i, (title, desc) in enumerate(features):
    y = 1.5 + i * 0.95
    add_shape(slide, 0.6, y, 8.8, 0.8, fill_color=LIGHT_BG if i % 2 == 0 else WHITE)
    add_text(slide, title, 1.0, y + 0.1, 2.5, 0.5, size=13, bold=True, color=BLUE)
    add_text(slide, desc, 3.5, y + 0.1, 5.5, 0.5, size=12, color=DARK)

# === Slide 5: AI Technology ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, 'AI 技术亮点', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

techs = [
    ('1. 智能任务分析引擎', '基于任务属性（优先级、截止日期、标签）的多维度分析，自动识别高风险项与瓶颈。'),
    ('2. 实时风险预警系统', '自动检测超期任务、临近截止任务，并提供可操作的处理建议。'),
    ('3. 工作负载平衡建议', '分析各列任务分布，自动建议任务分配优化方案。'),
]
for i, (title, desc) in enumerate(techs):
    y = 1.5 + i * 1.2
    add_text(slide, title, 0.6, y, 8.8, 0.4, size=16, bold=True)
    add_text(slide, desc, 0.6, y + 0.5, 8.8, 0.5, size=13, color=GRAY)

# === Slide 6: Business Model ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '商业模式', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

models = [
    ('免费版', '¥0', '个人用户 / 学生', '基础看板、5 个项目、基础 AI 分析'),
    ('专业版', '¥29/月', '小型团队（2-10人）', '无限项目、高级 AI 分析、团队协作'),
    ('企业版', '¥99/月', '中型企业（10-50人）', '全部功能、API 接入、私有部署、专属支持'),
]
for i, (tier, price, target, features_str) in enumerate(models):
    y = 1.5 + i * 1.5
    fill = LIGHT_BLUE if i == 1 else LIGHT_BG
    add_shape(slide, 0.6, y, 8.8, 1.3, fill_color=fill, line_color=BLUE if i == 1 else LIGHT_GRAY, line_width=2 if i == 1 else 1)
    add_text(slide, tier, 1.0, y + 0.1, 2, 0.4, size=16, bold=True, color=BLUE)
    add_text(slide, price, 1.0, y + 0.5, 2, 0.4, size=20, bold=True)
    add_text(slide, target, 3.5, y + 0.1, 2.5, 0.4, size=13, bold=True)
    add_text(slide, features_str, 3.5, y + 0.5, 5.5, 0.5, size=12, color=GRAY)

# === Slide 7: Team ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '团队介绍', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)
add_text(slide, '我们是一支充满激情的创业团队，致力于用 AI 技术提升团队协作效率。', 0.6, 1.6, 8.8, 0.5, size=14, color=GRAY)

members = [
    ('项目经理', '产品规划 & 用户研究'),
    ('前端工程师', 'UI/UX 设计与前端开发'),
    ('后端工程师', '后端架构与 AI 算法'),
]
for i, (name, role) in enumerate(members):
    x = 1 + i * 2.8
    y = 2.5
    add_shape(slide, x, y, 2.5, 0.8, fill_color=LIGHT_BG)
    add_text(slide, name, x, y + 0.05, 2.5, 0.35, size=14, bold=True, align=PP_ALIGN.CENTER)
    add_text(slide, role, x, y + 0.4, 2.5, 0.3, size=11, color=GRAY, align=PP_ALIGN.CENTER)

# === Slide 8: Roadmap ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, WHITE)
add_text(slide, '发展路线图', 0.6, 0.4, 8.8, 0.7, size=28, bold=True)
add_shape(slide, 0.6, 1.1, 1.2, 0.06, fill_color=BLUE)

phases = [
    ('Phase 1（当前）', '2026 Q3', 'MVP 上线 · 核心看板功能 · AI 基础分析'),
    ('Phase 2', '2026 Q4', '多项目支持 · 团队协作 · 实时同步'),
    ('Phase 3', '2027 Q1', 'AI 增强 · 数据看板 · 第三方集成 API'),
    ('Phase 4', '2027 Q2', '移动端 App · 企业版 · 商业化'),
]
for i, (phase, period, goals) in enumerate(phases):
    y = 1.6 + i * 1.1
    fill = LIGHT_BLUE if i == 0 else LIGHT_BG
    add_shape(slide, 0.6, y, 8.8, 0.9, fill_color=fill, line_color=BLUE if i == 0 else LIGHT_GRAY, line_width=2 if i == 0 else 1)
    add_text(slide, phase, 1.0, y + 0.1, 3, 0.35, size=14, bold=True, color=BLUE)
    add_text(slide, period, 1.0, y + 0.45, 2.5, 0.3, size=11, color=GRAY)
    add_text(slide, goals, 4.0, y + 0.15, 5, 0.5, size=12, color=DARK)

# === Slide 9: Contact ===
slide = prs.slides.add_slide(prs.slide_layouts[6])
add_bg(slide, BLUE)
add_text(slide, '谢谢！', 1, 2.0, 8, 1.0, size=44, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
add_text(slide, '欢迎体验 AI Kanban 智能任务管理平台', 1, 3.2, 8, 0.6, size=18, color=RGBColor(0xC7, 0xD2, 0xFE), align=PP_ALIGN.CENTER)
add_text(slide, 'GitHub: https://github.com/your-org/ai-kanban', 1, 4.5, 8, 0.5, size=14, color=RGBColor(0xEE, 0xF2, 0xFF), align=PP_ALIGN.CENTER)

# Save
out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'docs')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'AI-Kanban-商业计划书.pptx')
prs.save(out_path)
print('PPT generated: ' + out_path)
