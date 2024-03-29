import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Layout, SiderProps } from "antd";

import "./ResizableSider.css";

interface ResizableSiderProps extends SiderProps {
  // Default width
  width: number;

  // Minimun drag width
  minWidth?: number;

  // Maximun drag width
  maxWidth?: number;
};

let isResizing: boolean = false;

const resizableSider: React.FC<ResizableSiderProps> = ({ children, ...props }) => {
  const [siderWidth, _setSiderWidth] = useState<number | string>(props.width);
  const cachedSiderWidth = useRef<number>(siderWidth as number);
  function setSiderWidth(width: number) {
    cachedSiderWidth.current = width;
    _setSiderWidth(width);
  }

  const cbHandleMouseMove = React.useCallback(handleMousemove, []);
  const cbHandleMouseUp = React.useCallback(handleMouseup, []);

  useEffect(() => {
    setSiderWidth(props.width);
  }, [props.width]);

  function handleMouseup(e: MouseEvent) {
    if (!isResizing) {
      return;
    }
    isResizing = false;
    window.removeEventListener("mousemove", cbHandleMouseMove);
    window.removeEventListener("mouseup", cbHandleMouseUp);
  }

  function handleMousedown(e: React.MouseEvent) {
    e.stopPropagation();
    // we will only add listeners when needed, and remove them afterward
    window.addEventListener("mousemove", cbHandleMouseMove);
    window.addEventListener("mouseup", cbHandleMouseUp);
    isResizing = true;
  }

  function handleMousemove(e: MouseEvent) {
    let offsetRight =
      document.body.offsetWidth - (e.clientX - document.body.offsetLeft);
    let minWidth = props.minWidth || 220;
    let maxWidth = props.maxWidth || document.body.offsetWidth;
    if (maxWidth > document.body.offsetWidth) {
      maxWidth = document.body.offsetWidth;
    }

    // Stick to the side if near boundry
    if (offsetRight > maxWidth - 32 && document.body.offsetWidth === maxWidth) {
      setSiderWidth(maxWidth);
      return;
    }

    if (offsetRight >= minWidth && offsetRight <= maxWidth) {
      setSiderWidth(offsetRight);
    }
  }

  // Adjust width when screen resized
  useEffect(() => {
    let cache = siderWidth;
    const cbHandleWindowResize = () => {
      setTimeout(() => {
        if (cachedSiderWidth.current >= document.body.offsetWidth) {
          if (cache !== "100%") {
            _setSiderWidth("100%");
            cache = "100%";
          }
        } else {
          if (cache !== cachedSiderWidth.current) {
            _setSiderWidth(cachedSiderWidth.current);
            cache = cachedSiderWidth.current;
          }
        }
      }, 0);
    };
    window.addEventListener("resize", cbHandleWindowResize);
    return () => {
      window.removeEventListener("resize", cbHandleWindowResize);
    };
  }, []);

  return (
    <Layout.Sider {...props} width={siderWidth}>
      <div className="sidebar-dragger" onMouseDown={handleMousedown} />
      <div className="sidebar-content" style={{ height: "100%" }}>{children}</div>
    </Layout.Sider>
  );
};

export default resizableSider;
