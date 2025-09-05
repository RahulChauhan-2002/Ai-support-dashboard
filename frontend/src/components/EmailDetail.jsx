import React, { useState } from 'react';

export default function EmailDetail({ 
  email, 
  onUpdateResponse, 
  onSendReply, 
  onUpdateStatus,
  loading = false 
}) {
  const [editedResponse, setEditedResponse] = useState(email?.aiResponse || '');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setEditedResponse(email?.aiResponse || '');
  }, [email]);

  if (!email) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-4xl mb-4">📮</div>
        <p className="text-gray-500 text-lg">Select an email to view details</p>
        <p className="text-gray-400 text-sm mt-2">
          Choose an email from the list to see its content and AI-generated response
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onUpdateResponse(email._id, editedResponse);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      await onSendReply(email._id);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    await onUpdateStatus(email._id, newStatus);
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    return priority === 'Urgent' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {email.subject}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(email.sentiment)}`}>
                {email.sentiment}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                {email.priority}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {email.status}
              </span>
            </div>
          </div>
          
          {/* Status Update Buttons */}
          <div className="flex gap-2">
            <select
              value={email.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="p-6 space-y-6">
        {/* Sender Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
          <p className="text-gray-900">{email.sender}</p>
          <p className="text-sm text-gray-500">
            {new Date(email.sentDate).toLocaleString()}
          </p>
        </div>

        {/* Email Body */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
              {email.body}
            </pre>
          </div>
        </div>

        {/* Extracted Information */}
        {email.extractedInfo && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Extracted Information</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              {email.extractedInfo.requirements?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-700">Requirements:</p>
                  <ul className="text-sm text-blue-900 list-disc list-inside">
                    {email.extractedInfo.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {email.extractedInfo.contactDetails?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-700">Contact Details:</p>
                  <ul className="text-sm text-blue-900">
                    {email.extractedInfo.contactDetails.map((contact, idx) => (
                      <li key={idx}>{contact}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Response Editor */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">AI Generated Response</h3>
          <textarea
            value={editedResponse}
            onChange={(e) => setEditedResponse(e.target.value)}
            rows={8}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="AI response will appear here..."
          />
          
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || editedResponse === email.aiResponse}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>💾 Save Draft</>
              )}
            </button>

            <button
              onClick={handleSend}
              disabled={isSending || !editedResponse.trim() || email.status === 'resolved'}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>📤 Send Reply</>
              )}
            </button>

            {email.status === 'resolved' && (
              <span className="flex items-center px-3 py-2 text-green-700 bg-green-100 rounded-lg text-sm">
                ✅ Reply Sent
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
