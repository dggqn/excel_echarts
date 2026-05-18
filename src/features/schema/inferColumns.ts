import type { ParsedWorkbook, SheetRow, StudentReport } from '../../lib/types';

const scoreKeywords = ['成绩', '分数', '得分', 'score'];
const correctKeywords = ['正确', '对题', '答对', 'correct'];
const averageKeywords = ['平均', '均分', '班级平均', 'avg'];
const examKeywords = ['考试', '测验', '日期', 'exam', 'test'];
const nameKeywords = ['姓名', '学生', 'name'];

export function inferStudentReport(workbook: ParsedWorkbook): StudentReport {
  const sheet = workbook.sheets.find((candidate) => candidate.rows.length > 0);

  if (!sheet) {
    throw new Error('没有找到包含数据的 Sheet。');
  }

  const columns = Object.keys(sheet.rows[0] ?? {});
  const nameColumn = findColumn(columns, nameKeywords);
  const examColumn = findColumn(columns, examKeywords);
  const scoreColumn = findColumn(columns, scoreKeywords);
  const correctColumn = findColumn(columns, correctKeywords);
  const averageColumn = findColumn(columns, averageKeywords);

  if (!examColumn || !scoreColumn) {
    return inferWideStudentReport(sheet.rows, workbook.fileName);
  }

  const firstRow = sheet.rows[0];
  const studentName = toText(nameColumn ? firstRow[nameColumn] : null) || workbook.fileName.replace(/\.[^.]+$/, '');
  const rows = sheet.rows.filter((row) => toText(row[examColumn]) && toNumber(row[scoreColumn]) !== null);

  if (rows.length === 0) {
    throw new Error('没有识别到有效的考试和成绩数据。');
  }

  return {
    studentName,
    exams: rows.map((row) => toText(row[examColumn]) || '未命名考试'),
    scores: rows.map((row) => toNumber(row[scoreColumn]) ?? 0),
    correctCounts: rows.map((row) => (correctColumn ? toNumber(row[correctColumn]) : null)),
    averages: rows.map((row) => (averageColumn ? toNumber(row[averageColumn]) : null)),
  };
}

function inferWideStudentReport(rows: SheetRow[], fileName: string): StudentReport {
  const columns = Object.keys(rows[0] ?? {});
  const nameColumn = findColumn(columns, nameKeywords);
  const numericColumns = columns.filter((column) => rows.some((row) => toNumber(row[column]) !== null));

  if (numericColumns.length < 2) {
    throw new Error('暂未识别到表格结构，请确保至少有考试列和成绩列。');
  }

  const firstStudentRow = rows.find((row) => numericColumns.some((column) => toNumber(row[column]) !== null));
  const averageRow = rows.find((row) => {
    const values = Object.values(row).map((value) => toText(value));
    return values.some((value) => averageKeywords.some((keyword) => value.toLowerCase().includes(keyword)));
  });

  if (!firstStudentRow) {
    throw new Error('没有找到可用于生成趋势图的学生成绩行。');
  }

  const studentName = toText(nameColumn ? firstStudentRow[nameColumn] : null) || fileName.replace(/\.[^.]+$/, '');

  return {
    studentName,
    exams: numericColumns,
    scores: numericColumns.map((column) => toNumber(firstStudentRow[column]) ?? 0),
    correctCounts: numericColumns.map(() => null),
    averages: numericColumns.map((column) => (averageRow ? toNumber(averageRow[column]) : null)),
  };
}

function findColumn(columns: string[], keywords: string[]) {
  return columns.find((column) => {
    const normalized = column.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  });
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(String(value).replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}
