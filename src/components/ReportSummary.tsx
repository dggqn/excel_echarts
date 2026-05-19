import type { ReportPlan } from '../lib/types';

type ReportSummaryProps = {
  report: ReportPlan;
};

export function ReportSummary({ report }: ReportSummaryProps) {
  const latestExam = report.exams.at(-1);
  const latestIndex = report.exams.length - 1;
  const latestScores = report.students
    .map((student) => student.scores[latestIndex])
    .filter((score): score is number => score !== null);
  const topStudent = [...report.students]
    .filter((student) => student.scores[latestIndex] !== null)
    .sort((a, b) => Number(b.scores[latestIndex]) - Number(a.scores[latestIndex]))[0];
  const bestImprover = [...report.students]
    .filter((student) => student.improvement !== null)
    .sort((a, b) => Number(b.improvement) - Number(a.improvement))[0];

  return (
    <div className="summary-grid">
      <div className="summary-tile">
        <span>考试次数</span>
        <strong>{report.exams.length}</strong>
        <small>{report.templateName}</small>
      </div>
      <div className="summary-tile">
        <span>学生人数</span>
        <strong>{report.students.length}</strong>
        <small>{report.sheetName}</small>
      </div>
      <div className="summary-tile">
        <span>最近均分</span>
        <strong>{latestExam?.averageScore ?? '-'}</strong>
        <small>{latestExam?.name ?? '暂无考试'}</small>
      </div>
      <div className="summary-tile">
        <span>最高分</span>
        <strong>{latestScores.length ? Math.max(...latestScores) : '-'}</strong>
        <small>{topStudent ? topStudent.name : '暂无数据'}</small>
      </div>
      <div className="summary-tile">
        <span>最大提升</span>
        <strong>{bestImprover?.improvement ?? '-'}</strong>
        <small>{bestImprover ? bestImprover.name : '暂无数据'}</small>
      </div>
    </div>
  );
}
