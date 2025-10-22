"use client";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'replied';
  updatedAt?: string;
}

export const ContactAdmin: React.FC = () => {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-296dcbbb/admin/contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setContacts(result.contacts || []);
      } else {
        throw new Error(result.error || 'Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId: string, status: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-296dcbbb/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === contactId 
              ? { ...contact, status: status as 'new' | 'read' | 'replied', updatedAt: result.contact.updatedAt }
              : contact
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update contact status');
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Failed to update contact status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle size={16} className="text-blue-500" />;
      case 'read': return <Clock size={16} className="text-yellow-500" />;
      case 'replied': return <CheckCircle size={16} className="text-green-500" />;
      default: return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={fetchContacts}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Form Submissions</h1>
        <p className="text-gray-600">Manage and respond to contact form submissions</p>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Mail size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No contact submissions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contact.status)}`}>
                      {getStatusIcon(contact.status)}
                      <span className="ml-1 capitalize">{contact.status}</span>
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">{contact.subject}</h4>
                  <p className="text-gray-600 leading-relaxed">{contact.message}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>Submitted: {formatDate(contact.timestamp)}</span>
                    {contact.updatedAt && (
                      <>
                        <span>•</span>
                        <span>Updated: {formatDate(contact.updatedAt)}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {contact.status === 'new' && (
                      <button
                        onClick={() => updateContactStatus(contact.id, 'read')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                    {contact.status === 'read' && (
                      <button
                        onClick={() => updateContactStatus(contact.id, 'replied')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Mark as Replied
                      </button>
                    )}
                    <a
                      href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Reply via Email
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};