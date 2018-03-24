import React, { Component } from "react";
import "./App.css";
import Graph from "./Graph";
import LoadingSpinner from "./LoadingSpinner";
import { fetchGraph } from "./api";

class App extends Component {
  constructor() {
    super(...arguments);

    this.state = {};
  }

  async componentWillMount() {
    const resp = await fetchGraph();

    this.setState({ graph: resp.data });
  }

  render() {
    const { graph } = this.state;

    if (!graph) {
      return <LoadingSpinner />;
    }

    return (
      <div className="App">
        {graph.name && <h1>{graph.name}</h1>}
        <Graph nodes={graph.nodes} edges={graph.edges} />
      </div>
    );
  }
}

export default App;
