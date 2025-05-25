import React, { useState, useEffect, useMemo } from "react";
import { Bar, Line, Pie, Radar } from "react-chartjs-2";
import Select from "react-select";
import {
    fetchCyclicDependencies,
    fetchKnotPatterns,
    fetchBottleneckServices,
    fetchNanoServices,
    fetchLongServiceChains,
    fetchFanInOverload,
    fetchFanOutOverload,
    fetchChattyServices,
    fetchSyncOveruse,
    fetchImproperApiGatewayUsage,
    fetchEventualConsistency,
    fetchImproperLoadBalancer,
} from "../services/pattern.js";
import "chart.js/auto";

const AntiPatternInsights = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    // For the multi-select
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedPatterns, setSelectedPatterns] = useState([]);

    // A small helper to map a numeric "count" to a severity level
    const determineSeverity = (count) => {
        if (count >= 10) return "High";
        if (count >= 5) return "Medium";
        return "Low";
    };

    // The main fetch routine
    const fetchAllPatterns = async () => {
        setLoading(true);

        const endpoints = [
            { fn: fetchCyclicDependencies, label: "Cyclic Dependency", key: "cycles" },
            { fn: fetchKnotPatterns, label: "The Knot", key: "dense_clusters" },
            { fn: fetchBottleneckServices, label: "Bottleneck Services", key: "services" },
            { fn: fetchNanoServices, label: "Nano Services", key: "services" },
            { fn: fetchLongServiceChains, label: "Long Service Chains", key: "chains" },
            { fn: fetchFanInOverload, label: "Fan-in Overload", key: "services" },
            { fn: fetchFanOutOverload, label: "Fan-out Overload", key: "services" },
            { fn: fetchChattyServices, label: "Chatty Services", key: "services" },
            { fn: fetchSyncOveruse, label: "Sync Overuse", key: "issues" },
            { fn: fetchImproperApiGatewayUsage, label: "Improper API Gateway Usage", key: "issues" },
            { fn: fetchEventualConsistency, label: "Eventual Consistency Pitfall", key: "issues" },
            { fn: fetchImproperLoadBalancer, label: "Improper Load Balancer", key: "imbalances" },
        ];

        try {
            const results = await Promise.all(
                endpoints.map(async (ep) => {
                    const res = await ep.fn();
                    return {
                        label: ep.label,
                        key: ep.key,
                        data: res ? res[ep.key] || [] : [],
                    };
                })
            );

            // Flatten
            const flattened = results.flatMap(({ label, key, data }) => {
                if (Array.isArray(data)) {
                    // array scenario
                    return data.map((item) => {
                        const c =
                            item.cycle_length ||
                            item.incoming_calls ||
                            item.total_upstream ||
                            item.total_downstream ||
                            item.total_connections ||
                            item.length ||
                            item.total_calls ||
                            1;

                        return {
                            service: item.service || item.source || item.api_gateway || "Unknown",
                            name: label,
                            count: c,
                            severity: determineSeverity(c),
                            date: new Date().toISOString().split("T")[0],
                        };
                    });
                } else {
                    // object scenario
                    return Object.entries(data).map(([svc, details]) => {
                        const c =
                            details.total_upstream ||
                            details.total_downstream ||
                            details.incoming_calls ||
                            details.total_connections ||
                            details.length ||
                            1;
                        return {
                            service: svc,
                            name: label,
                            count: c,
                            severity: determineSeverity(c),
                            date: new Date().toISOString().split("T")[0],
                        };
                    });
                }
            });

            setInsights(flattened);
        } catch (e) {
            console.error("Error while fetching anti-patterns data:", e);
        } finally {
            setLoading(false);
        }
    };

    // load all data
    useEffect(() => {
        fetchAllPatterns();
    }, []);

    // Distill unique services/patterns
    const allServices = [...new Set(insights.map((i) => i.service))];
    const allPatterns = [...new Set(insights.map((i) => i.name))];

    // 2. When the lists are known, we can default-select them if no selection is made
    useEffect(() => {
        if (!loading) {
            // If nothing is selected yet, select them all
            if (selectedServices.length === 0 && allServices.length > 0) {
                setSelectedServices(allServices.map((s) => ({ value: s, label: s })));
            }
            if (selectedPatterns.length === 0 && allPatterns.length > 0) {
                setSelectedPatterns(allPatterns.map((p) => ({ value: p, label: p })));
            }
        }
    }, [loading, allServices, allPatterns, selectedServices, selectedPatterns]);

    const filteredInsights = insights.filter((ins) => {
        const matchSvc =
            selectedServices.length === 0 ||
            selectedServices.some((sel) => sel.value === ins.service);
        const matchPat =
            selectedPatterns.length === 0 ||
            selectedPatterns.some((sel) => sel.value === ins.name);
        return matchSvc && matchPat;
    });

    // Data-building function (memo for performance)
    const createChartData = useMemo(
        () =>
            (type) => {
                if (filteredInsights.length === 0) {
                    return { labels: [], datasets: [] };
                }

                switch (type) {
                    case "bar": {
                        // "Service vs. Pattern"
                        const services = [...new Set(filteredInsights.map((x) => x.service))];
                        return {
                            labels: services,
                            datasets: (selectedPatterns || []).map((p) => {
                                const label = p.value;
                                return {
                                    label,
                                    data: services.map((svc) => {
                                        const found = filteredInsights.find(
                                            (fi) => fi.service === svc && fi.name === label
                                        );
                                        return found ? found.count : 0;
                                    }),
                                    backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${
                                        Math.random() * 255
                                    },0.6)`,
                                };
                            }),
                        };
                    }

                    case "severity": {
                        // bar for severity, x-axis is pattern
                        const patterns = [...new Set(filteredInsights.map((x) => x.name))];
                        const severityLevels = ["High", "Medium", "Low"];
                        return {
                            labels: patterns,
                            datasets: severityLevels.map((level) => ({
                                label: level,
                                data: patterns.map(
                                    (pat) =>
                                        filteredInsights.filter((ins) => ins.name === pat && ins.severity === level)
                                            .length
                                ),
                                backgroundColor:
                                    level === "High" ? "red" : level === "Medium" ? "orange" : "green",
                            })),
                        };
                    }

                    case "pie": {
                        // distribution among patterns
                        const patterns = [...new Set(filteredInsights.map((x) => x.name))];
                        return {
                            labels: patterns,
                            datasets: [
                                {
                                    data: patterns.map(
                                        (p) => filteredInsights.filter((ins) => ins.name === p).length
                                    ),
                                    backgroundColor: patterns.map(
                                        () =>
                                            `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                                                Math.random() * 255
                                            }, 0.6)`
                                    ),
                                },
                            ],
                        };
                    }

                    case "radar": {
                        // x-axis are services, each pattern is a dataset
                        const services = [...new Set(filteredInsights.map((x) => x.service))];
                        return {
                            labels: services,
                            datasets: (selectedPatterns || []).map((p) => {
                                const label = p.value;
                                return {
                                    label,
                                    data: services.map((svc) => {
                                        const found = filteredInsights.find(
                                            (fi) => fi.service === svc && fi.name === label
                                        );
                                        return found ? found.count : 0;
                                    }),
                                    backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                                        Math.random() * 255
                                    }, 0.4)`,
                                };
                            }),
                        };
                    }

                    case "line": {
                        // dates on x-axis, sum of pattern counts
                        const dates = [...new Set(filteredInsights.map((f) => f.date))].sort();
                        return {
                            labels: dates,
                            datasets: (selectedPatterns || []).map((p) => {
                                const label = p.value;
                                return {
                                    label,
                                    data: dates.map((d) => {
                                        // sum up all items
                                        const dayItems = filteredInsights.filter(
                                            (ins) => ins.date === d && ins.name === label
                                        );
                                        return dayItems.reduce((acc, cur) => acc + cur.count, 0);
                                    }),
                                    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                                        Math.random() * 255
                                    }, 1)`,
                                    fill: false,
                                };
                            }),
                        };
                    }

                    default:
                        return { labels: [], datasets: [] };
                }
            },
        [filteredInsights, selectedPatterns]
    );

    if (loading) {
        return <p className="text-center my-10 text-lg font-semibold">Loading insights...</p>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Anti-Pattern Insights</h1>

            {/* row 1: multi-select filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    isMulti
                    placeholder="Select Services..."
                    options={allServices.map((s) => ({ value: s, label: s }))}
                    value={selectedServices}
                    onChange={setSelectedServices}
                />
                <Select
                    isMulti
                    placeholder="Select Patterns..."
                    options={allPatterns.map((p) => ({ value: p, label: p }))}
                    value={selectedPatterns}
                    onChange={setSelectedPatterns}
                />
            </div>

            {/* row 2: Bar charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-lg font-semibold mb-2">Service vs. Pattern (Bar)</h2>
                    <Bar data={createChartData("bar")} />
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-lg font-semibold mb-2">Pattern Severity (Bar)</h2>
                    <Bar data={createChartData("severity")} />
                </div>
            </div>

            {/* row 3: Pie + Radar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-lg font-semibold mb-2">Pie of Patterns</h2>
                    <Pie data={createChartData("pie")} />
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-lg font-semibold mb-2">Radar Analysis</h2>
                    <Radar data={createChartData("radar")} />
                </div>
            </div>

            {/* row 4: line chart */}
            <div className="bg-white shadow rounded p-4">
                <h2 className="text-lg font-semibold mb-2">Trends Over Time (Line)</h2>
                <Line data={createChartData("line")} />
            </div>
        </div>
    );
};

export default AntiPatternInsights;
