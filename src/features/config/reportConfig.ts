import type { ChartSpec, ReportConfig } from '../../lib/types';

export const defaultReportConfig: ReportConfig = {
  enabledCharts: {
    studentTrend: true,
    classTrend: true,
    latestRanking: true,
    improvement: true,
    scoreBand: true,
    analysisPages: true,
    studentTable: true,
  },
  chartTypes: {
    studentTrend: 'line',
    classTrend: 'bar-line',
    latestRanking: 'horizontal-bar',
    improvement: 'horizontal-bar',
    scoreBand: 'stacked-bar',
  },
};

export const chartConfigOptions = [
  {
    key: 'studentTrend',
    title: '学生个人成绩趋势',
    description: '轮播查看每位学生的成绩、正确题数和班级平均分。',
    typeLabel: '趋势类型',
    typeOptions: [
      { value: 'line', label: '折线图' },
      { value: 'bar', label: '柱状图' },
      { value: 'line-bar', label: '折线+柱状' },
    ],
  },
  {
    key: 'classTrend',
    title: '班级平均分与达标率',
    description: '展示平均分、及格率、优秀率的阶段变化。',
    typeLabel: '趋势类型',
    typeOptions: [
      { value: 'bar-line', label: '柱状+折线' },
      { value: 'line', label: '折线图' },
      { value: 'bar', label: '柱状图' },
    ],
  },
  {
    key: 'latestRanking',
    title: '最近一次考试排名',
    description: '查看最近一次考试的学生排名。',
    typeLabel: '排名类型',
    typeOptions: [
      { value: 'horizontal-bar', label: '横向柱状' },
      { value: 'pie', label: '饼状图' },
    ],
  },
  {
    key: 'improvement',
    title: '首末考试提升幅度',
    description: '比较首个有效成绩到末次有效成绩的变化。',
    typeLabel: '对比类型',
    typeOptions: [
      { value: 'horizontal-bar', label: '横向柱状' },
      { value: 'vertical-bar', label: '纵向柱状' },
    ],
  },
  {
    key: 'scoreBand',
    title: '分数段结构变化',
    description: '展示优秀、60~80、40~60、低分段比例。',
    typeLabel: '结构类型',
    typeOptions: [
      { value: 'stacked-bar', label: '堆叠柱状' },
      { value: 'pie', label: '饼状图' },
    ],
  },
  {
    key: 'analysisPages',
    title: '考试情况分析',
    description: '展示 Excel 中每次考试的分析文本。',
    typeLabel: null,
    typeOptions: [],
  },
  {
    key: 'studentTable',
    title: '学生汇总表',
    description: '展示首考、末考、提升、平均成绩和缺考备注。',
    typeLabel: null,
    typeOptions: [],
  },
] as const;

export function cloneDefaultReportConfig(): ReportConfig {
  return {
    enabledCharts: { ...defaultReportConfig.enabledCharts },
    chartTypes: { ...defaultReportConfig.chartTypes },
  };
}

export function filterChartsByConfig(charts: ChartSpec[], config: ReportConfig) {
  return charts.filter((chart) => {
    if (chart.id === 'class-trend') {
      return config.enabledCharts.classTrend;
    }

    if (chart.id === 'latest-ranking') {
      return config.enabledCharts.latestRanking;
    }

    if (chart.id === 'improvement') {
      return config.enabledCharts.improvement;
    }

    if (chart.id === 'score-band') {
      return config.enabledCharts.scoreBand;
    }

    return true;
  });
}

export function summarizeReportConfig(config: ReportConfig) {
  return chartConfigOptions
    .filter((option) => config.enabledCharts[option.key])
    .map((option) => {
      const typeValue = config.chartTypes[option.key as keyof ReportConfig['chartTypes']];
      const typeLabel = option.typeOptions.find((type) => type.value === typeValue)?.label;
      return typeLabel ? `${option.title}：${typeLabel}` : option.title;
    });
}
