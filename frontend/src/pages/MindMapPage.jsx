import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2, Network, Sparkles } from "lucide-react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

function buildFlowData(mindMap) {
  const sourceNodes = mindMap?.nodes || [];
  const rootIndex = Math.max(
    0,
    sourceNodes.findIndex((node) => !node.parentId || node.type === "root")
  );
  const root = sourceNodes[rootIndex];
  const childrenByParent = sourceNodes.reduce((acc, node) => {
    if (!node.parentId) return acc;
    acc[node.parentId] = [...(acc[node.parentId] || []), node];
    return acc;
  }, {});

  const positioned = [];

  function visit(node, depth, siblingIndex, siblingCount) {
    const spread = Math.max(1, siblingCount - 1);
    const y = (siblingIndex - spread / 2) * 150;
    positioned.push({
      id: node.id,
      type: "default",
      position: {
        x: depth * 280,
        y: depth === 0 ? 0 : y + depth * 24,
      },
      data: {
        label: (
          <div className="max-w-48">
            <div className="text-sm font-semibold text-white">{node.label}</div>
            {node.description && (
              <div className="mt-1 text-[11px] leading-4 text-slate-300">
                {node.description}
              </div>
            )}
          </div>
        ),
      },
      style: {
        border: "1px solid rgba(125, 211, 252, 0.25)",
        borderRadius: 18,
        background:
          node.type === "root"
            ? "linear-gradient(135deg, rgba(168,85,247,.95), rgba(34,211,238,.9))"
            : "rgba(15, 23, 42, 0.92)",
        boxShadow: "0 18px 45px rgba(8, 47, 73, 0.25)",
        padding: 12,
      },
    });

    const children = childrenByParent[node.id] || [];
    children.forEach((child, index) =>
      visit(child, depth + 1, index, children.length)
    );
  }

  if (root) {
    visit(root, 0, 0, 1);
  }

  const edges = sourceNodes
    .filter((node) => node.parentId)
    .map((node) => ({
      id: `${node.parentId}-${node.id}`,
      source: node.parentId,
      target: node.id,
      animated: true,
      style: { stroke: "rgba(34,211,238,.75)", strokeWidth: 2 },
    }));

  return { nodes: positioned, edges };
}

export default function MindMapPage() {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const noteId = localStorage.getItem("noteId");
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowData(note?.mindMap),
    [note]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!noteId) return;
    axios.get(`${API_URL}/${noteId}`).then((res) => setNote(res.data));
  }, [noteId]);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setEdges, setNodes]);

  const generateMindMap = async () => {
    if (!noteId) {
      alert("Upload or create a note first");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/mind-map/${noteId}`);
      setNote(res.data);
    } catch (error) {
      alert("Mind map generation failed");
    } finally {
      setLoading(false);
    }
  };

  const hasMindMap = nodes.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl space-y-5"
    >
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              <Network className="h-3.5 w-3.5" />
              Interactive visual aid
            </div>
            <h1 className="text-3xl font-semibold text-white">
              {note?.mindMap?.title || "Mind Maps"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Generate draggable concept trees with animated relationships from
              the current uploaded note.
            </p>
          </div>
          <button
            onClick={generateMindMap}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Mind Map
          </button>
        </div>
      </div>

      <div className="h-[650px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#050815]/80 shadow-2xl shadow-cyan-950/20">
        {hasMindMap ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background color="rgba(148,163,184,.18)" gap={28} />
            <Controls />
            <MiniMap pannable zoomable nodeColor="#22d3ee" />
          </ReactFlow>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <Network className="mx-auto mb-4 h-10 w-10 text-cyan-300" />
              <h2 className="text-xl font-semibold text-white">
                No mind map yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Upload notes, then generate a concept tree. Nodes can be dragged
                and zoomed once created.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
