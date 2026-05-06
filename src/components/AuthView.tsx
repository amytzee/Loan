import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Camera, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';

interface AuthViewProps {
  onSuccess: () => void;
  lang: 'sw' | 'en';
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, lang }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    if (mode === 'signup') {
      if (!formData.fullName || !formData.phone || !formData.password) return 'Tafadhali jaza nafasi zote muhimu';
      if (formData.password !== formData.confirmPassword) return 'Password hazifanani';
      if (formData.password.length < 6) return 'Password lazima iwe na herufi angalau 6';
    } else {
      if (!formData.email || !formData.password) return 'Tafadhali jaza email na password';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const emailToUse = formData.email || `${formData.phone}@coshve.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, emailToUse, formData.password);
        const user = userCredential.user;

        let photoURL = '';
        if (imageFile) {
          const storageRef = ref(storage, `profiles/${user.uid}`);
          await uploadBytes(storageRef, imageFile);
          photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(user, {
          displayName: formData.fullName,
          photoURL: photoURL
        });

        await setDoc(doc(db, 'users', user.uid), {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          photoURL: photoURL,
          role: 'user',
          createdAt: new Date().toISOString()
        });

      } else {
        // Login - support phone or email login
        const emailToUse = formData.email.includes('@') ? formData.email : `${formData.email}@coshve.com`;
        await signInWithEmailAndPassword(auth, emailToUse, formData.password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Kuna tatizo limetokea. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-brand-blue rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-blue/20">
          <ShieldCheck className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-display font-bold text-brand-blue mb-2">
          {mode === 'login' ? (lang === 'sw' ? 'Karibu Tena' : 'Welcome Back') : (lang === 'sw' ? 'Jisajili na Sisi' : 'Join Coshve')}
        </h2>
        <p className="text-gray-500 font-medium">
          {mode === 'login' ? (lang === 'sw' ? 'Ingia kuanza safari yako' : 'Login to manage your loans') : (lang === 'sw' ? 'Pata suluhisho la kifedha leo' : 'Get your financial solution today')}
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-50">
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-50 bg-gray-100 overflow-hidden shadow-inner flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-300" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Camera size={16} className="text-brand-blue" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Jina Kamili</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. George Anderson"
                    className="w-full bg-gray-50 border border-gray-100 py-4 px-12 rounded-2xl focus:outline-none focus:border-brand-gold transition-all font-semibold"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Namba ya Simu</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="tel" 
                    placeholder="06XX XXX XXX"
                    className="w-full bg-gray-50 border border-gray-100 py-4 px-12 rounded-2xl focus:outline-none focus:border-brand-gold transition-all font-semibold"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email / Namba</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={mode === 'login' ? "Email au Namba ya Simu" : "Barua Pepe (Si lazima)"}
                className="w-full bg-gray-50 border border-gray-100 py-4 px-12 rounded-2xl focus:outline-none focus:border-brand-gold transition-all font-semibold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 py-4 px-12 rounded-2xl focus:outline-none focus:border-brand-gold transition-all font-semibold"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-blue"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Thibitisha Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 py-4 px-12 rounded-2xl focus:outline-none focus:border-brand-gold transition-all font-semibold"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 text-rose-500 text-xs font-bold p-4 rounded-xl border border-rose-100"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-5 shadow-brand-blue/20 flex items-center justify-center gap-3 group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? (lang === 'sw' ? 'Ingia Sasa' : 'Login Now') : (lang === 'sw' ? 'Fungua Akaunti' : 'Create Account'))}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-gray-400 font-medium text-sm">
            {mode === 'login' ? (lang === 'sw' ? 'Huna akaunti?' : "Don't have an account?") : (lang === 'sw' ? 'Tayari una akaunti?' : 'Already have an account?')}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-brand-blue font-black ml-2 hover:underline"
            >
              {mode === 'login' ? (lang === 'sw' ? 'Jisajili' : 'Sign Up') : (lang === 'sw' ? 'Ingia' : 'Login')}
            </button>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">
           Secured by Coshve Guard Systems
         </p>
      </div>
    </div>
  );
};
