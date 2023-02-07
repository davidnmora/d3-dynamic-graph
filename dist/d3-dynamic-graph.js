const DynamicGraph = (d3SelectedVisContainer, d3, optionalPubVars) => {
  let pubVar = {
    width: 600,
    height: 600,
    transitionTime: 750,
    centeringForce: 0.09,
    nodeRefProp: "id",
    unfocusOpacity: 0.4,
    focusOpacity: 0.95,
    unfocusStrokeThickness: 0.5,
    focusStrokeThickness: 5,
    linkColor: (link2) => "white",
    nodeColor: (node2) => "skyblue",
    nodeStartXPos: null,
    nodeStartYPos: null,
    nodeRadius: (node2) => 5,
    tooltipInnerHTML: (node2) => node2["id"],
    tooltipXOffset: 16,
    tooltipYOffset: 24
  };
  if (optionalPubVars)
    pubVar = { ...pubVar, ...optionalPubVars };
  let link, node, simulation;
  let svg = d3SelectedVisContainer.append("svg").attr("width", pubVar.width).attr("height", pubVar.height);
  const tooltip = d3SelectedVisContainer.append("div").attr("class", "d3-dynamic-graph-tooltip").style("opacity", 0).style("position", "absolute");
  const getX = (base) => base + pubVar.tooltipXOffset + "px";
  const getY = (base) => base + pubVar.tooltipYOffset + "px";
  const displayNodeTooltip = (event, d) => {
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(pubVar.tooltipInnerHTML(d)).style("left", getX(event.pageX)).style("top", getY(event.pageY));
  };
  const updateTooltipPosition = (event) => {
    const [mouseX, mouseY] = d3.pointer(event, globalThis);
    tooltip.style("left", getX(mouseX)).style("top", getY(mouseY));
  };
  const removeNodeTooltip = () => {
    tooltip.transition().duration(500).style("opacity", 0);
  };
  const setLinkStrokeWidth = (link2, thickness) => d3SelectedVisContainer.select(
    ".link-" + link2.source[pubVar.nodeRefProp] + ".link-" + link2.target[pubVar.nodeRefProp]
  ).attr("stroke-width", thickness);
  const changeNodeFocus = (node2, links, isInFocus) => {
    node2[pubVar.nodeRefProp];
    const strokeThickness = isInFocus ? pubVar.focusStrokeThickness : pubVar.unfocusStrokeThickness;
    const neighborsSet = /* @__PURE__ */ new Set([node2[pubVar.nodeRefProp]]);
    d3SelectedVisContainer.selectAll("line.link").style("opacity", (link2) => {
      if (link2.source[pubVar.nodeRefProp] === node2[pubVar.nodeRefProp]) {
        neighborsSet.add(link2.target[pubVar.nodeRefProp]);
        setLinkStrokeWidth(link2, strokeThickness);
      } else if (link2.target[pubVar.nodeRefProp] === node2[pubVar.nodeRefProp]) {
        neighborsSet.add(link2.source[pubVar.nodeRefProp]);
        setLinkStrokeWidth(link2, strokeThickness);
      }
    });
    d3SelectedVisContainer.selectAll("circle.node").style("opacity", (node3) => {
      const keepStatusQuo = (node4) => {
        if (node4.focused)
          return pubVar.focusOpacity;
        if (!node4.focused)
          return pubVar.unfocusOpacity;
      };
      if (isInFocus) {
        if (neighborsSet.has(node3[pubVar.nodeRefProp]) || node3.clicked || node3.focused) {
          node3.focused = true;
          return pubVar.focusOpacity;
        }
        return keepStatusQuo(node3);
      }
      if (!isInFocus) {
        if (neighborsSet.has(node3[pubVar.nodeRefProp]) && !node3.clicked) {
          node3.focused = false;
          return pubVar.unfocusOpacity;
        }
        return keepStatusQuo(node3);
      }
    });
  };
  function ticked() {
    link.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    node.attr("cx", (d) => {
      const r = pubVar.nodeRadius(d);
      const x = Math.max(r, Math.min(pubVar.width - r, d.x));
      d.x = x;
      return x;
    }).attr("cy", (d) => {
      const r = pubVar.nodeRadius(d);
      const y = Math.max(r, Math.min(pubVar.width - r, d.y));
      d.y = y;
      return y;
    });
  }
  function updateVis(nodes, links) {
    if (!simulation) {
      simulation = d3.forceSimulation().force(
        "link",
        d3.forceLink().id((node2) => node2[pubVar.nodeRefProp])
      ).force("charge", d3.forceManyBody()).force("x", d3.forceX(pubVar.width / 2).strength(pubVar.centeringForce)).force(
        "y",
        d3.forceY(pubVar.height / 2).strength(pubVar.centeringForce)
      ).velocityDecay(0.8);
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
        const startingXPos = pubVar.nodeStartXPos ? pubVar.nodeStartXPos(d) : Math.random() * pubVar.width;
        const startingYPos = pubVar.nodeStartYPos ? pubVar.nodeStartYPos(d) : Math.random() * pubVar.height;
        d.x = d.cx = startingXPos;
        d.y = d.cy = startingYPos;
      });
    }
    node = node.data(nodes, (d) => d.id);
    node.exit().transition().duration(pubVar.transitionTime).attr("r", 0).remove();
    node = node.enter().append("circle").attr("class", "node").attr("fill", pubVar.nodeColor).style("opacity", pubVar.unfocusOpacity).on("mouseover", (event, node2) => {
      displayNodeTooltip(event, node2);
      changeNodeFocus(node2, links, true);
    }).on("mouseout", (event, node2) => {
      if (!node2.clicked) {
        removeNodeTooltip();
        changeNodeFocus(node2, links, false);
      }
    }).on("click", (event, node2) => {
      node2.clicked = !node2.clicked;
      if (!node2.clicked) {
        removeNodeTooltip();
        changeNodeFocus(node2, links, false);
      }
    }).call((node2) => {
      node2.transition().duration(pubVar.transitionTime).attr("r", (d) => pubVar.nodeRadius(d));
    }).call(
      d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    ).merge(node);
    link.exit().transition().duration(pubVar.transitionTime).attr("stroke-opacity", 0).attrTween("x1", function(d) {
      return function() {
        return d.source.x;
      };
    }).attrTween("x2", function(d) {
      return function() {
        return d.target.x;
      };
    }).attrTween("y1", function(d) {
      return function() {
        return d.source.y;
      };
    }).attrTween("y2", function(d) {
      return function() {
        return d.target.y;
      };
    }).remove();
    link = link.enter().append("line").attr(
      "class",
      (link2) => "link link-" + link2.source[pubVar.nodeRefProp] + " link-" + link2.target[pubVar.nodeRefProp]
    ).call(function(link2) {
      link2.transition().attr("stroke-opacity", 1);
    }).attr("stroke", pubVar.linkColor).attr("stroke-width", pubVar.unfocusStrokeThickness).merge(link);
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
  }
  function dragstarted(event) {
    if (!event.active)
      simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    updateTooltipPosition(event);
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active)
      simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  function _DynamicGraph() {
  }
  _DynamicGraph.updateVis = (nodes, links) => {
    nodes && links ? updateVis(nodes, links) : console.error(
      "Error: paramters should be: DyanmicGraph.udpateVis(nodes, links)"
    );
    return _DynamicGraph;
  };
  _DynamicGraph.nodeColor = (colorSetter) => {
    if (!colorSetter)
      return pubVar.nodeColor;
    pubVar.nodeColor = colorSetter;
    return _DynamicGraph;
  };
  _DynamicGraph.tooltipInnerHTML = (innerHTML) => {
    if (!innerHTML)
      return pubVar.tooltipInnerHTML;
    pubVar.tooltipInnerHTML = innerHTML;
    return _DynamicGraph;
  };
  _DynamicGraph.nodeRadius = (radiusSetter) => {
    if (!radiusSetter)
      return pubVar.nodeRadius;
    pubVar.nodeRadius = radiusSetter;
    return _DynamicGraph;
  };
  return _DynamicGraph;
};
export {
  DynamicGraph as default
};
