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
  displayScores: number[];
  correctCounts: Array<number | null>;
  examStatuses: ExamScoreStatus[];
  absentExamNames: string[];
  firstScore: number | null;
  lastScore: number | null;
  improvement: number | null;
  improvementNote: string;
  averageScore: number | null;
};

export type ExamScoreStatus = 'normal' | 'absent' | 'missing';

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

export type ChartVisibilityConfig = {
  studentTrend: boolean;
  classTrend: boolean;
  latestRanking: boolean;
  improvement: boolean;
  scoreBand: boolean;
  analysisPages: boolean;
  studentTable: boolean;
};

export type ChartTypeConfig = {
  studentTrend: 'line' | 'bar' | 'line-bar';
  classTrend: 'bar-line' | 'line' | 'bar';
  latestRanking: 'horizontal-bar' | 'pie';
  improvement: 'horizontal-bar' | 'vertical-bar';
  scoreBand: 'stacked-bar' | 'pie';
};

export type ReportConfig = {
  enabledCharts: ChartVisibilityConfig;
  chartTypes: ChartTypeConfig;
};

export type UploadedReportFile = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'queued' | 'ready' | 'error';
  file?: File;
  report?: ReportPlan;
  error?: string;
  config: ReportConfig;
};

export type ChartOption = EChartsOption;
