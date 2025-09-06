// ============================================
// FILE: frontend/src/components/EmailCard.js
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, User, Calendar, Tag, AlertCircle, 
  CheckCircle, Clock, ArrowRight, Phone, FileText 
} from 'lucide-react';

const EmailCard = ({ email, onStatusUpdate }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <Link
              to={`/emails/${email._id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
            >
              {email.subject}
            </Link>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span className="truncate">{email.sender}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(email.receivedDate)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(email.priority)}`}>
              {email.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(email.sentiment)}`}>
              {email.sentiment}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
              {email.status}
            </span>
          </div>
        </div>

        {/* Email Preview */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm line-clamp-2">
            {email.body}
          </p>
        </div>

        {/* Extracted Information */}
        {email.extractedInfo && (
          <div className="mb-4 flex flex-wrap gap-4 text-xs">
            {email.extractedInfo.phoneNumbers?.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-3 w-3 mr-1" />
                <span>{email.extractedInfo.phoneNumbers.length} phone number(s)</span>
              </div>
            )}
            {email.extractedInfo.requirements?.length > 0 && (
              <div className="flex items-center text-gray-600">
                <FileText className="h-3 w-3 mr-1" />
                <span>{email.extractedInfo.requirements.length} requirement(s)</span>
              </div>
            )}
            {email.category && (
              <div className="flex items-center text-gray-600">
                <Tag className="h-3 w-3 mr-1" />
                <span className="capitalize">{email.category}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {email.status === 'pending' && (
              <button
                onClick={() => onStatusUpdate(email._id, 'resolved')}
                className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Resolved
              </button>
            )}
          </div>
          
          <Link
            to={`/emails/${email._id}`}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
