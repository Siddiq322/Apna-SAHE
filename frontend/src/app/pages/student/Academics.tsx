import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Book, Clock, Download, ChevronDown, FileText, Search, Plus, Upload, X, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useData } from '@/app/context/DataContext';
import { useAuth } from '@/app/context/AuthContext';
import { Note } from '@/app/types';
import { PDFUpload } from '../../components/PDFUpload';
import { NotesViewer } from '../../components/NotesViewer';

export const Academics = () => {
  const { notes, addNote } = useData();
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'timetable' | 'notes' | 'upload' | 'calendar'>('notes');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1.5 inline-flex mb-4">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'timetable' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Clock size={18} />
          Timetable
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'notes' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Book size={18} />
          Browse Notes
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'upload' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Upload size={18} />
          Upload Notes
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'calendar' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Calendar size={18} />
          Faculty
        </button>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <NotesViewer 
              allowedBranches={undefined}
              allowedSemesters={undefined}
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <PDFUpload 
              onUploadSuccess={() => {
                // Optional: switch back to notes tab after upload
                setActiveTab('notes');
              }}
              allowedBranches={undefined}
              allowedSemesters={undefined}
            />
          </div>
        )}

        {activeTab === 'timetable' && (
           <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-xl shadow-sm border border-slate-200">
             <div className="bg-blue-50 p-6 rounded-full">
               <Clock className="text-blue-900" size={48} />
             </div>
             <div className="max-w-md space-y-2">
               <h2 className="text-2xl font-bold text-slate-900">Official Timetable</h2>
               <p className="text-slate-500">
                 Go to timetable portal to access your class schedules, exam dates, and academic calendar.
               </p>
             </div>
             <button 
               onClick={() => window.open('https://vrsec.campx.in/sahe/student-workspace/timetable', '_blank', 'noopener,noreferrer')}
               className="flex items-center gap-2 bg-blue-950 text-white hover:bg-blue-900 px-8 py-4 rounded-lg text-base font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
             >
               Visit Timetable Portal
               <ArrowRight size={20} />
             </button>
             <p className="text-xs text-slate-400">Opens in a new tab • Redirects to official website</p>
           </div>
        )}

        {activeTab === 'calendar' && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="bg-amber-50 p-6 rounded-full">
              <Calendar className="text-amber-600" size={48} />
            </div>
            <div className="max-w-md space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Faculty Portal</h2>
              <p className="text-slate-500">
                Access faculty information, course materials, and learning management system.
              </p>
            </div>
            <button 
              onClick={() => window.open('https://vrsec.campx.in/sahe/student-workspace/learning-management', '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-2 bg-blue-950 text-white hover:bg-blue-900 px-8 py-4 rounded-lg text-base font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Visit Faculty Portal
              <ArrowRight size={20} />
            </button>
            <p className="text-xs text-slate-400">Opens in a new tab • Redirects to official website</p>
          </div>
        )}
      </motion.div>

    </div>
  );
};
