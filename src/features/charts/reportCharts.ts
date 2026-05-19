import type { ChartOption, ExamInfo, StudentRecord } from '../../lib/types';
import { getDisplayScoreForRank } from '../rules/scoreRules';

const palette = {
  ink: '#18312d',
  muted: '#53615f',
  teal: '#0f6b78',
  amber: '#c76d1d',
  berry: '#a43e64',
  green: '#2b7e4d',
  grid: '#e8efeb',
};

export function buildStudentTrendOption(
  student: StudentRecord,
  exams: ExamInfo[],
  students: StudentRecord[],
): ChartOption {
  const averages = exams.map((exam) => exam.averageScore);

  return {
    backgroundColor: 'transparent',
    color: [palette.teal, palette.amber, palette.berry],
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { top: 8, right: 12, data: ['学生成绩', '班级平均分', '正确题数'] },
    grid: { left: 52, right: 56, top: 64, bottom: 82, containLabel: true },
    xAxis: {
      type: 'category',
      data: exams.map((exam) => exam.name),
      axisLabel: { color: palette.muted, rotate: 28 },
      axisLine: { lineStyle: { color: '#d7dfdc' } },
    },
    yAxis: [
      {
        type: 'value',
        name: '成绩',
        min: 0,
        max: 110,
        axisLabel: { color: palette.teal },
        splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
      },
      {
        type: 'value',
        name: '正确题数',
        min: 0,
        max: 25,
        axisLabel: { color: palette.berry },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '班级平均分',
        type: 'bar',
        data: averages,
        barWidth: 28,
        itemStyle: { color: 'rgba(199, 109, 29, 0.28)', borderRadius: [8, 8, 0, 0] },
        label: {
          show: true,
          position: 'top',
          color: '#a85d1c',
          formatter: ({ value }) => formatValue(value),
        },
      },
      {
        name: '学生成绩',
        type: 'line',
        data: student.displayScores,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: 'top',
          color: palette.teal,
          fontWeight: 700,
          formatter: ({ dataIndex, value }) => (student.examStatuses[dataIndex] === 'absent' ? '缺考' : formatValue(value)),
        },
        markArea: {
          silent: true,
          itemStyle: { color: 'rgba(43, 126, 77, 0.08)' },
          data: exams.length > 5 ? [[{ name: '模考冲刺阶段', xAxis: exams[5].name }, { xAxis: exams.at(-1)?.name }]] : [],
        },
      },
      {
        name: '正确题数',
        type: 'line',
        yAxisIndex: 1,
        data: student.correctCounts,
        connectNulls: false,
        symbol: 'rect',
        symbolSize: 10,
        lineStyle: { width: 3 },
        label: {
          show: true,
          position: 'bottom',
          color: palette.berry,
          fontWeight: 700,
          formatter: ({ value }) => formatValue(value),
        },
      },
    ],
    graphic: buildFooterGraphic(`样本人数：${students.length} 人`),
  };
}

export function buildClassTrendOption(exams: ExamInfo[]): ChartOption {
  return {
    backgroundColor: 'transparent',
    color: [palette.amber, palette.green, palette.teal],
    tooltip: { trigger: 'axis' },
    legend: { top: 8, right: 12, data: ['平均分', '及格率', '优秀率'] },
    grid: { left: 52, right: 56, top: 64, bottom: 82, containLabel: true },
    xAxis: {
      type: 'category',
      data: exams.map((exam) => exam.name),
      axisLabel: { color: palette.muted, rotate: 28 },
    },
    yAxis: [
      {
        type: 'value',
        name: '分数',
        min: 0,
        max: 110,
        axisLabel: { color: palette.amber },
        splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
      },
      {
        type: 'value',
        name: '比例',
        min: 0,
        max: 100,
        axisLabel: { color: palette.green, formatter: '{value}%' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '平均分',
        type: 'bar',
        data: exams.map((exam) => exam.averageScore),
        barWidth: 28,
        itemStyle: { color: 'rgba(199, 109, 29, 0.32)', borderRadius: [8, 8, 0, 0] },
        label: { show: true, position: 'top', color: '#a85d1c', formatter: ({ value }) => formatValue(value) },
      },
      {
        name: '及格率',
        type: 'line',
        yAxisIndex: 1,
        data: exams.map((exam) => toPercent(exam.passRate)),
        smooth: true,
        lineStyle: { width: 3 },
      },
      {
        name: '优秀率',
        type: 'line',
        yAxisIndex: 1,
        data: exams.map((exam) => toPercent(exam.excellentRate)),
        smooth: true,
        lineStyle: { width: 3 },
      },
    ],
  };
}

export function buildLatestRankingOption(students: StudentRecord[], exams: ExamInfo[]): ChartOption {
  const latestExam = exams.at(-1);
  const latestIndex = exams.length - 1;
  const ranked = [...students]
    .map((student) => ({
      name: student.name,
      score: getDisplayScoreForRank(student.scores[latestIndex], student.examStatuses[latestIndex]),
      status: student.examStatuses[latestIndex],
    }))
    .filter((item): item is { name: string; score: number; status: StudentRecord['examStatuses'][number] } => item.score !== null)
    .sort((a, b) => b.score - a.score);

  return {
    backgroundColor: 'transparent',
    color: [palette.teal],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 32, top: 36, bottom: 36, containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 110,
      axisLabel: { color: palette.muted },
      splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ranked.map((item) => item.name).reverse(),
      axisLabel: { color: palette.ink },
    },
    series: [
      {
        name: latestExam?.name ?? '最近一次考试',
        type: 'bar',
        data: ranked.map((item) => item.score).reverse(),
        barWidth: 18,
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: ({ dataIndex }) => {
            const reversed = ranked.slice().reverse();
            return reversed[dataIndex]?.status === 'absent' ? palette.berry : palette.teal;
          },
        },
        label: {
          show: true,
          position: 'right',
          color: palette.teal,
          fontWeight: 700,
          formatter: ({ dataIndex, value }) => {
            const reversed = ranked.slice().reverse();
            return reversed[dataIndex]?.status === 'absent' ? '缺考' : formatValue(value);
          },
        },
      },
    ],
  };
}

export function buildImprovementOption(students: StudentRecord[]): ChartOption {
  const ranked = [...students]
    .filter((student): student is StudentRecord & { improvement: number } => student.improvement !== null)
    .sort((a, b) => b.improvement - a.improvement);

  return {
    backgroundColor: 'transparent',
    color: [palette.green],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 32, top: 36, bottom: 36, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: palette.muted },
      splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ranked.map((student) => student.name).reverse(),
      axisLabel: { color: palette.ink },
    },
    series: [
      {
        name: '首末提升',
        type: 'bar',
        data: ranked.map((student) => student.improvement).reverse(),
        barWidth: 18,
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: ({ value }) => (Number(value) >= 0 ? palette.green : palette.berry),
        },
        label: { show: true, position: 'right', color: palette.ink, fontWeight: 700 },
      },
    ],
  };
}

export function buildScoreBandOption(exams: ExamInfo[]): ChartOption {
  const normalRates = exams.map((exam) => {
    if (exam.excellentRate === null || exam.midRate === null || exam.lowRate === null) {
      return null;
    }

    const low = exam.lowRate;
    const excellent = exam.excellentRate;
    const mid = exam.midRate;
    const normal = 1 - excellent - mid - low;
    return Number((Math.max(0, normal) * 100).toFixed(2));
  });

  return {
    backgroundColor: 'transparent',
    color: ['#0f6b78', '#5b9a72', '#c76d1d', '#a43e64'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => `${value}%` },
    legend: { top: 8, right: 12, data: ['优秀率', '60~80', '40~60', '低分率'] },
    grid: { left: 52, right: 32, top: 64, bottom: 82, containLabel: true },
    xAxis: {
      type: 'category',
      data: exams.map((exam) => exam.name),
      axisLabel: { color: palette.muted, rotate: 28 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', color: palette.muted },
      splitLine: { lineStyle: { color: palette.grid, type: 'dashed' } },
    },
    series: [
      { name: '优秀率', type: 'bar', stack: 'rate', data: exams.map((exam) => toPercent(exam.excellentRate)) },
      { name: '60~80', type: 'bar', stack: 'rate', data: exams.map((exam) => toPercent(exam.midRate)) },
      { name: '40~60', type: 'bar', stack: 'rate', data: normalRates },
      { name: '低分率', type: 'bar', stack: 'rate', data: exams.map((exam) => toPercent(exam.lowRate)) },
    ],
  };
}

function toPercent(value: number | null) {
  if (value === null) {
    return null;
  }

  return Number((value * 100).toFixed(2));
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value);
}

function buildFooterGraphic(text: string) {
  return {
    type: 'text',
    left: 16,
    bottom: 12,
    style: {
      text,
      fill: '#7a8582',
      fontSize: 12,
    },
  };
}
