
export interface Coordinate {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface BackgroundScene {
  id: string;
  name: string;
  url: string;
  description: string;
}

// Add GalleryImage interface to support the Community Gallery component
export interface GalleryImage {
  id: string;
  url: string;
  isStarred: boolean;
  timestamp: number;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  SELECT_BACKGROUND = 'SELECT_BACKGROUND',
  POSITION_ACTORS = 'POSITION_ACTORS',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  DEVELOPER_PORTAL = 'DEVELOPER_PORTAL',
}

export interface ProcessingError {
  message: string;
  type: 'validation' | 'generation' | 'network';
}
