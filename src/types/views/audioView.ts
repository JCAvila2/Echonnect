import { OrderByDirection, Timestamp } from "firebase/firestore";
import { formatDate } from "@/utils/formatDate";
import { AudioItem } from "./searchView";
import { User } from "firebase/auth";
import { User as CustomUser } from "./profileView";

export interface AudioViewState {
  formatDate: typeof formatDate;
  router: any;
  user: User | null;
  audio: AudioItem | null;
  author: CustomUser | null;
  comments: Comment[] | null;
  totalComments: number;
  totalBookmarks: number;
  displayedComments: number;
  currentLimit: number;
  showMoreButton: boolean;
  newComment: string;
  replyingTo: string | null | undefined;
  replyContent: string;
  sortOrder: OrderByDirection;
  userRating: number;
  hoverRating: number | null;
  isExpanded: boolean;
  shortDescriptionLength: number;
  isBookmarked: boolean;
}

export interface Comment {
  id?: string;
  audioId: string;
  content: string;
  parentId?: string | null;
  timestamp: Timestamp;
  uid: string;
  userProfilePicture?: string | null;
  username: string;
  replies?: Comment[];
}
