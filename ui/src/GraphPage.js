import React, { Component } from "react";
import "./GraphPage.css";
import Graph from "./Graph";
import LoadingSpinner from "./LoadingSpinner";
import { fetchGraph } from "./api";

class GraphPage extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  async componentWillMount() {
    const { id } = this.props.match.params;
    const graph = await fetchGraph(id);

    this.setState({ graph });
  }

  render() {
    const { graph } = this.state;

    if (!graph) {
      return <LoadingSpinner />;
    }

    return (
      <div className="GraphPage">
        {graph.name && <h1>{graph.name}</h1>}
        <Graph nodes={graph.nodes} edges={graph.edges} />
      </div>
    );
  }
}

export default GraphPage;
