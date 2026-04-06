export interface Student {
  id: string;
  name: string;
  group: string;
  attendance: string[]; // dates of attendance
  grades: {
    cc?: number;
    efm?: number;
  };
}

export interface AttendanceSession {
  id: string;
  date: string;
  group: string;
  presentStudents: string[]; // student IDs
  isFinalized?: boolean;
  expiresAt?: string; // ISO string
}

export interface Module {
  id: string;
  name: string;
  cours: number;
  tp: number;
  td: number;
  evaluation: number;
}
