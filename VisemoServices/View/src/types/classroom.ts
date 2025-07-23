import { JSX } from "react/jsx-runtime";

export interface Classroom {
  map(arg0: (classroom: any) => JSX.Element): import("react").ReactNode;
  id: number | string;
  className: string;
  teacherName: string;
  activities?: string[];
}

export interface Activity {
  id: number;
  name: string;
  timer: string;
  isStarted: boolean;
  instruction: string;
  createdAt: string;
  classroomId: number;
  isEnded: boolean;
}
