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
import ExecuteBar, { ActionOptions } from "./execute_bar";
import Node, { NodeOptions } from "@/presentation/components/node";
import {
  createEdgeNodeUseCase,
  createEmptyNodeUseCase,
  createNodeUseCase,
  updateNodeUseCase,
} from "@/application/use_cases/create_empty_node.use_case";
import { readProjectEdgesUseCase, readProjectNodesUseCase } from "@/application/use_cases/read_my_nodes.use_case";
import { Tables } from "@/application/dao/database.types";
import { moveNodeUseCase } from "@/application/use_cases/modify_node.use_case";
import deleteNodeUseCase from "@/application/use_cases/delete_node.use_case";
import { ACTIONS, convertActionsToNodeType } from "@/core/constants/actions";
import Components from ".";
import { Button } from "@/presentation/shadcn/button";
import generateApplicationUseCase, { updateUseCase } from "@/application/use_cases/generate_application.use_case";
import generateSchemaCodeUseCase from "@/application/use_cases/generate_schema_code.use_case";
import generateApplicationCodeUseCase from "@/application/use_cases/generate_application_code.use_case";
import { useRouter } from "next/navigation";
import generatePresentationPageSpecUseCase from "@/application/use_cases/generate_presentation_page_spec.use_case";
import generatePresentationComponentSpecUseCase from "@/application/use_cases/generate_presentation_component_spec.use_case";
import generatePresenationComponentCodeUseCase from "@/application/use_cases/generate_presentation_component_code.use_case";

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

export type EdgeUI = {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
};

export type EdgeData = {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};

export default function Whiteboard({ projectId }: { projectId: string }) {
  const [nodes, setNodes] = useState<NodeUI[]>([]);
  const [edges, setEdges] = useState<EdgeUI[]>([]);
  const [resultBar, setResultBar] = useState<boolean>(false);
  const [helpBar, setHelpBar] = useState<boolean>(false);
  const lastMoveCallTime = useRef(Date.now());

  const router = useRouter();

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

  const readInitialNodesAndEdges = async () => {
    const nodes = await readProjectNodesUseCase(projectId);
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

    const edges = await readProjectEdgesUseCase(projectId);
    const newEdges = edges.map((edge: Tables<"node">) => {
      const edgeData: EdgeData = JSON.parse(edge.data as string);
      const UIEdge: EdgeUI = {
        id: edge.id,
        source: edgeData.source,
        target: edgeData.target,
        label: "",
        type: "EDGE",
      };
      return UIEdge;
    });
    setEdges(newEdges);
  };

  useEffect(() => {
    readInitialNodesAndEdges();
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
    const newNodes: any[] = [];
    setNodes((nds) => {
      const newNode = applyNodeChanges(changes, nds);
      newNodes.push(newNode);
      // return applyNodeChanges(changes, nds);
      return newNode;
    });
    console.log(JSON.stringify(newNodes));
    const nodeChange = changes[0] as any;
    if (!nodeChange.position) return;
    const changedNode = { x: nodeChange.position.x, y: nodeChange.position.y };
    debouncedMoveNode(nodeChange.id, changedNode);
  }, []);

  const onEdgesChange = useCallback(async (changes: EdgeChange<EdgeUI>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(async (params: any) => {
    setEdges((eds) => addEdge(params, eds));
    const newEdge: EdgeData & { id: string } = {
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      id: `${params.source}->${params.target}`,
    };

    await createEdgeNodeUseCase(newEdge);
  }, []);

  const nodeTypes = useMemo(
    () => ({
      USER_FLOW_PAGE: Node,
      USER_FLOW_ACTION: Node,
      USE_CASE: Node,
      USE_CASE_CODE: Node,
      SCHEMA_TABLE: Node,
      PRESENTATION_PAGE_SPEC: Node,
      PRESENTATION_PAGE: Node,
      PRESENTATION_COMPONENT_SPEC: Node,
      PRESENTATION_COMPONENT: Node,
      IDEA: Node,
      EDGE: Node,
    }),
    []
  );

  const createEmptyNode = useCallback(async (type: NodeOptions) => {
    const nodeID = await createEmptyNodeUseCase({ type, projectId });

    const newNode = {
      id: nodeID,
      data: { defaultLabel: type, defaultText: "" },
      position: { x: 0, y: 0 },
      type: type,
    };

    setNodes((nds) => [...nds, newNode]);
  }, []);

  const createNewNode = useCallback(async (type: NodeOptions, data: string) => {
    const nodeID = await createNodeUseCase({ type, projectId, data });

    const newNode = {
      id: nodeID,
      data: { defaultLabel: type, defaultText: data },
      position: { x: 0, y: 0 }, // TODO: set position based on the last node
      type: type,
    };

    setNodes((nds) => [...nds, newNode]);
    return nodeID;
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

  const onEdgesDelete = useCallback(async (deleted: any[]) => {
    setEdges((eds) => eds.filter((edge) => !deleted.includes(edge)));
    await deleteNodeUseCase(deleted[0].id);
  }, []);

  const executeAction = async (action: ActionOptions) => {
    const nodeTypes = convertActionsToNodeType(action);
    const filteredNodes = nodes.filter((node) => nodeTypes.includes(node.type as NodeOptions));
    const minimizedNodes = filteredNodes.map((node) => {
      return {
        id: node.id,
        type: node.type,
        data: node.data.defaultText,
      };
    });

    const relatedEdges = edges.filter((edge) => {
      return filteredNodes.some((node) => {
        return node.id === edge.source || node.id === edge.target;
      });
    });
    const minimizedEdges = relatedEdges.map((edge) => {
      return {
        id: "from " + edge.source + " to " + edge.target,
        type: "EDGE",
      };
    });

    const inputs = [...minimizedNodes, ...minimizedEdges];
    const inputJson = JSON.stringify(inputs);

    if (action === ACTIONS[0]) {
      const useCases = await generateApplicationUseCase(inputJson, projectId);
      for (const useCase of useCases) {
        const data = {
          title: useCase.title,
          description: useCase.description,
        };
        const stringifiedData = JSON.stringify(data);
        const nodeId = await createNewNode("USE_CASE", stringifiedData);
        const updatedUseCase = await updateUseCase(
          {
            node_id: nodeId,
          },
          useCase.id
        );
      }
    } else if (action === ACTIONS[1]) {
      const outputs = await generateSchemaCodeUseCase(inputJson, projectId);
      outputs.forEach((output: any) => {
        const data = JSON.stringify(output);
        createNewNode("SCHEMA_TABLE", data);
      });
    } else if (action === ACTIONS[2]) {
      const outputs = (await generateApplicationCodeUseCase(inputJson, projectId)) as any[];
      outputs.forEach((output) => {
        // TODO: 실제로 USE_CASE 노드와 엣지로 연결하기
        const data = JSON.stringify(output);
        createNewNode("USE_CASE_CODE", data);
      });
    } else if (action === ACTIONS[3]) {
      // "Generate Page Spec",
      console.log(inputJson);
      const outputs = await generatePresentationPageSpecUseCase(inputJson, projectId);
      for (const output of outputs) {
        const newPageSpec = JSON.stringify(output);
        const pageSpecNodeId = (await createNewNode("PRESENTATION_PAGE_SPEC", newPageSpec)) as string;
        const componentsSpecs = await generatePresentationComponentSpecUseCase(newPageSpec, inputJson, projectId);
        for (const componentSpec of componentsSpecs) {
          const componenSpecIncluidngPageId = {
            ...componentSpec,
            page_id: pageSpecNodeId,
          };
          const componentData = JSON.stringify(componenSpecIncluidngPageId);
          createNewNode("PRESENTATION_COMPONENT_SPEC", componentData);
        }
      }
    } else if (action === ACTIONS[4]) {
      const componentSpecNodes = nodes.filter((node) => node.type === "PRESENTATION_COMPONENT_SPEC");
      const pageSpecNodes = nodes.filter((node) => node.type === "PRESENTATION_PAGE_SPEC");
      const schemaNodes = nodes.filter((node) => node.type === "SCHEMA_TABLE");
      const useCaseCodeNodes = nodes.filter((node) => node.type === "USE_CASE_CODE");

      for (const componentSpecNode of componentSpecNodes) {
        const parentPageSpecNodeId = JSON.parse(componentSpecNode.data.defaultText).page_id;
        const parentPageSpecNode = pageSpecNodes.find((node) => node.id === parentPageSpecNodeId) as NodeUI;

        const componentSpecNodeJson = JSON.stringify({
          id: componentSpecNode.id,
          type: componentSpecNode.type,
          data: componentSpecNode.data.defaultText,
        });
        const parentPageSpecNodeJson = JSON.stringify({
          id: parentPageSpecNode.id,
          type: parentPageSpecNode.type,
          data: parentPageSpecNode.data.defaultText,
        });
        const schemaNodesJson = JSON.stringify(
          schemaNodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data.defaultText,
          }))
        );
        const useCaseCodeNodesJson = JSON.stringify(
          useCaseCodeNodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data.defaultText,
          }))
        );

        const output = await generatePresenationComponentCodeUseCase(
          componentSpecNodeJson,
          schemaNodesJson,
          parentPageSpecNodeJson,
          useCaseCodeNodesJson,
          projectId
        );
        const componenCodeIncluidngPageId = {
          ...output,
          page_id: parentPageSpecNodeId,
        };
        const data = JSON.stringify(componenCodeIncluidngPageId);
        createNewNode("PRESENTATION_COMPONENT", data);
      }
    } else if (action === ACTIONS[5]) {
      const pageSpecNodes = nodes.filter((node) => node.type === "PRESENTATION_PAGE_SPEC");
      const componentCodeNodes = nodes.filter((node) => node.type === "PRESENTATION_COMPONENT");
      const schemaNodes = nodes.filter((node) => node.type === "SCHEMA_TABLE");
      const useCaseCodeNodes = nodes.filter((node) => node.type === "USE_CASE_CODE");

      for (const pageSpecNode of pageSpecNodes) {
        const filteredComponentCodeNodes = componentCodeNodes.filter((node) => {
          return JSON.parse(node.data.defaultText).page_id === pageSpecNode.id;
        }) as NodeUI[];

        const pageSpecNodeJson = JSON.stringify({
          id: pageSpecNode.id,
          type: pageSpecNode.type,
          data: pageSpecNode.data.defaultText,
        });
        const componentCodeNodesJson = JSON.stringify(
          filteredComponentCodeNodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data.defaultText,
          }))
        );

        const schemaNodesJson = JSON.stringify(
          schemaNodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data.defaultText,
          }))
        );

        const useCaseCodeNodesJson = JSON.stringify(
          useCaseCodeNodes.map((node) => ({
            id: node.id,
            type: node.type,
            data: node.data.defaultText,
          }))
        );

        const output = await generatePresenationComponentCodeUseCase(
          pageSpecNodeJson,
          componentCodeNodesJson,
          useCaseCodeNodesJson,
          schemaNodesJson,
          projectId
        );
        const data = JSON.stringify(output);
        createNewNode("PRESENTATION_COMPONENT", data);
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <Components.ExecuteBar onClick={createEmptyNode} action={executeAction} />
      <Components.ResultsBar result="hello world" open={resultBar} onClose={() => setResultBar(false)} />
      <Components.HelpBar open={helpBar} onClose={() => setHelpBar(false)} />
      <div className="fixed top-3 left-3 flex flex-col gap-2 p-5 rounded-lg bg-white border border-100 shadow-sm">
        <Button
          className="transition-all duration-300"
          onClick={() => {
            setResultBar(!resultBar);
            setHelpBar(false);
          }}
        >
          Show Results
        </Button>
        <Button
          variant="secondary"
          className="transition-all duration-300 hover:bg-gray-200 "
          onClick={() => {
            setHelpBar(!helpBar);
            setResultBar(false);
          }}
        >
          Need Help?
        </Button>
        <Button variant="outline" className="transition-all duration-300" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}
