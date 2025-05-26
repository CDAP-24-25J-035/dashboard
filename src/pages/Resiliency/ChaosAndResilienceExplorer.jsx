import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageUserReports from './ManageUserReports';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const timeZones = [
  "UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Europe/Paris",
  "Asia/Tokyo", "Australia/Sydney", "America/Los_Angeles", "America/Chicago",
  "Asia/Shanghai", "Asia/Dubai", "Europe/Berlin", "America/Sao_Paulo",
  "Africa/Johannesburg", "Asia/Singapore", "America/Denver", "Asia/Hong_Kong",
  "Europe/Moscow", "Pacific/Auckland", "America/Toronto",
];

const BASE_API_URL = 'http://178.128.19.205:8080';

const ChaosAndResilienceExplorer = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [chaosData, setChaosData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [threads, setThreads] = useState(10);
  const [serviceUrl, setServiceUrl] = useState('');
  const [showManageReports, setShowManageReports] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [reportRegion, setReportRegion] = useState('');
  const [reportTime, setReportTime] = useState('');
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [testRunning, setTestRunning] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_API_URL}/api/resiliency/get-service-name`);
        setServices(res.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch services.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (!selectedService) {
      setChaosData([]);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/api/resiliency/score?serviceName=${selectedService}`);
        setChaosData(res.data || []);
        setError(null);
      } catch (err) {
        console.warn('No data for this service or service might be new.');
        setChaosData([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedService]);

  const prepareChartData = useCallback(() => {
    if (!chaosData.length) return {
      resiliencyScoreChart: null,
      failureRateChart: null,
      avgLatencyChart: null,
    };

    const labels = chaosData.map(d => `ID: ${d.deploymentId} | Req: ${d.noOfRequests ?? 'N/A'}`);
    return {
      resiliencyScoreChart: {
        labels,
        datasets: [{
          label: 'Resiliency Scores',
          data: chaosData.map(d => d.resiliencyScore),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.3,
        }],
      },
      failureRateChart: {
        labels,
        datasets: [{
          label: 'Failure Rate',
          data: chaosData.map(d => d.failureRate),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.3,
        }],
      },
      avgLatencyChart: {
        labels,
        datasets: [{
          label: 'Avg Latency',
          data: chaosData.map(d => d.avgLatency),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.2)',
          fill: true,
          tension: 0.3,
        }],
      },
    };
  }, [chaosData]);

  const handleFileChange = e => setFile(e.target.files[0]);

  const extractPort = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443' : '80');
    } catch {
      return null;
    }
  };

  const handleTestRun = async () => {
  if (!file || !selectedService || !serviceUrl) {
    toast.error('Please provide all required inputs: file, service name, and service URL.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('threads', threads);
  formData.append('serviceName', selectedService);
  formData.append('deploymentId', 3);
  formData.append('serviceUrl', serviceUrl);

  setTestRunning(true); // Start loading spinner

  try {
    const response = await axios.post(`${BASE_API_URL}/postman/run`, formData);
    const data = response.data;

    if (typeof data === 'string' && data.startsWith('Postman collection executed with')) {
      toast.success(data);
    } 
    else if (typeof data === 'string' && data.startsWith('Please start the Service and then re run the command')) {
      console.log("Please start the Service and then re run the command");
      toast.error(data);
    }else if (typeof data === 'string' && data.startsWith('Error: Error: Port number mismatch between serviceUrl and Postman collection.')) {
      console.log("Service URL and Api collection Service URL aren't equal, Please recheck");
      toast.error(data);
    }else if (data.message) {
      toast.error(data.message);
    } else {
      toast.error('Unknown response from server.');
    }
  } catch (err) {
    console.error(err);
    const msg = err.response?.data?.message || 'Test run failed due to server error.';
    toast.error(msg);
  } finally {
    setTestRunning(false); // Stop loading spinner
  }
};


  const handleRegisterReport = async () => {
    if (!reportEmail || !reportRegion || !reportTime || !selectedService) {
      alert('Please fill in all the fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reportEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    const payload = {
      email: reportEmail,
      region: reportRegion,
      reportTime: `${reportTime}:00`,
      serviceName: selectedService,
    };

    try {
      await axios.post(`${BASE_API_URL}/user-report`, payload);
      toast.success('✅ Registered for scheduled reports!');
      setReportEmail('');
      setReportRegion('');
      setReportTime('');
    } catch (err) {
      console.error(err);
      toast.error('❌ Registration failed.');
    }
  };

  // Handle single/double click on chart points for delete functionality
const handleChartClick = async (event, elements, metric) => {
  if (!elements.length) return; // No point clicked

  const pointIndex = elements[0].index;

  if (selectedPointIndex !== null && selectedPointIndex === pointIndex) {
    // Double click: delete from backend and state
    const id = chaosData[pointIndex]?.id;

    if (!id) {
      toast.error('Cannot delete: id missing.');
      return;
    }

    try {
      await axios.delete(`${BASE_API_URL}/api/resiliency/delete-resiliency-score`, {
        params: { id },
      });
      toast.success(`Deleted point #${pointIndex + 1} from ${metric}`);

      setChaosData(prev => prev.filter((_, i) => i !== pointIndex));
      setSelectedPointIndex(null);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete the selected data point.');
    }
  } else {
    // Single click: select point
    setSelectedPointIndex(pointIndex);
    toast.info(`Selected point #${pointIndex + 1} from ${metric} (double click to delete)`);
  }
};


  const { resiliencyScoreChart, failureRateChart, avgLatencyChart } = prepareChartData();

  if (showManageReports) {
    return (
      <div className="p-6">
        <button onClick={() => setShowManageReports(false)} className="mb-4 p-2 bg-indigo-600 text-white rounded">
          Back to Chaos Explorer
        </button>
        <ManageUserReports />
      </div>
    );
  }

  return (
    <div className="p-6">
    <h1 className="text-2xl font-semibold text-center text-red-600 mb-6">
  ⚠️ Please ensure <span className="font-bold text-red-700">Prometheus</span> is installed and running
</h1>

      <ToastContainer />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-72 p-4 bg-white border rounded shadow">
          <h2 className="text-center text-xl font-semibold text-indigo-600 mb-4">Schedule Report</h2>
          <input
            type="email"
            placeholder="Email"
            value={reportEmail}
            onChange={(e) => setReportEmail(e.target.value)}
            className="w-full p-2 mb-2 border rounded text-sm"
          />
          <select
            value={reportRegion}
            onChange={(e) => setReportRegion(e.target.value)}
            className="w-full p-2 mb-2 border rounded text-sm"
          >
            <option value="">Select Region</option>
            {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
          <input
            type="time"
            value={reportTime}
            onChange={(e) => setReportTime(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm"
          />
          <button onClick={handleRegisterReport} className="w-full p-2 bg-green-600 text-white rounded mb-4">
            Register
          </button>
          <button onClick={() => setShowManageReports(true)} className="w-full p-2 bg-indigo-600 text-white rounded">
            Manage User Reports
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <label className="block mb-1 font-semibold">Select or Enter Service Name:</label>
            <input
              list="service-options"
              type="text"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <datalist id="service-options">
              {services.map(service => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </div>

          {/* Postman Test Runner */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="text-lg font-semibold mb-2 text-indigo-700">Run Chaos Test</h3>
            <input type="file" accept=".json" onChange={handleFileChange} className="w-full p-2 border rounded" />
            <input
              type="text"
              placeholder="Service URL (e.g. http://localhost:8080)"
              value={serviceUrl}
              onChange={e => setServiceUrl(e.target.value)}
              className="w-full p-2 mt-2 border rounded"
            />
            <input
              type="number"
              min={1}
              max={100}
              value={threads}
              onChange={e => setThreads(Number(e.target.value) || 1)}
              className="w-full p-2 mt-2 border rounded"
            />
            <button
  onClick={handleTestRun}
  disabled={testRunning}
  className="w-full p-2 mt-4 bg-indigo-600 text-white rounded flex justify-center items-center"
>
  {testRunning ? (
    <>
      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      Running...
    </>
  ) : (
    'Run Test'
  )}
</button>
          </div>

          {/* Charts */}
          {!chaosData.length ? (
            <div className="text-center text-gray-600">No data available for selected service.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ChartBox
                title="Resiliency Score"
                data={resiliencyScoreChart}
                onPointClick={(e, elements) => handleChartClick(e, elements, 'Resiliency Score')}
              />
              <ChartBox
                title="Failure Rate"
                data={failureRateChart}
                onPointClick={(e, elements) => handleChartClick(e, elements, 'Failure Rate')}
              />
              <ChartBox
                title="Avg Latency"
                data={avgLatencyChart}
                onPointClick={(e, elements) => handleChartClick(e, elements, 'Avg Latency')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChartBox = ({ title, data, onPointClick }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, elements) => {
      if (onPointClick) onPointClick(event, elements);
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow" style={{ height: 250, overflow: 'hidden' }}>
      <h3 className="text-center font-semibold text-indigo-700 mb-2">{title}</h3>
      {data ? (
        <Line data={data} options={options} height={200} />
      ) : (
        <p className="text-center text-gray-500">No data</p>
      )}
    </div>
  );
};

export default ChaosAndResilienceExplorer;
