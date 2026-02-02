import React, { useState } from 'react';
import { useData } from '@/app/context/DataContext';
import { Trophy, Medal, Award, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export const Leaderboard = () => {
  const { leaderboard, refreshLeaderboard } = useData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshLeaderboard();
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sort by points descending just in case
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  const hasRealData = sortedLeaderboard.length > 0 && sortedLeaderboard[0].points > 0;
  
  if (!hasRealData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold font-serif text-slate-900">Student Leaderboard</h1>
          <p className="text-slate-500">Earn points by sharing notes and participating in events!</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <Trophy size={64} className="mx-auto text-slate-300 mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Leaderboard Coming Soon!</h3>
          <p className="text-slate-500 mb-4">
            Be the first to earn points by uploading notes and participating in events.
          </p>
          <p className="text-sm text-slate-400">
            ⭐ Upload notes: +10 points each<br />
            🎉 Join events: +5 points each
          </p>
        </div>
      </div>
    );
  }

  const topThree = sortedLeaderboard.slice(0, 3);
  const rest = sortedLeaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-8 flex justify-between items-center">
        <div className="flex-1">
          <h1 className="text-3xl font-bold font-serif text-slate-900">Student Leaderboard</h1>
          <p className="text-slate-500">Earn points by sharing notes and participating in events!</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-12">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 rounded-full border-4 border-slate-300 bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 mb-4 shadow-lg overflow-hidden relative">
              <span className="z-10">{topThree[1].name.charAt(0)}</span>
            </div>
            <div className="bg-white w-32 h-32 rounded-t-xl shadow-lg border-t-4 border-slate-300 flex flex-col items-center justify-start pt-4">
               <span className="text-3xl font-bold text-slate-300">2</span>
               <p className="font-bold text-slate-900 text-sm mt-1">{topThree[1].name}</p>
               <p className="text-xs text-slate-500 font-bold">{topThree[1].points} pts</p>
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center z-10"
          >
            <div className="relative">
              <Trophy className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-500" size={32} />
              <div className="w-24 h-24 rounded-full border-4 border-amber-500 bg-amber-50 flex items-center justify-center text-2xl font-bold text-amber-600 mb-4 shadow-xl overflow-hidden relative">
                <span className="z-10">{topThree[0].name.charAt(0)}</span>
              </div>
            </div>
            <div className="bg-white w-40 h-40 rounded-t-xl shadow-lg border-t-4 border-amber-500 flex flex-col items-center justify-start pt-6">
               <span className="text-4xl font-bold text-amber-600">1</span>
               <p className="font-bold text-slate-900 text-sm mt-2">{topThree[0].name}</p>
               <p className="text-xs text-slate-500 font-bold">{topThree[0].points} pts</p>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-18 h-18 rounded-full border-4 border-amber-300 bg-amber-50 flex items-center justify-center text-lg font-bold text-amber-500 mb-4 shadow-lg overflow-hidden relative">
              <span className="z-10">{topThree[2].name.charAt(0)}</span>
            </div>
            <div className="bg-white w-28 h-28 rounded-t-xl shadow-lg border-t-4 border-amber-300 flex flex-col items-center justify-start pt-3">
               <span className="text-3xl font-bold text-amber-700">3</span>
               <p className="font-bold text-slate-900 text-sm mt-1">{topThree[2].name}</p>
               <p className="text-xs text-slate-500 font-bold">{topThree[2].points} pts</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-sm text-slate-500 uppercase">Rank</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-500 uppercase">Student</th>
              <th className="px-6 py-4 font-bold text-sm text-slate-500 uppercase text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rest.map((student, index) => (
              <tr key={student.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-bold">#{index + 4}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-blue-900">{student.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
