export const fetchGraphData = async () => {
    try {
        const response = await fetch("http://localhost:8000/api/graph");
        const result = await response.json();

        console.log("📡 API Response:", result);

        if (!result.graph) {
            console.error("❌ Invalid Graph Data:", result);
            return { nodes: [], links: [] };
        }

        return {
            nodes: result.graph.nodes || [],
            links: result.graph.links.map(link => ({
                source: link.source ?? "Unknown Source",
                target: link.target ?? "Unknown Target",
                method: link.method ?? "Unknown",
                type: link.type ?? "Unknown",
                calls: link.calls ?? "Not Available",
                avg_duration: link.avg_duration ?? "Not Available",
                weight: link.weight ?? "Not Available",
            }))
        };
    } catch (error) {
        console.error("❌ Error Fetching Graph Data:", error);
        return { nodes: [], links: [] };
    }
};
