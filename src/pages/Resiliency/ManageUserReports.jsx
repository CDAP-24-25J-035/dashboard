import React, { useState, useEffect } from 'react';
import axios from 'axios';

const timeZones = [
  "UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Europe/Paris",
  "Asia/Tokyo", "Australia/Sydney", "America/Los_Angeles", "America/Chicago",
  "Asia/Shanghai", "Asia/Dubai", "Europe/Berlin", "America/Sao_Paulo",
  "Africa/Johannesburg", "Asia/Singapore", "America/Denver", "Asia/Hong_Kong",
  "Europe/Moscow", "Pacific/Auckland", "America/Toronto",
];

const ManageUserReports = () => {
  const [userReports, setUserReports] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    serviceName: '',
    email: '',
    region: '',
    reportTime: '',
  });

  const BASE_API_URL = 'http://178.128.19.205:8080';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/user-report`);
      const normalizedData = response.data.map(report => ({
        ...report,
        reportTime: report.reportTime || '',
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
      reportTime: report.reportTime ? report.reportTime.substring(0, 5) : '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: '',
      serviceName: '',
      email: '',
      region: '',
      reportTime: '',
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
        reportTime: formData.reportTime ? `${formData.reportTime}:00` : null,
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await axios.delete(`${BASE_API_URL}/user-report/delete-user-report/${id}`);
      alert('Report deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report.');
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
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="border p-1 rounded w-full"
                    >
                      <option value="">Select Time Zone</option>
                      {timeZones.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="time"
                      name="reportTime"
                      value={formData.reportTime}
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
                    {report.reportTime ? report.reportTime.substring(0, 5) : '-'}
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEditClick(report)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
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
