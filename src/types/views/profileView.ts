import { Timestamp } from "firebase/firestore";

export interface ProfileViewState {
	user: User | null;
  defaultProfilePicture: string;
  audiosCount: number;
  playsCount: number;
  averageRating: number | null;
  followerCount: number;
  bookmarksCount: number;
  editingBio: boolean;
  newBio: string;
  bioMaxLength: number;
  file: File | null;
  isUploading: boolean;
  isMobile: boolean;
}

export interface User {
	id: string;
	username: string;
	profilePicture?: string | null | undefined;
	biography?: string | null | undefined;
	createdAt: Timestamp;
}
