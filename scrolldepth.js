/*!
 * @preserve
 * scrolldepth.js | v2-beta
 * Copyright (c) 2020 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 */
;(function ( window, document, undefined ) {

  // Default settings
  var defaults = {
    sendEvent: sendEvent,
    category: 'Scroll Depth',
    interval: 1000,
    milestones: undefined,
    pixelDepth: true
  };

  var settings;

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

  function sendEvent(data) {
    [category, action, label, delta] = data

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
    var offset = settings.milestones.hasOwnProperty('offset') ? settings.milestones.offset : 0;
    var pageId = new Date().getTime() + '.' + Math.floor(10000 + Math.random() * 90000) + '.' + pageHeight + '.' + windowHeight

    var lastDepth = 0
    var milestoneList = []

    if (settings.milestones) {

      var milestones = document.querySelectorAll('.scroll-milestone');
      milestones.forEach((elem) => {
        var distanceFromTop= elem.getBoundingClientRect().top + window.pageYOffset
        milestoneList.push(distanceFromTop)
      });

    }

    window.addEventListener('scroll', throttle(function(e) {

      var depth = window.pageYOffset + windowHeight
      var roundedDepth = parseInt(rounded(window.pageYOffset + windowHeight), 10)
      var delta = roundedDepth - lastDepth
      var passedMilestones = []

      console.log(depth)

      if (settings.pixelDepth) {

        if (roundedDepth > lastDepth) {
          lastDepth = roundedDepth
          settings.sendEvent([settings.category, 'Pixel Depth', pageId, delta])
        }

      }

      if (settings.milestones) {

        if (milestoneList.length == 0) {
          return
        }

        milestoneList.forEach((point) => {
          if (depth > point + offset) {
            passedMilestones.push(point)
            milestoneList = milestoneList.filter(item => item !== point)
          }
        })

        if (passedMilestones.length) {
          settings.sendEvent([settings.category, 'Milestones', pageId, passedMilestones.length])
        }

      }


    }, 250), false);

    document.addEventListener('visibilitychange', function (e) {

      if (document.visibilityState == 'hidden') {

        if (settings.pixelDepth) {
          var depth = window.pageYOffset + windowHeight
          var delta = depth - lastDepth

          if (depth > lastDepth) {
            lastDepth = depth;
            settings.sendEvent([settings.category, 'Pixel Depth', pageId, delta])
          }
        }
      }

    }, false);

  }

  window.scrolldepth = {
     init: init
  };



})( window, document );
