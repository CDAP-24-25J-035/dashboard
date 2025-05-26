import React, { useEffect, useState } from "react";
import { Graph } from "react-d3-graph";
import { fetchAntiPatternGraphData } from "../../services/graphs.js";

const SystemArchitecture = () => {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const loadGraphData = async () => {
            try {
                const data = await fetchAntiPatternGraphData();
                console.log("🔍 DEBUG: Received Graph Data:", data);

                const transformedData = {
                    nodes: data.nodes || [],
                    links: data.links.map(link => ({
                        source: link.source ?? "Unknown Source",
                        target: link.target ?? "Unknown Target",
                        method: link.method ?? "Unknown",
                        type: link.type ?? "Unknown",
                        calls: link.calls ?? "N/A",
                        avg_duration: link.avg_duration ?? "N/A",
                        weight: link.weight ?? "N/A",
                    }))
                };

                console.log("DEBUG: Transformed Graph Data:", transformedData);
                setGraphData(transformedData);
            } catch (err) {
                console.error("ERROR: Fetching graph data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadGraphData();
    }, []);

    const handleNodeClick = (nodeId) => {
        alert(`🟢 Node clicked: ${nodeId}`);
    };

    const handleLinkHover = (source, target, event) => {
        const link = graphData.links.find(
            (link) => link.source === source && link.target === target
        );

        if (link) {
            setHoveredLink({
                source: link.source,
                target: link.target,
                method: link.method,
                type: link.type,
                calls: link.calls,
                avg_duration: link.avg_duration,
                weight: link.weight,
            });

            setMousePosition({
                x: event.clientX + 10,
                y: event.clientY + 10,
            });
        }
    };

    const handleLinkLeave = () => {
        setHoveredLink(null);
    };

    const graphConfig = {
        directed: true,
        nodeHighlightBehavior: true,
        node: {
            color: "#008080",
            size: 400,
            fontSize: 12,
            highlightStrokeColor: "blue",
        },
        link: {
            highlightColor: "#ADD8E6",
            renderLabel: false,
        },
        d3: {
            gravity: -500,
            linkLength: 150,
            alphaTarget: 0.05,
            disableLinkForce: false,
        },
        panAndZoom: true,
        height: window.innerHeight - 50,
        width: window.innerWidth - 50,
    };

    if (loading) return <p className="text-lg text-gray-700">🔄 Loading system architecture...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!Object.keys(graphData.nodes).length > 0 || !Object.keys(graphData.links).length > 0)
        return <p className="text-gray-500">No data to create the system architecture...</p>

    return (
        <div style={{ textAlign: "center", padding: "20px", position: "relative" }}>
            <h1 className="text-2xl font-bold text-gray-800">🔗 System Architecture Graph</h1>
            <p className="text-gray-600 mb-4">
                This graph represents the microservice dependencies, API call types, latencies, and weights.
            </p>
            <Graph
                id="dependency-graph"
                data={graphData}
                config={graphConfig}
                onClickNode={handleNodeClick}
                onMouseOverLink={(source, target, event) => handleLinkHover(source, target, event)}
                onMouseOutLink={handleLinkLeave}
            />

            {hoveredLink && (
                <div
                    style={{
                        position: "fixed",
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                        backgroundColor: "white",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                        padding: "15px",
                        borderRadius: "8px",
                        width: "280px",
                        marginTop: "100px",
                        zIndex: 1000,
                        transition: "opacity 0.2s ease-in-out",
                    }}
                >
                    <strong style={{ fontSize: "16px", color: "#333" }}>🔗 Link Details</strong>
                    <hr style={{ margin: "8px 0" }} />
                    <p><strong>Source:</strong> {hoveredLink.source}</p>
                    <p><strong>Target:</strong> {hoveredLink.target}</p>
                    <p><strong>Method:</strong> {hoveredLink.method} ({hoveredLink.type})</p>
                    <p><strong>Calls:</strong> {hoveredLink.calls}</p>
                    <p><strong>Latency:</strong> {hoveredLink.avg_duration}ms</p>
                    <p><strong>Weight:</strong> {hoveredLink.weight}</p>
                </div>
            )}
        </div>
    );
};

export default SystemArchitecture;
