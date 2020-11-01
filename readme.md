# Scroll Depth 2
Beta version of a better way to measure scroll depth.

The script generates a unique ID for each pageview and sends the ID as the Event Label. Scroll depth is a pixel value recorded by incrementing the Event Value.

The pageview ID includes the document height, which can be used to calculate the percent of the page scrolled, and the viewport height, which can be used to calculate the number of screens scrolled.

Example:

`1604195775299.26174.8016.744`

`{timestamp}.{random number}.{document height}.{viewport height}`

## Pixel Depth
The script records pixel depth, sending an event at intervals (default interval = 1000px). It also sends an event when `visibilityState` changes to `hidden` as a way of recording the deepest scroll point when the tab is closed.

## Milestones
Optionally (pass `{ milestones: true }`) you can record events for specific elements in the DOM. Elements with class `scroll-milestone` will fire milestone events in the order they appear in the DOM. You can also pass an `offset` value to require the element to be scrolled into view a minimum amount before firing the event.

## How to Use
```
<script src="scrolldepth.js"></script>
<script>
  scrolldepth.init()
</script>
```

- Requires gtag
- Doesn't support IE11

