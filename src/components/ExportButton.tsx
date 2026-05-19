import * as echarts from 'echarts';

type ExportButtonProps = {
  chartContainerRef: React.RefObject<HTMLDivElement | null>;
  fileName: string;
  label?: string;
};

export function ExportButton({ chartContainerRef, fileName, label = '导出 PNG' }: ExportButtonProps) {
  const exportPng = () => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = echarts.getInstanceByDom(chartContainerRef.current);

    if (!chart) {
      return;
    }

    const url = chart.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#f8f5eb',
    });
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    link.click();
  };

  return (
    <button className="secondary-button" type="button" onClick={exportPng}>
      {label}
    </button>
  );
}
