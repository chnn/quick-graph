/* global window */

import React, { Component } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";
import { setCanvasDimensions } from "./utils";

const NODE_PADDING = 4;
const NODE_DISTANCE = 30;
const NODE_FILL = "#dfe6e9";
const NODE_STROKE = "#636e72";
const NODE_STROKE_WIDTH = 2;
const EDGE_STROKE = "#636e72";
const EDGE_STROKE_WIDTH = 2;
const NODE_LABEL_FILL = "#2d3436";
const NODE_LABEL_FONT = "bold 12px Helvetica, serif";
const NODE_LABEL_HEIGHT = 12;

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

      context.font = NODE_LABEL_FONT;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = NODE_STROKE_WIDTH;
      context.strokeStyle = NODE_STROKE;

      nodes.forEach(node => {
        const label = node.label || node.id;
        const { width } = context.measureText(label);

        const rect = [
          node.x - width / 2 - NODE_PADDING,
          node.y - NODE_LABEL_HEIGHT / 2 - NODE_PADDING,
          width + 2 * NODE_PADDING,
          NODE_LABEL_HEIGHT + 2 * NODE_PADDING
        ];

        context.fillStyle = NODE_FILL;
        context.fillRect(...rect);
        context.strokeRect(...rect);

        context.fillStyle = NODE_LABEL_FILL;
        context.fillText(label, node.x, node.y);
        context.fill();
      });
    };

    setCanvasDimensions(this.canvas, width, height);

    simulation.nodes(nodes).on("tick", onTick);
    simulation.force("edge").links(edges);
  }
}

export default Graph;
