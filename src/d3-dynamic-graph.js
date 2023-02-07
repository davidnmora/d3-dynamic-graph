const DynamicGraph = (d3SelectedVisContainer, d3, optionalPubVars) => {
  // 1. GLOBAL VARIALBES -------------------------------------------------------------------------
  // Public variables width default settings
  let pubVar = {
    width: 600, // pixles
    height: 600, // pixles
    transitionTime: 750, // milliseconds
    centeringForce: 0.09,
    // e.g. Nodes: [{id: "foo"}, {id: "bar"}] Links: [{source: "foo", target: "bar"}]
    nodeRefProp: "id",
    unfocusOpacity: 0.4,
    focusOpacity: 0.95,
    unfocusStrokeThickness: 0.5,
    focusStrokeThickness: 5,
    // Link and Node functions
    linkColor: (link) => "white",
    nodeColor: (node) => "skyblue",
    nodeStartXPos: null, // function, returns pixels
    nodeStartYPos: null, // function, returns pixels
    nodeRadius: (node) => 5, // pixles

    // Tooltip:
    tooltipInnerHTML: (node) => node["id"],
    tooltipXOffset: 16,
    tooltipYOffset: 24,
  };

  // Merge any specififed publiv variables
  if (optionalPubVars) pubVar = { ...pubVar, ...optionalPubVars };

  // Private global variables
  let link, node, simulation; // globals set within json request response

  // Create vis svg canvas
  let svg = d3SelectedVisContainer
    .append("svg")
    .attr("width", pubVar.width)
    .attr("height", pubVar.height);

  // FOCUS NODE: TOOLTIP AND NEIGHBOR HIGHLIGHT -------------------------------------------------------------------------
  const tooltip = d3SelectedVisContainer
    .append("div")
    .attr("class", "d3-dynamic-graph-tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  const getX = (base) => base + pubVar.tooltipXOffset + "px";
  const getY = (base) => base + pubVar.tooltipYOffset + "px";

  const displayNodeTooltip = (event, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip
      .html(pubVar.tooltipInnerHTML(d))
      .style("left", getX(event.pageX))
      .style("top", getY(event.pageY));
  };

  const updateTooltipPosition = (event) => {
    const [mouseX, mouseY] = d3.pointer(event, this);
    tooltip.style("left", getX(mouseX)).style("top", getY(mouseY));
  };

  const removeNodeTooltip = () => {
    tooltip.transition().duration(500).style("opacity", 0);
  };

  const setLinkStrokeWidth = (link, thickness) =>
    d3SelectedVisContainer
      .select(
        ".link-" +
          link.source[pubVar.nodeRefProp] +
          ".link-" +
          link.target[pubVar.nodeRefProp]
      )
      .attr("stroke-width", thickness);

  // Toggles node and its nearest neighbors display, with respect to isInFocus param
  const changeNodeFocus = (node, links, isInFocus) => {
    const centerNodeId = node[pubVar.nodeRefProp];
    const strokeThickness = isInFocus
      ? pubVar.focusStrokeThickness
      : pubVar.unfocusStrokeThickness;
    // Get all neighbors via links, setting the link thickness simultaniously
    const neighborsSet = new Set([node[pubVar.nodeRefProp]]);
    d3SelectedVisContainer.selectAll("line.link").style("opacity", (link) => {
      if (link.source[pubVar.nodeRefProp] === node[pubVar.nodeRefProp]) {
        neighborsSet.add(link.target[pubVar.nodeRefProp]);
        setLinkStrokeWidth(link, strokeThickness);
      } else if (link.target[pubVar.nodeRefProp] === node[pubVar.nodeRefProp]) {
        neighborsSet.add(link.source[pubVar.nodeRefProp]);
        setLinkStrokeWidth(link, strokeThickness);
      }
    });
    // Set the opacity of ego-node and neighbor nodes
    d3SelectedVisContainer.selectAll("circle.node").style("opacity", (node) => {
      const keepStatusQuo = (node) => {
        // Leave remaining "focused" highlighted
        if (node.focused) return pubVar.focusOpacity;
        if (!node.focused) return pubVar.unfocusOpacity;
      };

      if (isInFocus) {
        // Highlight node and neighbors
        if (
          neighborsSet.has(node[pubVar.nodeRefProp]) ||
          node.clicked ||
          node.focused
        ) {
          node.focused = true;
          return pubVar.focusOpacity;
        }
        return keepStatusQuo(node);
      }

      // Un-highlight appropriate nodes
      if (!isInFocus) {
        // Unhighlight central node and direct neighbors (who haven't themselves been clicked)
        if (neighborsSet.has(node[pubVar.nodeRefProp]) && !node.clicked) {
          node.focused = false;
          return pubVar.unfocusOpacity;
        }
        return keepStatusQuo(node);
      }
    });
  };

  // Update positions at each frame refresh
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node
      .attr("cx", (d) => {
        const r = pubVar.nodeRadius(d);
        const x = Math.max(r, Math.min(pubVar.width - r, d.x));
        d.x = x;
        return x;
      })
      .attr("cy", (d) => {
        const r = pubVar.nodeRadius(d);
        const y = Math.max(r, Math.min(pubVar.width - r, d.y));
        d.y = y;
        return y;
      });
  }

  // 5. UPDATE GRAPH AFTER FILTERING DATA -------------------------------------------------------------------------
  function updateVis(nodes, links) {
    // Initialize layout simulation at startup
    if (!simulation) {
      simulation = d3
        .forceSimulation()
        .force(
          "link",
          d3.forceLink().id((node) => node[pubVar.nodeRefProp])
        )
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX(pubVar.width / 2).strength(pubVar.centeringForce))
        .force(
          "y",
          d3.forceY(pubVar.height / 2).strength(pubVar.centeringForce)
        )
        .velocityDecay(0.8);
      simulation.nodes(nodes).on("tick", ticked);
      simulation.force("link").links(links);
    }

    simulation.stop();

    if (!link) {
      link = svg.append("g").attr("class", "links").selectAll("line");
    }
    link = link.data(links);

    if (!node) {
      node = svg.append("g").attr("class", "nodes").selectAll("circle");

      nodes.forEach((d) => {
        // if not supplied, distribute randomly
        const startingXPos = pubVar.nodeStartXPos
          ? pubVar.nodeStartXPos(d)
          : Math.random() * pubVar.width;
        const startingYPos = pubVar.nodeStartYPos
          ? pubVar.nodeStartYPos(d)
          : Math.random() * pubVar.height;

        d.x = d.cx = startingXPos;
        d.y = d.cy = startingYPos;
      });
    }

    // Apply the general update pattern to the nodes.
    node = node.data(nodes, (d) => d.id);

    node
      .exit()
      .transition()
      .duration(pubVar.transitionTime)
      .attr("r", 0)
      .remove();

    node = node
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("fill", pubVar.nodeColor)
      .style("opacity", pubVar.unfocusOpacity)
      .on("mouseover", (event, node) => {
        displayNodeTooltip(event, node);
        changeNodeFocus(node, links, true);
      })
      .on("mouseout", (event, node) => {
        if (!node.clicked) {
          removeNodeTooltip(event, node);
          changeNodeFocus(node, links, false);
        }
      })
      .on("click", (event, node) => {
        node.clicked = !node.clicked;
        if (!node.clicked) {
          removeNodeTooltip(event, node);
          changeNodeFocus(node, links, false);
        }
      })
      .call((node) => {
        node
          .transition()
          .duration(pubVar.transitionTime)
          .attr("r", (d) => pubVar.nodeRadius(d));
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .merge(node);

    // Apply the general update pattern to the links.
    // Keep the exiting links connected to the moving remaining nodes.
    link
      .exit()
      .transition()
      .duration(pubVar.transitionTime)
      .attr("stroke-opacity", 0)
      .attrTween("x1", function (d) {
        return function () {
          return d.source.x;
        };
      })
      .attrTween("x2", function (d) {
        return function () {
          return d.target.x;
        };
      })
      .attrTween("y1", function (d) {
        return function () {
          return d.source.y;
        };
      })
      .attrTween("y2", function (d) {
        return function () {
          return d.target.y;
        };
      })
      .remove();

    link = link
      .enter()
      .append("line")
      .attr(
        "class",
        (link) =>
          "link link-" +
          link.source[pubVar.nodeRefProp] +
          " link-" +
          link.target[pubVar.nodeRefProp]
      )
      .call(function (link) {
        link.transition().attr("stroke-opacity", 1);
      })
      .attr("stroke", pubVar.linkColor)
      .attr("stroke-width", pubVar.unfocusStrokeThickness)
      .merge(link);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
  }

  // DRAG EVENTS ______________________________
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    updateTooltipPosition(event);
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  // CREATE API ______________________________
  function _DynamicGraph() {}

  // (Re)starts graph layout with given nodes and links
  _DynamicGraph.updateVis = (nodes, links) => {
    nodes && links
      ? updateVis(nodes, links)
      : console.error(
          "Error: paramters should be: DyanmicGraph.udpateVis(nodes, links)"
        );
    return _DynamicGraph;
  };

  // Optional settable values

  // Provide a custom function to set node colors on vis update
  _DynamicGraph.nodeColor = (colorSetter) => {
    if (!colorSetter) return pubVar.nodeColor;
    pubVar.nodeColor = colorSetter;
    return _DynamicGraph;
  };

  // Provide a custom function to set node colors on vis update
  _DynamicGraph.tooltipInnerHTML = (innerHTML) => {
    if (!innerHTML) return pubVar.tooltipInnerHTML;
    pubVar.tooltipInnerHTML = innerHTML;
    return _DynamicGraph;
  };

  // Provide a custom function to set node colors on vis update
  _DynamicGraph.nodeRadius = (radiusSetter) => {
    if (!radiusSetter) return pubVar.nodeRadius;
    pubVar.nodeRadius = radiusSetter;
    return _DynamicGraph;
  };

  return _DynamicGraph; // for future api calls
};

export default DynamicGraph;
