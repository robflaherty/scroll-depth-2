/*
 * Throttle function borrowed from:
 * Underscore.js 1.5.2
 * http://underscorejs.org
 * (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Underscore may be freely distributed under the MIT license.
 */

function throttle(func, wait) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  var later = function() {
    previous = new Date;
    timeout = null;
    result = func.apply(context, args);
  };
  return function() {
    var now = new Date;
    if (!previous) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function rounded(scrollDistance) {
  return (Math.floor(scrollDistance/250) * 250).toString()
}

function sendEvent(category, action, label) {

  console.log(category, action, label)

  if (typeof gtag === 'function') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'non_interaction': true
    });
  }

}

function init(options) {
  settings = Object.assign(defaults, options)

  var pageHeight = document.documentElement.scrollHeight
  var windowHeight = window.innerHeight
  var interval = 500
  var lastDepth = 0

  var pageId = new Date().getTime() + '.' + Math.random().toString(36).substring(8) + '.' + pageHeight

  window.addEventListener('scroll', throttle(function(e) {

    var depth = parseInt(rounded(window.pageYOffset + windowHeight), 10)
    console.log(depth, lastDepth)

    if (depth > lastDepth) {
      lastDepth = depth;
      sendEvent(settings.category, depth, pageId)
    }


  }, 250), false);


}


// Default settings
var defaults = {
  callback: sendEvent,
  category: 'Scroll Depth'
};

var settings;







