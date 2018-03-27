from itertools import product

import requests


class QuickGraph:
    """Represents a multigraph that can be posted to an external visualization
    service.


    Examples
    --------
    >>> g = QuickGraph()
    >>> g.set_name("My Graph")
    >>> g.add_node("a")
    >>> g.add_node("b")
    >>> g.add_node("c")
    >>> g.add_edge("a", "b", "Edge 1")
    >>> g.add_edge("a", "b", "Edge 2")
    >>> g.add_edge("c", "b", "Edge 3")
    >>> g.post_graph()
    Graph created. View it at http://159.89.136.108/graphs/ea3e11cf-fdd4-4c85-8529-59e2e644b848

    """
    HOST = "159.89.136.108"

    def __init__(self):
        self._graph = {
            "name": "New Graph",
            "nodes": [],
            "edges": []
        }
        self._currentID = 0

    def add_node(self, name):
        self._graph["nodes"].append({
            "id": self._generate_id(),
            "name": name
        })

    def add_edge(self, source, target, label=""):
        self._graph["edges"].append({
            "id": self._generate_id(),
            "name": label,
            "source": source,
            "target": target
        })

    def set_name(self, name):
        self._graph["name"] = name

    def post_graph(self):
        self._finalize_edges()

        r = requests.post("http://{}/api/graphs".format(self.HOST), json=self._graph).json()

        print("Graph created. View it at http://{}/graphs/{}".format(self.HOST, r["id"]))

    def _finalize_edges(self):
        nodes = self._graph["nodes"]
        final_edges = []

        for edge in self._graph["edges"]:
            sources = filter(lambda x: x["name"] == edge["source"], nodes)
            targets = filter(lambda x: x["name"] == edge["target"], nodes)

            for source, target in product(sources, targets):
                final_edges.append({
                    "id": self._generate_id(),
                    "name": edge["name"],
                    "source": source["id"],
                    "target": target["id"]
                })

        self._graph["edges"] = final_edges

    def _generate_id(self):
        self._currentID += 1

        return str(self._currentID)
