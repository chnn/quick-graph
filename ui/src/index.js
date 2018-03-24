import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import GraphPage from "./GraphPage";
import { BrowserRouter as Router, Route } from "react-router-dom";

ReactDOM.render(
  <Router>
    <Route path="/graphs/:id" component={GraphPage} />
  </Router>,
  document.getElementById("root")
);
