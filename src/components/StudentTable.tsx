import type { StudentRecord } from '../lib/types';

type StudentTableProps = {
  students: StudentRecord[];
};

export function StudentTable({ students }: StudentTableProps) {
  const rankedStudents = [...students].sort((a, b) => Number(b.lastScore ?? -1) - Number(a.lastScore ?? -1));

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
          </tr>
        </thead>
        <tbody>
          {rankedStudents.map((student, index) => (
            <tr key={student.id}>
              <td>{index + 1}</td>
              <td>{student.name}</td>
              <td>{student.studentNo}</td>
              <td>{student.firstScore ?? '-'}</td>
              <td>{student.lastScore ?? '-'}</td>
              <td className={Number(student.improvement ?? 0) >= 0 ? 'positive-text' : 'negative-text'}>
                {student.improvement ?? '-'}
              </td>
              <td>{student.averageScore ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
