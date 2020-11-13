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

  function debounce(func, wait, immediate) {
    var timeout;

    return function() {
      var context = this, args = arguments;

      var later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;

      clearTimeout(timeout);

      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
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
    var selectors = settings.milestones.hasOwnProperty('selectors') ? settings.milestones.selectors : ['.scroll-milestone'];

    var pageId = new Date().getTime() + '.' + Math.floor(10000 + Math.random() * 90000) + '.' + pageHeight + '.' + windowHeight

    var lastDepth = 0
    var milestoneList = []
    var milestoneZeroSent = false;

    if (settings.milestones) {

      selectors.forEach((selector) => {

        var milestones = document.querySelectorAll(selector);
        milestones.forEach((elem) => {
          var distanceFromTop= elem.getBoundingClientRect().top + window.pageYOffset
          milestoneList.push(distanceFromTop)
        });

      });



    }

    window.addEventListener('scroll', debounce(function(e) {

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


    }, 1000), false);

    document.addEventListener('visibilitychange', function (e) {

      if (document.visibilityState == 'hidden') {

        var depth = window.pageYOffset + windowHeight
        var delta = depth - lastDepth

        // 100px buffer to avoid sending event for insignificant scrolls
        if (depth > lastDepth + 100) {
          lastDepth = depth;

          if (settings.pixelDepth) {
            settings.sendEvent([settings.category, 'Pixel Depth', pageId, delta])
          }

          // if (settings.milestones && !milestoneZeroSent) {
          //   // Only need to send this once
          //   milestoneZeroSent = true
          //   settings.sendEvent([settings.category, 'Milestones', pageId, 0])
          // }

        }

      }

    }, false);

  }

  window.scrolldepth = {
     init: init
  };

})( window, document );
