import { TableHeader, AudioItem } from "../views/searchView";

export interface UserAudiosTableStatus { 
  search: string;
  headers: TableHeader[];
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
