// ============================================
// FILE: frontend/src/components/RecentActivity.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, Send, CheckCircle, Clock, User, 
  MessageSquare, AlertCircle, TrendingUp 
} from 'lucide-react';

const RecentActivity = ({ emails }) => {
  const getActivityIcon = (status, priority) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'responded': return <Send className="h-4 w-4 text-blue-600" />;
      case 'pending': 
        return priority === 'urgent' 
          ? <AlertCircle className="h-4 w-4 text-red-600" />
          : <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-50 border-green-200';
      case 'responded': return 'bg-blue-50 border-blue-200';
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActivityText = (email) => {
    switch (email.status) {
      case 'resolved': return `Email from ${email.sender} was resolved`;
      case 'responded': return `Response sent to ${email.sender}`;
      case 'pending': return `New email received from ${email.sender}`;
      default: return `Email activity from ${email.sender}`;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  // Sort by most recent first
  const sortedEmails = [...emails].sort((a, b) => 
    new Date(b.receivedDate) - new Date(a.receivedDate)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link
            to="/analytics"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Analytics
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Latest email interactions and updates
        </p>
      </div>

      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {sortedEmails.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">Email activity will appear here</p>
          </div>
        ) : (
          sortedEmails.slice(0, 15).map((email) => (
            <div key={email._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start">
                <div className={`flex-shrink-0 p-2 rounded-full border ${getActivityColor(email.status)} mr-4`}>
                  {getActivityIcon(email.status, email.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getActivityText(email)}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTimeAgo(email.receivedDate)}
                    </span>
                  </div>
                  
                  <Link
                    to={`/emails/${email._id}`}
                    className="text-sm text-gray-700 hover:text-blue-600 line-clamp-1 mb-1"
                  >
                    {email.subject}
                  </Link>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {email.sender}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      email.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      email.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      email.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {email.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      email.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      email.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {email.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {sortedEmails.length > 15 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <Link
            to="/emails"
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all email activity
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
