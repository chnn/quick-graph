import MISERABLES from "./miserables.js";

const GRAPH_FIXTURE = {
  name: "Les Misérables",
  nodes: MISERABLES.nodes,
  edges: MISERABLES.edges
};

const timeout = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const fetchGraph = async (/* graphId */) => {
  await timeout(1000);

  return { data: GRAPH_FIXTURE };
};
