import type { StudentRecord } from '../lib/types';
import { getDisplayScoreForRank } from '../features/rules/scoreRules';

type StudentTableProps = {
  students: StudentRecord[];
};

export function StudentTable({ students }: StudentTableProps) {
  const rankedStudents = [...students].sort((a, b) => {
    const aIndex = a.scores.length - 1;
    const bIndex = b.scores.length - 1;
    const aScore = getDisplayScoreForRank(a.scores[aIndex], a.examStatuses[aIndex]) ?? -1;
    const bScore = getDisplayScoreForRank(b.scores[bIndex], b.examStatuses[bIndex]) ?? -1;
    return bScore - aScore;
  });

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>姓名</th>
            <th>学号</th>
            <th>首考</th>
            <th>末考</th>
            <th>提升</th>
            <th>平均成绩</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {rankedStudents.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.name}</td>
              <td>{student.studentNo}</td>
              <td>{student.firstScore ?? '-'}</td>
              <td>{student.examStatuses.at(-1) === 'absent' ? '缺考' : (student.lastScore ?? '-')}</td>
              <td className={Number(student.improvement ?? 0) >= 0 ? 'positive-text' : 'negative-text'}>
                {student.improvement ?? '-'}
              </td>
              <td>{student.averageScore ?? '-'}</td>
              <td>{student.absentExamNames.length > 0 ? `缺考：${student.absentExamNames.join('、')}` : student.improvementNote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
