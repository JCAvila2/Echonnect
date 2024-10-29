import { AudioItem, TableHeader } from "./searchView";

export interface BookmarksViewStatus { 
  search: string;
  headers: TableHeader[];
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
