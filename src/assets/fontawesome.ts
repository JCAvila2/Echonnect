import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faCamera,
  faPen,
  faTrash,
  faSortUp,
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeLow,
  faVolumeMute,
  faChartLine,
  faBookmark,
  faSearch,
  faGear,
  faImage,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { faClock, faCalendar, faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';

library.add(
  faCamera,
  faPen,
  faTrash,
  faClock,
  faCalendar,
  faSortUp,
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeLow,
  faVolumeMute,
  faChartLine,
  faBookmark,
  farBookmark,
  faSearch,
  faGear,
  faImage,
  faMagnifyingGlass,
);

export { FontAwesomeIcon };
