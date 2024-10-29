import { User } from '@/types/views/profileView';

export interface WatchProfileViewStatus {
	user: User | null;
  defaultProfilePicture: string;
  audiosCount: number;
  playsCount: number;
  averageRating: number | null;
  followerCount: number;
  bookmarksCount: number;
  isFollowing: boolean;
  isMobile: boolean;
}
