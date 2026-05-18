import type { ChartOption, StudentReport } from '../../lib/types';

export function buildStudentTrendOption(report: StudentReport): ChartOption {
  return {
    backgroundColor: 'transparent',
    color: ['#0f6b78', '#c76d1d', '#a43e64'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      top: 8,
      right: 12,
      data: ['学生成绩', '班级平均分', '正确题数'],
    },
    grid: {
      left: 52,
      right: 56,
      top: 64,
      bottom: 82,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: report.exams,
      axisLabel: {
        color: '#53615f',
        rotate: 28,
      },
      axisLine: {
        lineStyle: { color: '#d7dfdc' },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '成绩',
        min: 0,
        max: 110,
        axisLabel: { color: '#0f6b78' },
        splitLine: { lineStyle: { color: '#e8efeb', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '正确题数',
        min: 0,
        max: 25,
        axisLabel: { color: '#a43e64' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '班级平均分',
        type: 'bar',
        data: report.averages,
        barWidth: 28,
        itemStyle: {
          color: 'rgba(199, 109, 29, 0.28)',
          borderRadius: [8, 8, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: '#a85d1c',
          formatter: ({ value }) => (value === null || value === undefined ? '' : String(value)),
        },
      },
      {
        name: '学生成绩',
        type: 'line',
        data: report.scores,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: 'top',
          color: '#0f6b78',
          fontWeight: 700,
        },
        markArea: {
          silent: true,
          itemStyle: { color: 'rgba(43, 126, 77, 0.08)' },
          data:
            report.exams.length > 5
              ? [[{ name: '模考冲刺阶段', xAxis: report.exams[5] }, { xAxis: report.exams.at(-1) }]]
              : [],
        },
      },
      {
        name: '正确题数',
        type: 'line',
        yAxisIndex: 1,
        data: report.correctCounts,
        connectNulls: false,
        symbol: 'rect',
        symbolSize: 10,
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: 'bottom',
          color: '#a43e64',
          fontWeight: 700,
          formatter: ({ value }) => (value === null || value === undefined ? '' : String(value)),
        },
      },
    ],
  };
}
