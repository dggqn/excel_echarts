import { useRef } from 'react';
import { ChartPreview } from './ChartPreview';
import { ExportButton } from './ExportButton';
import type { ChartSpec } from '../lib/types';

type ChartCardProps = {
  chart: ChartSpec;
};

export function ChartCard({ chart }: ChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <article className="card chart-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Chart</p>
          <h2>{chart.title}</h2>
          <p className="chart-description">{chart.description}</p>
        </div>
        <ExportButton chartContainerRef={chartRef} fileName={chart.title} />
      </div>
      <ChartPreview ref={chartRef} option={chart.option} />
    </article>
  );
}
