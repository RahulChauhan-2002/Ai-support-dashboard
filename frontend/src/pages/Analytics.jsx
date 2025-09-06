import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [timeSeriesRes, responseTimeRes, statsRes] = await Promise.all([
        axios.get('/api/analytics/timeseries'),
        axios.get('/api/analytics/response-times'),
        axios.get('/api/analytics/stats')
      ]);

      setTimeSeriesData(processTimeSeriesData(timeSeriesRes.data));
      setResponseTimeData(responseTimeRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item._id.date]) {
        grouped[item._id.date] = { date: item._id.date };
      }
      grouped[item._id.date][item._id.status] = item.count;
    });
    return Object.values(grouped);
  };

  const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

      {/* Time Series Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Email Volume Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pending" stroke="#F59E0B" />
            <Line type="monotone" dataKey="responded" stroke="#3B82F6" />
            <Line type="monotone" dataKey="resolved" stroke="#10B981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats?.sentimentBreakdown || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {stats?.sentimentBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.categoryBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Time Analysis */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Average Response Times</h3>
        <div className="grid grid-cols-2 gap-4">
          {responseTimeData.map((item) => (
            <div key={item._id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-700 capitalize">{item._id} Priority</h4>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(item.avgResponseTime / 60000)} min
              </p>
              <p className="text-sm text-gray-500">
                Min: {Math.round(item.minResponseTime / 60000)} min | 
                Max: {Math.round(item.maxResponseTime / 60000)} min
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;