"use client";

import { ReactFlow, Background, Controls } from "@xyflow/react";

export default function Whiteboard() {
    return (
        <div className="w-full h-full">
            <ReactFlow>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}
