// Implementation Example:
// https://github.com/react-spring/react-spring-examples/tree/renderprops/demos/renderprops/sunburst

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from "react";
import { Group } from "@visx/group";
import { arc as d3arc } from "d3-shape";
import { scaleLinear, scaleSqrt, scaleOrdinal } from "@visx/scale";
import { interpolate as d3interpolate } from "d3-interpolate";
import Partition from "./Partition";
import { useSpring, animated } from "react-spring";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { localPoint } from "@visx/event";

var color = scaleOrdinal().range([
  "#FE938C",
  "#E6B89C",
  "#EAD2AC",
  "#9CAFB7",
  "#4281A4"
]);

let tooltipTimeout;

const SunburstDiagram = (props) => {
  const {
    root,
    width,
    height,
    margin = { top: 0, left: 0, right: 0, bottom: 0 }
  } = props;

  // Complete set of input values
  const [xDomain, setXDomain] = useState([0, 1]);
  const [yDomain, setYDomain] = useState([0, 1]);

  // Output range
  const [xRange] = useState([0, 2 * Math.PI]);
  const [yRange, setYRange] = useState([0, width / 2]);

  // // // Scale Axis
  // const xScale = useMemo(() => scaleLinear(), [width]);
  // const yScale = useMemo(() => scaleSqrt(), [height]);
  const xScale = scaleLinear();
  const yScale = scaleSqrt();
  // Map input domain to output range
  xScale.domain(xDomain).range(xRange);
  yScale.domain(yDomain).range(yRange);

  const handleClick = (node) => {
    setXDomain([node.x0, node.x1]);
    setYDomain([node.y0, 1]);
    setYRange([node.y0 ? 20 : 0, width / 2]);
  };

  // Arc generators produce path data from angle and radius values.
  const arcGenerator = d3arc()
    .startAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale(d.x0))))
    .endAngle((d) => Math.max(0, Math.min(2 * Math.PI, xScale(d.x1))))
    .innerRadius((d) => Math.max(0, yScale(d.y0)))
    .outerRadius((d) => Math.max(0, yScale(d.y1)));

  const rootDescendants = root.descendants();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true
  });
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip
  } = useTooltip();

  const handleUpdate = (t, xd, yd, yr) => {
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    xScale.domain(xd(t));
    yScale.domain(yd(t)).range(yr(t));
  };

  const xd = d3interpolate(xScale.domain(), xDomain);
  const yd = d3interpolate(yScale.domain(), yDomain);
  const yr = d3interpolate(yScale.range(), yRange);

  return (
    <svg width={width} height={height}>
      <Partition top={margin.top} left={margin.left} root={root}>
        <Group top={height / 2} left={width / 2}>
          {rootDescendants.map((node, index) => (
            <AnimatedPath
              node={node}
              onClick={handleClick}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              onUpdate={handleUpdate}
              xd={xd}
              yd={yd}
              yr={yr}
              arcGenerator={arcGenerator}
              key={index}
            />
          ))}
        </Group>
      </Partition>
      {tooltipOpen && (
        <TooltipInPortal
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          Data value <strong>{tooltipData}</strong>
        </TooltipInPortal>
      )}
    </svg>
  );
};

function AnimatedPath({
  node,
  onClick,
  showTooltip,
  hideTooltip,
  onUpdate,
  xd,
  yd,
  yr,
  arcGenerator
}) {
  const { t, fill } = useSpring({
    native: true,
    reset: true,
    from: { t: 0, fill: "yellow" },
    to: { t: 1, fill: "black" },
    config: {
      mass: 5,
      tension: 500,
      friction: 100,
      precision: 0.00001
    },
    onFrame: ({ t }) => onUpdate(t, xd, yd, yr)
  });

  const handleMouseOver = useCallback(
    (event, data) => {
      const coords = localPoint(event.target.ownerSVGElement, event);
      showTooltip({
        tooltipLeft: coords.x,
        tooltipTop: coords.y,
        tooltipData: data.size
      });
    },
    [showTooltip]
  );

  const handleClick = useCallback(() => {
    onClick(node);
  }, [node]);

  const handleMouseLeave = useCallback(() => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  }, [hideTooltip]);

  return (
    <animated.path
      onClick={handleClick}
      className="path"
      d={t.interpolate(() => arcGenerator)}
      stroke="#fff"
      strokeWidth="1"
      fill={fill.interpolate((d) => d)}
      fillRule="evenodd"
      onMouseEnter={(e) => handleMouseOver(e, node.data)}
      onMouseLeave={handleMouseLeave}
    />
  );
}

function areEqual(prevProps, nextProps) {
  /*
  return true if passing nextProps to render would return
  the same result as passing prevProps to render,
  otherwise return false
  */
  return true;
}

export default React.memo(SunburstDiagram, areEqual);
