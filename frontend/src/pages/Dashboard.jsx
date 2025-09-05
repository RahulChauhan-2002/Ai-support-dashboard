import React, { useState, useEffect } from 'react';
import { emailAPI } from '../utils/api';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import Analytics from '../components/Analytics';

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('emails');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sentiment: ''
  });

  useEffect(() => {
    loadEmails();
  }, [filters]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const response = await emailAPI.getEmails(filters);
      setEmails(response.data);
      
      // If selected email is no longer in the list, clear selection
      if (selectedEmail && !response.data.find(email => email._id === selectedEmail._id)) {
        setSelectedEmail(null);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    try {
      setFetching(true);
      const response = await emailAPI.fetchEmails();
      console.log('Fetch result:', response.data);
      
      // Reload emails after fetching
      await loadEmails();
      
      // Show success message
      alert(`Successfully processed ${response.data.totalProcessed} emails (${response.data.newEmails} new)`);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      alert('Failed to fetch emails. Please check your email configuration.');
    } finally {
      setFetching(false);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleUpdateResponse = async (emailId, aiResponse) => {
    try {
      const response = await emailAPI.updateEmail(emailId, { aiResponse });
      
      // Update the email in the list
      setEmails(emails.map(email => 
        email._id === emailId ? response.data : email
      ));
      
      // Update selected email if it's the one being updated
      if (selectedEmail?._id === emailId) {
        setSelectedEmail(response.data);
      }
      
      console.log('Response updated successfully');
    } catch (error) {
      console.error('Failed to update response:', error);
      alert('Failed to save response');
    }
  };

  const handleSendReply = async (emailId) => {
    try {
      await emailAPI.sendReply(emailId);
      
      // Reload emails to get updated status
      await loadEmails();
      
      // Clear selection since email is now resolved
      setSelectedEmail(null);
      
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply. Please check your email configuration.');
    }
  };

  const handleUpdateStatus = async (emailId, status) => {
    try {
      const response = await emailAPI.updateEmail(emailId, { status });
      
      // Update the email in the list
      setEmails(emails.map(email => 
        email._id === emailId ? response.data : email
      ));
      
      // Update selected email if it's the one being updated
      if (selectedEmail?._id === emailId) {
        setSelectedEmail(response.data);
      }
      
      console.log('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🤖 AI Support Dashboard
              </h1>
              <p className="text-gray-600">
                Intelligent email management and automated responses
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleFetchEmails}
                disabled={fetching}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {fetching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Fetching...
                  </>
                ) : (
                  <>📥 Fetch New Emails</>
                )}
              </button>
              
              <button
                onClick={loadEmails}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('emails')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'emails'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📧 Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {activeTab === 'emails' ? (
          <>
            {/* Filters */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Not urgent">Not urgent</option>
                </select>

                <select
                  value={filters.sentiment}
                  onChange={(e) => setFilters({...filters, sentiment: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sentiments</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>
            </div>

            {/* Email Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmailList
                emails={emails}
                selectedEmail={selectedEmail}
                onSelectEmail={handleSelectEmail}
                loading={loading}
              />
              
              <EmailDetail
                email={selectedEmail}
                onUpdateResponse={handleUpdateResponse}
                onSendReply={handleSendReply}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          </>
        ) : (
          <Analytics />
        )}
      </main>
    </div>
  );
}
