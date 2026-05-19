import { useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { ChartPreview } from './ChartPreview';
import { ExportButton } from './ExportButton';
import { buildStudentTrendOption } from '../features/charts/reportCharts';
import type { ExamInfo, StudentRecord } from '../lib/types';

type StudentTrendCarouselProps = {
  exams: ExamInfo[];
  students: StudentRecord[];
  selectedStudentId: string;
  onStudentChange: (studentId: string) => void;
};

export function StudentTrendCarousel({
  exams,
  students,
  selectedStudentId,
  onStudentChange,
}: StudentTrendCarouselProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    students.findIndex((student) => student.id === selectedStudentId),
  );
  const selectedStudent = students[selectedIndex] ?? students[0];
  const option = useMemo(
    () => buildStudentTrendOption(selectedStudent, exams, students),
    [exams, selectedStudent, students],
  );

  const goPrev = () => {
    if (selectedIndex > 0) {
      onStudentChange(students[selectedIndex - 1].id);
    }
  };

  const goNext = () => {
    if (selectedIndex < students.length - 1) {
      onStudentChange(students[selectedIndex + 1].id);
    }
  };

  const exportAllStudents = async () => {
    for (const student of students) {
      await exportStudentTrend(student, exams, students);
    }
  };

  if (!selectedStudent) {
    return null;
  }

  return (
    <section className="card chart-card student-trend-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Student Carousel</p>
          <h2>{selectedStudent.name} - 个人成绩趋势</h2>
          <p className="chart-description">
            横向选择学生，或使用左右箭头翻页查看每位学生的成绩、正确题数与班级平均分对比。
          </p>
        </div>
        <div className="export-actions">
          <ExportButton chartContainerRef={chartRef} fileName={`${selectedStudent.name}-个人成绩趋势`} label="导出当前同学" />
          <button className="secondary-button" type="button" onClick={exportAllStudents}>
            导出所有同学
          </button>
        </div>
      </div>

      <div className="student-carousel">
        <button
          className="carousel-arrow carousel-arrow-left"
          type="button"
          onClick={goPrev}
          disabled={selectedIndex === 0}
          aria-label="上一位学生"
        >
          ‹
        </button>

        <div className="student-carousel-main">
          <div className="student-chip-row" aria-label="学生选择">
            {students.map((student, index) => (
              <button
                className={student.id === selectedStudent.id ? 'student-chip active' : 'student-chip'}
                key={student.id}
                type="button"
                onClick={() => onStudentChange(student.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {student.name}
              </button>
            ))}
          </div>
          <ChartPreview ref={chartRef} option={option} />
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          type="button"
          onClick={goNext}
          disabled={selectedIndex === students.length - 1}
          aria-label="下一位学生"
        >
          ›
        </button>
      </div>
    </section>
  );
}

async function exportStudentTrend(student: StudentRecord, exams: ExamInfo[], students: StudentRecord[]) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1200px';
  container.style.height = '640px';
  document.body.appendChild(container);

  const chart = echarts.init(container, undefined, { renderer: 'canvas' });
  chart.setOption(buildStudentTrendOption(student, exams, students), true);
  await new Promise((resolve) => window.setTimeout(resolve, 80));

  const url = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#f8f5eb',
  });
  const link = document.createElement('a');
  link.href = url;
  link.download = `${student.name}-个人成绩趋势.png`;
  link.click();

  chart.dispose();
  container.remove();
  await new Promise((resolve) => window.setTimeout(resolve, 80));
}
