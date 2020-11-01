/*!
 * @preserve
 * scrolldepth.js | v2-beta
 * Copyright (c) 2020 Rob Flaherty (@robflaherty)
 * Licensed under the MIT and GPL licenses.
 */
;(function ( window, document, undefined ) {

  // Default settings
  var defaults = {
    callback: sendEvent,
    category: 'Scroll Depth',
    interval: 1000,
    milestones: undefined,
    pixelDepth: true,
    zeroEvent: false,
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
    var milestonesList = []
    var offset = 0;
    var didNotScroll = true;

    var pageId = new Date().getTime() + '.' + Math.floor(100000 + Math.random() * 900000) + '.' + pageHeight

    if (settings.milestones) {

      if (settings.milestones.hasOwnProperty('offset')) {
        offset = settings.milestones.offset
      }

      var milestones = document.querySelectorAll('.scroll-milestone');
      milestones.forEach((elem) => {
        var distanceFromTop= elem.getBoundingClientRect().top + window.pageYOffset
        milestonesList.push(distanceFromTop)
      });

    }

    if (settings.zeroEvent) {
      if (settings.milestones) {
        sendEvent(settings.category, 'Milestones', pageId, 0)
      }

      if (settings.pixelDepth) {
        sendEvent(settings.category, 'Pixel Depth', pageId, 0)
      }
    }

    window.addEventListener('scroll', throttle(function(e) {

      var depth = window.pageYOffset + windowHeight
      var roundedDepth = parseInt(rounded(window.pageYOffset + windowHeight), 10)
      var delta = roundedDepth - lastDepth
      var passedMilestones = [];
      didNotScroll = false;

      console.log(depth)

      if (settings.pixelDepth) {

        if (roundedDepth > lastDepth) {
          lastDepth = roundedDepth;
          sendEvent(settings.category, 'Pixel Depth', pageId, delta)
        }

      }

      if (settings.milestones) {

        if (milestonesList.length == 0) {
          return
        }

        milestonesList.forEach((point) => {
          if (depth > point + offset) {
            passedMilestones.push(point)
            milestonesList = milestonesList.filter(item => item !== point)
          }
        })

        if (passedMilestones.length) {
          sendEvent(settings.category, 'Milestones', pageId, passedMilestones.length)
        }

      }


    }, 250), false);

    document.addEventListener('visibilitychange', function (e) {

      if (document.visibilityState == 'hidden') {

        if (settings.pixelDepth) {
          //Add a buffer so it only fires event if there's a meaningful delta
          var depth = (window.pageYOffset + windowHeight);
          var delta = depth - lastDepth
          console.log(depth, lastDepth)
          if (depth > lastDepth) {
            lastDepth = depth;
            sendEvent(settings.category, 'Pixel Depth', pageId, delta)
          }
        }
      }

    }, false);

  }

  window.scrolldepth = {
     init: init
  };



})( window, document );
