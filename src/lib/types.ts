import type { EChartsOption } from 'echarts';

export type CellValue = string | number | boolean | null;

export type SheetRow = Record<string, CellValue>;

export type ParsedSheet = {
  name: string;
  rows: SheetRow[];
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

export type ChartOption = EChartsOption;
