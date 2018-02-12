![Screenshot of Vis](https://github.com/davidnmora/positive-psych-vis/blob/master/vis-screenshot.png "Screenshot of the vis")

# DynamicGraph
DynamicGraph provides a high level API to create interactive, dynamically updating D3 Force Layout graph visualizations. (Graph in the computer science "network" sense, not plot sense. :)

## How to use DynamicGraph:
Assuming you've got a graph in the format 
```
let nodes = [{id: "foo", ...}, {id: "bar", ...}, ...]
let links = [{source: "foo", target: "bar"}, ...]
```
and an have added DynamicGraph to your js files
```
<script src="dynamic-graph.js"></script>
```
with a designated container element like
```
<div id="dynamic-graph-container"></div>
```
simply create and launch a graph with default properties via
```
let vis = DynamicGraph(d3.select("#dynamic-graph-container"))
            .updateVis(nodes, links)
```
and then update it as you wish simply by passing an updated nodes and links array:
```
// Update nodes and/or links...
vis.updateVis(nodes, links)
```
## DynamicGraph API:
You can set optional parameters on instantiation via
```
let vis = DynamicGraph(d3.select("#dynamic-graph-container"), {
					 	width: 1000px, 
					 	nodeColor: node => node.color,
					 	// etc
					})
```
A number of commonly used aspects of the graph can also be updating after instantiation (though more could be added):
```
let vis = DynamicGraph(d3.select("#dynamic-graph-container"))
vis.nodeColor(node => node.color)
	 .nodeRadius(node => node.radius)
	 .tooltipInnerHTML(node => "<div>" + node.info + "</div>")
```