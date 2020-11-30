import React from "react";
import "./styles.css";
import Sunburst from "./Sunburst";

import { hierarchy } from "@visx/hierarchy";
import data from "./data";
import { ScaleSVG } from "@visx/responsive";

export default function App() {
  const root = hierarchy(data).sum((d) => d.size);
  return (
    <div className="App">
      <h1>Visx zoomable sunburst chart</h1>
      <ScaleSVG width={600} height={600}>
        <Sunburst root={root} width={600} height={600} />
      </ScaleSVG>
    </div>
  );
}
