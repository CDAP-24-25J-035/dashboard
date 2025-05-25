import React, { useEffect, useState } from "react";
import "chart.js/auto";

const CouplingIndexes = () => {
    const [averageConnections, setAverageConnections] = useState(null);
    const [overallCoupling, setOverallCoupling] = useState(null);

    const fetchData = async () => {
        try {
            const avgResponse = await fetch('http://localhost:8000/api/coupling/average-direct_connections');
            const avgData = await avgResponse.json();
            setAverageConnections(avgData.data);

            const overallResponse = await fetch('http://localhost:8000/api/coupling/overall-coupling-percentage');
            const overallData = await overallResponse.json();
            setOverallCoupling(overallData.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    })

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Coupling Indexes</h1>
            <p>Run an analysis to measure the coupling of your microservices</p>
            <button 
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 mb-6"
                onClick=""
            >
                Run Detection
            </button>
            <div className="flex">
                <div className="w-1/2 p-4">
                    <h2 className="text-xl font-semibold">Average Connections</h2>
                    <p>{averageConnections !== null ? averageConnections : "No data available"}</p>
                </div>
                <div className="w-1/2 p-4">
                    <h2 className="text-xl font-semibold">Overall Coupling</h2>
                    <p>{overallCoupling !== null ? overallCoupling : "No data available"}</p>
                </div>
            </div>
        </div>
    );
};

export default CouplingIndexes;
