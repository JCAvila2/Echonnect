import { AudioItem } from "../views/searchView";

export interface ManageAudioTableStatus { 
  search: string;
  listOfAudios: AudioItem[];
  isMobile: boolean;
}
