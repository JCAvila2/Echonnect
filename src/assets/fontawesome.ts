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
} from '@fortawesome/free-solid-svg-icons';
import { faClock, faCalendar } from '@fortawesome/free-regular-svg-icons';

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
);

export { FontAwesomeIcon };
