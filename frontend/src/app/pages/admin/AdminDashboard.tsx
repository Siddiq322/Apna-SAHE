import React, { useState } from 'react';
import { useData } from '@/app/context/DataContext';
import { useAuth } from '@/app/context/AuthContext';
import { BookOpen, Calendar, MessageSquare, Plus, Check, X, Trash2, ShieldCheck, User, Upload, Users } from 'lucide-react';
import { Event, Note } from '@/app/types';
import { PDFUpload } from '../../components/PDFUpload';
import { NotesViewer } from '../../components/NotesViewer';
import AdminUserManagement from '../../components/AdminUserManagement';

export const AdminDashboard = () => {
  const { notes, events, queries, addEvent, deleteEvent, addNote, updateQueryStatus, refreshNotes } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'events' | 'queries' | 'users'>('overview');
  
  // Event Form State
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventType, setEventType] = useState('Technical');
  const [eventBranch, setEventBranch] = useState('ALL');
  const [eventLink, setEventLink] = useState('');

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventTitle,
        date: eventDate,
        type: eventType,
        time: '10:00 AM',
        venue: 'Main Auditorium',
        description: 'New event added by admin.',
        branch: eventBranch,
        registerLink: eventLink || '#'
      };
      
      await addEvent(newEvent);
      setIsEventModalOpen(false);
      setEventTitle('');
      setEventDate('');
      setEventBranch('ALL');
      setEventLink('');
      alert("Event published successfully!");
    } catch (error) {
      console.error('Failed to add event:', error);
      alert("Failed to publish event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        alert('Event deleted successfully!');
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Tabs */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex gap-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'notes' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Manage Notes
        </button>
        <button 
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'events' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Manage Events
        </button>
        <button 
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'queries' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Student Queries
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Manage Users
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                 <BookOpen size={24} />
               </div>
               <div>
                 <p className="text-sm text-slate-500 font-bold">Total Notes</p>
                 <h3 className="text-2xl font-bold text-slate-900">{notes.length}</h3>
               </div>
             </div>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                 <Calendar size={24} />
               </div>
               <div>
                 <p className="text-sm text-slate-500 font-bold">Total Events</p>
                 <h3 className="text-2xl font-bold text-slate-900">{events.length}</h3>
               </div>
             </div>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                 <MessageSquare size={24} />
               </div>
               <div>
                 <p className="text-sm text-slate-500 font-bold">Pending Queries</p>
                 <h3 className="text-2xl font-bold text-slate-900">{queries.filter(q => q.status === 'Pending').length}</h3>
               </div>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">📤 Upload New Notes</h3>
              <PDFUpload onUploadSuccess={refreshNotes} />
            </div>
            
            {/* Stats Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Notes Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Notes</span>
                  <span className="font-bold text-blue-600">{notes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Admin Uploads</span>
                  <span className="font-bold text-green-600">
                    {notes.filter(note => note.uploadedByRole === 'admin').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Student Uploads</span>
                  <span className="font-bold text-purple-600">
                    {notes.filter(note => note.uploadedByRole === 'student').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Notes Section */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">📚 All Notes</h3>
            <NotesViewer useDataContext={true} />
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button 
              onClick={() => setIsEventModalOpen(true)}
              className="bg-blue-950 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-blue-900"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {events.map(event => (
               <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
                 <div className="flex-1">
                   <h3 className="font-bold text-slate-900">{event.title}</h3>
                   <p className="text-sm text-slate-500">{event.date} • {event.venue}</p>
                   {event.registerLink && event.registerLink !== '#' && (
                     <a 
                       href={event.registerLink} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-800 text-xs underline mt-1 block"
                     >
                       View Event Link
                     </a>
                   )}
                 </div>
                 <button 
                   onClick={() => handleDeleteEvent(event.id!)}
                   className="text-slate-400 hover:text-red-500 transition-colors"
                   title="Delete Event"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-4">
          {queries.map(query => (
            <div key={query.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <span className="font-bold text-slate-900 block">{query.subject}</span>
                   <span className="text-xs text-slate-500">From: {query.studentName}</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  query.status === 'Completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {query.status}
                </span>
              </div>
              <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded-lg">{query.message}</p>
              
              {query.status === 'Pending' && (
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => updateQueryStatus(query.id, 'Completed')}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700"
                  >
                    <Check size={16} />
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
          {queries.length === 0 && (
            <p className="text-slate-500 text-center py-8">No queries found.</p>
          )}
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg">Add New Event</h3>
               <button onClick={() => setIsEventModalOpen(false)}><X size={20} /></button>
             </div>
             <form onSubmit={handleAddEvent} className="space-y-4">
               <input 
                 type="text" 
                 placeholder="Event Title" 
                 required 
                 value={eventTitle}
                 onChange={(e) => setEventTitle(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
               />
               <input 
                 type="date" 
                 required 
                 value={eventDate}
                 onChange={(e) => setEventDate(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
               />
               <select 
                 value={eventBranch}
                 onChange={(e) => setEventBranch(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
               >
                 <option value="ALL">All Branches</option>
                 <option value="CSE">Computer Science and Engineering</option>
                 <option value="ECE">Electronics and Communication Engineering</option>
                 <option value="MECH">Mechanical Engineering</option>
                 <option value="CIVIL">Civil Engineering</option>
                 <option value="EEE">Electrical and Electronics Engineering</option>
                 <option value="IT">Information Technology</option>
                 <option value="CHEMICAL">Chemical Engineering</option>
                 <option value="BIOTECH">Biotechnology Engineering</option>
                 <option value="AERONAUTICAL">Aeronautical Engineering</option>
                 <option value="AUTOMOBILE">Automobile Engineering</option>
               </select>
               <input 
                 type="url" 
                 placeholder="Event Link (optional)" 
                 value={eventLink}
                 onChange={(e) => setEventLink(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm"
               />
               <button className="w-full bg-blue-950 text-white font-bold py-3 rounded-lg">
                 Publish Event
               </button>
             </form>
           </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <AdminUserManagement />
        </div>
      )}
    </div>
  );
};
