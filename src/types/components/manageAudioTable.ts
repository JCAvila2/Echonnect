import { TableHeader, AudioItem } from "../views/searchView";

export interface ManageAudioTableStatus { 
  search: string;
  headers: TableHeader[];
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
