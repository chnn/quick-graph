import MISERABLES from "./miserables.js";

export const GRAPH_FIXTURE = {
  name: "Les Misérables",
  nodes: MISERABLES.nodes,
  edges: MISERABLES.edges
};

export const fetchGraph = async id => {
  const graph = await fetch(`/api/graphs/${id}`).then(r => r.json());

  return graph;
};
