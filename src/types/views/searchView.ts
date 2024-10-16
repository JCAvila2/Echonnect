import { Timestamp } from "firebase/firestore";

export interface AudioItem {
	id: string;
	title: string;
	imageUrl: string;
	audioUrl: string;
	author: string;
	uid: string;
	duration: string;
	createdAt: Timestamp;
	averageRating?: number;
	reproductions: number;
	description?: string;
	tags?: string[];
}

export interface TableHeader {
  title?: string;
  value: string;
  sortable?: boolean;
  width?: string;
}
