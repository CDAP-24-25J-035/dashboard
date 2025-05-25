import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import Select from "react-select";
import "chart.js/auto";
import axios from "axios";

const CouplingInsights = () => {
    const [allServices, setAllServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [absoluteImportance, setAbsoluteImportance] = useState({});
    const [absoluteDependence, setAbsoluteDependence] = useState({});

    useEffect(() => {
    
        const fetchData = async () => {
            try {
                const servicesResponse = await axios.get("http://localhost:8000/api/services/recorded");
                const importanceResponse = await axios.get("http://localhost:8000/api/coupling/absolute-importance-of");
                const dependenceResponse = await axios.get("http://localhost:8000/api/coupling/absolute-dependence-of");

                setAllServices(servicesResponse.data.services);
                setAbsoluteImportance(importanceResponse.data.data);
                setAbsoluteDependence(dependenceResponse.data.data);

                const serviceOptions = servicesResponse.data.services.map((service) => ({
                    value: service,
                    label: service,
                }));
                setSelectedServices(serviceOptions);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Coupling Insights</h1>

            {/* Filters */}
            <div className="flex gap-6">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold">Select Services</h2>
                    <Select
                        isMulti
                        options={allServices.map((service) => ({ value: service, label: service }))}
                        value={selectedServices}
                        onChange={(selected) => setSelectedServices(selected)}
                        placeholder="Search and select services..."
                        isSearchable
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h2 className="text-lg font-bold mb-4">Absolute Importance</h2>
                    <Bar
                        data={{
                            labels: Object.keys(absoluteImportance),
                            datasets: [
                                {
                                    label: "Importance",
                                    data: Object.values(absoluteImportance),
                                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: "top" } },
                        }}
                    />
                </div>

                {/* Chart 2 */}
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h2 className="text-lg font-bold mb-4">Absolute Dependence</h2>
                    <Bar
                        data={{
                            labels: Object.keys(absoluteDependence),
                            datasets: [
                                {
                                    label: "Dependence",
                                    data: Object.values(absoluteDependence),
                                    backgroundColor: "rgba(153, 102, 255, 0.6)",
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            plugins: { legend: { position: "top" } },
                        }}
                    />
                </div>
            </div>

            {/* Historic Data Download */}
            <div className="text-right">
                <button
                    onClick={() => {
                        const blob = new Blob([JSON.stringify(filteredInsights, null, 2)], {
                            type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "coupling-insights.json";
                        a.click();
                    }}
                    className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
                >
                    Download Historic Data
                </button>
            </div>
        </div>
    );
};

export default CouplingInsights;
