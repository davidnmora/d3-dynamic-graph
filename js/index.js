
// SETUP CUSTOM FILTERING -------------------------------------------------------------------------
let minRadius = 7,
    scaleRadiusDownBy = 5
const setNodeRadiusAndDegree = node => {    
  if(node.radius !== undefined) return node.radius
  node.degree = graph.links.filter(l => {
    return l.source == node.id || l.target == node.id
  }).length
  node.radius = minRadius + (node.degree/scaleRadiusDownBy)
}

let filterParams = {
  sampleParam: true,
}

// High-level filters
const shouldKeepNode = node => (node.index % 2) === 0 // For testing purposes
const shouldKeepLink = (nodesById, link) => {
  const sourceNode = nodesById[link.sourceId]
  const targetNode = nodesById[link.targetId]
  return shouldKeepNode(sourceNode) && shouldKeepNode(targetNode)
}

// Set node color based on type
const nodeColor = node => {
  switch (getNodeInfo(node).category) {
    case "AssociationType":
      return "darkred"
    case "EntityType":
      return "skyblue"
    case undefined:
      return "#525252"
    default:
      console.error("ERROR: node improperly typed: ", node)
      return "red"
  }
}

// Tooltip display
const tooltipInnerHTML = node => {
  return getNodeInfo(node).title
}

// PROJECT SPECIFIC HELPERS
const getNodeInfo = node => node.type ? node : node.entityType


// 3. GET DATA, LUANCH VIS -------------------------------------------------------------------------
const graphDataJSONUrl = "https://raw.githubusercontent.com/davidnmora/open-lattice-edm-vis/master/graph-data.json" 
Promise.all([
  new Promise((res,rej) => d3.json(graphDataJSONUrl, function(error, JSONdata) { if(error) { rej(error) } else { res(JSONdata) } }))  
  ])
  .then(([_graph]) => {
    graph = _graph
    graph.nodesById = {}
    let namespaceHist = {}
    for (const node of graph.nodes) {
      graph.nodesById[node.id] = node
      let namespace = getNodeInfo(node).type.namespace
      if (!namespaceHist[namespace]) namespaceHist[namespace] = 0
      namespaceHist[namespace]++
      setNodeRadiusAndDegree(node)
    }
    console.log(namespaceHist)

    for (const link of graph.links) {
      link.sourceId = link.source
      link.targetId = link.target
    }

    // Launch vis
    let nodes = graph.nodes
    let links = graph.links
    let vis = DynamicGraph(d3.select("#canvas"), { width: 1000 })
                .nodeColor(nodeColor)
                .nodeRadius(node => node.radius)
                .tooltipInnerHTML(tooltipInnerHTML)
                .updateVis(nodes, links)

    d3.select('#toggle-nodes').on('click', () => {
			// Update vis (filter out half the nodes)
			nodes = graph.nodes.filter(node => shouldKeepNode(node))
			links = graph.links.filter(link => shouldKeepLink(graph.nodesById, link))
			vis.updateVis(nodes, links)
    })
    
    // setTimeout(() => vis.updateVis(nodes, links), 2000)

  }); // closes Primise.then(...)
