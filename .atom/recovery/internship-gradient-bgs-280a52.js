// ==================================================
//
// Nav Scroll
//
// ==================================================
import { throttle, debounce, elementIndex } from './../utilities/savnac';
import {forEach, map} from 'lodash'
import { TweenMax, Linear } from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import gradientAnimation from './gradient-animation';
import checkMobileDevice from './../utilities/ismobiledevice';

const internshipGradientBgs = () => {
  const props = {
    isEnabled: false,
    onWindowScroll: null,
    onWindowResize: null,
    sectionLength: 0,
    gradientWidth: 0,
    windowWidth: 0,
    halfHeight: 0,
    scrollTop: 0,
    sectionTops: []
  };

  const els = {};

  const restGradientTweenProps = {
    roundProps: "x",
    ease: Linear.easeNone,
    force3D: true
  }

  // Cache dom element selectors
  // ------------------------------------------------
  const createChildren = () => {
    els.gradient      = document.querySelector('.js-gradient');
    els.readOn        = document.querySelector('.js-read-on');
    els.readOnLine    = document.querySelector('.js-read-line');
    els.sections      = document.querySelectorAll('.js-section');
    props.sectionLength = els.sections.length;
  };

  // Set up vars that will change on resize
  // ------------------------------------------------
  const setChangingVars = () => {
    const {innerWidth, innerHeight} = window
    props.windowWidth   = innerWidth;
    props.scrollTop = window.pageYOffset
    // NOTE: when there are several sections, the gradient sizes fine.
    // but when there is the only one section, it needs to be more.
    // props.gradientWidth = props.windowWidth * props.sectionLength * 2;
    props.gradientWidth = props.windowWidth * 8;
    props.halfHeight    = innerHeight / 3;

    TweenMax.killTweensOf(els.gradient);
    els.gradient.style.width = '';

    setTimeout(() => {
      els.gradient.style.width = `${props.gradientWidth}px`;
      listenToScrollPos();
    }, 10);

    // props.sectionTops = map(els.sections, section => section.offsetTop + props.scrollTop)
  };

  // 'Read on' animation
  // ------------------------------------------------
  const readOnAnimation = () => {
    const {readOn, readOnLine} = els;
    if (!readOn || !readOnLine) return

    if (props.halfHeight <= props.scrollTop) {
      readOn.classList.add('is-fading-out');
      readOnLine.classList.add('is-folding-down');
    }

    if (props.scrollTop <= 5) {
      readOnLine.classList.remove('is-folding-down');
      readOn.classList.remove('is-fading-out');
    }
  };

  // Activate proper link in nav based on scroll position
  // ------------------------------------------------
  const listenToScrollPos = () => {
    props.scrollTop = window.pageYOffset;
    readOnAnimation();
    TweenMax.killTweensOf(els.gradient);
    const gradientWidth = els.gradient.offsetWidth
    console.log(gradientWidth)

    forEach(els.sections, (section, i, arr) => {
      const top = section.offsetTop
      const nextSection = arr[i + 1]
      // trigger if the section top is near the window top or
      // above and the next section is both present and has yet to come
      if (top - 250 <= props.scrollTop && (nextSection && nextSection.offsetTop - 250 > props.scrollTop)) {
        if (i === 0) {
          gradientAnimation.heroAnimation()
          return
        }
        const xPercent = (i - 1) / (arr.length - 1)
        console.log(-Math.round(gradientWidth * xPercent))
        TweenMax.to(els.gradient, 2, {...restGradientTweenProps, x: -Math.round(gradientWidth * xPercent)})
        // const xPositionCalculated = props.windowWidth * 2 * i
        // TweenMax.to(els.gradient, 2, { ...restGradientTweenProps, x: -Math.round(xPositionCalculated + props.windowWidth) });
        // TweenMax.to(els.gradient, 2, { ...restGradientTweenProps, x: -Math.round(xPositionCalculated) });
      }
    })

    // forEach(els.sections, (currentSection, i) => {
    //   const xPositionCalculated = props.windowWidth * 2 * i;
    //   // console.log(currentSection.offsetTop - 1, props.scrollTop)
    //   if (currentSection.offsetTop - 1 <= props.scrollTop) {
    //     TweenMax.killTweensOf(els.gradient);
    //   }
    //
    //   if (currentSection.offsetTop - 250 <= props.scrollTop) {
    //     // debugger
    //     // switch (i) {
    //     //   case 0:
    //     //     gradientAnimation.heroAnimation();
    //     //     break;
    //     // }
    //   }
    // })
    // els.sections.forEach(currentSection => {
    //   const sectionRef     = currentSection.getAttribute('id');
    //   const refElement     = document.querySelector(`#${sectionRef}`);
    //   const currIndex      = elementIndex(els.sections, refElement);
    //
    //   const xPositionCalculated = props.windowWidth * 2 * currIndex;
    //
    //   if (refElement.offsetTop - 1 <= props.scrollTop) {
    //     TweenMax.killTweensOf(els.gradient);
    //   }
    //
    //   if (refElement.offsetTop - 250 <= props.scrollTop) {
    //     // console.log('hit')
    //     // console.log('scrolltop ' + props.scrollTop)
    //     // console.log('refElement Offset ' + refElement.offsetTop)
    //     // console.log('refElement ' + refElement)
    //     // console.log('currentIndex ' + currIndex)
    //     switch (currIndex) {
    //       case 0:
    //         gradientAnimation.heroAnimation();
    //         break;
    //
    //       // at halfway point,
    //       // add windowwidth to x pos
    //       case 3:
    //       case 4:
    //         TweenMax.to(els.gradient, 2, { x: -Math.round(xPositionCalculated + props.windowWidth), roundProps: "x",ease: Linear.easeNone, force3D: true });
    //         break;
    //
    //       case 5:
    //         break;
    //
    //       default:
    //         TweenMax.to(els.gradient, 2, { x: -Math.round(xPositionCalculated), roundProps: "x",ease: Linear.easeNone, force3D: true });
    //     }
    //   }
    // });
  };

  // Enable
  // ------------------------------------------------
  const enable = () => {
    if (props.isEnabled) return;

    // Activate scroll listener for active nav switch
    props.onWindowScroll = throttle(listenToScrollPos, 10);
    props.onWindowResize = debounce(setChangingVars, 50);

    window.addEventListener('scroll', listenToScrollPos);

    // Resize event to rerun gradient on non-mobile devices
    if (!checkMobileDevice.isMobileDevice) {
      window.addEventListener('resize', props.onWindowResize);
    }

    props.isEnabled = true;

    return;
  }

  // Disable
  // ------------------------------------------------
  const disable = () => {
    if (!props.isEnabled) return;

    window.removeEventListener('scroll', props.onWindowScroll);
    window.removeEventListener('resize', props.onWindowResize);

    props.isEnabled = false;

    return;
  }

  // Init
  // ------------------------------------------------
  const init = () => {
    createChildren();
    setChangingVars();
    enable();
  };

  return {
    init,
    disable
  };
};

export default internshipGradientBgs();
