import React, { useRef, useEffect, useState } from "react";
import { fetchGraphData } from "../../services/graphs.js";
import ForceGraph2D from "react-force-graph-2d";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const WeightedGraphViewer = () => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [weightType, setWeightType] = useState("CO");
  const [weightedGraph, setWeightedGraph] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  const [tab, setTab] = useState("edges");
  const [noDataLabel, setNoDataLabel] = useState(false)
  const NoData = "No traces to plot Graph"
  const fgRef = useRef();
  const sidePanelRef = useRef();

  const convertToMicroseconds = (date) => (date ? date.getTime() * 1000 : null);

  const transformData = (data) => ({
    nodes: data.nodes.map((node) => ({
      id: node.id,
      importance: node.absolute_importance || 0,
      dependence: node.absolute_dependence || 0,
    })),
    links: data.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight || 1,
      latency: edge["latency(ms)"] || 0,
      frequency: edge.frequency || 0,
      co_execution: edge.co_execution || 0,
    })),
  });

  useEffect(() => {
    setStartTime(new Date(Date.now() - 15 * 60 * 1000));
    setEndTime(new Date());
    handleFetchGraph();
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force("link").distance((link) => link.weight * 10);
    }

    if (weightedGraph.nodes.length === 0 && weightedGraph.links.length === 0) {
      setNoDataLabel("No data found for the selected time range");
      setError(null)
    }

  }, [weightedGraph]);

  useEffect(() => {
    if (hoverNode && sidePanelRef.current) {
      const nodeEl = document.getElementById(`node-${hoverNode.id}`);
      if (nodeEl)
        nodeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [hoverNode]);

  const handleFetchGraph = async () => {
    setLoading(true);
    setError(null);

    const startMicro = convertToMicroseconds(startTime);
    const endMicro = convertToMicroseconds(endTime);

    try {
      const resp = await fetchGraphData(
        startMicro,
        endMicro,
        weightType
      );
      if (resp.status === "success") {
        if (resp.data && resp.data.nodes && resp.data.edges) {
          if (!resp.data.nodes.length && !resp.data.edges.length) {
            setError(null);
            setNoDataLabel(true)
            setWeightedGraph({ nodes: [], links: [] });
          } else {
            setWeightedGraph(transformData(resp.data));
            setNoDataLabel(false)
            setError(null)
          }
        } else {
          setError(null)
          setWeightedGraph({ nodes: [], links: [] });
          setNoDataLabel(true);
        }
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setWeightedGraph({ nodes: [], links: [] });
      setNoDataLabel(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Adjust height to fill remaining space below header; parent should be flex-col
    <div className="flex flex-1" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Left Panel: controls on top, graph below */}
      <div className="w-3/4 flex flex-col p-6 space-y-6 h-full">
        <h1 className="text-2xl font-bold text-gray-800">
          📊 Weighted Dependency Graph
        </h1>

        {/* Controls */}
        <div className="flex items-center space-x-4 p-2 bg-white rounded shadow">
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Start Time:</label>
            <DatePicker
              selected={startTime}
              onChange={setStartTime}
              showTimeSelect
              dateFormat="Pp"
              className="p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">End Time:</label>
            <DatePicker
              selected={endTime}
              onChange={setEndTime}
              showTimeSelect
              dateFormat="Pp"
              className="p-2 border rounded"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Weight Type:</label>
            <select
              value={weightType}
              onChange={(e) => setWeightType(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="CO">CoExecution</option>
              <option value="Lat">Latency</option>
              <option value="Freq">Frequency</option>
            </select>
          </div>
          <button
            onClick={handleFetchGraph}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Generate Graph
          </button>
        </div>

        {loading && <p className="text-lg text-gray-700">🔄 Loading…</p>}
        {error && <p className="text-red-500">❌ {error}</p>}
        {noDataLabel && <p className="text-gray-500">{noDataLabel}</p>}

        {/* Graph below controls */}
        {weightedGraph.nodes.length > 0 && (
          <div className="flex-grow bg-white p-4 rounded shadow overflow-hidden">
            <ForceGraph2D
              ref={fgRef}
              graphData={weightedGraph}
              style={{ width: "100%", height: "100%" }}
              nodeAutoColorBy="id"
              linkDirectionalArrowLength={(link) =>
                Math.max(10, link.weight * 2)
              }
              linkDirectionalArrowRelPos={1}
              linkCurvature={0.1}
              linkWidth={(link) => Math.max(2, link.weight / 2)}
              linkDirectionalParticles={4}
              linkDirectionalParticleSpeed={(link) => link.weight / 50}
              onNodeHover={(node) => {
                setTab("nodes");
                setHoverNode(node);
              }}
            />
          </div>
        )}
      </div>

      {/* Right Panel: side information */}
      <div
        ref={sidePanelRef}
        className="w-1/4 h-full bg-gray-100 p-4 rounded shadow overflow-y-auto"
      >
        <div className="flex space-x-4 mb-4">
          <button
            className={`p-2 rounded ${
              tab === "nodes" ? "bg-teal-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("nodes")}
          >
            Node Info
          </button>
          <button
            className={`p-2 rounded ${
              tab === "edges" ? "bg-teal-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab("edges")}
          >
            Edge Info
          </button>
        </div>

        {tab === "nodes" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              🔢 Node Information
            </h2>
            <div className="mt-2 space-y-2">
              {weightedGraph.nodes.map((node) => (
                <div
                  key={node.id}
                  id={`node-${node.id}`}
                  className={`p-2 border rounded cursor-pointer ${
                    hoverNode?.id === node.id ? "bg-yellow-300" : "bg-white"
                  }`}
                >
                  <p className="font-bold">{node.id}</p>
                  <p>Importance: {node.importance.toFixed(2)}</p>
                  <p>Dependence: {node.dependence.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "edges" && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              🔗 Edge Information
            </h2>
            <div className="mt-2 space-y-2">
              {weightedGraph.links.map((link, i) => (
                <div key={i} className="p-2 border rounded bg-white">
                  <p className="font-bold">
                    {typeof link.source === "object"
                      ? link.source.id
                      : link.source}{" "}
                    ➡{" "}
                    {typeof link.target === "object"
                      ? link.target.id
                      : link.target}
                  </p>
                  <p>Weight: {link.weight.toFixed(2)}</p>
                  <p>Latency: {link.latency.toFixed(4)} ms</p>
                  <p>Frequency: {link.frequency.toFixed(4)}</p>
                  <p>Co-Execution: {link.co_execution.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightedGraphViewer;
