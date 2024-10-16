import { Timestamp } from "firebase/firestore";

export interface User {
	id: string;
	username: string;
	profilePicture?: string | null | undefined;
	biography?: string | null | undefined;
	createdAt: Timestamp;
}
