import { AudioItem } from "./searchView";

export interface BookmarksViewStatus { 
  search: string;
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
