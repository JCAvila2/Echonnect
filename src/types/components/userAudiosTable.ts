import { AudioItem } from "../views/searchView";

export interface UserAudiosTableStatus { 
  search: string;
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
