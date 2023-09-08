import React, { useState, useEffect } from "react";
import { Drawer, DrawerProps } from "antd";

import "./ResizableDrawer.css";

interface ResizableDrawerProps extends DrawerProps {
};

let isResizing: boolean = false;

const ResizableDrawer:React.FC<ResizableDrawerProps> = ({ children, ...props }) => {
  const [drawerWidth, setDrawerWidth] = useState(props.width);

  const cbHandleMouseMove = React.useCallback(handleMousemove, []);
  const cbHandleMouseUp = React.useCallback(handleMouseup, []);

  useEffect(() => {
    setDrawerWidth(props.width);
    //// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

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
    let minWidth = 256;
    let maxWidth = 600;
    if (offsetRight > minWidth && offsetRight < maxWidth) {
      setDrawerWidth(offsetRight);
    }
  }

  return (
    <Drawer {...props} width={drawerWidth}>
      <div className="sidebar-dragger" onMouseDown={handleMousedown} />
      {children}
    </Drawer>
  );
};

export default ResizableDrawer;
