import { useMemo, useRef, useState } from 'react';
import { ChartPreview } from './components/ChartPreview';
import { DataPreview } from './components/DataPreview';
import { EmptyState } from './components/EmptyState';
import { ExportButton } from './components/ExportButton';
import { UploadPanel } from './components/UploadPanel';
import { buildStudentTrendOption } from './features/charts/studentTrendOption';
import { parseWorkbook } from './features/excel/parseWorkbook';
import { inferStudentReport } from './features/schema/inferColumns';
import type { ParsedWorkbook, StudentReport } from './lib/types';

const sampleReport: StudentReport = {
  studentName: '宋天麦',
  exams: [
    '摸底考试',
    '暑期结业考',
    '模拟考试',
    '11月香港留考',
    '期末考试',
    '第1次模考',
    '第2次模考',
    '第3次模考',
    '第4次模考',
    '第5次模考',
  ],
  scores: [56, 91, 86, 71, 74, 100, 92, 86, 85, 94],
  correctCounts: [8, 19, 15, null, 14, 20, 18, 16, 16, 18],
  averages: [31, 72.2, 57.5, 58.7, 55.9, 60.7, 65, 64.8, 67.3, 72.5],
};

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
  const [report, setReport] = useState<StudentReport>(sampleReport);
  const [status, setStatus] = useState('当前展示的是示例数据，可上传 Excel 替换。');
  const [error, setError] = useState<string | null>(null);

  const chartOption = useMemo(() => buildStudentTrendOption(report), [report]);

  const handleFile = async (file: File) => {
    setError(null);
    setStatus(`正在解析 ${file.name} ...`);

    try {
      const nextWorkbook = await parseWorkbook(file);
      const inferred = inferStudentReport(nextWorkbook);
      setWorkbook(nextWorkbook);
      setReport(inferred);
      setStatus(`已解析 ${file.name}，生成 ${inferred.studentName} 的趋势图。`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Excel 解析失败。');
      setStatus('解析失败，请检查文件格式或表头结构。');
    }
  };

  const resetDemo = () => {
    setWorkbook(null);
    setReport(sampleReport);
    setError(null);
    setStatus('已切换回示例数据。');
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Excel ECharts Report Lab</p>
          <h1>上传 Excel，一键生成可交付的垂直图表报告。</h1>
          <p className="hero-description">
            首版聚焦成绩分析场景：浏览器本地解析表格，自动生成学生趋势图，后续可扩展到销售、
            财务、运营等细分报告。
          </p>
          <div className="hero-actions">
            <UploadPanel onFileSelected={handleFile} />
            <button className="ghost-button" type="button" onClick={resetDemo}>
              查看示例
            </button>
          </div>
          <p className="status-line">{status}</p>
          {error ? <p className="error-line">{error}</p> : null}
        </div>

        <div className="metric-stack" aria-label="产品验证指标">
          <div>
            <span>01</span>
            <strong>纯前端 MVP</strong>
            <p>文件不上传服务器，降低试用门槛。</p>
          </div>
          <div>
            <span>02</span>
            <strong>模板化图表</strong>
            <p>先把成绩趋势图做深，再横向扩展。</p>
          </div>
          <div>
            <span>03</span>
            <strong>后端可插拔</strong>
            <p>需要批量导出或 AI 解读时再接服务端。</p>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="card chart-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Chart Preview</p>
              <h2>{report.studentName} - 历次考试趋势</h2>
            </div>
            <ExportButton chartContainerRef={chartRef} fileName={`${report.studentName}-成绩趋势图`} />
          </div>
          <ChartPreview ref={chartRef} option={chartOption} />
        </div>

        <aside className="card insight-card">
          <p className="eyebrow">MVP Pipeline</p>
          <h2>工具链路</h2>
          <ol>
            <li>上传 Excel / CSV</li>
            <li>解析 Sheet 并预览数据</li>
            <li>推断考试、成绩、正确题数、平均分字段</li>
            <li>生成 ECharts option</li>
            <li>导出 PNG，后续扩展 PDF / PPT</li>
          </ol>
        </aside>
      </section>

      <section className="card data-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Data Preview</p>
            <h2>{workbook ? `${workbook.fileName} / ${workbook.activeSheetName}` : '示例数据结构'}</h2>
          </div>
        </div>
        {workbook ? <DataPreview rows={workbook.sheets[0]?.rows ?? []} /> : <EmptyState report={report} />}
      </section>
    </main>
  );
}

export default App;
