import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
  useKeyPress,
  Node,
  Edge,
  Viewport,
  useViewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { toJpeg } from "html-to-image";
import "./styles.css";

import { autoLayout } from "../utils/autoLayout";
import { readYaml } from "../utils/readYaml";
import { writeYaml } from "../utils/writeYaml";

import { downloadFile, downloadImage, initialNode } from "../utils/commonUtils";

const cacheKey = "bq-flow";

export default function MyFlowPanel() {
  const viewport = useViewport();
  const { getNodes, setNodes, getEdges, setEdges, setViewport, fitView } =
    useReactFlow();

  /* Reset Flow */

  const resetFlow = useCallback(
    async (nodes: Node[], edges: Edge[], viewport?: Viewport) => {
      setEdges([]);
      setNodes([]);
      setViewport({ x: 0, y: 0, zoom: 1 });

      setTimeout(() => {
        setNodes(nodes || []);
        setEdges(edges || []);
        if (viewport) {
          setViewport(viewport);
        } else {
          window.requestAnimationFrame(() => fitView());
        }
      }, 0);
    },
    [fitView, setEdges, setNodes, setViewport]
  );

  /* DEL keyboard button event */

  const deleteButtonPressed = useKeyPress(["Delete"]);
  const deleteSelectedNodes = useCallback(() => {
    const nodes2 = getNodes().filter((item, i) => {
      return item.selected !== true;
    });
    const edges2 = getEdges().filter((item, i) => {
      return item.selected !== true;
    });
    setNodes(nodes2);
    setEdges(edges2);
  }, [getNodes, getEdges, setNodes, setEdges]);

  useEffect(() => {
    deleteSelectedNodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteButtonPressed]);

  /* Clear event */

  const onClear = useCallback(() => {
    setEdges([]);
    setNodes([initialNode]);
    window.requestAnimationFrame(() => fitView());
  }, [fitView, setEdges, setNodes]);

  /* DEBUG Save/Restore event */

  const onSave = useCallback(() => {
    let dict = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: viewport,
    };
    const json = JSON.stringify(dict);
    localStorage.setItem(cacheKey, json);
  }, [getNodes, getEdges, viewport]);

  const onRestore = useCallback(() => {
    const item = localStorage.getItem(cacheKey) as string;
    const flow = JSON.parse(item);
    if (!flow) {
      return;
    }
    resetFlow(flow.nodes, flow.edges, flow.viewport);
  }, [resetFlow]);

  /* DEBUG Download/Upload event */

  const onDownloadJSON = useCallback(() => {
    let dict = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: viewport,
    };
    const json = JSON.stringify(dict);
    downloadFile("debug.json", json, "json");
  }, [getNodes, getEdges, viewport]);

  const onUploadJSON = useCallback(() => {
    const ele = document.getElementById("json-upload");
    if (ele) {
      ele.click();
    }
  }, []);

  const uploadJSON = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = function () {
        const text = reader.result;
        const flow = JSON.parse(text as string);
        if (!flow) {
          return;
        }
        resetFlow(flow.nodes, flow.edges, flow.viewport);
      };
      if (file) {
        reader.readAsText(file);
      }
      event.target.value = "";
    },
    [resetFlow]
  );

  /* YML Download/Upload event */

  const onDownloadYML = useCallback(() => {
    const data = writeYaml(getNodes(), getEdges());
    if (!data) {
      return;
    }
    downloadFile(`${data.fileName}.yml`, data.content, "yml");
  }, [getNodes, getEdges]);

  const onUploadYML = useCallback(() => {
    const ele = document.getElementById("yml-upload");
    if (ele) {
      ele.click();
    }
  }, []);

  const uploadYML = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      const file = event.target.files[0];
      let fileName = file.name.split(".").slice(0, -1).join(".");
      const reader = new FileReader();
      reader.onload = function () {
        const text = reader.result;
        const flow = readYaml(fileName, text as string);
        if (!flow) {
          return;
        }

        const obj = autoLayout(flow.nodes, flow.edges);
        if (!obj) {
          return;
        }
        const objCopy = JSON.parse(JSON.stringify(obj));
        resetFlow(objCopy.nodes, objCopy.edges);
      };
      if (file) {
        reader.readAsText(file);
      }
      event.target.value = "";
    },
    [resetFlow]
  );

  /* Screenshot */

  const onScreenshot = useCallback(() => {
    const nodesBounds = getRectOfNodes(getNodes());
    const targetScale = 1;
    const targetWidth = nodesBounds.width * targetScale;
    const targetHeight = nodesBounds.height * targetScale;

    const transform = getTransformForBounds(
      nodesBounds,
      targetWidth,
      targetHeight,
      0.5,
      2
    );
    const ele = document.querySelector(".react-flow__viewport");
    toJpeg(ele as HTMLElement, {
      backgroundColor: "#ffffff",
      quality: 0.95,
      width: targetWidth,
      height: targetHeight,
      style: {
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  }, [getNodes]);

  /* Auto Layout */

  const onAutoLayout = useCallback(() => {
    const obj = autoLayout(getNodes(), getEdges());
    if (!obj) {
      return;
    }
    const objCopy = JSON.parse(JSON.stringify(obj));
    resetFlow(objCopy.nodes, objCopy.edges);
  }, [getNodes, getEdges, resetFlow]);

  const [needsLayout, setNeedsLayout] = useState(false);

  useEffect(() => {
    if (needsLayout) {
      onAutoLayout();
      setNeedsLayout(false);
    }
  }, [needsLayout, onAutoLayout]);

  return (
    <Panel position="top-right" className="panel">
      <input
        type="file"
        id="json-upload"
        onChange={uploadJSON}
        style={{ display: "none" }}
      />
      <input
        type="file"
        id="yml-upload"
        onChange={uploadYML}
        className="download-btn"
        style={{ display: "none" }}
      />
      <button onClick={onRestore} className="debug-button">
        Cache: Restore
      </button>
      <button onClick={onSave} className="debug-button">
        Cache: Save
      </button>
      <button onClick={onUploadJSON} className="debug-button">
        DEBUG: Upload
      </button>
      <button onClick={onDownloadJSON} className="debug-button">
        DEBUG: Download
      </button>
      <button onClick={onClear} className="clear-button">
        Clear all
      </button>
      <button onClick={onAutoLayout} className="user-button">
        Auto Layout
      </button>
      <button onClick={onScreenshot} className="user-button">
        Screenshot
      </button>
      <button onClick={onUploadYML} className="user-button">
        yml: Upload
      </button>
      <button onClick={onDownloadYML} className="user-button">
        yml: Download
      </button>
    </Panel>
  );
}
