export interface User {
  id: string;
  username: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

export type TaskLocationStatus = 'granted' | 'denied' | 'unavailable' | 'low_accuracy';

export interface TaskLocation {
  status: TaskLocationStatus;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  capturedAt: string | null;
}

export interface Task {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  photoUri: string | null;
  location: TaskLocation | null;
  createdAt: string;
}
