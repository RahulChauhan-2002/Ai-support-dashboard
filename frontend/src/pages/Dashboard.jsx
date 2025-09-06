// ============================================
// FILE: frontend/src/pages/Dashboard.js
// ============================================
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { 
  Mail, AlertCircle, CheckCircle, Clock, TrendingUp, 
  TrendingDown, Activity, BarChart3, Bell, Users,
  MessageSquare, Calendar, Filter, RefreshCw
} from 'lucide-react';
import StatsCard from '../components/StatsCard';  // Fixed: was ./components/StatsCard
import PriorityQueue from '../components/PriorityQueue';  // Fixed: was ./components/PriorityQueue
import RecentActivity from '../components/RecentActivity';  // Fixed: was ./components/RecentActivity

const Dashboard = () => {
  const [stats, setStats] = useState({
    total24h: 0,
    resolved: 0,
    pending: 0,
    sentimentBreakdown: [],
    priorityBreakdown: [],
    categoryBreakdown: []
  });
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
    
    const socket = io('http://localhost:5000');
    socket.on('newEmail', (email) => {
      setRecentEmails(prev => [email, ...prev].slice(0, 5));
      fetchStats();
      setLastUpdated(new Date());
    });

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, emailsRes] = await Promise.all([
        axios.get('/api/analytics/stats'),
        axios.get('/api/emails?limit=5')
      ]);
      
      const statsData = {
        total24h: statsRes.data?.total24h || 0,
        resolved: statsRes.data?.resolved || 0,
        pending: statsRes.data?.pending || 0,
        sentimentBreakdown: Array.isArray(statsRes.data?.sentimentBreakdown) 
          ? statsRes.data.sentimentBreakdown : [],
        priorityBreakdown: Array.isArray(statsRes.data?.priorityBreakdown) 
          ? statsRes.data.priorityBreakdown : [],
        categoryBreakdown: Array.isArray(statsRes.data?.categoryBreakdown) 
          ? statsRes.data.categoryBreakdown : []
      };
      
      setStats(statsData);
      setRecentEmails(emailsRes.data?.emails || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/analytics/stats');
      const statsData = {
        total24h: response.data?.total24h || 0,
        resolved: response.data?.resolved || 0,
        pending: response.data?.pending || 0,
        sentimentBreakdown: Array.isArray(response.data?.sentimentBreakdown) 
          ? response.data.sentimentBreakdown : [],
        priorityBreakdown: Array.isArray(response.data?.priorityBreakdown) 
          ? response.data.priorityBreakdown : [],
        categoryBreakdown: Array.isArray(response.data?.categoryBreakdown) 
          ? response.data.categoryBreakdown : []
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-lg text-gray-600 mt-2 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Real-time email management and analytics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDashboardData}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="transform hover:scale-105 transition-transform duration-200">
            <StatsCard
              title="Emails Today"
              value={stats.total24h}
              icon={<Mail className="h-6 w-6" />}
              trend="+12%"
              trendUp={true}
              gradient="from-blue-500 to-cyan-500"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <StatsCard
              title="Resolved"
              value={stats.resolved}
              icon={<CheckCircle className="h-6 w-6" />}
              trend="+8%"
              trendUp={true}
              gradient="from-green-500 to-emerald-500"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon={<Clock className="h-6 w-6" />}
              trend="-5%"
              trendUp={false}
              gradient="from-yellow-500 to-orange-500"
            />
          </div>
          <div className="transform hover:scale-105 transition-transform duration-200">
            <StatsCard
              title="Urgent"
              value={stats.priorityBreakdown?.find(p => p._id === 'urgent')?.count || 0}
              icon={<AlertCircle className="h-6 w-6" />}
              trend="2 new"
              trendUp={false}
              gradient="from-red-500 to-pink-500"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/emails?status=pending"
                className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-200 group"
              >
                <Clock className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-gray-900">View Pending</p>
                  <p className="text-sm text-gray-600">{stats.pending} emails</p>
                </div>
              </Link>
              <Link
                to="/emails?priority=urgent"
                className="flex items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100 hover:border-red-200 transition-all duration-200 group"
              >
                <AlertCircle className="h-8 w-8 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-gray-900">Urgent Items</p>
                  <p className="text-sm text-gray-600">{stats.priorityBreakdown?.find(p => p._id === 'urgent')?.count || 0} urgent</p>
                </div>
              </Link>
              <Link
                to="/analytics"
                className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 transition-all duration-200 group"
              >
                <BarChart3 className="h-8 w-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-gray-900">Analytics</p>
                  <p className="text-sm text-gray-600">View reports</p>
                </div>
              </Link>
              <Link
                to="/emails"
                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200 group"
              >
                <MessageSquare className="h-8 w-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-semibold text-gray-900">All Emails</p>
                  <p className="text-sm text-gray-600">Manage all</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Priority Queue - Enhanced */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Bell className="h-6 w-6 mr-2" />
                  Priority Queue
                </h3>
                <p className="text-blue-100 mt-1">Emails requiring immediate attention</p>
              </div>
              <div className="p-0">
                <PriorityQueue emails={recentEmails} />
              </div>
            </div>
          </div>

          {/* Enhanced Sentiment Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Sentiment Analysis
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.sentimentBreakdown && stats.sentimentBreakdown.length > 0 ? (
                    stats.sentimentBreakdown.map((sentiment) => (
                      <div key={sentiment._id} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${
                              sentiment._id === 'positive' ? 'bg-green-500' :
                              sentiment._id === 'negative' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`}></div>
                            {sentiment._id}
                          </span>
                          <span className="text-sm font-bold text-gray-900">{sentiment.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              sentiment._id === 'positive' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              sentiment._id === 'negative' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                              'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            }`}
                            style={{ 
                              width: `${stats.total24h > 0 ? (sentiment.count / stats.total24h) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {stats.total24h > 0 ? Math.round((sentiment.count / stats.total24h) * 100) : 0}%
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No sentiment data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                Performance Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Response Rate</span>
                  <span className="text-sm font-bold text-blue-600">94%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                  <span className="text-sm font-bold text-green-600">2.3h</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-purple-600">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Activity className="h-6 w-6 mr-2" />
                Recent Activity
              </h3>
              <p className="text-purple-100 mt-1">Latest email interactions and updates</p>
            </div>
            <div className="p-0">
              <RecentActivity emails={recentEmails} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
