import React, { useState } from 'react';
import { useData } from '@/app/context/DataContext';
import { Map, Info, Building2, ExternalLink, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const Infrastructure = () => {
  const { facilities } = useData();
  const [activeTab, setActiveTab] = useState<'about' | 'university'>('about');
  const [selectedBlock, setSelectedBlock] = useState('');

  const blocks = [
    'Administrative Block',
    'Block A - CSE Department',
    'Block B - ECE & EEE Department',
    'Block C - Mechanical & Civil',
    'Library Building',
    'Sports Complex',
    'Auditorium',
    'Cafeteria'
  ];

  const handleOpenMap = () => {
    if (selectedBlock) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBlock + " Siddhartha Academic of Higher Education")}`, '_blank');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 lg:p-1.5 inline-flex mb-4 w-full sm:w-auto overflow-hidden">
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-bold transition-all ${
            activeTab === 'about' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Info size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="truncate">About University</span>
        </button>
        <button
          onClick={() => setActiveTab('university')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-bold transition-all ${
            activeTab === 'university' 
              ? 'bg-blue-950 text-white shadow-md' 
              : 'text-slate-500 hover:text-blue-950 hover:bg-slate-50'
          }`}
        >
          <Map size={16} className="lg:w-[18px] lg:h-[18px]" />
          <span className="truncate">Find My University</span>
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white p-4 lg:p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="bg-blue-950 text-white p-4 lg:p-6 rounded-xl mb-4 lg:mb-6">
              <h3 className="text-lg lg:text-xl font-bold text-amber-400 mb-2 lg:mb-3 flex items-center gap-2">
                🏫 About Siddhartha Academy of Higher Education (SAHE)
              </h3>
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed mb-3 lg:mb-4">
                SAHE is a premier educational institution located in Kanuru, Vijayawada, Andhra Pradesh, India. 
                Formerly known as Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), our institution 
                traces its roots back to 1977, making it one of the first private engineering colleges in united Andhra Pradesh.
              </p>
              <p className="text-xs lg:text-sm text-slate-300 leading-relaxed mb-3 lg:mb-4">
                As a deemed-to-be university recognised by UGC and accredited by NAAC with A+ grade, SAHE offers 
                undergraduate and postgraduate programmes in engineering, business, and technology, integrating 
                rigorous academics with practical skills and industry relevance.
              </p>
              <div className="mb-3 lg:mb-4">
                <h4 className="text-sm lg:text-base font-semibold text-amber-300 mb-2">🏗️ World-Class Infrastructure</h4>
                <ul className="text-sm text-slate-300 leading-relaxed space-y-1 ml-4">
                  <li>• State-of-the-art laboratories with latest equipment and technology</li>
                  <li>• Modern classrooms with smart boards and audio-visual facilities</li>
                  <li>• Comprehensive library with vast collection of books and digital resources</li>
                  <li>• High-speed Wi-Fi campus connectivity and computer centers</li>
                  <li>• Sports facilities including indoor and outdoor courts</li>
                  <li>• Spacious hostels with modern amenities for students</li>
                  <li>• Advanced research centers and innovation labs</li>
                  <li>• Green campus with sustainable energy solutions</li>
                </ul>
              </div>
              <button 
                onClick={() => window.open('https://siddhartha.edu.in/', '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-2 bg-amber-500 text-blue-950 px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-400 transition-colors"
              >
                🌐 Know More
              </button>
            </div>
            
            <h2 className="text-3xl font-bold font-serif text-blue-950 mb-6">Institutional Excellence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-amber-600 mb-2 uppercase tracking-wide">Our Vision</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To be a center of excellence in technical education and research, producing global leaders who contribute to the sustainable development of society.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-600 mb-2 uppercase tracking-wide">Our Mission</h3>
                  <p className="text-slate-600 leading-relaxed">
                    To provide quality education through innovative teaching methodologies, foster a culture of research and innovation, and instill ethical values and leadership qualities in students.
                  </p>
                </div>
              </div>
              <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Facts — SAHE (VRSEC)</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Established in 1977
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    NAAC A+ Accredited Institution
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Lush Green Campus in Vijayawada
                  </li>
                  <li className="flex items-center gap-3 text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    5000+ Students Across Programs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Find My University Tab */}
        {activeTab === 'university' && (
          <div className="bg-gradient-to-br from-blue-50 to-amber-50 p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Header Section */}
              <div className="space-y-4">
                <div className="bg-blue-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Navigation className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-blue-950">Find My University</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Discover our beautiful campus located in the heart of Vijayawada. 
                  Navigate to Siddhartha Academy of Higher Education with ease.
                </p>
              </div>

              {/* University Info Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">University Location</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Siddhartha Academy of Higher Education</h3>
                <p className="text-slate-600">
                  📍 Kanuru, Vijayawada, Andhra Pradesh, India
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span>🚗 Easy Access</span>
                  <span>•</span>
                  <span>🌳 Green Campus</span>
                  <span>•</span>
                  <span>🏛️ Historic Institution</span>
                </div>
              </div>

              {/* Navigation Button */}
              <div className="space-y-4">
                <button 
                  onClick={() => window.open('https://maps.app.goo.gl/eSTjbkSkH4Q4JSfj9?g_st=ic', '_blank', 'noopener,noreferrer')}
                  className="group bg-gradient-to-r from-blue-950 to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                >
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                    <ExternalLink size={24} />
                  </div>
                  <span>Navigate to Campus</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </button>
                <p className="text-sm text-slate-500">
                  Opens in Google Maps for turn-by-turn directions
                </p>
              </div>

              {/* Campus Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="bg-white/80 p-4 rounded-lg border border-slate-200">
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="font-semibold text-slate-900">Academic Excellence</h4>
                  <p className="text-sm text-slate-600">Premier education since 1977</p>
                </div>
                <div className="bg-white/80 p-4 rounded-lg border border-slate-200">
                  <div className="text-2xl mb-2">🌿</div>
                  <h4 className="font-semibold text-slate-900">Green Campus</h4>
                  <p className="text-sm text-slate-600">Eco-friendly environment</p>
                </div>
                <div className="bg-white/80 p-4 rounded-lg border border-slate-200">
                  <div className="text-2xl mb-2">🚌</div>
                  <h4 className="font-semibold text-slate-900">Easy Transport</h4>
                  <p className="text-sm text-slate-600">Well-connected location</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
