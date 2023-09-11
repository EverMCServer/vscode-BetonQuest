import React, { useState, useEffect } from "react";
import { Drawer, DrawerProps } from "antd";

import "./ResizableDrawer.css";

interface ResizableDrawerProps extends DrawerProps {
  // Minimun drag width
  minWidth?: number;

  // Maximun drag width
  maxWidth?: number;
};

let isResizing: boolean = false;

const ResizableDrawer:React.FC<ResizableDrawerProps> = ({ children, ...props }) => {
  const [drawerWidth, setDrawerWidth] = useState(props.width);

  const cbHandleMouseMove = React.useCallback(handleMousemove, []);
  const cbHandleMouseUp = React.useCallback(handleMouseup, []);

  useEffect(() => {
    setDrawerWidth(props.width);
    //// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, props.width]);

  function handleMouseup(e: MouseEvent) {
    if (!isResizing) {
      return;
    }
    isResizing = false;
    document.removeEventListener("mousemove", cbHandleMouseMove);
    document.removeEventListener("mouseup", cbHandleMouseUp);
  }

  function handleMousedown(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    // we will only add listeners when needed, and remove them afterward
    document.addEventListener("mousemove", cbHandleMouseMove);
    document.addEventListener("mouseup", cbHandleMouseUp);
    isResizing = true;
  }

  function handleMousemove(e: MouseEvent) {
    let offsetRight =
      document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
    let minWidth = props.minWidth || document.body.scrollWidth/4;
    let maxWidth = props.maxWidth || document.body.scrollWidth;
    if (offsetRight > minWidth && offsetRight < maxWidth) {
      setDrawerWidth(offsetRight);
    }
  }

  return (
    <Drawer {...props} width={drawerWidth}>
      <div className="sidebar-dragger" onMouseDown={handleMousedown} />
      <div className="sidebar-content">{children}</div>
    </Drawer>
  );
};

export default ResizableDrawer;
