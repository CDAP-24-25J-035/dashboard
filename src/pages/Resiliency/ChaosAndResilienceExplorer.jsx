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
import ManageUserReports from './ManageUserReports.jsx'; // Adjust path if needed

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const timeZones = [
  "UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Europe/Paris",
  "Asia/Tokyo", "Australia/Sydney", "America/Los_Angeles", "America/Chicago",
  "Asia/Shanghai", "Asia/Dubai", "Europe/Berlin", "America/Sao_Paulo",
  "Africa/Johannesburg", "Asia/Singapore", "America/Denver", "Asia/Hong_Kong",
  "Europe/Moscow", "Pacific/Auckland", "America/Toronto",
];

const BASE_API_URL = 'http://localhost:8080';

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

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_API_URL}/api/resiliency/get-service-name`);
        setServices(res.data);
        if (res.data.length > 0) setSelectedService(res.data[0]);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError('Failed to fetch services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch chaos data when selectedService changes
  useEffect(() => {
    if (!selectedService) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${BASE_API_URL}/api/resiliency/score?serviceName=${selectedService}`);
        setChaosData(res.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching chaos data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 30000); // refresh every 30 sec

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

  const handleTestRun = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }
    if (!selectedService) {
      alert('Please select a service.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('threads', threads);
    formData.append('serviceName', selectedService);
    formData.append('deploymentId', 3);
    formData.append('serviceUrl', serviceUrl);

    try {
      await axios.post(`${BASE_API_URL}/postman/run`, formData);
      alert('Test run started successfully!');
    } catch (err) {
      console.error('Test run failed:', err);
      alert('Failed to start test run.');
    }
  };

  const handleRegisterReport = async () => {
    if (!reportEmail || !reportRegion || !reportTime || !selectedService) {
      alert('Please fill in all the fields.');
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
      alert('Registered for scheduled reports!');
      setReportEmail('');
      setReportRegion('');
      setReportTime('');
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed. Check console for details.');
    }
  };

  const { resiliencyScoreChart, failureRateChart, avgLatencyChart } = prepareChartData();

  if (loading && !showManageReports) {
    return <div className="p-10 text-center">Loading chaos and resilience data...</div>;
  }

  if (error && !showManageReports) {
    return (
      <div className="p-10 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-4 p-2 bg-indigo-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showManageReports) {
    return (
      <div className="p-6">
        <button
          onClick={() => setShowManageReports(false)}
          className="mb-4 p-2 bg-indigo-600 text-white rounded"
        >
          Back to Chaos Explorer
        </button>
        <ManageUserReports />
      </div>
    );
  }

  if (!chaosData.length) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-600">No data available for selected service.</p>
        <button
          onClick={() => setShowManageReports(true)}
          className="mt-4 p-2 bg-indigo-600 text-white rounded"
        >
          Manage User Reports
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center mb-4 text-sm text-gray-500">
        📊 Make sure <strong>Prometheus</strong> is integrated before starting the app.
      </div>

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

        {/* Main Section */}
        <div className="flex-1">
          {/* Service Selector */}
          <div className="mb-6">
  <label className="block mb-1 font-semibold" htmlFor="service-input">Select Service:</label>
  <input
    list="service-options"
    type="text"
    id="service-input"
    value={selectedService}
    onChange={(e) => setSelectedService(e.target.value)}
    className="w-full p-2 border rounded"
    placeholder="Type or select service name"
  />
  <datalist id="service-options">
    {services.map((service) => (
      <option key={service} value={service} />
    ))}
  </datalist>
</div>

          {/* Test Run Section */}
          <div className="bg-white p-4 rounded shadow mb-6">
  <h3 className="text-lg font-semibold mb-2 text-indigo-700">Run Chaos Test</h3>
  <input
  type="file"
  accept=".json,application/json"
  onChange={handleFileChange}
  className="w-full p-2 border rounded"
/>
  {file && <p className="text-sm text-gray-600 mb-2">Selected file: {file.name}</p>}
  <input
    type="text"
    placeholder="Service URL"
    value={serviceUrl}
    onChange={e => setServiceUrl(e.target.value)}
    className="w-full p-2 mb-2 border rounded"
  />
  <input
    type="number"
    min={1}
    max={100}
    value={threads}
    onChange={e => setThreads(parseInt(e.target.value, 10) || 1)}
    className="w-full p-2 mb-4 border rounded"
    placeholder="Number of Threads"
  />
  <button
    onClick={handleTestRun}
    className="w-full p-2 bg-indigo-600 text-white rounded disabled:opacity-50"
    disabled={!file || !serviceUrl}
  >
    Run Test
  </button>
</div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resiliency Score Chart */}
            <div
              className="bg-white p-4 rounded shadow"
              style={{ height: 250, minHeight: 250, overflow: 'hidden' }}
            >
              <h3 className="text-center font-semibold text-indigo-700 mb-2">Resiliency Score</h3>
              {resiliencyScoreChart ? (
                <Line
                  data={resiliencyScoreChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={200}
                />
              ) : (
                <p className="text-center text-gray-500">No data</p>
              )}
            </div>

            {/* Failure Rate Chart */}
            <div
              className="bg-white p-4 rounded shadow"
              style={{ height: 250, minHeight: 250, overflow: 'hidden' }}
            >
              <h3 className="text-center font-semibold text-indigo-700 mb-2">Failure Rate</h3>
              {failureRateChart ? (
                <Line
                  data={failureRateChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={200}
                />
              ) : (
                <p className="text-center text-gray-500">No data</p>
              )}
            </div>

            {/* Average Latency Chart */}
            <div
              className="bg-white p-4 rounded shadow"
              style={{ height: 250, minHeight: 250, overflow: 'hidden' }}
            >
              <h3 className="text-center font-semibold text-indigo-700 mb-2">Avg Latency</h3>
              {avgLatencyChart ? (
                <Line
                  data={avgLatencyChart}
                  options={{ responsive: true, maintainAspectRatio: false }}
                  height={200}
                />
              ) : (
                <p className="text-center text-gray-500">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChaosAndResilienceExplorer;
