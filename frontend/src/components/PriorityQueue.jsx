// ============================================
// FILE: frontend/src/components/PriorityQueue.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, Clock, User, ArrowRight, 
  Flame, Zap, AlertTriangle, Info 
} from 'lucide-react';

const PriorityQueue = ({ emails }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <Flame className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Zap className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Sort emails by priority (urgent first) and then by date
  const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
  const sortedEmails = [...emails].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.receivedDate) - new Date(a.receivedDate);
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Priority Queue</h3>
          <Link
            to="/emails"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          High-priority emails requiring immediate attention
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {sortedEmails.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No emails in queue</p>
            <p className="text-sm text-gray-400 mt-1">All caught up!</p>
          </div>
        ) : (
          sortedEmails.slice(0, 10).map((email, index) => (
            <div key={email._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border mr-3 ${getPriorityColor(email.priority)}`}>
                      {getPriorityIcon(email.priority)}
                      <span className="ml-1 capitalize">{email.priority}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(email.sentiment)}`}>
                      {email.sentiment}
                    </span>
                    {index === 0 && email.priority === 'urgent' && (
                      <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                        NEXT
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={`/emails/${email._id}`}
                    className="block font-medium text-gray-900 hover:text-blue-600 line-clamp-1 mb-1"
                  >
                    {email.subject}
                  </Link>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate mr-4">{email.sender}</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatTimeAgo(email.receivedDate)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {email.body}
                  </p>
                  
                  {email.extractedInfo && (
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {email.extractedInfo.phoneNumbers?.length > 0 && (
                        <span>📞 {email.extractedInfo.phoneNumbers.length} phone(s)</span>
                      )}
                      {email.extractedInfo.requirements?.length > 0 && (
                        <span>📋 {email.extractedInfo.requirements.length} requirement(s)</span>
                      )}
                    </div>
                  )}
                </div>
                
                <Link
                  to={`/emails/${email._id}`}
                  className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {sortedEmails.length > 10 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link
            to="/emails"
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View {sortedEmails.length - 10} more emails
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default PriorityQueue;
