# =================================================================================================
#
# DOM Routing
#
# ==================================================================================================

# ------------------------------------------------
# WardVillage Object
# ------------------------------------------------
window.WardVillage          ||= {}
window.WardVillage.pages    ||= {}

# ------------------------------------------------
# Call Page Specific JS
# ------------------------------------------------
runPageJs = () =>
  controller = document.body.dataset.jsRouter

  # check for pages_index which is set on both residence and neighborhood pages
  if controller == 'pages_index'
    controller = document.querySelector('[data-js-pages]').dataset.jsPages


  WardVillage.currentPage = controller
  if WardVillage[controller]
    WardVillage.pages[controller] ||= new WardVillage[controller]();
    WardVillage.pages[controller].init()

  this

# Check CSS Breakpoint for width specific modules init
window.checkBreakpoint = () =>
  return window.getComputedStyle(document.body, ':before').getPropertyValue('content').replace(/\"/g, '')

window.WardVillage.pageLoad = () =>
  window.WardVillage.isMobileDevice = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent)
  window.WardVillage.currentBreakpoint = window.checkBreakpoint()

  # disable the modules of the previous page as they'll persist in the cache
  WardVillage.pages[WardVillage.currentPage].disable() if WardVillage[WardVillage.currentPage]
  runPageJs()

  WardVillage.global ||= new WardVillage.GlobalJS()
  WardVillage.global.init()

  setTimeout =>
    $('.page-wrapper').addClass('animate-in')
  , 75

  $('body').imagesLoaded(window.WardVillage.onImagesLoad)

  this

window.WardVillage.onImagesLoad = () =>
  WardVillage.global.initWindowLoad()
  WardVillage.pages[WardVillage.currentPage].initWindowLoad() if WardVillage[WardVillage.currentPage]
  this

# ------------------------------------------------
# Call on Browser Navigation (with turbolinks)
# ------------------------------------------------
window.WardVillage.docReady = () =>
  window.WardVillage.pageLoad()

  this

# ------------------------------------------------
# Call on Browser Navigation (with turbolinks)
# ------------------------------------------------
$(document).ready(window.WardVillage.docReady)

$(document).on 'page:fetch', =>
  $('.page-wrapper').removeClass('animate-in')
  this

$(document).on 'page:restore', =>
  window.WardVillage.pageLoad()
  this

$(document).on 'page:change', =>
  # fbq('track', 'PageView')
  ga('send', 'pageview', window.location.pathname)
  this
