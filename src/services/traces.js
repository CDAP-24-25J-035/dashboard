import axios from "axios";

const API_ENDPOINT = "http://localhost:8085/traces";

export const fetchTraces = async () => {
    try {
        const response = await axios.get(API_ENDPOINT);
        return response.data.data || {};
    } catch (error) {
        console.error("Error fetching traces:", error);
        return {};
    }
};
