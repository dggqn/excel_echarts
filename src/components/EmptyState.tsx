import type { StudentReport } from '../lib/types';

type EmptyStateProps = {
  report: StudentReport;
};

export function EmptyState({ report }: EmptyStateProps) {
  return (
    <div className="empty-grid">
      {report.exams.map((exam, index) => (
        <div className="empty-cell" key={exam}>
          <span>{exam}</span>
          <strong>{report.scores[index]}</strong>
          <small>平均 {report.averages[index] ?? '-'}</small>
        </div>
      ))}
    </div>
  );
}
