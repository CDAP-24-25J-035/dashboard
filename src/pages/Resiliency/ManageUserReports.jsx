import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageUserReports = () => {
  const [userReports, setUserReports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    serviceName: '',
    email: '',
    region: '',
    localTime: '',  // consistently use localTime
  });

  const BASE_API_URL = 'http://localhost:8080';

  // Fetch all user reports on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/user-report`);

      // Map response to normalize time field from `reportTime` to `localTime`
      const normalizedData = response.data.map(report => ({
        ...report,
        localTime: report.reportTime || report.localTime || '',  // normalize time field
      }));

      setUserReports(normalizedData);
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
    }
  };

  const handleEditClick = (report) => {
    setEditingId(report.id);
    setFormData({
      id: report.id,
      serviceName: report.serviceName,
      email: report.email,
      region: report.region,
      localTime: report.localTime ? report.localTime.substring(0, 5) : '',  // HH:mm format
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      id: '',
      serviceName: '',
      email: '',
      region: '',
      localTime: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updatedReport = {
        id: formData.id,
        serviceName: formData.serviceName,
        email: formData.email,
        region: formData.region,
        // Append ':00' to make full HH:mm:ss format expected by backend
        localTime: formData.localTime ? formData.localTime + ':00' : null,
      };

      await axios.put(`${BASE_API_URL}/user-report`, updatedReport);
      alert('Report updated successfully');
      setEditingId(null);
      fetchReports();
    } catch (error) {
      console.error('Failed to update report:', error);
      alert('Failed to update report.');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700">Manage User Reports</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-indigo-100">
            <th className="border px-4 py-2">Service</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Region</th>
            <th className="border px-4 py-2">Report Time</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userReports.map((report) => (
            <tr key={report.id}>
              {editingId === report.id ? (
                <>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      name="serviceName"
                      value={formData.serviceName}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      name="localTime"
                      value={formData.localTime}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={handleSave}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-4 py-2">{report.serviceName}</td>
                  <td className="border px-4 py-2">{report.email}</td>
                  <td className="border px-4 py-2">{report.region}</td>
                  <td className="border px-4 py-2">
                    {report.localTime ? report.localTime.substring(0, 5) : '-'}
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEditClick(report)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {userReports.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No user reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUserReports;
