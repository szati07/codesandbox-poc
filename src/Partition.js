import React from "react";
import cx from "classnames";
import { Group } from "@visx/group";
import { partition as d3partition } from "d3-hierarchy";
import { HierarchyDefaultNode as DefaultNode } from "@visx/hierarchy";

import { Text } from "@visx/text";

const Partition = ({
  top,
  left,
  className,
  root,
  size,
  round,
  padding,
  children,
  nodeComponent = DefaultNode,
  ...restProps
}) => {
  const partition = d3partition();
  if (size) partition.size(size);
  if (round) partition.round(round);
  if (padding) partition.padding(padding);
  partition(root);

  return (
    console.log("particione"),
    (
      <>
        <Group top={top} left={left} className={cx("vx-partition", className)}>
          {children}
        </Group>
      </>
    )
  );
};

export default Partition;
