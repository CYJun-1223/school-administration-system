import { Subject, TeacherClassSubject, Teacher } from '../models';
import { WorkloadRow } from '../types/Domain';

const compareWorkloadRows = (left: WorkloadRow, right: WorkloadRow): number => {
  const teacherComparison = left.teacherName.localeCompare(
    right.teacherName,
    undefined,
    {
      sensitivity: 'base',
    },
  );
  if (teacherComparison !== 0) {
    return teacherComparison;
  }

  const subjectComparison = left.subjectName.localeCompare(
    right.subjectName,
    undefined,
    {
      sensitivity: 'base',
    },
  );
  if (subjectComparison !== 0) {
    return subjectComparison;
  }

  const emailComparison = left.teacherEmail.localeCompare(
    right.teacherEmail,
    undefined,
    {
      sensitivity: 'base',
    },
  );
  if (emailComparison !== 0) {
    return emailComparison;
  }

  return left.subjectCode.localeCompare(right.subjectCode, undefined, {
    sensitivity: 'base',
  });
};

export const getWorkloadRows = async (): Promise<WorkloadRow[]> => {
  const teacherClassSubjects = await TeacherClassSubject.findAll({
    include: [
      {
        model: Teacher,
        as: 'teacher',
        attributes: ['email', 'name'],
        required: true,
      },
      {
        model: Subject,
        as: 'subject',
        attributes: ['code', 'name'],
        required: true,
      },
    ],
  });

  const workloadMap = new Map<string, WorkloadRow>();

  teacherClassSubjects.forEach((relation) => {
    const teacher = relation.teacher;
    const subject = relation.subject;

    if (!teacher || !subject) {
      return;
    }

    const workloadKey = `${teacher.email}::${subject.code}`;
    const currentSummary = workloadMap.get(workloadKey);

    if (currentSummary) {
      currentSummary.numberOfClasses =
        Number(currentSummary.numberOfClasses) + 1;
      return;
    }

    workloadMap.set(workloadKey, {
      teacherEmail: teacher.email,
      teacherName: teacher.name,
      subjectCode: subject.code,
      subjectName: subject.name,
      numberOfClasses: 1,
    });
  });

  return Array.from(workloadMap.values()).sort(compareWorkloadRows);
};
