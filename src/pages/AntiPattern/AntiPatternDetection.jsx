import React, { useState, useEffect } from "react";
import { fetchAllAntiPatterns } from "../../services/pattern.js";

const ToggleSection = ({ title, description, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white border rounded shadow-md mb-4">
            <button
                className={`w-full text-left px-6 py-4 flex justify-between items-center text-lg font-semibold ${
                    isOpen ? "bg-gray-300" : "bg-gray-200"
                } hover:bg-gray-300`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{isOpen ? `▼ Hide ${title}` : `► Show ${title}`}</span>
            </button>
            {isOpen && (
                <div className="p-6 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    {children}
                </div>
            )}
        </div>
    );
};

const AntiPatternDetection = () => {
    const [antiPatterns, setAntiPatterns] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllAntiPatterns()
            .then((data) => {
                if (data && Object.keys(data).length > 0) setAntiPatterns(data);
                else setAntiPatterns(null);
            })
            .catch((err) => setError(`Error: ${err.message}`))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-lg text-gray-700">🔄 Loading anti-patterns...</p>;
    if (error) return <p className="text-red-500">❌ {error}</p>;

    if (!(Object.keys(antiPatterns).length > 0)) return <p className="text-gray-500">No anti-patterns detected!</p>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">📊 Anti-Pattern Detection</h1>
            <p className="text-gray-600">Below are the detected anti-patterns in your system.</p>

            {/* 1. Cyclic Dependencies */}
            {antiPatterns.cyclic_dependencies?.cycles.length > 0 && (
                <ToggleSection title="Cyclic Dependencies" description="Services depend on each other in a loop, making them hard to manage.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Cycle</th></tr></thead>
                        <tbody>
                        {antiPatterns.cyclic_dependencies.cycles.map((cycle, index) => (
                            <tr key={index}><td className="border px-4 py-2">{cycle.cycle.join(" → ")}</td></tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 2. Knot Patterns */}
            {antiPatterns.knot_patterns?.dense_clusters.length > 0 && (
                <ToggleSection title="The Knot Pattern" description="Multiple services are tightly coupled, making the system complex.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th></tr></thead>
                        <tbody>
                        {antiPatterns.knot_patterns.dense_clusters.map((cluster, index) => (
                            <tr key={index}><td className="border px-4 py-2">{cluster.service}</td></tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 3. Bottleneck Services */}
            {antiPatterns.bottleneck_services?.services.length > 0 && (
                <ToggleSection title="Bottleneck Services" description="These services receive too many requests, causing performance slowdowns.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th></tr></thead>
                        <tbody>
                        {antiPatterns.bottleneck_services.services.map((service, index) => (
                            <tr key={index}><td className="border px-4 py-2">{service}</td></tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 4. Nano Services */}
            {antiPatterns.nano_services?.services.length > 0 && (
                <ToggleSection title="Nano Services" description="Small services with minimal responsibilities, increasing communication overhead.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Connections</th></tr></thead>
                        <tbody>
                        {antiPatterns.nano_services.services.map((item, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{item.service}</td>
                                <td className="border px-4 py-2">{item.total_connections}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 5. Long Service Chains */}
            {antiPatterns.long_service_chains?.chains.length > 0 && (
                <ToggleSection title="Long Service Chains" description="Excessive dependency chains between services, increasing latency.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Source</th><th className="border px-4 py-2">Target</th><th className="border px-4 py-2">Length</th></tr></thead>
                        <tbody>
                        {antiPatterns.long_service_chains.chains.map((chain, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{chain.source}</td>
                                <td className="border px-4 py-2">{chain.target}</td>
                                <td className="border px-4 py-2">{chain.length}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 6. Fan-In Overload */}
            {antiPatterns.fan_in_overload?.services && Object.keys(antiPatterns.fan_in_overload.services).length > 0 && (
                <ToggleSection title="Fan-In Overload" description="A single service is overloaded with too many upstream dependencies.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Upstream Services</th></tr></thead>
                        <tbody>
                        {Object.entries(antiPatterns.fan_in_overload.services).map(([service, details], index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{service}</td>
                                <td className="border px-4 py-2">{details.upstream_services.join(", ")}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 7. Fan-Out Overload */}
            {antiPatterns.fan_out_overload?.services && Object.keys(antiPatterns.fan_out_overload.services).length > 0 && (
                <ToggleSection title="Fan-Out Overload" description="A service sends requests to too many downstream services, increasing failure risk.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Downstream Services</th></tr></thead>
                        <tbody>
                        {Object.entries(antiPatterns.fan_out_overload.services).map(([service, details], index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{service}</td>
                                <td className="border px-4 py-2">{details.downstream_services.join(", ")}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 8. Chatty Services */}
            {antiPatterns.chatty_services?.services && Object.keys(antiPatterns.chatty_services.services).length > 0 && (
                <ToggleSection title="Chatty Services" description="Excessive communication between services, causing network congestion.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Total Calls</th><th className="border px-4 py-2">Avg Duration (ms)</th></tr></thead>
                        <tbody>
                        {Object.entries(antiPatterns.chatty_services.services).map(([service, details], index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{service}</td>
                                <td className="border px-4 py-2">{details.total_calls}</td>
                                <td className="border px-4 py-2">{details.avg_duration}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 9. Sync Overuse */}
            {antiPatterns.sync_overuse?.issues.length > 0 && (
                <ToggleSection title="Synchronous Call Overuse" description="Blocking synchronous calls between services, reducing scalability.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Source</th><th className="border px-4 py-2">Destination</th><th className="border px-4 py-2">Method</th><th className="border px-4 py-2">Avg Duration (ms)</th></tr></thead>
                        <tbody>
                        {antiPatterns.sync_overuse.issues.map((issue, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{issue.source}</td>
                                <td className="border px-4 py-2">{issue.destination}</td>
                                <td className="border px-4 py-2">{issue.method}</td>
                                <td className="border px-4 py-2">{issue.avg_duration}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 10. API Gateway Usage Issues */}
            {antiPatterns.api_gateway_usage?.issues.length > 0 && (
                <ToggleSection title="Improper API Gateway Usage" description="API Gateway is overloaded or misused, leading to performance issues.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">API Gateway</th><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Avg Duration (ms)</th></tr></thead>
                        <tbody>
                        {antiPatterns.api_gateway_usage.issues.map((issue, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{issue.api_gateway}</td>
                                <td className="border px-4 py-2">{issue.service}</td>
                                <td className="border px-4 py-2">{issue.avg_duration}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

            {/* 11. Improper Load Balancer */}
            {antiPatterns.improper_load_balancer?.imbalances.length > 0 && (
                <ToggleSection title="Improper Load Balancer" description="Load balancing is uneven, leading to bottlenecks and inefficiencies.">
                    <table className="w-full border border-gray-300 text-sm">
                        <thead><tr className="bg-gray-200"><th className="border px-4 py-2">Service</th><th className="border px-4 py-2">Requests</th><th className="border px-4 py-2">Imbalance Factor</th></tr></thead>
                        <tbody>
                        {antiPatterns.improper_load_balancer.imbalances.map((imbalance, index) => (
                            <tr key={index}>
                                <td className="border px-4 py-2">{imbalance.service}</td>
                                <td className="border px-4 py-2">{imbalance.requests}</td>
                                <td className="border px-4 py-2">{imbalance.imbalance_factor}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </ToggleSection>
            )}

        </div>
    );
};

export default AntiPatternDetection;
