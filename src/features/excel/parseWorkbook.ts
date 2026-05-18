import * as XLSX from 'xlsx';
import type { ParsedWorkbook, SheetRow } from '../../lib/types';

export async function parseWorkbook(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  if (workbook.SheetNames.length === 0) {
    throw new Error('文件中没有可读取的 Sheet。');
  }

  const sheets = workbook.SheetNames.map((name) => {
    const worksheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<SheetRow>(worksheet, {
      defval: null,
      raw: false,
    });

    return { name, rows };
  });

  return {
    fileName: file.name,
    activeSheetName: workbook.SheetNames[0],
    sheets,
  };
}
