const BASE_URL = "http://localhost:8000/api/anti-patterns";

const fetchData = async (endpoint) => {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        if (data) {
            return data;
        } else {
            throw new Error(data.message || `Failed to fetch ${endpoint}`);
        }
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
};

// Fetch all anti-patterns
export const fetchAllAntiPatterns = async () => await fetchData("all");

// Fetch cyclic dependencies
export const fetchCyclicDependencies = async () => await fetchData("cyclic");

// Fetch knot patterns
export const fetchKnotPatterns = async () => await fetchData("knot");

// Fetch bottleneck services
export const fetchBottleneckServices = async () => await fetchData("bottleneck");

// Fetch nano services
export const fetchNanoServices = async () => await fetchData("nano-services");

// Fetch long service chains
export const fetchLongServiceChains = async () => await fetchData("long-chain");

// Fetch fan-in overload
export const fetchFanInOverload = async () => await fetchData("fan-in");

// Fetch fan-out overload
export const fetchFanOutOverload = async () => await fetchData("fan-out");

// Fetch chatty services
export const fetchChattyServices = async () => await fetchData("chatty");

// Fetch synchronous call overuse
export const fetchSyncOveruse = async () => await fetchData("sync-overuse");

// Fetch improper API Gateway usage
export const fetchImproperApiGatewayUsage = async () => await fetchData("api-gateway");

// Fetch eventual consistency issues
export const fetchEventualConsistency = async () => await fetchData("consistency");

// Fetch improper load balancer usage
export const fetchImproperLoadBalancer = async () => await fetchData("load-balancer");
