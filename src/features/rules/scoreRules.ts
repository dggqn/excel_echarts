import type { ExamInfo, ExamScoreStatus } from '../../lib/types';

export const scoreRules = {
  absentKeywords: ['缺考'] as string[],
  absentDisplayScore: 0,
  fullScore: 100,
  useSourceSummaryFirst: true,
  absentRankingScore: 0,
  absentAffectsTrend: 'display-as-zero',
  absentAffectsImprovement: 'exclude',
  missingCorrectCountAffectsScore: false,
} as const;

export type ParsedScoreCell = {
  rawScore: number | null;
  displayScore: number;
  status: ExamScoreStatus;
  note: string;
};

export function parseScoreCell(value: unknown): ParsedScoreCell {
  const text = toText(value);

  if (scoreRules.absentKeywords.includes(text)) {
    return {
      rawScore: null,
      displayScore: scoreRules.absentDisplayScore,
      status: 'absent',
      note: '缺考，图表按 0 分展示，统计和提升计算不按普通 0 分处理。',
    };
  }

  if (!text) {
    return {
      rawScore: null,
      displayScore: scoreRules.absentDisplayScore,
      status: 'missing',
      note: '成绩缺失',
    };
  }

  const parsed = Number(text.replace('%', ''));

  if (!Number.isFinite(parsed)) {
    return {
      rawScore: null,
      displayScore: scoreRules.absentDisplayScore,
      status: 'missing',
      note: `无法识别成绩：${text}`,
    };
  }

  return {
    rawScore: parsed,
    displayScore: parsed,
    status: 'normal',
    note: parsed >= scoreRules.fullScore ? '满分，按正常成绩计算。' : '',
  };
}

export function parseCorrectCountCell(value: unknown) {
  const text = toText(value);

  if (!text || scoreRules.absentKeywords.includes(text)) {
    return null;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getFirstValidScore(scores: Array<number | null>) {
  return scores.find((score): score is number => score !== null) ?? null;
}

export function getLastValidScore(scores: Array<number | null>) {
  return [...scores].reverse().find((score): score is number => score !== null) ?? null;
}

export function calculateImprovement(scores: Array<number | null>, statuses: ExamScoreStatus[]) {
  const firstValidIndex = scores.findIndex((score, index) => score !== null && statuses[index] === 'normal');
  const lastValidIndex = findLastIndex(scores, (score, index) => score !== null && statuses[index] === 'normal');

  if (firstValidIndex === -1 || lastValidIndex === -1 || firstValidIndex === lastValidIndex) {
    return {
      improvement: null,
      note: '有效考试不足，暂不计算提升。',
    };
  }

  return {
    improvement: Number((Number(scores[lastValidIndex]) - Number(scores[firstValidIndex])).toFixed(1)),
    note:
      statuses[0] === 'absent'
        ? '首考缺考，提升按首个有效成绩到末次有效成绩计算。'
        : '按首个有效成绩到末次有效成绩计算。',
  };
}

export function calculateAverageScore(scores: Array<number | null>) {
  const validScores = scores.filter((score): score is number => score !== null);

  if (validScores.length === 0) {
    return null;
  }

  return Number((validScores.reduce((total, score) => total + score, 0) / validScores.length).toFixed(1));
}

export function getDisplayScoreForRank(score: number | null, status: ExamScoreStatus) {
  if (status === 'absent') {
    return scoreRules.absentRankingScore;
  }

  return score;
}

export function buildAbsentExamNames(exams: ExamInfo[], statuses: ExamScoreStatus[]) {
  return exams.filter((_, index) => statuses[index] === 'absent').map((exam) => exam.name);
}

function toText(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function findLastIndex<T>(items: T[], predicate: (item: T, index: number) => boolean) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index], index)) {
      return index;
    }
  }

  return -1;
}
