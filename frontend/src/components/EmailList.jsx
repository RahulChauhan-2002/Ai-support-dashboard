import React from 'react';

export default function EmailList({ 
  emails, 
  selectedEmail, 
  onSelectEmail, 
  loading = false 
}) {
  const getPriorityColor = (priority) => {
    return priority === 'Urgent' ? 'text-red-600' : 'text-green-600';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-600';
      case 'Negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'resolved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'in_progress':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Support Emails</h2>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          Support Emails ({emails.length})
        </h2>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        {emails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📧</div>
            <p>No emails found</p>
            <p className="text-sm">Click "Fetch New Emails" to get started</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {emails.map((email) => (
              <li
                key={email._id}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedEmail?._id === email._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
                onClick={() => onSelectEmail(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {email.subject}
                      </p>
                      <span className={getStatusBadge(email.status)}>
                        {email.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      From: {email.sender}
                    </p>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      {new Date(email.sentDate).toLocaleString()}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`font-medium ${getSentimentColor(email.sentiment)}`}>
                        {email.sentiment}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className={`font-medium ${getPriorityColor(email.priority)}`}>
                        {email.priority}
                      </span>
                    </div>
                  </div>
                  
                  {email.priority === 'Urgent' && (
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        🚨 Urgent
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
