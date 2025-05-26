const BASE_URL = "http://167.172.83.56:8000/api/graphs/weight";

export const fetchGraphData = async (startTime, endTime, weight_type) => {
    try {
        var query = "?"
        if (startTime && startTime != "") {
            const parsedStartTime = parseInt(startTime, 10);
            if (!isNaN(parsedStartTime))
                query += `start_time=${parsedStartTime}&`;
        }
        if (endTime){
            const parsedEndTime = parseInt(endTime, 10);
            if (!isNaN(parsedEndTime))
                query += `end_time=${parsedEndTime}&`;
        }
        if (weight_type)
            query += `weight_type=${weight_type}&`;
        
        const response = await fetch(`${BASE_URL}${query}`);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        if (data) {
            return data;
        } else {
            throw new Error(data.message || `Failed to fetch weighted dependency graph`);
        }
    } catch (error) {
        console.error(`Error fetching weighted graph:`, error);
        return null;
    }
};


export const fetchChangePointGraph = async (start_time, end_time, metric) => {
    try {
        const response = await fetch(
            `http://167.172.83.56:8000/api/metrics/change-points?start_time=${start_time}&end_time=${end_time}&metric=${metric}`);
        const result = await response.json();

        // console.log("API Response:", result);

        if (!result.data) {
            console.error("Invalid Plot Data:", result);
            return [];
        }

        return result.data;
    } catch (error) {
        console.error("❌ Error Fetching Plot Data:", error);
        return { nodes: [], links: [] };
    }
};
