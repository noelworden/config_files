// Import all modules
// _______________________________________________
import MenuHover              from '../modules/menu-hover';
import SmoothScroll           from '../modules/smooth-scroll';
import MobileMenu             from '../modules/mobile-menu';
import MobileMenuBookingPanel from '../modules/mobile-menu-booking-panel';
import MenuBookingPanel       from '../modules/menu-booking-panel';
import MenuBookingDatepicker  from '../modules/menu-booking-datepicker';
import MenuBookingSubmit      from '../modules/menu-booking-form-submit';
import NewsletterSignup       from '../modules/newsletter-signup';
import VideoSwap              from '../modules/video-swap';
import checkpoint             from '../modules/checkpoint';
import breakpoint             from '../utilities/breakpoint';
import filterLink             from '../modules/filter-link';
import googleAnalytics        from '../modules/google-analytics';
import linkPreventer          from '../modules/link-preventer';

// Homepage modules
import homepageMobileScrolling  from '../modules/homepage/homepage-mobile-scrolling';
import homepageDesktopScrolling from '../modules/homepage/homepage-desktop-scrolling';

// Eat and Drink, Events, Temple Court, Rooms
import GalleryModal from '../modules/gallery-modal';

// Rooms
import FloorplanModal from '../modules/floorplan-modal';

// Hotel
import VideoEmbed from '../modules/video-embed';

// Neighborhood
import neighborhoodMap from '../modules/neighborhood-map';

// Posts
import mobileSelectUrl from '../modules/mobile-select-url';

// Rooms
import ViewAmenitiesPanel from '../modules/view-amenities-panel';
import ScrollToFixed from '../modules/rooms-scroll-to-fixed';

// Offers Show
import offerCenter from '../modules/offer-center';


// Controller Generation
import { controller } from '../utilities/savnac';

let ckpoint = checkpoint.bind(this, '.js-waterfall');


// Create Controllers
// _______________________________________________

const universal = controller({
  VideoSwap,
  MenuHover,
  SmoothScroll,
  MobileMenu,
  MobileMenuBookingPanel,
  MenuBookingPanel,
  MenuBookingDatepicker,
  MenuBookingSubmit,
  NewsletterSignup,
  filterLink,
  linkPreventer,
  googleAnalytics,
  breakpoint
});

const pages_homepage = controller({
  homepageMobileScrolling,
  homepageDesktopScrolling
});

const rooms_index = controller({
  GalleryModal,
  FloorplanModal,
  ViewAmenitiesPanel,
  ScrollToFixed,
  ckpoint
});

const pages_eat_and_drink = controller({
  GalleryModal,
  ckpoint
});

const pages_events = controller({
  GalleryModal,
  ckpoint
});

const pages_temple_court = controller({
  GalleryModal,
  ckpoint
});

const pages_hotel = controller({
  VideoEmbed,
  ckpoint
});

const posts_index = controller({
  mobileSelectUrl,
  ckpoint
});

const posts_show = controller({ckpoint});

const pages_neighborhood = controller({
  neighborhoodMap,
  ckpoint
});

const pages_the_bar_room = controller({
  GalleryModal,
  ckpoint
});

const offers_index = controller({ckpoint});
const offers_show = controller({
  ckpoint,
  offerCenter
});


// Export Controllers
// _______________________________________________

export {
  universal,
  pages_homepage,
  pages_eat_and_drink,
  pages_events,
  pages_temple_court,
  pages_hotel,
  rooms_index,
  posts_index,
  posts_show,
  pages_neighborhood,
  pages_the_bar_room,
  offers_index,
  offers_show
};
