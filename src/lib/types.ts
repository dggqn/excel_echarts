import type { EChartsOption } from 'echarts';

export type CellValue = string | number | boolean | null;

export type SheetRow = Record<string, CellValue>;

export type SheetMatrix = CellValue[][];

export type ParsedSheet = {
  name: string;
  rows: SheetRow[];
  matrix: SheetMatrix;
};

export type ParsedWorkbook = {
  fileName: string;
  activeSheetName: string;
  sheets: ParsedSheet[];
};

export type StudentReport = {
  studentName: string;
  exams: string[];
  scores: number[];
  correctCounts: Array<number | null>;
  averages: Array<number | null>;
};

export type ExamInfo = {
  id: string;
  name: string;
  scoreColumn: number;
  correctColumn: number;
  averageScore: number | null;
  passRate: number | null;
  excellentRate: number | null;
  midRate: number | null;
  lowRate: number | null;
  analysis: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  studentNo: string;
  scores: Array<number | null>;
  correctCounts: Array<number | null>;
  firstScore: number | null;
  lastScore: number | null;
  improvement: number | null;
  averageScore: number | null;
};

export type ChartSpec = {
  id: string;
  title: string;
  description: string;
  option: ChartOption;
};

export type ReportPlan = {
  title: string;
  sourceFileName: string;
  sheetName: string;
  templateName: string;
  exams: ExamInfo[];
  students: StudentRecord[];
  selectedStudentId: string;
  charts: ChartSpec[];
};

export type ChartOption = EChartsOption;
