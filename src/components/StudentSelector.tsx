import type { StudentRecord } from '../lib/types';

type StudentSelectorProps = {
  students: StudentRecord[];
  selectedStudentId: string;
  onChange: (studentId: string) => void;
};

export function StudentSelector({ students, selectedStudentId, onChange }: StudentSelectorProps) {
  return (
    <label className="student-select">
      <span>个人趋势学生</span>
      <select value={selectedStudentId} onChange={(event) => onChange(event.target.value)}>
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}（{student.studentNo}）
          </option>
        ))}
      </select>
    </label>
  );
}
