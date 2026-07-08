export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  room?: string;
  dayOfWeek: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 7 = Sun
  startTime: string; // e.g. "14:30"
  endTime: string;   // e.g. "16:00"
  color: string;     // Hex color
}

export interface Task {
  id: string;
  title: string;
  courseId?: string;
  dueDate: string;   // YYYY-MM-DD
  status: 'pending' | 'completed';
  studyIntensity: number; // Focus hours estimated, e.g., 1-5
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  courseId?: string;
}

export interface AIHighlight {
  summary: string;
  keyTakeaways: string[];
  coreConcepts: { name: string; explanation: string }[];
  actionItems: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  aiHighlight?: AIHighlight;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
}

export interface AcademicSettings {
  studentName: string;
  studentEmail: string;
  semesterName: string;
  semesterStart: string;
  semesterEnd: string;
  gpaTarget: number;
  attendanceTarget: number;
  soundTheme: string;
  notificationsEnabled: boolean;
}
