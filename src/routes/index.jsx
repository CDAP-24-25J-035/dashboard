import { Route, Routes } from 'react-router-dom';
import TraceExplorer from "@/pages/AntiPattern/TraceExplorer.jsx";
import SystemArchitecture from "@/pages/AntiPattern/SystemArchitecture.jsx";
import NotFound from "@/pages/AntiPattern/NotFound.jsx";
import Settings from "@/pages/AntiPattern/Settings.jsx";
import AntiPatternInsights from "@/pages/AntiPattern/AntiPatternInsights.jsx";
import AntiPatternDetection from "@/pages/AntiPattern/AntiPatternDetection.jsx";
import CouplingIndexes from "@/pages/Coupling/CouplingIndexes.jsx";

const AnimatedRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AntiPatternDetection />} />
            <Route path="/anti-patterns" element={<AntiPatternDetection />} />
            <Route path="/insights" element={<AntiPatternInsights />} />
            <Route path="/trace-explorer" element={<TraceExplorer />} />
            <Route path="/system-architecture" element={<SystemArchitecture />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/coupling-indexes" element={<CouplingIndexes />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AnimatedRoutes;
