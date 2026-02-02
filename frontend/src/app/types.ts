export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  semester?: string;
  rollNumber?: string;
  points?: number;
  notesUploaded?: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  semester: string;
  branch: string;
  uploadedBy: string; // User ID
  uploadedByName: string;
  uploadedByRole: UserRole; // 'student' | 'admin'
  date: string;
  size: string;
  type: 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' | 'IMG';
  downloadUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  branch: 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'ALL';
  registerLink?: string;
  organizerContact?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'Library' | 'Lab' | 'Auditorium' | 'Canteen' | 'Hostel' | 'Sports' | 'Other';
  timings: string;
  description: string;
  locationUrl: string;
  image?: string;
}

export interface Query {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  message: string;
  status: 'Pending' | 'Completed';
  date: string;
}
