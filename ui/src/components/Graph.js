/* global window */

import React, { Component } from "react";
import * as d3 from "d3";
import debounce from "lodash/debounce";
import { truncate, extentBy, midpoint, orthUnitVector } from "../utils";
import "./Graph.css";

const NODE_PADDING = 4;
const NODE_DISTANCE = 100;
const NODE_FILL = "#dfe6e9";
const NODE_STROKE = "#636e72";
const NODE_STROKE_WIDTH = 1;
const NODE_TEXT_FILL = "#2d3436";
const EDGE_STROKE = "#636e72";
const EDGE_STROKE_WIDTH = 1;
const EDGE_CURVATURE = 40;

class Graph extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      nodes: [],
      edges: []
    };
  }

  windowDidResize = debounce(this.renderD3.bind(this), 100);

  componentDidMount() {
    window.addEventListener("resize", this.windowDidResize);

    this.prepareGraphData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.prepareGraphData(nextProps);
  }

  componentDidUpdate() {
    this.renderD3();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.windowDidResize);
  }

  prepareGraphData(props) {
    const { nodes, edges } = props;

    const newNodes = nodes.map(n => {
      return { id: n.id, name: n.name };
    });

    const edgeGroupIndices = {};
    const edgeKey = edge => `(${edge.source}, ${edge.target})`;
    const newEdges = edges.map(({ source, target, id, name }) => {
      return { source, target, id, name };
    });

    newEdges.forEach(edge => {
      const k = edgeKey(edge);
      const a = edgeGroupIndices[k] || 0;

      edge.groupIndex = a;

      if (a === 0) {
        edgeGroupIndices[k] = 1;
      } else if (a > 0) {
        edgeGroupIndices[k] = -a;
      } else if (a < 0) {
        edgeGroupIndices[k] = Math.abs(a) + 1;
      }
    });

    this.setState({ nodes: newNodes, edges: newEdges });
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

    const { nodes, edges } = this.state;
    const width = this.svg.parentElement.offsetWidth;
    const height = this.svg.parentElement.offsetHeight;
    const svg = d3.select(this.svg);

    svg.attr("width", width).attr("height", height);

    const edgeJoin = svg.selectAll("g.edge").data(edges, d => d.id);

    const edgeJoinEnter = edgeJoin
      .enter()
      .append("g")
      .classed("edge", true);

    edgeJoinEnter
      .append("path")
      .attr("id", d => d.id)
      .attr("fill", "none")
      .attr("stroke", EDGE_STROKE)
      .attr("stroke-width", EDGE_STROKE_WIDTH);

    edgeJoinEnter
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", NODE_TEXT_FILL)
      .append("textPath")
      .attr("xlink:href", d => `#${d.id}`)
      .text(d => truncate(d.name || d.id, 6));

    edgeJoin.exit().remove();

    const nodeJoin = svg.selectAll("g.node").data(nodes, d => d.id);

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
      .attr("fill", NODE_TEXT_FILL)
      .text(d => truncate(d.name || d.id))
      .each(function(d) {
        const { width, height } = this.getBBox();

        // Capture width and height of text node for future calculations.
        // Mutating the datum for a selection is wack af, but it's already done
        // quite liberally by d3-force ¯\_(ツ)_/¯. We do this again in a few
        // other places.
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
        .selectAll(".edge path")
        .attr("d", d => {
          const { x: x0, y: y0 } = d.source;
          const { x: x1, y: y1 } = d.target;
          const [m0, m1] = midpoint([x0, y0], [x1, y1]);
          const [v0, v1] = orthUnitVector([x1 - x0, y1 - y0]);
          const q0 = m0 + EDGE_CURVATURE * d.groupIndex * v0;
          const q1 = m1 + EDGE_CURVATURE * d.groupIndex * v1;
          const [startPoint, endPoint] = extentBy(
            [d.source, d.target],
            p => p.x
          );

          // prettier-ignore
          return `M ${startPoint.x} ${startPoint.y} Q ${q0} ${q1} ${endPoint.x} ${endPoint.y}`;
        })
        .each(function(d) {
          d.pathLength = this.getTotalLength();
        });

      svg
        .selectAll(".edge textPath")
        .attr("startOffset", d => d.pathLength / 2);
    };

    const updateNodes = () => {
      svg
        .selectAll(".node")
        .select("rect")
        .attr("x", d => d.x - d.width / 2 - NODE_PADDING)
        .attr("y", d => d.y - d.height / 2 - NODE_PADDING);

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

    const drag = d3
      .drag()
      .on("start", d => {
        if (!d3.event.active) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      })
      .on("end", d => {
        d.fx = null;
        d.fx = null;
      });

    svg.selectAll(".node").call(drag);
  }
}

export default Graph;
