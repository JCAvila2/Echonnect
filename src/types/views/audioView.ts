import { Timestamp } from "firebase/firestore";

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
