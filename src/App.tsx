import { useMemo, useState } from 'react';
import { AnalysisPager } from './components/AnalysisPager';
import { ChartCard } from './components/ChartCard';
import { UploadPanel } from './components/UploadPanel';
import { ReportSummary } from './components/ReportSummary';
import { StudentSelector } from './components/StudentSelector';
import { StudentTable } from './components/StudentTable';
import { parseWorkbook } from './features/excel/parseWorkbook';
import { buildCharts, buildReportPlan } from './features/schema/buildReportPlan';
import type { ReportPlan } from './lib/types';

const sampleExams = [
  '摸底考试（2025.08.01）',
  '暑期结业考（2025.08.22）',
  '模拟考试（2025.10.29）',
  '11月香港留考',
  '期末考试（2026.01.28）',
  '第1次模考（2026.03.19）',
  '第2次模考（2026.04.02）',
  '第3次模考（2026.04.16）',
  '第4次模考（2026.04.23）',
  '第5次模考（2026.05.07）',
];

const sampleStudents = [
  {
    id: '23031',
    name: '龚一宸',
    studentNo: '23031',
    scores: [16, 77, 49, 53, 45, 56, 73, 42, 50, 65],
    correctCounts: [2, 14, 9, null, 7, 9, 13, 6, 9, 13],
  },
  {
    id: '23032',
    name: '赵梓桐',
    studentNo: '23032',
    scores: [45, 93, 79, 67, 79, 82, 85, 91, 100, 100],
    correctCounts: [7, 18, 14, null, 14, 16, 17, 19, 20, 20],
  },
  {
    id: '23037',
    name: '宋天麦',
    studentNo: '23037',
    scores: [56, 91, 86, 71, 74, 100, 92, 86, 85, 94],
    correctCounts: [8, 19, 15, null, 14, 20, 18, 16, 16, 18],
  },
].map((student) => {
  const firstScore = student.scores.find((score) => score !== null) ?? null;
  const lastScore = [...student.scores].reverse().find((score) => score !== null) ?? null;
  const validScores = student.scores.filter((score): score is number => score !== null);

  return {
    ...student,
    firstScore,
    lastScore,
    improvement: firstScore !== null && lastScore !== null ? lastScore - firstScore : null,
    averageScore: Number((validScores.reduce((total, score) => total + score, 0) / validScores.length).toFixed(1)),
  };
});

const sampleReport: ReportPlan = {
  title: '成绩单多图分析报告',
  sourceFileName: '示例成绩单.xlsx',
  sheetName: '成绩表',
  templateName: '成绩单宽表模板',
  selectedStudentId: '23037',
  exams: sampleExams.map((name, index) => ({
    id: `sample-exam-${index + 1}`,
    name,
    correctColumn: index * 2 + 3,
    scoreColumn: index * 2 + 4,
    averageScore: [31, 72.2, 57.5, 58.7, 55.9, 60.7, 65, 64.8, 67.3, 72.5][index],
    passRate: [0, 0.8, 0.4, 0.5, 0.5, 0.5, 0.6, 0.6, 0.6, 0.7][index],
    excellentRate: [0, 0.4, 0.1, 0, 0, 0.2, 0.2, 0.2, 0.4, 0.4][index],
    midRate: [0, 0.4, 0.3, 0.5, 0.5, 0.3, 0.4, 0.4, 0.2, 0.3][index],
    lowRate: [0.6, 0.1, 0.1, 0, 0.3, 0.1, 0.1, 0.1, 0.1, 0][index],
    analysis: [
      '【真题卷：2019年6月香港卷】\n1、考试内容：留考化学全部内容\n2、分析：正式复习前摸底，整体基础较弱。',
      '【阶段测试卷：暑期复习内容检测】\n1、考试内容：基础模块\n2、分析：刚复习过，均分明显提高。',
      '【真题卷：2024年6月香港卷】\n1、考试内容：留考化学全部内容\n2、分析：对比摸底考试已有进步。',
      '【真题卷：2025年11月香港卷】\n1、考试内容：留考化学全部内容\n2、分析：暂未完全复习完，成绩位于中等左右。',
      '【真题卷：2023年6月香港卷】\n1、考试内容：留考化学全部内容\n2、分析：尖子生较少，对知识还不够熟练。',
      '【模拟卷】\n1、考试内容：留考化学全部内容\n2、分析：对比期末考试大部分都有进步。',
      '【模拟卷】\n1、考试内容：留考化学全部内容\n2、分析：中等成绩学生进步明显，进入二轮复习后要加强练习。',
      '【真题卷21年6月】\n1、考试内容：留考化学全部内容\n2、分析：大部分学生成绩稳定，个别学生进步明显。',
      '【真题卷20年11月】\n1、考试内容：留考化学全部内容\n2、分析：大部分学生稳定或稳步提升。',
      '【真题卷21年11月】\n1、考试内容：留考化学全部内容\n2、分析：大部分学生成绩稳定，正确题数稳步提升。',
    ][index],
  })),
  students: sampleStudents,
  charts: [],
};

sampleReport.charts = buildCharts(
  sampleReport.students.find((student) => student.id === sampleReport.selectedStudentId) ?? sampleReport.students[0],
  sampleReport.exams,
  sampleReport.students,
);

function App() {
  const [report, setReport] = useState<ReportPlan>(sampleReport);
  const [status, setStatus] = useState('当前展示的是示例数据，可上传 Excel 替换。');
  const [error, setError] = useState<string | null>(null);

  const selectedStudent = useMemo(
    () => report.students.find((student) => student.id === report.selectedStudentId) ?? report.students[0],
    [report],
  );

  const handleFile = async (file: File) => {
    setError(null);
    setStatus(`正在解析 ${file.name} ...`);

    try {
      const nextWorkbook = await parseWorkbook(file);
      const nextReport = buildReportPlan(nextWorkbook);
      setReport(nextReport);
      setStatus(`已解析 ${file.name}，生成 ${nextReport.charts.length} 张图表和 ${nextReport.exams.length} 页考试分析。`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Excel 解析失败。');
      setStatus('解析失败，请检查文件格式或表头结构。');
    }
  };

  const resetDemo = () => {
    setReport(sampleReport);
    setError(null);
    setStatus('已切换回示例数据。');
  };

  const handleStudentChange = (studentId: string) => {
    setReport((currentReport) => {
      const nextStudent = currentReport.students.find((student) => student.id === studentId);

      if (!nextStudent) {
        return currentReport;
      }

      return {
        ...currentReport,
        selectedStudentId: studentId,
        charts: buildCharts(nextStudent, currentReport.exams, currentReport.students),
      };
    });
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Excel ECharts Report Lab</p>
          <h1>上传 Excel，一键生成可交付的垂直图表报告。</h1>
          <p className="hero-description">
            当前 MVP 以成绩单宽表为标准模板，自动生成多张图表、学生汇总表和可翻页考试分析。
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
            <strong>{report.exams.length} 次考试</strong>
            <p>识别合并表头下的正确题数与成绩列。</p>
          </div>
          <div>
            <span>02</span>
            <strong>{report.charts.length} 张图表</strong>
            <p>个人趋势、班级趋势、排名、提升、分数段。</p>
          </div>
          <div>
            <span>03</span>
            <strong>{report.students.length} 名学生</strong>
            <p>本地解析数据，不上传服务器。</p>
          </div>
        </div>
      </section>

      <section className="card report-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Report Overview</p>
            <h2>{report.title}</h2>
            <p className="chart-description">
              {report.sourceFileName} / {report.sheetName} / 当前个人趋势：{selectedStudent.name}
            </p>
          </div>
          <StudentSelector
            students={report.students}
            selectedStudentId={report.selectedStudentId}
            onChange={handleStudentChange}
          />
        </div>
        <ReportSummary report={report} />
      </section>

      <section className="chart-gallery">
        {report.charts.map((chart) => (
          <ChartCard chart={chart} key={chart.id} />
        ))}
      </section>

      <section className="card data-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Analysis Pages</p>
            <h2>考试情况分析</h2>
          </div>
        </div>
        <AnalysisPager exams={report.exams} />
      </section>

      <section className="card data-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Student Data</p>
            <h2>学生汇总表</h2>
          </div>
        </div>
        <StudentTable students={report.students} />
      </section>
    </main>
  );
}

export default App;
