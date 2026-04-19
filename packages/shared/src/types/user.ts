export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  billingTier: 'free' | 'patron';
  tasteProfile?: TasteProfile;
  createdAt: string;
  updatedAt: string;
}

export interface TasteProfile {
  topGenres: string[];
  danceability: number;
  energy: number;
  acousticness: number;
}
