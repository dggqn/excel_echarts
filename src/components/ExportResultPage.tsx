import { AnalysisPager } from './AnalysisPager';
import { ChartCard } from './ChartCard';
import { ReportSummary } from './ReportSummary';
import { StudentTable } from './StudentTable';
import { StudentTrendCarousel } from './StudentTrendCarousel';
import { filterChartsByConfig, summarizeReportConfig } from '../features/config/reportConfig';
import type { UploadedReportFile } from '../lib/types';

type ExportResultPageProps = {
  file: UploadedReportFile | null;
  onBackAnalysis: () => void;
  onBackHome: () => void;
  onStudentChange: (fileId: string, studentId: string) => void;
};

export function ExportResultPage({ file, onBackAnalysis, onBackHome, onStudentChange }: ExportResultPageProps) {
  if (!file?.report) {
    return (
      <main className="app-shell">
        <section className="card data-card">
          <p className="muted-text">没有可导出的结果，请返回分析页面。</p>
          <div className="footer-actions">
            <button className="ghost-button" type="button" onClick={onBackAnalysis}>
              返回分析
            </button>
          </div>
        </section>
      </main>
    );
  }

  const report = file.report;
  const selectedConfig = summarizeReportConfig(file.config);

  return (
    <main className="app-shell export-page">
      <section className="page-header card">
        <div>
          <p className="eyebrow">Step 03 / Export</p>
          <h1>导出结果页面</h1>
          <p className="hero-description">{file.fileName} 的图表已按当前配置生成，可预览或下载 PDF。</p>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={onBackAnalysis}>
            返回分析
          </button>
          <button className="ghost-button" type="button" onClick={onBackHome}>
            返回首页
          </button>
          <button className="primary-button" type="button" onClick={() => window.print()}>
            预览 / 下载 PDF
          </button>
        </div>
      </section>

      <section className="card report-card export-summary-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected Conditions</p>
            <h2>{file.fileName}</h2>
            <p className="chart-description">以下是本次导出选择的图表类型和内容。</p>
          </div>
        </div>
        <div className="condition-list">
          {selectedConfig.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <div className="print-surface">
        <section className="card report-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Report Overview</p>
              <h2>{report.title}</h2>
              <p className="chart-description">
                {report.sourceFileName} / {report.sheetName} / {report.exams.length} 次考试 / {report.students.length} 名学生
              </p>
            </div>
          </div>
          <ReportSummary report={report} />
        </section>

        {file.config.enabledCharts.studentTrend ? (
          <StudentTrendCarousel
            exams={report.exams}
            students={report.students}
            selectedStudentId={report.selectedStudentId}
            chartType={file.config.chartTypes.studentTrend}
            onStudentChange={(studentId) => onStudentChange(file.id, studentId)}
          />
        ) : null}

        <section className="chart-gallery">
          {filterChartsByConfig(report.charts, file.config).map((chart) => (
            <ChartCard chart={chart} key={chart.id} />
          ))}
        </section>

        {file.config.enabledCharts.analysisPages ? (
          <section className="card data-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Analysis Pages</p>
                <h2>考试情况分析</h2>
              </div>
            </div>
            <AnalysisPager exams={report.exams} />
          </section>
        ) : null}

        {file.config.enabledCharts.studentTable ? (
          <section className="card data-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Student Data</p>
                <h2>学生汇总表</h2>
              </div>
            </div>
            <StudentTable students={report.students} />
          </section>
        ) : null}
      </div>
    </main>
  );
}
