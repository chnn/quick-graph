/* global window */

import React, { Component } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";

const NODE_PADDING = 4;
const NODE_DISTANCE = 30;
const NODE_FILL = "#dfe6e9";
const NODE_STROKE = "#636e72";
const NODE_STROKE_WIDTH = 1;
const NODE_TEXT_FILL = "#2d3436";
const EDGE_STROKE = "#636e72";
const EDGE_STROKE_WIDTH = 1;

const truncate = (text, k = 5) => {
  if (text.length < k + 2) {
    return text;
  }

  return `${text.slice(0, k)}...`;
};

class Graph extends Component {
  windowDidResize = debounce(this.renderD3.bind(this), 100);

  componentDidMount() {
    this.renderD3();
    window.addEventListener("resize", this.windowDidResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.windowDidResize);
  }

  componentWillUpdate(/* prevProps, prevState */) {
    this.renderD3();
  }

  render() {
    return (
      <div className="Graph">
        <svg ref={el => (this.svg = el)} />
      </div>
    );
  }

  renderD3() {
    if (!this.svg) {
      throw new Error("No element to render into");
    }

    const { nodes, edges } = this.props;
    const width = this.svg.parentElement.offsetWidth;
    const height = this.svg.parentElement.offsetHeight;
    const svg = d3.select(this.svg);

    svg.attr("width", width).attr("height", height);

    const edgeJoin = svg.selectAll("g.edge").data(edges);

    edgeJoin
      .enter()
      .append("g")
      .classed("edge", true)
      .append("line")
      .attr("stroke", EDGE_STROKE)
      .attr("stroke-width", EDGE_STROKE_WIDTH);

    edgeJoin.exit().remove();

    const nodeJoin = svg.selectAll("g.node").data(nodes);

    const nodeJoinEnter = nodeJoin
      .enter()
      .append("g")
      .classed("node", true);

    nodeJoinEnter
      .append("rect")
      .attr("stroke", NODE_STROKE)
      .attr("stroke-width", NODE_STROKE_WIDTH)
      .attr("fill", NODE_FILL);

    nodeJoinEnter
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "Helvetica, sans-serif")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", NODE_TEXT_FILL)
      .text(d => truncate(d.name || d.id))
      .each(function(d) {
        const { width, height } = this.getBBox();

        // Capture width and height of text node for future calculations.
        // Mutating the datum for a selection is wack af, but it's already
        // done quite liberally by d3-force ¯\_(ツ)_/¯
        d.width = width;
        d.height = height;
      });

    // Now we can update the rects to accomodate the correct text size
    nodeJoinEnter
      .select("rect")
      .attr("width", d => d.width + NODE_PADDING * 2)
      .attr("height", d => d.height + NODE_PADDING * 2);

    nodeJoin.exit().remove();

    const updateEdges = () => {
      svg
        .selectAll("line")
        .attr("x1", d => d.source.x)
        .attr("x2", d => d.target.x)
        .attr("y1", d => d.source.y)
        .attr("y2", d => d.target.y);
    };

    const updateNodes = () => {
      svg
        .selectAll("g.node")
        .select("rect")
        .attr("x", d => d.x - d.width / 2 - NODE_PADDING)
        .attr("y", d => d.y - d.height - NODE_PADDING / 2);

      svg
        .selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    };

    const edgeForce = d3
      .forceLink()
      .id(d => d.id)
      .distance(NODE_DISTANCE);

    const simulation = d3
      .forceSimulation()
      .force("edge", edgeForce)
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    const onTick = () => {
      updateEdges();
      updateNodes();
    };

    simulation.nodes(nodes).on("tick", onTick);
    simulation.force("edge").links(edges);
  }
}

export default Graph;
