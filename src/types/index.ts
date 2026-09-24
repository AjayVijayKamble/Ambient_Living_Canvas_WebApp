export type TransitionType = 
  | 'crossfade' 
  | 'zoom-fade' 
  | 'cinematic' 
  | 'dissolve' 
  | 'blur-fade' 
  | 'light-leak' 
  | 'slide';

export type MotionLevel = 'off' | 'subtle' | 'medium' | 'dynamic';

export type MotionType = 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'panLeft' 
  | 'panRight' 
  | 'panUp' 
  | 'panDown' 
  | 'float';

export type PerformanceMode = 'standard' | 'enhanced' | 'ultra';

export type ParticleType = 
  | 'none' 
  | 'stars' 
  | 'aurora' 
  | 'rain' 
  | 'snow' 
  | 'fireflies' 
  | 'bokeh'
  | 'sakura';

export type SoundscapeType = 
  | 'none' 
  | 'rain' 
  | 'ocean' 
  | 'forest' 
  | 'fireplace' 
  | 'space' 
  | 'cafe' 
  | 'meditation';

export type MediaOrientation = 'landscape' | 'portrait' | 'ultrawide' | 'square';

export type MediaSource = 'unsplash' | 'nasa' | 'wikimedia' | 'local' | 'generated' | 'curated';

export interface FocalPoint {
  x: number; // 0.0 to 1.0
  y: number; // 0.0 to 1.0
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  categories: string[];
  moods: string[];
  location?: string;
  timeOfDay?: string;
  orientation?: MediaOrientation;
  source: MediaSource;
  sourceUrl?: string;
  author?: string;
  authorUrl?: string;
  license?: string;
  width: number;
  height: number;
  type: 'image' | 'video' | 'canvas';
  focalPoint?: FocalPoint;
  particleEffect?: ParticleType;
  suggestedSoundscape?: SoundscapeType;
  colorHint?: string; // hex or hsl for ambient glow
}

export interface Experience {
  id: string;
  name: string;
  tagline: string;
  description: string;
  coverUrl: string;
  mediaIds: string[];
  categories: string[];
  moods: string[];
  transition: TransitionType;
  defaultDuration: number;
  particleEffect?: ParticleType;
  soundscape?: SoundscapeType;
  isFeatured?: boolean;
  isSmartMix?: boolean;
  isCustom?: boolean;
  badge?: string;
  accentColor?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  group: 'mood' | 'location' | 'time' | 'world' | 'lifestyle' | 'nature' | 'mix';
  iconName: string;
  description: string;
  coverUrl: string;
  gradient: string;
  itemCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  mediaIds: string[];
  createdAt: number;
  updatedAt: number;
  coverUrl?: string;
}

export interface UserSettings {
  slideshowDuration: number; // in seconds (5, 10, 15, 30, 60)
  transition: TransitionType;
  motionLevel: MotionLevel;
  performanceMode: PerformanceMode;
  soundscape: SoundscapeType;
  soundVolume: number; // 0.0 - 1.0
  isMuted: boolean;
  showClock: boolean;
  clockFormat: '12h' | '24h';
  showTitleCard: boolean;
  adaptiveMode: boolean;
  journeyMode: boolean;
  journeyIntervalMinutes: number;
  reduceMotion: boolean;
  autoFullscreenOnStart: boolean;
  smartRandomization: boolean;
}

export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  country: string;
  avatarUrl?: string;
  role: UserRole;
  lastSignInAt: string;
  createdAt: string;
}

export interface UserPhoto {
  id: string;
  albumId: string;
  userId: string;
  title: string;
  url: string;
  width: number;
  height: number;
  sortOrder: number;
  createdAt: string;
}

export interface UserAlbum {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverUrl?: string;
  transition: TransitionType;
  defaultDuration: number;
  soundscape: SoundscapeType;
  particleEffect: ParticleType;
  isDefaultScreensaver?: boolean;
  photos: UserPhoto[];
  createdAt: string;
  updatedAt: string;
}

export type FeedbackType = 'query' | 'feedback' | 'feature_request' | 'bug';

export interface UserFeedback {
  id: string;
  userId?: string;
  email: string;
  name?: string;
  type: FeedbackType;
  message: string;
  status: 'new' | 'reviewed' | 'archived';
  createdAt: string;
}

export interface UserAdminView extends UserProfile {
  albumCount: number;
  photoCount: number;
  albums?: UserAlbum[];
}
