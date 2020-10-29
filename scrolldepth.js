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
  return (Math.floor(scrollDistance/settings.interval) * settings.interval).toString()
}

function sendEvent(category, action, label, delta) {

  console.log(category, action, label, delta)

  if (typeof gtag === 'function') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': delta,
      'non_interaction': true
    });
  }

}

function init(options) {
  settings = Object.assign(defaults, options)

  var pageHeight = document.documentElement.scrollHeight
  var windowHeight = window.innerHeight
  var lastDepth = 0

  var pageId = new Date().getTime() + '.' + Math.random().toString(36).substring(8) + '.' + pageHeight

  window.addEventListener('scroll', throttle(function(e) {

    var depth = parseInt(rounded(window.pageYOffset + windowHeight), 10)
    var delta = depth - lastDepth

    if (depth > lastDepth) {
      lastDepth = depth;
      sendEvent(settings.category, settings.action, pageId, delta)
    }


  }, 250), false);

  document.addEventListener('visibilitychange', function (e) {

    if (document.visibilityState == 'hidden') {

      var depth = parseInt(window.pageYOffset + windowHeight, 10)
      var delta = depth - lastDepth
      if (depth > lastDepth) {
        lastDepth = depth;
        sendEvent(settings.category, settings.action, pageId, delta)
      }

    }

  }, false);

}


// Default settings
var defaults = {
  callback: sendEvent,
  category: 'Scroll Depth',
  action: 'Pixel Depth',
  interval: 1000
};

var settings;


// Page visibility event
// Measure as number of screenfuls?
// Measure scroll bounces
// Scroll position and time spent, what position spent most time
//const terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';




