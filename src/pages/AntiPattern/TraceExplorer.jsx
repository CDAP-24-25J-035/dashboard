import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchTraces } from "../../services/traces.js";
import { Timeline } from "vis-timeline/standalone";
import moment from "moment";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

const TraceExplorer = () => {
    const [traceData, setTraceData] = useState({});
    const [selectedTrace, setSelectedTrace] = useState("");
    const [loading, setLoading] = useState(true);
    const timelineRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const loadTraces = async () => {
            const data = await fetchTraces();
            setTraceData(data);
            const firstTrace = Object.keys(data)[0];
            if (firstTrace) setSelectedTrace(firstTrace);
            setLoading(false);
        };

        loadTraces();
    }, []);

    const renderTimeline = useCallback((selectedTraceData) => {
        if (!containerRef.current || !selectedTraceData) return;

        const itemsMap = new Map();
        const groupsSet = new Set();

        selectedTraceData.forEach((span) => {
            const itemId = `${span.trace_id}-${span.span_id}`;

            if (!itemsMap.has(itemId)) {
                const start = moment(span.timestamp).toDate();
                const end = moment(span.timestamp).add(1, "seconds").toDate();

                itemsMap.set(itemId, {
                    id: itemId,
                    content: `<b>${span.source}</b> → ${span.destination}`,
                    start,
                    end,
                    group: span.source,
                    title: `<div>
                            <strong>${span.source} → ${span.destination}</strong><br/>
                            Method: ${span.method}<br/>
                            Status: ${span.http_status}<br/>
                            Response: ${span.response || "N/A"}
                        </div>`
                });

                groupsSet.add(span.source);
            }
        });

        const items = Array.from(itemsMap.values());

        const groups = Array.from(groupsSet).map(service => ({
            id: service,
            content: service,
        }));

        if (timelineRef.current) timelineRef.current.destroy();

        timelineRef.current = new Timeline(containerRef.current, items, groups, {
            stack: true,
            showMajorLabels: true,
            showCurrentTime: false,
            zoomMin: 50,
            zoomMax: 10000,
            tooltipOnItemUpdateTime: true,
        });

        timelineRef.current.fit();
    }, []);

    useEffect(() => {
        if (selectedTrace && traceData[selectedTrace]) {
            renderTimeline(traceData[selectedTrace]);
        }
    }, [selectedTrace, traceData, renderTimeline]);

    if (loading)
        return <p className="text-center mt-10">Loading traces...</p>;

    if (!Object.keys(traceData).length > 0)
        return <p className="text-center mt-10">No anti-patterns detected!</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Trace Explorer</h1>

            <select
                className="mb-4 p-2 border rounded"
                value={selectedTrace || ""}
                onChange={(e) => setSelectedTrace(e.target.value)}
            >
                {Object.keys(traceData).map((traceId) => (
                    <option key={traceId} value={traceId}>
                        {traceId}
                    </option>
                ))}
            </select>

            <div
                ref={containerRef}
                className="border border-gray-300 rounded-lg shadow-md"
                style={{ height: "500px" }}
            ></div>
        </div>
    );
};

export default TraceExplorer;
