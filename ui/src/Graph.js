/* global window */

import React, { Component } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";
import { setCanvasDimensions } from "./utils";

const NODE_RADIUS = 10;
const NODE_DISTANCE = 100;
const NODE_FILL = "#dfe6e9";
const NODE_STROKE = "#636e72";
const NODE_STROKE_WIDTH = 2;
const EDGE_STROKE = "#636e72";
const EDGE_STROKE_WIDTH = 2;
const NODE_LABEL_FILL = "#2d3436";
const NODE_LABEL_FONT = "bold 16px Helvetica, serif";

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
        <canvas ref={el => (this.canvas = el)} />
      </div>
    );
  }

  renderD3() {
    if (!this.canvas) {
      throw new Error("No element to render into");
    }

    const { nodes, edges } = this.props;
    const width = this.canvas.parentElement.offsetWidth;
    const height = this.canvas.parentElement.offsetHeight;
    const context = this.canvas.getContext("2d");
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
      context.clearRect(0, 0, width, height);

      // Draw edges
      context.beginPath();
      edges.forEach(edge => {
        context.moveTo(edge.source.x, edge.source.y);
        context.lineTo(edge.target.x, edge.target.y);
      });
      context.lineWidth = EDGE_STROKE_WIDTH;
      context.strokeStyle = EDGE_STROKE;
      context.stroke();

      // Draw nodes
      context.beginPath();
      nodes.forEach(node => {
        context.moveTo(node.x + NODE_RADIUS, node.y);
        context.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
      });
      context.fillStyle = NODE_FILL;
      context.fill();
      context.lineWidth = NODE_STROKE_WIDTH;
      context.strokeStyle = NODE_STROKE;
      context.stroke();

      // Draw node labels
      context.beginPath();
      context.font = NODE_LABEL_FONT;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = NODE_LABEL_FILL;
      nodes.forEach(node => {
        if (node.label) {
          context.fillText(node.label, node.x, node.y);
        }
      });
    };

    setCanvasDimensions(this.canvas, width, height);

    simulation.nodes(nodes).on("tick", onTick);
    simulation.force("edge").links(edges);
  }
}

export default Graph;
