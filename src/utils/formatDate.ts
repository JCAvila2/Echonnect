import { Timestamp } from 'firebase/firestore';

export function formatDate(timestamp: Timestamp | null): string {
  if (timestamp) {
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  }
  return '';
};
