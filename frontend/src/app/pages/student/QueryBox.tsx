import React, { useState } from 'react';
import { useData } from '@/app/context/DataContext';
import { useAuth } from '@/app/context/AuthContext';
import { Send, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { Query } from '@/app/types';

export const QueryBox = () => {
  const { queries, addQuery } = useData();
  const { user } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newQuery: Query = {
      id: Date.now().toString(),
      studentId: user.id,
      studentName: user.name,
      subject,
      message,
      status: 'Pending',
      date: new Date().toLocaleDateString(),
    };

    addQuery(newQuery);
    setSubject('');
    setMessage('');
    alert("Your request has been submitted successfully!");
  };

  const myQueries = queries.filter(q => q.studentId === user?.id);
  const filteredQueries = filter === 'all' 
    ? myQueries 
    : myQueries.filter(q => q.status.toLowerCase() === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Request Form */}
      <div className="space-y-6">
        <div className="bg-blue-950 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <MessageSquare className="text-amber-500" />
            Submit a Request
          </h2>
          <p className="text-blue-200 text-sm">
            Need study materials or have a query? Let the admin know.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none"
              >
                <option value="">Select Category</option>
                <option value="Notes Requirement">Notes Requirement</option>
                <option value="Event Query">Event Query</option>
                <option value="Study Material Request">Study Material Request</option>
                <option value="Exam Query">Exam Query</option>
                <option value="Event Inquiry">Event Inquiry</option>
                <option value="Facility Issue">Facility Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Describe your request in detail..."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              Submit Request
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Your History</h2>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'pending' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filter === 'completed' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredQueries.length > 0 ? (
            filteredQueries.map(query => (
              <div key={query.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-900">{query.subject}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
                    query.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {query.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {query.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-3 bg-slate-50 p-3 rounded-lg">{query.message}</p>
                <div className="text-xs text-slate-400 text-right">
                  Submitted on {query.date}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500 font-medium">No requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
