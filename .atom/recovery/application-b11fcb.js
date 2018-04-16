// Import utilities
import checkIfPC from './utilities/ispc';

// Import local modules
import grainAnimation from './modules/grain-animation';
import contactToggle from './modules/contact-toggle';
import agencyInfo from './modules/agency-info';
import logoScroll from './modules/logo-scroll';
import navScroll from './modules/nav-scroll';

// Call modules in order
checkIfPC.init();
grainAnimation.init();
contactToggle.init();
agencyInfo.init();
logoScroll.init();
navScroll.init();

// Call modules that use breakpoint utility
// breakpoint({navScroll});
