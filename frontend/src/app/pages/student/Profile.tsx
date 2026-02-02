import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { User, Award, BookOpen, Mail, Shield } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-800"></div>
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end -mt-12 mb-6 gap-6">
            <div className="w-24 h-24 bg-amber-500 rounded-xl border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-blue-950">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-slate-500 font-medium">{user.role === 'student' ? `${user.branch} • ${user.semester}` : 'Administrator'}</p>
            </div>
            <div className="pb-1">
               <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                 {user.role === 'student' ? 'Student Account' : 'Admin Access'}
               </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Email Address</p>
                    <p className="text-slate-700 font-medium">{user.email}</p>
                  </div>
                </div>
                
                {user.role === 'student' && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Roll Number</p>
                        <p className="text-slate-700 font-medium">{user.rollNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Branch & Semester</p>
                        <p className="text-slate-700 font-medium">{user.branch} - {user.semester}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {user.role === 'student' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Academic Performance</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2 text-amber-700">
                      <Award size={20} />
                      <span className="text-xs font-bold uppercase">Total Points</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{user.points}</p>
                    <p className="text-xs text-slate-500 mt-1">Top 10% of class</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-700">
                      <BookOpen size={20} />
                      <span className="text-xs font-bold uppercase">Notes Shared</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{user.notesUploaded}</p>
                    <p className="text-xs text-slate-500 mt-1">Helping 50+ students</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
