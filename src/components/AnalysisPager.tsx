import { useMemo, useState } from 'react';
import type { ExamInfo } from '../lib/types';

type AnalysisPagerProps = {
  exams: ExamInfo[];
};

export function AnalysisPager({ exams }: AnalysisPagerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const currentExam = exams[currentPage];
  const progress = useMemo(() => `${currentPage + 1} / ${exams.length}`, [currentPage, exams.length]);

  if (!currentExam) {
    return <p className="muted-text">暂无考试分析数据。</p>;
  }

  const goPrev = () => setCurrentPage((page) => Math.max(0, page - 1));
  const goNext = () => setCurrentPage((page) => Math.min(exams.length - 1, page + 1));

  return (
    <div className="analysis-layout">
      <aside className="analysis-tabs" aria-label="考试分析分页">
        {exams.map((exam, index) => (
          <button
            className={index === currentPage ? 'analysis-tab active' : 'analysis-tab'}
            key={exam.id}
            type="button"
            onClick={() => setCurrentPage(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {exam.name}
          </button>
        ))}
      </aside>

      <article className="analysis-page">
        <div className="analysis-page-head">
          <div>
            <p className="eyebrow">Analysis Page {progress}</p>
            <h2>{currentExam.name}</h2>
          </div>
          <div className="pager-actions">
            <button className="secondary-button" type="button" onClick={goPrev} disabled={currentPage === 0}>
              上一页
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={goNext}
              disabled={currentPage === exams.length - 1}
            >
              下一页
            </button>
          </div>
        </div>

        <div className="analysis-metrics">
          <Metric label="平均分" value={currentExam.averageScore} />
          <Metric label="及格率" value={formatRate(currentExam.passRate)} />
          <Metric label="优秀率" value={formatRate(currentExam.excellentRate)} />
          <Metric label="低分率" value={formatRate(currentExam.lowRate)} />
        </div>

        <div className="analysis-text">
          {(currentExam.analysis || '暂无分析内容。').split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value ?? '-'}</strong>
    </div>
  );
}

function formatRate(value: number | null) {
  if (value === null) {
    return null;
  }

  return `${(value * 100).toFixed(0)}%`;
}
