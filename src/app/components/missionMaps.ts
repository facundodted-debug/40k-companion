import map55 from '../../imports/WhatsApp_Image_2026-06-08_at_13.06.55.jpeg';
import map56 from '../../imports/WhatsApp_Image_2026-06-08_at_13.06.56.jpeg';
import map56_1 from '../../imports/WhatsApp_Image_2026-06-08_at_13.06.56__1_.jpeg';
import map56_2 from '../../imports/WhatsApp_Image_2026-06-08_at_13.06.56__2_.jpeg';
import map57 from '../../imports/WhatsApp_Image_2026-06-08_at_13.06.57.jpeg';

export const MISSION_MAPS: Record<string, string> = {
  vital: map55,      // hammer — vertical strips
  vanguard: map56,   // diagonal top-left / bottom-right
  crucible: map56_1, // corner arcs
  sweep: map56_2,    // horizontal strips
  dawn: map56_2,     // horizontal strips (same layout family)
  search: map57,     // diagonal — vertical-strip visual, long sight lines
};
