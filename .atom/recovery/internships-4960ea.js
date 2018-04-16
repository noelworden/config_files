// Import utilities
import checkIfPC from './utilities/ispc';

// Import local modules
import gradientAnimation from './modules/gradient-animation';
import grainAnimation from './modules/grain-animation';
import internshipGradientBgs from './modules/internship-gradient-bgs';
import drawerToggle from './modules/drawer-toggle';
import smoothScroll from './modules/smooth-scroll';

// Call modules in order
checkIfPC.init();
gradientAnimation.init();
grainAnimation.init();
// internshipGradientBgs.init();
drawerToggle.init();
// smoothScroll.init();

// Call modules that use breakpoint utility
// breakpoint({navScroll});
