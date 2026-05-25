import { AnalysisPager } from './AnalysisPager';
import { ChartCard } from './ChartCard';
import { ChartConfigPanel } from './ChartConfigPanel';
import { ReportSummary } from './ReportSummary';
import { StudentTable } from './StudentTable';
import { StudentTrendCarousel } from './StudentTrendCarousel';
import { filterChartsByConfig } from '../features/config/reportConfig';
import type { ReportConfig, UploadedReportFile } from '../lib/types';

type AnalysisPageProps = {
  files: UploadedReportFile[];
  activeFileId: string | null;
  onActiveFileChange: (fileId: string) => void;
  onBackHome: () => void;
  onExport: () => void;
  onConfigChange: (fileId: string, config: ReportConfig) => void;
  onStudentChange: (fileId: string, studentId: string) => void;
};

export function AnalysisPage({
  files,
  activeFileId,
  onActiveFileChange,
  onBackHome,
  onExport,
  onConfigChange,
  onStudentChange,
}: AnalysisPageProps) {
  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const readyFiles = files.filter((file) => file.status === 'ready' && file.report);

  if (!activeFile) {
    return null;
  }

  const report = activeFile.report;

  return (
    <main className="app-shell">
      <section className="page-header card">
        <div>
          <p className="eyebrow">Step 02 / Analysis</p>
          <h1>表格分析页面</h1>
          <p className="hero-description">切换不同文件，配置要生成的图表类型，确认后进入最终导出结果。</p>
        </div>
        <div className="header-actions">
          <button className="ghost-button" type="button" onClick={onBackHome}>
            返回上传
          </button>
          <button className="primary-button" type="button" onClick={onExport} disabled={!report}>
            导出
          </button>
        </div>
      </section>

      <section className="file-tabs" aria-label="文件切换">
        {files.map((file) => (
          <button
            className={file.id === activeFile.id ? 'file-tab active' : 'file-tab'}
            key={file.id}
            type="button"
            onClick={() => onActiveFileChange(file.id)}
          >
            <span>{file.status === 'ready' ? '已解析' : file.status === 'error' ? '失败' : '待解析'}</span>
            {file.fileName}
          </button>
        ))}
      </section>

      {activeFile.status === 'error' ? (
        <section className="card data-card">
          <p className="eyebrow">Parse Error</p>
          <h2>{activeFile.fileName}</h2>
          <p className="error-line">{activeFile.error}</p>
        </section>
      ) : null}

      {report ? (
        <>
          <section className="card report-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Current File</p>
                <h2>{activeFile.fileName}</h2>
                <p className="chart-description">
                  {report.sheetName} / {report.exams.length} 次考试 / {report.students.length} 名学生
                </p>
              </div>
            </div>
            <ReportSummary report={report} />
          </section>

          <ChartConfigPanel
            config={activeFile.config}
            onConfigChange={(config) => onConfigChange(activeFile.id, config)}
          />

          {activeFile.config.enabledCharts.studentTrend ? (
            <StudentTrendCarousel
              exams={report.exams}
              students={report.students}
              selectedStudentId={report.selectedStudentId}
              chartType={activeFile.config.chartTypes.studentTrend}
              onStudentChange={(studentId) => onStudentChange(activeFile.id, studentId)}
            />
          ) : null}

          <section className="chart-gallery">
            {filterChartsByConfig(report.charts, activeFile.config).map((chart) => (
              <ChartCard chart={chart} key={chart.id} />
            ))}
          </section>

          {activeFile.config.enabledCharts.analysisPages ? (
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

          {activeFile.config.enabledCharts.studentTable ? (
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
        </>
      ) : (
        <section className="card data-card">
          <p className="muted-text">正在等待解析完成。已成功解析 {readyFiles.length} 个文件。</p>
        </section>
      )}
    </main>
  );
}
