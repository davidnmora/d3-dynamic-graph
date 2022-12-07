![Screenshot of DynamicGraph](https://raw.githubusercontent.com/davidnmora/dynamic-graph/master/dynamic-graph-screenshot.png "Screenshot of DynamicGraph")

# DynamicGraph

`DynamicGraph` provides a high level API to create interactive, dynamically updating D3.js force-directed graph layout visualizations.

### Why do I need this?

Turns out transitioning and animating between states in D3 Force Layout is tricky requires 300+ lines of non-trivial code.

With DynamicGraph, you can smoothly update graphs with a single line of code.

# How to use DynamicGraph

## Run the example locally

```bash
npm install
npm run dev

# Build distrubition:
npm run build
```

## Quickstart

Get your graph data in the format

```javascript
let nodes = [{id: "foo", ...}, {id: "bar", ...}, ...]
let links = [{source: "foo", target: "bar"}, ...]
```

Create a parent container for the chart

```html
<div id="dynamic-graph-container"></div>
```

Create a graph with default properties

```javascript
import DynamicGraph from "DynamicGraph";

const container = d3.select("#dynamic-graph-container");
let vis = DynamicGraph(container).updateVis(nodes, links);
// Then, later, after you've updated nodes and links, call updateVis to transition:
vis.updateVis(updatedNodes, updatedLinks);
// Voila! The graph gracefuly transitions states.
```

## DynamicGraph API:

You can set optional parameters on instantiation via

```javascript
let vis = DynamicGraph(container, {
  width: 1000, // px
  nodeColor: (node) => node.color,
  // etc
});
```

A number of commonly used aspects of the graph can also be updating after instantiation (feel free to add a PR with more!)

```javascript
let vis = DynamicGraph(d3.select("#dynamic-graph-container"));
vis
  .nodeColor((node) => node.color)
  .nodeRadius((node) => node.radius)
  .tooltipInnerHTML((node) => "<div>" + node.info + "</div>");
```
