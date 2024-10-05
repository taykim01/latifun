"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  addEdge,
  NodeChange,
  EdgeChange,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ExecuteBar from "./execute_bar";
import Node from "@/presentation/components/node";
import createEmptyNodeUseCase from "@/application/use_cases/create_empty_node.use_case";
import readProjectNodesUseCase from "@/application/use_cases/read_my_nodes.use_case";
import { Tables } from "@/application/dao/database.types";
import { moveNodeUseCase } from "@/application/use_cases/modify_node.use_case";
import deleteNodeUseCase from "@/application/use_cases/delete_node.use_case";

type NodeUI = {
  id: string;
  data: {
    defaultLabel: string;
    defaultText: string;
  };
  position: {
    x: number;
    y: number;
  };
  type: string;
};

type EdgeUI = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
};

const initialEdges = [{ id: "1-2", source: "1", target: "2", label: "to the", type: "step" }];

export default function Whiteboard() {
  const [nodes, setNodes] = useState<NodeUI[]>([]);
  const [edges, setEdges] = useState<EdgeUI[]>([]);
  const lastMoveCallTime = useRef(Date.now());

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      const later = () => {
        timeout = null;
        func(...args);
      };
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const readInitialNodes = async () => {
    const nodes = await readProjectNodesUseCase();

    const newNodes = nodes.map((node: Tables<"node">) => {
      const positions = JSON.parse(node.position as string);
      const UINode: NodeUI = {
        id: node.id,
        data: {
          defaultLabel: node.type,
          defaultText: node.data as string,
        },
        position: {
          x: positions.x,
          y: positions.y,
        },
        type: node.type,
      };
      return UINode;
    });

    setNodes(newNodes);
  };

  useEffect(() => {
    readInitialNodes();
  }, []);

  const debouncedMoveNode = useCallback(
    debounce(async (id: string, changedNode: any) => {
      const now = Date.now();
      if (now - lastMoveCallTime.current >= 2000) {
        await moveNodeUseCase(id, changedNode);
        lastMoveCallTime.current = now;
      }
    }, 500),
    []
  );

  const onNodesChange = useCallback(async (changes: NodeChange<NodeUI>[]) => {
    setNodes((nds) => {
      return applyNodeChanges(changes, nds);
    });
    const nodeChange = changes[0] as any;
    if (!nodeChange.position) return;
    const changedNode = { x: nodeChange.position.x, y: nodeChange.position.y };
    debouncedMoveNode(nodeChange.id, changedNode);
  }, []);
  const onEdgesChange = useCallback(
    (changes: EdgeChange<EdgeUI>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), []);

  const nodeTypes = useMemo(
    () => ({
      USER_FLOW_PAGE: Node,
      USER_FLOW_ACTION: Node,
      USE_CASE: Node,
      SCHEMA_TABLE: Node,
      PRESENTATION_PAGE: Node,
      PRESENTATION_COMPONENT: Node,
      IDEA: Node,
      EDGE: Node,
    }),
    []
  );

  const createNewNode = useCallback(async (type: string) => {
    const nodeID = await createEmptyNodeUseCase({ type: type });

    const newNode = {
      id: nodeID,
      data: { defaultLabel: type, defaultText: "" },
      position: { x: 0, y: 0 },
      type: type,
    };

    setNodes((nds) => [...nds, newNode]);
  }, []);

  const onNodesDelete = useCallback(
    async (deleted: any[]) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter((edge: EdgeUI) => !connectedEdges.includes(edge));

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            }))
          );

          return [...remainingEdges, ...createdEdges];
        }, edges)
      );
      await deleteNodeUseCase(deleted[0].id);
    },
    [nodes, edges]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <ExecuteBar onClick={createNewNode} />
    </div>
  );
}
