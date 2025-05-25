import { Route, Routes } from 'react-router-dom';
import TraceExplorer from "@/pages/TraceExplorer.jsx";
import SystemArchitecture from "@/pages/SystemArchitecture.jsx";
import NotFound from "@/pages/NotFound.jsx";
import Settings from "@/pages/Settings.jsx";
import AntiPatternInsights from "@/pages/AntiPatternInsights.jsx";
import AntiPatternDetection from "@/pages/AntiPatternDetection.jsx";

const AnimatedRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<AntiPatternDetection />} />
            <Route path="/anti-patterns" element={<AntiPatternDetection />} />
            <Route path="/insights" element={<AntiPatternInsights />} />
            <Route path="/trace-explorer" element={<TraceExplorer />} />
            <Route path="/system-architecture" element={<SystemArchitecture />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AnimatedRoutes;
