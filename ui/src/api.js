export const fetchGraph = async id => {
  const graph = await fetch(`/api/graphs/${id}`).then(r => r.json());

  return graph;
};
