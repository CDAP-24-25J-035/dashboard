import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchChangePointGraph } from "../../services/graphs.js"

const ChangePointPlot = () => {
  const [startTime, setStartTime] = useState(new Date(Date.now() - 15 * 60 * 1000));
  const [endTime, setEndTime] = useState(new Date());
  const [metric, setMetric] = useState("lat");
  const node_metrics = { imp: "Absolute Importance", dep: "Absolute Dependence" };
  const edge_metrics = { lat: "Latency", coexec: "Co-Execution", freq: "Frequency" };

  const [chartData, setChartData] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlotData = async () => {
    setLoading(true);
    setError(null);
    try {
      const startMicro = startTime.getTime() * 1000;
      const endMicro = endTime.getTime() * 1000;
      const resp = await fetchChangePointGraph(startMicro, endMicro, metric);
      const rawItems = Array.isArray(resp) ? resp : resp.data;

      const points = {};
      const nodeSet = new Set();

      rawItems.forEach(item => {
        const nodeKey = item.node || `${item.source}->${item.target}`;
        nodeSet.add(nodeKey);
        item.series.forEach(point => {
          const timeKey = new Date(point.time).toISOString();
          if (!points[timeKey]) points[timeKey] = { time: timeKey };
          points[timeKey][nodeKey] = point[metric];
          if (item.change_points.includes(point.time)) {
            points[timeKey][`cp_${nodeKey}`] = point[metric];
          }
        });
      });

      const sorted = Object.values(points).sort((a, b) => new Date(a.time) - new Date(b.time));

      setChartData(sorted);
      setNodes(Array.from(nodeSet));
    } catch (err) {
      console.error("Error loading change point data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlotData();
  }, []);

  return (
    <div className="flex flex-col h-full p-6 space-y-6" style={{ height: "calc(100vh - 4rem)" }}>
      <h1 className="text-2xl font-bold text-gray-800">
        📈 Change Point Plot
      </h1>

      {/* Controls */}
      <div className="flex items-center space-x-4 p-4 bg-white rounded shadow">
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">Start:</label>
          <DatePicker
            selected={startTime}
            onChange={date => setStartTime(date)}
            showTimeSelect
            dateFormat="Pp"
            className="p-2 border rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">End:</label>
          <DatePicker
            selected={endTime}
            onChange={date => setEndTime(date)}
            showTimeSelect
            dateFormat="Pp"
            className="p-2 border rounded"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">Metric:</label>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value)}
            className="p-2 border rounded"
          >
            {Object.entries({ ...edge_metrics, ...node_metrics }).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={loadPlotData}
          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          disabled={loading}
        >
          {loading ? "Loading…" : "Plot"}
        </button>
      </div>

      {error && <p className="text-red-500">❌ {error}</p>}

      <div className="bg-white rounded shadow p-4 flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fill: '#4A5568', fontSize: 12 }} />
            <YAxis tick={{ fill: '#4A5568', fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {nodes.map(node => (
              <Line
                key={node}
                type="monotone"
                dataKey={node}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            {nodes.map(node =>
              chartData.map((entry, i) => (
                entry[`cp_${node}`] != null && (
                  <ReferenceDot
                    key={`${node}-cp-${i}`}
                    x={entry.time}
                    y={entry[node]}
                    r={5}
                    label={{ position: 'top', fill: '#E53E3E' }}
                    stroke="#E53E3E"
                    fill="#E53E3E"
                  />
                )
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChangePointPlot;
