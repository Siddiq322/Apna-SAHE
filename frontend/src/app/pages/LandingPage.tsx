import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/app/context/AuthContext';
import { GraduationCap, ShieldCheck, UserCircle, ArrowRight } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSignUpForm } from '../components/GoogleSignUpForm';

export const LandingPage = () => {
  const { login, signUp, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [semester, setSemester] = useState('1');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSignUpData, setGoogleSignUpData] = useState<{
    tempUser: FirebaseUser;
    userName: string;
    userEmail: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (authMode === 'login') {
        // STRICT TAB VALIDATION
        if (activeTab === 'admin') {
          // Admin tab: Only allow admin email
          if (email.toLowerCase() !== 'siddiqshaik613@gmail.com') {
            alert('Error: Only authorized admin email (siddiqshaik613@gmail.com) can access admin portal');
            return;
          }
        }
        
        if (activeTab === 'student') {
          // Student tab: Block admin email completely
          if (email.toLowerCase() === 'siddiqshaik613@gmail.com') {
            alert('Error: Admin account must use Admin tab for login');
            return;
          }
          // Also check if it's a valid student email
          if (!email.toLowerCase().includes('@vrsec.ac.in')) {
            alert('Error: Please use a valid VRSEC email (@vrsec.ac.in)');
            return;
          }
        }
        
        // Proceed with login - pass expected role for validation
        await login(email, password, activeTab);
      } else {
        // Register new user - ONLY FOR STUDENTS
        if (activeTab === 'admin') {
          alert('Error: Admin accounts cannot be created through this portal. Contact system administrator.');
          return;
        }
        
        // Student registration only
        await signUp({
          email,
          password,
          name,
          branch,
          semester
        });
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // If successful, user will be automatically redirected by auth state change
    } catch (error: any) {
      if (error.message === 'GOOGLE_SIGNUP_REQUIRED') {
        // User needs to provide additional info
        setGoogleSignUpData({
          tempUser: error.tempUser,
          userName: error.userName || error.userEmail.split('@')[0],
          userEmail: error.userEmail
        });
      } else {
        alert('Google Sign-In Error: ' + error.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignUpComplete = (result: any) => {
    // User successfully created, they will be redirected automatically
    setGoogleSignUpData(null);
  };

  const handleGoogleSignUpError = (error: string) => {
    alert('Registration Error: ' + error);
    setGoogleSignUpData(null);
  };

  // Show Google Sign-Up form if additional info is needed
  if (googleSignUpData) {
    return (
      <GoogleSignUpForm
        tempUser={googleSignUpData.tempUser}
        userName={googleSignUpData.userName}
        userEmail={googleSignUpData.userEmail}
        onComplete={handleGoogleSignUpComplete}
        onError={handleGoogleSignUpError}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-950 text-white relative overflow-hidden flex-col justify-between p-8 xl:p-16">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 lg:gap-4 mb-8 lg:mb-10">
            <div className="bg-white p-3 lg:p-4 rounded-xl shadow-lg">
              <img src="https://i.postimg.cc/htNM9R26/Screenshot-2026-02-01-222826.png" alt="VRSEC Logo" className="w-12 h-12 lg:w-16 lg:h-16 object-contain" />
            </div>
            <span className="font-bold text-2xl lg:text-4xl tracking-wider">Apna SAHE</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl lg:text-5xl font-bold font-serif leading-tight mb-4 lg:mb-6"
          >
            Siddhartha Academy of Higher Education
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mb-8"
          >
            <p className="text-lg text-slate-300 font-light mb-8">
              Your Campus, Your Portal. Seamless access to academics, events, infrastructure, and student community resources.
            </p>
          </motion.div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <h3 className="font-bold text-amber-400 text-lg">Academics</h3>
              <p className="text-sm text-slate-300">Access notes & timetables</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <h3 className="font-bold text-amber-400 text-lg">Events</h3>
              <p className="text-sm text-slate-300">Stay updated on campus life</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-base text-slate-400 font-medium">
          © 2026 Apna SAHE. All rights reserved.
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        {/* Mobile Logo Header - Only visible on mobile */}
        <div className="lg:hidden absolute top-6 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-xl shadow-lg border">
              <img src="https://i.postimg.cc/htNM9R26/Screenshot-2026-02-01-222826.png" alt="VRSEC Logo" className="w-10 h-10 object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-wider text-slate-800">Apna SAHE</span>
          </div>
        </div>

        <div className="w-full max-w-md mt-20 lg:mt-0">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => { 
                  setActiveTab('student'); 
                  setAuthMode('login'); 
                  setEmail(''); // Clear admin email
                  setPassword('');
                  setName('');
                  setBranch('CSE');
                  setSemester('1');
                }}
                className={`flex-1 py-3 lg:py-4 text-xs lg:text-sm font-bold flex items-center justify-center gap-1 lg:gap-2 transition-colors ${
                  activeTab === 'student' 
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900' 
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                }`}
              >
                <UserCircle size={16} className="lg:w-[18px] lg:h-[18px]" />
                Student
              </button>
              <button
                onClick={() => { 
                  setActiveTab('admin'); 
                  setAuthMode('login'); // Force admin to login mode only
                  setEmail(''); // Clear email field
                  setPassword('');
                  setName('');
                  setBranch('CSE');
                  setSemester('1');
                }}
                className={`flex-1 py-3 lg:py-4 text-xs lg:text-sm font-bold flex items-center justify-center gap-1 lg:gap-2 transition-colors ${
                  activeTab === 'admin' 
                    ? 'bg-white text-blue-900 border-b-2 border-blue-900' 
                    : 'bg-slate-50 text-slate-500 hover:text-slate-700'
                }`}
              >
                <ShieldCheck size={16} className="lg:w-[18px] lg:h-[18px]" />
                Admin
              </button>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {authMode === 'login' 
                    ? `Welcome Back, ${activeTab === 'student' ? 'Student' : 'Admin'}!` 
                    : activeTab === 'admin' 
                      ? 'Admin Access Only' 
                      : 'Create Student Account'
                  }
                </h2>
                <p className="text-slate-500 text-sm">
                  {authMode === 'login' 
                    ? activeTab === 'admin'
                      ? 'Admin credentials required'
                      : 'Please sign in to continue'
                    : activeTab === 'admin'
                      ? 'Contact administrator for access'
                      : 'Join the community today'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all"
                    placeholder={activeTab === 'admin' ? 'Enter admin email' : 'username@vrsec.ac.in'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {activeTab === 'student' && authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        required
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all"
                      >
                        <option value="CSE">Computer Science Engineering</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EEE">Electrical & Electronics</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Semester</label>
                      <select
                        required
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 outline-none transition-all"
                      >
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                        <option value="3">3rd Semester</option>
                        <option value="4">4th Semester</option>
                        <option value="5">5th Semester</option>
                        <option value="6">6th Semester</option>
                        <option value="7">7th Semester</option>
                        <option value="8">8th Semester</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-950 text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2"
                >
                  {authMode === 'login' ? 'Sign In' : 'Register'}
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Google Sign-In Section */}
              {!googleSignUpData && (
                <>
                  <div className="mt-4 flex items-center">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="px-4 text-xs text-slate-500 bg-white">OR</span>
                    <div className="flex-1 border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full mt-4 bg-white border border-slate-300 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isGoogleLoading ? 'Signing in...' : `Continue with Google`}
                  </button>
                </>
              )}

              {/* Google Sign-Up Additional Info Form */}
              {googleSignUpData && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Complete Your Registration</h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Signing in as: {googleSignUpData.tempUser.email}
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">
                        Branch
                      </label>
                      <select
                        value={googleSignUpData.branch}
                        onChange={(e) => setGoogleSignUpData(prev => prev ? {...prev, branch: e.target.value} : null)}
                        className="w-full bg-white border border-blue-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="CSE">Computer Science Engineering</option>
                        <option value="ECE">Electronics & Communication</option>
                        <option value="EEE">Electrical & Electronics</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                        <option value="IT">Information Technology</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">
                        Semester
                      </label>
                      <select
                        value={googleSignUpData.semester}
                        onChange={(e) => setGoogleSignUpData(prev => prev ? {...prev, semester: e.target.value} : null)}
                        className="w-full bg-white border border-blue-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                        <option value="3">3rd Semester</option>
                        <option value="4">4th Semester</option>
                        <option value="5">5th Semester</option>
                        <option value="6">6th Semester</option>
                        <option value="7">7th Semester</option>
                        <option value="8">8th Semester</option>
                      </select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleCompleteGoogleSignUp}
                        disabled={isGoogleLoading}
                        className="flex-1 bg-blue-900 text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-all disabled:opacity-50"
                      >
                        {isGoogleLoading ? 'Completing...' : 'Complete Registration'}
                      </button>
                      <button
                        onClick={() => setGoogleSignUpData(null)}
                        disabled={isGoogleLoading}
                        className="px-4 bg-slate-200 text-slate-600 font-medium py-2 rounded-lg hover:bg-slate-300 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'student' && (
                <div className="mt-6 text-center text-sm">
                  {authMode === 'login' ? (
                    <p className="text-slate-500">
                      New student?{' '}
                      <button 
                        onClick={() => setAuthMode('register')}
                        className="text-blue-900 font-bold hover:underline"
                      >
                        Register here
                      </button>
                    </p>
                  ) : (
                    <p className="text-slate-500">
                      Already have an account?{' '}
                      <button 
                        onClick={() => setAuthMode('login')}
                        className="text-blue-900 font-bold hover:underline"
                      >
                        Login here
                      </button>
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="mt-6 text-center text-sm">
                  <p className="text-slate-500">
                    Only authorized personnel can access admin portal.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Admin accounts are managed by system administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
