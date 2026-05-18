import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as echarts from 'echarts';
import type { ChartOption } from '../lib/types';

type ChartPreviewProps = {
  option: ChartOption;
};

export const ChartPreview = forwardRef<HTMLDivElement, ChartPreviewProps>(({ option }, forwardedRef) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = echarts.init(containerRef.current, undefined, { renderer: 'canvas' });
    chart.setOption(option, true);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={containerRef} className="chart-preview" aria-label="ECharts 图表预览" />;
});

ChartPreview.displayName = 'ChartPreview';
