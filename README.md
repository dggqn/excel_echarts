# Excel ECharts Report Lab

一个用于验证「Excel 上传后自动生成垂直场景图表/报告」的 React 原型。

## 技术栈

- Vite + React + TypeScript
- SheetJS CE 解析 Excel
- Apache ECharts 渲染图表
- 浏览器本地处理文件，首版不依赖后端

## 本地运行

```bash
npm install
npm run dev
```

## 构建验证

```bash
npm run build
```

## MVP 方向

第一阶段聚焦「成绩 Excel -> 学生成绩趋势图」：

- 上传 `.xlsx` / `.xls` / `.csv`
- 预览 Sheet 数据
- 自动推断考试、成绩、正确题数等字段
- 生成 ECharts 趋势图
- 导出 PNG
