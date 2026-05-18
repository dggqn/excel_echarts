import type { SheetRow } from '../lib/types';

type DataPreviewProps = {
  rows: SheetRow[];
};

export function DataPreview({ rows }: DataPreviewProps) {
  const columns = Object.keys(rows[0] ?? {}).slice(0, 12);
  const visibleRows = rows.slice(0, 8);

  if (rows.length === 0) {
    return <p className="muted-text">当前 Sheet 没有可预览的数据。</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${columns.join('-')}`}>
              {columns.map((column) => (
                <td key={column}>{String(row[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="table-note">
        已显示前 {visibleRows.length} 行 / 前 {columns.length} 列，完整解析共 {rows.length} 行。
      </p>
    </div>
  );
}
