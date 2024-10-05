"use client";

import { useState, useCallback, useMemo } from "react";
import { ReactFlow, applyEdgeChanges, applyNodeChanges, Background, Controls, addEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ExecuteBar from "./execute_bar";
import Node from "@/presentation/components/node";

const initialNodes = [
  {
    id: "1",
    data: { defaultLabel: "Hello", defaultText: "Hello World" },
    position: { x: 0, y: 0 },
    type: "Node",
  },
  {
    id: "2",
    data: { label: "World" },
    position: { x: 100, y: 100 },
  },
];

const initialEdges = [{ id: "1-2", source: "1", target: "2", label: "to the", type: "step" }];

export default function Whiteboard() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback((changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const nodeTypes = useMemo(() => ({ Node: Node }), []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <ExecuteBar />
    </div>
  );
}
