import React, { useState } from 'react';
import { useData } from '@/app/context/DataContext';
import { Calendar, MapPin, Clock, ExternalLink, Mail, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export const Events = () => {
  const { events } = useData();
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const branches = [
    'ALL', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'CHEMICAL', 'BIOTECH',
    'AERONAUTICAL', 'AUTOMOBILE', 'MINING', 'METALLURGY', 'TEXTILE', 
    'FOOD TECHNOLOGY', 'ENVIRONMENTAL', 'MARINE', 'PETROLEUM', 
    'INSTRUMENTATION', 'PRODUCTION', 'INDUSTRIAL', 'AGRICULTURAL', 'FORESTRY'
  ];

  const filteredEvents = selectedBranch === 'ALL' 
    ? events 
    : events.filter(e => e.branch === 'ALL' || e.branch === selectedBranch);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-sm px-2">
          <Filter size={16} />
          Filter:
        </div>
        {branches.map(branch => (
          <button
            key={branch}
            onClick={() => setSelectedBranch(branch)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              selectedBranch === branch
                ? 'bg-blue-950 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {branch}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
            <div className="bg-blue-950 p-4 flex justify-between items-start">
              <span className="inline-block px-2 py-1 bg-amber-500 text-blue-950 text-xs font-bold rounded">
                {event.type}
              </span>
              <span className="text-white/80 text-xs font-bold border border-white/20 px-2 py-1 rounded">
                {event.branch === 'ALL' ? 'All Branches' : event.branch}
              </span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex gap-4 mb-4">
                <div className="flex-shrink-0 w-16 text-center bg-slate-50 rounded-lg border border-slate-200 p-2 flex flex-col justify-center h-16">
                  <span className="text-xs font-bold text-slate-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-2xl font-bold text-blue-900">{new Date(event.date).getDate()}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {event.venue}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-600 text-sm mb-6 flex-1">
                {event.description}
              </p>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-auto">
                <a 
                  href={event.registerLink}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Register Now
                  <ExternalLink size={16} />
                </a>
                <button 
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-900 transition-colors"
                  title="Contact Organizer"
                >
                  <Mail size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))
        ) : (
          <div className="md:col-span-2 text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No events announced yet</h3>
            <p className="text-slate-500">Check back later for campus updates and events.</p>
          </div>
        )}
      </div>
    </div>
  );
};
