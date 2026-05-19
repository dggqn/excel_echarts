import {
  buildClassTrendOption,
  buildImprovementOption,
  buildLatestRankingOption,
  buildScoreBandOption,
  buildStudentTrendOption,
} from '../charts/reportCharts';
import type { CellValue, ChartSpec, ExamInfo, ParsedWorkbook, ReportPlan, SheetMatrix, StudentRecord } from '../../lib/types';

const summaryLabels = {
  averageScore: '平均分',
  passRate: '及格率',
  excellentRate: '优秀率',
  midRate: '（60~80）',
  lowRate: '低分率',
  analysis: '情况分析',
};

export function buildReportPlan(workbook: ParsedWorkbook): ReportPlan {
  const sheet = workbook.sheets.find((candidate) => candidate.matrix.length >= 3);

  if (!sheet) {
    throw new Error('没有找到符合成绩单模板的 Sheet。');
  }

  const matrix = compactMatrix(sheet.matrix);
  const exams = parseExams(matrix);
  const students = parseStudents(matrix, exams);

  if (exams.length === 0 || students.length === 0) {
    throw new Error('未识别到标准成绩单模板，请检查第 1 行考试、第 2 行正确题数/成绩结构。');
  }

  const selectedStudent = students.find((student) => student.name === '宋天麦') ?? students[0];
  const charts = buildCharts(selectedStudent, exams, students);

  return {
    title: '成绩单多图分析报告',
    sourceFileName: workbook.fileName,
    sheetName: sheet.name,
    templateName: '成绩单宽表模板',
    exams,
    students,
    selectedStudentId: selectedStudent.id,
    charts,
  };
}

export function buildCharts(selectedStudent: StudentRecord, exams: ExamInfo[], students: StudentRecord[]): ChartSpec[] {
  return [
    {
      id: 'student-trend',
      title: `${selectedStudent.name} - 个人成绩趋势`,
      description: '对比个人成绩、正确题数和班级平均分，识别进步与波动。',
      option: buildStudentTrendOption(selectedStudent, exams, students),
    },
    {
      id: 'class-trend',
      title: '班级平均分与达标率趋势',
      description: '观察平均分、及格率和优秀率随考试推进的变化。',
      option: buildClassTrendOption(exams),
    },
    {
      id: 'latest-ranking',
      title: `${exams.at(-1)?.name ?? '最近一次考试'} - 学生成绩排名`,
      description: '展示最近一次考试的学生分布和头部/尾部差距。',
      option: buildLatestRankingOption(students, exams),
    },
    {
      id: 'improvement',
      title: '首末考试提升幅度',
      description: '用第一次和最后一次考试差值衡量每位学生的阶段性变化。',
      option: buildImprovementOption(students),
    },
    {
      id: 'score-band',
      title: '分数段结构变化',
      description: '按优秀、60~80、40~60、低分段拆解每次考试的班级结构。',
      option: buildScoreBandOption(exams),
    },
  ];
}

function parseExams(matrix: SheetMatrix): ExamInfo[] {
  const headerRow = matrix[0] ?? [];
  const subHeaderRow = matrix[1] ?? [];
  const exams: ExamInfo[] = [];

  for (let column = 3; column < headerRow.length; column += 2) {
    const examName = toText(headerRow[column]);
    const correctLabel = toText(subHeaderRow[column]);
    const scoreLabel = toText(subHeaderRow[column + 1]);

    if (!examName || !correctLabel.includes('正确') || !scoreLabel.includes('成绩')) {
      continue;
    }

    exams.push({
      id: `exam-${exams.length + 1}`,
      name: examName,
      correctColumn: column,
      scoreColumn: column + 1,
      averageScore: readSummaryNumber(matrix, summaryLabels.averageScore, column),
      passRate: readSummaryRate(matrix, summaryLabels.passRate, column),
      excellentRate: readSummaryRate(matrix, summaryLabels.excellentRate, column),
      midRate: readSummaryRate(matrix, summaryLabels.midRate, column),
      lowRate: readSummaryRate(matrix, summaryLabels.lowRate, column),
      analysis: readSummaryText(matrix, summaryLabels.analysis, column),
    });
  }

  return exams;
}

function parseStudents(matrix: SheetMatrix, exams: ExamInfo[]): StudentRecord[] {
  return matrix
    .slice(2)
    .filter((row) => isStudentRow(row))
    .map((row) => {
      const scores = exams.map((exam) => toNumber(row[exam.scoreColumn]));
      const correctCounts = exams.map((exam) => toNumber(row[exam.correctColumn]));
      const firstScore = firstNumber(scores);
      const lastScore = lastNumber(scores);
      const validScores = scores.filter((score): score is number => score !== null);

      return {
        id: toText(row[2]) || toText(row[0]) || `student-${toText(row[1])}`,
        name: toText(row[1]) || '未命名学生',
        studentNo: toText(row[2]),
        scores,
        correctCounts,
        firstScore,
        lastScore,
        improvement: firstScore !== null && lastScore !== null ? Number((lastScore - firstScore).toFixed(1)) : null,
        averageScore:
          validScores.length > 0
            ? Number((validScores.reduce((total, score) => total + score, 0) / validScores.length).toFixed(1))
            : null,
      };
    });
}

function compactMatrix(matrix: SheetMatrix): SheetMatrix {
  return matrix.map((row) => {
    let lastValueIndex = -1;
    row.forEach((cell, index) => {
      if (cell !== null && cell !== '') {
        lastValueIndex = index;
      }
    });

    return row.slice(0, lastValueIndex + 1);
  });
}

function isStudentRow(row: CellValue[]) {
  return toNumber(row[0]) !== null && toText(row[1]) !== '' && toText(row[2]) !== '';
}

function readSummaryNumber(matrix: SheetMatrix, label: string, column: number) {
  const row = findSummaryRow(matrix, label);
  return row ? toNumber(row[column]) : null;
}

function readSummaryRate(matrix: SheetMatrix, label: string, column: number) {
  const row = findSummaryRow(matrix, label);
  return row ? toRate(row[column]) : null;
}

function readSummaryText(matrix: SheetMatrix, label: string, column: number) {
  const row = findSummaryRow(matrix, label);
  return row ? toText(row[column]) : '';
}

function findSummaryRow(matrix: SheetMatrix, label: string) {
  return matrix.find((row) => toText(row[0]).includes(label));
}

function firstNumber(values: Array<number | null>) {
  return values.find((value): value is number => value !== null) ?? null;
}

function lastNumber(values: Array<number | null>) {
  return [...values].reverse().find((value): value is number => value !== null) ?? null;
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toNumber(value: unknown) {
  const text = toText(value);

  if (!text || text === '缺考') {
    return null;
  }

  const parsed = Number(text.replace('%', ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function toRate(value: unknown) {
  const text = toText(value);

  if (!text) {
    return null;
  }

  if (text.endsWith('%')) {
    const parsed = Number(text.replace('%', ''));
    return Number.isFinite(parsed) ? parsed / 100 : null;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}
