![Screenshot of DynamicGraph](https://raw.githubusercontent.com/davidnmora/dynamic-graph/master/dynamic-graph-screenshot.png "Screenshot of DynamicGraph")

# DynamicGraph
DynamicGraph provides a high level API to create interactive, dynamically updating D3.js force-directed graph layout visualizations. Create and interactively update graphs with a single line of code. 

The only thing cooler than visualizing graphs is visualizing them dynamically accross time, space, and properties. :)

## How to use DynamicGraph:
Assuming you've got a graph in the format 
```javascript
let nodes = [{id: "foo", ...}, {id: "bar", ...}, ...]
let links = [{source: "foo", target: "bar"}, ...]
```
have a designated container for the vis and an have added DynamicGraph to your project
```html
<div id="dynamic-graph-container"></div>

<script src="dynamic-graph.js"></script>
```
simply create and launch a graph with default properties via
```javascript
let vis = DynamicGraph(d3.select("#dynamic-graph-container"))
            .updateVis(nodes, links)
// Update nodes and/or links via filters, queries etc...
vis.updateVis(nodes, links) // Voila! The graph gracefuly transitions states.
```
## DynamicGraph API:
You can set optional parameters on instantiation via
```javascript
let vis = DynamicGraph(d3.select("#dynamic-graph-container"), {
					 	width: 1000, // px
					 	nodeColor: node => node.color,
					 	// etc
					})
```
A number of commonly used aspects of the graph can also be updating after instantiation (though more could be added):
```javascript
let vis = DynamicGraph(d3.select("#dynamic-graph-container"))
vis.nodeColor(node => node.color)
	 .nodeRadius(node => node.radius)
	 .tooltipInnerHTML(node => "<div>" + node.info + "</div>")
```
