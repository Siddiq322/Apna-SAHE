import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useData } from '@/app/context/DataContext';
import { Calendar, BookOpen, Bell, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardHomeProps {
  setCurrentView: (view: string) => void;
}

export const DashboardHome = ({ setCurrentView }: DashboardHomeProps) => {
  const { user } = useAuth();
  const { events, notes } = useData();

  // Get recent items
  const recentEvents = events.slice(0, 2);
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <BookOpen size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-serif mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-blue-100 max-w-xl">
            You have upcoming exams next week. Don't forget to check the latest study notes uploaded by your peers.
          </p>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setCurrentView('academics')}
              className="bg-amber-500 text-blue-950 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg"
            >
              Go to Academics
            </button>
            <button 
              onClick={() => setCurrentView('events')}
              className="bg-white/10 backdrop-blur-sm text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
            >
              View Events
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Study Notes</p>
            <h3 className="text-2xl font-bold text-slate-900">{notes.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Upcoming Events</p>
            <h3 className="text-2xl font-bold text-slate-900">{events.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Your Points</p>
            <h3 className="text-2xl font-bold text-slate-900">{user?.points || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Events */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Calendar size={20} className="text-amber-500" />
              Latest Events
            </h3>
            <button 
              onClick={() => setCurrentView('events')}
              className="text-sm font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map(event => (
                <div key={event.id} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <div className="flex-shrink-0 w-16 text-center bg-white rounded-lg border border-slate-200 p-2 flex flex-col justify-center shadow-sm">
                    <span className="text-xs font-bold text-amber-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold text-slate-900">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{event.venue} • {event.time}</p>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar size={32} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No events announced yet</p>
                <p className="text-slate-400 text-xs">Check back later for updates</p>
              </div>
            )}
          </div>
        </div>

        {/* New Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" />
              New Study Material
            </h3>
            <button 
              onClick={() => setCurrentView('academics')}
              className="text-sm font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentNotes.length > 0 ? (
              recentNotes.map(note => (
                <div key={note.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{note.title}</h4>
                      <p className="text-xs text-slate-500">{note.subject} • {note.uploadedByName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{note.type}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen size={32} className="text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No study material available</p>
                <p className="text-slate-400 text-xs">Be the first to upload notes!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
