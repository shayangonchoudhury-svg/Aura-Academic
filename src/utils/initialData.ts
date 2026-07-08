import { Course, Task, Note, AcademicSettings } from "../types";

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_NOTES: Note[] = [];

export const DEFAULT_SETTINGS: AcademicSettings = {
  studentName: "",
  studentEmail: "",
  semesterName: "",
  semesterStart: "",
  semesterEnd: "",
  gpaTarget: 9.0,
  attendanceTarget: 75,
  soundTheme: "Lo-fi Library Ambience",
  notificationsEnabled: true
};
