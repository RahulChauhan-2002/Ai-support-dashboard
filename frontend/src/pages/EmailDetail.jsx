import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Send, Edit, Save, X, 
  User, Calendar, Tag, AlertCircle 
} from 'lucide-react';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchEmail();
  }, [id]);

  const fetchEmail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/emails/${id}`);
      setEmail(response.data);
      setResponse(response.data.aiResponse);
    } catch (error) {
      console.error('Error fetching email:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async () => {
    try {
      setSending(true);
      await axios.post(`/api/emails/${id}/send`, {
        customResponse: editing ? response : null
      });
      alert('Response sent successfully!');
      navigate('/emails');
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    } finally {
      setSending(false);
    }
  };

  const handleSaveResponse = async () => {
    try {
      await axios.put(`/api/emails/${id}/response`, { response });
      setEmail({ ...email, aiResponse: response });
      setEditing(false);
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!email) {
    return <div>Email not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/emails')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Emails
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Email Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{email.subject}</h2>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {email.sender}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(email.receivedDate).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                email.priority === 'urgent' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {email.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                email.sentiment === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : email.sentiment === 'negative'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {email.sentiment}
              </span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="px-6 py-4">
          <h3 className="font-semibold text-gray-900 mb-2">Original Message</h3>
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
            {email.body}
          </div>
        </div>

        {/* Extracted Information */}
        {email.extractedInfo && (
          <div className="px-6 py-4 border-t">
            <h3 className="font-semibold text-gray-900 mb-2">Extracted Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {email.extractedInfo.phoneNumbers?.length > 0 && (
                <div>
                  <span className="font-medium">Phone Numbers:</span>
                  <ul className="mt-1">
                    {email.extractedInfo.phoneNumbers.map((phone, i) => (
                      <li key={i}>{phone}</li>
                    ))}
                  </ul>
                </div>
              )}
              {email.extractedInfo.requirements?.length > 0 && (
                <div>
                  <span className="font-medium">Requirements:</span>
                  <ul className="mt-1">
                    {email.extractedInfo.requirements.map((req, i) => (
                      <li key={i}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Response */}
        <div className="px-6 py-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">AI Generated Response</h3>
            <div className="flex space-x-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveResponse}
                    className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setResponse(email.aiResponse);
                      setEditing(false);
                    }}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
          {editing ? (
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="bg-blue-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
              {response}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={() => navigate('/emails')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSendResponse}
            disabled={sending}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Response'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;