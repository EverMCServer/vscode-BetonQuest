import React, { useState, useEffect } from "react";
import { Layout, SiderProps } from "antd";

import "./ResizableSider.css";

interface ResizableSiderProps extends SiderProps {
  // Minimun drag width
  minWidth?: number;

  // Maximun drag width
  maxWidth?: number;
};

let isResizing: boolean = false;

const resizableSider:React.FC<ResizableSiderProps> = ({ children, ...props }) => {
  const [siderWidth, setSiderWidth] = useState(props.width);

  const cbHandleMouseMove = React.useCallback(handleMousemove, []);
  const cbHandleMouseUp = React.useCallback(handleMouseup, []);

  useEffect(() => {
    setSiderWidth(props.width);
  }, [props.collapsed]);

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
      setSiderWidth(offsetRight);
    }
  }

  return (
    <Layout.Sider {...props} width={siderWidth}>
      <div className="sidebar-dragger" onMouseDown={handleMousedown} />
      <div className="sidebar-content">{children}</div>
    </Layout.Sider>
  );
};

export default resizableSider;
