import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EmailCard from '../components/EmailCard';
import FilterBar from '../components/FilterBar';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

const EmailList = () => {
  const [emails, setEmails] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priority: '',
    sentiment: '',
    status: '',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEmails();
  }, [filters, page]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        ...filters,
        page,
        limit: 20
      });
      
      const response = await axios.get(`/api/emails?${params}`);
      
      // Add data validation
      const emailsData = response.data?.emails;
      const totalPagesData = response.data?.totalPages;
      
      // Ensure we always have an array
      setEmails(Array.isArray(emailsData) ? emailsData : []);
      setTotalPages(totalPagesData || 1);
      
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError('Failed to fetch emails. Please try again.');
      setEmails([]); // Ensure emails is still an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleManualFetch = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.post('/api/emails/fetch');
      await fetchEmails();
    } catch (error) {
      console.error('Error fetching new emails:', error);
      setError('Failed to fetch new emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setError(null); // Clear error when filters change
  };

  const handleStatusUpdate = async (emailId, status) => {
    try {
      await axios.put(`/api/emails/${emailId}/resolve`);
      fetchEmails();
    } catch (error) {
      console.error('Error updating email status:', error);
      setError('Failed to update email status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Email Management</h2>
        <button
          onClick={handleManualFetch}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Fetch New Emails
        </button>
      </div>

      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchEmails}
                className="mt-2 text-sm text-red-800 underline hover:text-red-600"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-4">
        {/* Safe rendering with additional checks */}
        {emails && Array.isArray(emails) && emails.length > 0 ? (
          emails.map((email) => (
            <EmailCard
              key={email._id || email.id}
              email={email}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        ) : (
          !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
              <p className="text-gray-500">
                {error ? 'There was an error loading emails.' : 'Try adjusting your filters or fetch new emails.'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Pagination - Only show if we have emails */}
      {emails && Array.isArray(emails) && emails.length > 0 && totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 flex items-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;
