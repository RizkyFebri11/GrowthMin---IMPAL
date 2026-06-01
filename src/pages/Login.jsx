import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../config/supabase';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email dan Password tidak boleh kosong!');
      return;
    }

    // Validasi format email (IMK Task)
    if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Mohon masukkan format email yang valid!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let query = supabase.from('users').select('*').eq('password', password);
      if (email.includes('@')) {
        query = query.eq('email', email);
      } else {
        query = query.ilike('nama', `%${email}%`);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        throw new Error('Email atau Password salah!');
      }

      onLogin(data);
    } catch (err) {
      setError('Email atau Password salah!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-[#EDF6FF] overflow-hidden">
      <img
        src="/login_bg_blur.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover scale-105 filter blur-[6px] opacity-90 pointer-events-none"
      />

      {/* Huge Glass Container (Main Wrapper) */}
      <div className="relative w-full max-w-[1726px] h-[894px] max-h-[90vh] bg-white/10 shadow-[0_4px_53px_6px_rgba(0,0,0,0.17)] rounded-[26px] xl:rounded-[32px] backdrop-blur-[8px] flex flex-col lg:flex-row items-center justify-between p-6 lg:p-12 xl:p-20 overflow-y-auto lg:overflow-hidden">

        {/* Left Side: Main Illustration */}
        <div className="hidden lg:flex w-1/2 justify-center items-center h-full relative z-10">
          <img
            src="/logo_growthmin.png"
            alt="Logo GrowthMin"
            className="w-full max-w-[500px] max-h-[500px] object-contain animate-in fade-in duration-700 pointer-events-none"
          />
        </div>

        {/* Right Side: Login Form Container */}
        <div className="w-full max-w-xl lg:w-[592px] lg:h-[728px] bg-white/10 shadow-[5.2px_5.2px_5.2px_0_rgba(0,0,0,0.1),_0_4px_46px_14px_rgba(0,0,0,0.09)] rounded-[32px] border-2 border-[#BCEFFF] backdrop-blur-[3px] p-8 sm:p-12 lg:p-16 flex flex-col justify-center animate-in fade-in duration-500 delay-150 relative z-10 shrink-0">

          <h2 className="text-white text-[40px] font-bold text-center mb-10 tracking-tight drop-shadow-md">
            Login
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[15px] font-medium text-slate-800 ml-1">Email / Username</label>
              <div className="bg-white rounded-[8px] px-5 py-3.5 flex items-center shadow-sm">
                <input
                  type="text"
                  placeholder="username atau email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-light"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[15px] font-medium text-slate-800 ml-1">Password</label>
              <div className="bg-white rounded-[8px] px-5 py-3.5 flex items-center justify-between shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none font-light pr-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-3 mb-8">
            <a href="#" className="text-[#4F46E5] text-[15px] font-medium hover:underline">
              Lupa Kata Sandi?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full bg-[#4F46E5] hover:bg-indigo-700 text-white h-[58px] rounded-[8px] text-[24px] font-semibold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Memuat...' : 'Sign In'}
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-[#C33E3E] opacity-50"></div>
            <span className="text-slate-800 text-[14px]">or Login with</span>
            <div className="flex-1 h-[1px] bg-[#C33E3E] opacity-50"></div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-[#EEEEEE] hover:bg-gray-200 h-[40px] rounded-[8px] flex justify-center items-center gap-2 transition-colors">
              <svg width="20" height="20" viewBox="0 0 48 48" className="scale-[0.8]"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
              <span className="text-slate-800 text-[14px] font-medium">Continue with Google</span>
            </button>

            <button className="w-full bg-[#EEEEEE] hover:bg-gray-200 h-[40px] rounded-[8px] flex justify-center items-center gap-2 transition-colors">
              <svg width="20" height="20" viewBox="0 0 50 50" className="scale-[0.8]"><path d="M 25.041016 4.6074219 C 23.961016 4.6074219 22.868156 5.0341719 22.041016 5.8613281 L 21.849609 6.0527344 A 2.0002 2.0002 0 0 0 21.365234 6.7714844 C 20.893234 7.5454844 20.655234 8.2432656 20.609375 8.9746094 C 20.597375 9.1676094 20.612172 9.3512812 20.636719 9.53125 L 20.669922 9.7714844 C 20.730922 10.222484 20.932453 10.617188 21.21875 10.902344 L 21.246094 10.929688 C 21.579094 11.262688 22.052687 11.455422 22.560547 11.480469 L 22.59375 11.482422 C 22.79375 11.493422 23.003922 11.474609 23.210938 11.439453 L 23.470703 11.396484 C 24.167703 11.258484 24.819797 10.939266 25.568359 10.373047 A 2.0002 2.0002 0 0 0 26.242188 9.5820312 C 26.852188 8.4230312 27.070359 7.3779844 27.087891 6.3886719 C 27.091891 6.1606719 27.071859 5.9404219 27.041016 5.7324219 C 26.968016 5.2304219 26.70275 4.8878594 26.435547 4.7070312 C 26.068547 4.4570312 25.553016 4.6074219 25.041016 4.6074219 z M 24.960938 12.513672 C 22.427938 12.513672 20.089859 13.911297 18.068359 15.341797 C 16.714359 16.301797 15.485125 17.291703 14.341797 17.845703 C 13.064797 18.463703 11.666125 18.790516 10.285156 18.847656 L 10.134766 18.851562 C 6.8407656 18.989563 4.223875 21.134781 3.5683594 24.238281 C 3.2673594 25.666281 3.1230469 27.279891 3.1230469 28.751953 C 3.1230469 34.697953 4.4841562 39.467469 6.8847656 42.714844 L 6.890625 42.722656 C 8.650625 45.104656 10.963422 45.925781 13.111328 45.925781 L 13.294922 45.921875 C 14.869922 45.890875 16.388797 45.247297 17.873047 44.619141 C 19.389047 43.978141 20.893125 43.33925 22.484375 43.345703 C 24.113375 43.351703 25.666187 44.020219 27.228516 44.693359 L 27.240234 44.699219 C 28.618234 45.285219 30.013516 45.884766 31.429688 45.884766 C 34.789687 45.884766 37.387797 44.409391 39.238281 41.517578 L 39.244141 41.507812 L 39.255859 41.498047 C 39.417859 41.258047 39.636656 40.857641 39.818359 40.404297 L 39.824219 40.388672 L 39.833984 40.373047 C 40.063984 39.897047 40.669812 38.650828 41.318359 36.335938 L 41.380859 36.115234 L 41.162109 36.033203 C 39.025109 35.228203 37.525281 33.722609 36.568359 31.621094 C 35.618359 29.539094 35.293469 27.284203 35.794922 25.074219 C 36.368922 22.540219 37.581891 20.892609 39.220703 19.642578 L 39.232422 19.632812 L 39.025391 19.462891 C 37.778391 18.069891 36.126484 16.940547 34.195312 16.324219 L 34.152344 16.310547 C 32.748344 15.860547 31.066484 15.656516 29.230469 15.541016 C 28.051469 15.466016 26.697469 15.3855 25.435547 14.839844 C 25.276547 14.772844 25.109938 14.673859 24.960938 14.537109 z" /></svg>
              <span className="text-slate-800 text-[14px] font-medium">Continue with Apple</span>
            </button>
          </div>

          <p className="text-center mt-6 text-[12px] text-slate-800">
            Dont have account? <a href="#" className="text-[#4F46E5] hover:underline">Register</a>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;
