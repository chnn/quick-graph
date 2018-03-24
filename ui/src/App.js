import React, { Component } from "react";
import "./App.css";
import Graph from "./Graph";

const GRAPH_FIXTURE = {
  name: "My Graph",
  nodes: [{ id: "a", label: "a" }, { id: "b" }, { id: "c" }],
  edges: [{ source: "a", target: "b" }, { source: "b", target: "c" }]
};

class App extends Component {
  render() {
    return (
      <div className="App">
        {GRAPH_FIXTURE.name && <h1>{GRAPH_FIXTURE.name}</h1>}
        <Graph nodes={GRAPH_FIXTURE.nodes} edges={GRAPH_FIXTURE.edges} />
      </div>
    );
  }
}

export default App;
