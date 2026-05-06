import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  HandCoins, 
  GraduationCap, 
  Home, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Instagram, 
  MapPin, 
  ChevronRight,
  Menu,
  X,
  CreditCard,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Globe,
  Wallet,
  PieChart,
  User,
  History,
  LayoutDashboard,
  Bell,
  Plus,
  PenTool,
  Paperclip,
  Users,
  Search,
  AlertCircle,
  XCircle,
  Settings,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Sparkles,
  MessageSquare,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

import { auth, db } from './lib/firebase';
import { AuthView } from './components/AuthView';

// --- Types ---
type Language = 'sw' | 'en';
const ADMIN_EMAILS = ['admin@gmail.com', 'amytzee@gmail.com'];

interface Translation {
  nav: { home: string; services: string; about: string; process: string; apply: string };
  hero: {
    badge: string;
    title: string;
    smile: string;
    desc: string;
    cta: string;
    stats: string;
    fast: string;
  };
  services: {
    title: string;
    accent: string;
    desc: string;
    business: { title: string; desc: string; features: string[] };
    rental: { title: string; desc: string };
    education: { title: string; desc: string; accent: string };
    personal: { title: string; desc: string; badge1: string; badge2: string };
  };
  process: {
    title: string;
    accent: string;
    desc: string;
    steps: { title: string; desc: string }[];
  };
  calc: {
    title: string;
    accent: string;
    desc: string;
    amount: string;
    period: string;
    monthly: string;
    total: string;
    cta: string;
    note: string;
  };
  contact: {
    title: string;
    accent: string;
    desc: string;
    hq: string;
    hours: string;
    formTitle: string;
    name: string;
    phone: string;
    type: string;
    amount: string;
    submit: string;
    types: string[];
  };
}

interface AppConfig {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  themeMode: 'light' | 'dark' | 'system';
  helpPhone?: string;
  helpEmail?: string;
  helpWhatsapp?: string;
}

interface LoanFormField {
  label: string;
  type: 'text' | 'number' | 'image' | 'file' | 'tel' | 'textarea' | 'location' | 'guarantors';
  required: boolean;
}

interface Notification {
  id?: string;
  userId: string; // 'all' for broadcast
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'status' | 'broadcast' | 'alert';
}

interface LoanProduct {
  id?: string;
  title: string;
  description: string;
  icon: string;
  iconType: 'emoji' | 'lucide' | 'url';
  color: string;
  formFields: LoanFormField[];
}

// --- Translations Data ---
const translations: Record<Language, Translation> = {
  sw: {
    nav: { home: 'Nyumbani', services: 'Huduma', about: 'Kuhusu', process: 'Mchakato', apply: 'Omba Mkopo' },
    hero: {
      badge: 'Tier 2 Microfinance • Leseni ya BoT',
      title: 'Tabasamu',
      smile: 'Lako.',
      desc: 'Tunabadilisha maisha kupitia mikopo nafuu, ya haraka, na isiyo na usumbufu. Pata suluhisho leo.',
      cta: 'Anza Maombi',
      stats: '5k+ Wateja',
      fast: 'Utoaji wa Haraka'
    },
    services: {
      title: 'Suluhisho za',
      accent: 'Kifedha',
      desc: 'Tumebuni bidhaa zinazolenga kutatua matatizo halisi ya Watanzania, kuanzia kodi hadi mitaji ya biashara.',
      business: {
        title: 'Mkopo wa Biashara',
        desc: 'Kuza biashara yako leo kwa mtaji wenye masharti nafuu. Tunathamini mzunguko wa biashara yako.',
        features: ['Hadi TZS 10M', 'Mchakato wa siku moja', 'Ushauri wa bure']
      },
      rental: {
        title: 'Mkopo wa Kodi',
        desc: '"Stress za kodi sasa basi!" Tunalipa kodi yako ya nyumba kwa mkupuo nawe unaturejeshea taratibu.'
      },
      education: {
        title: 'Mkopo wa Ada',
        desc: 'Hakikisha elimu ya wana mpendwa inaendelea bila kukwama. Mkopo huu unalipa moja kwa moja shuleni.',
        accent: 'Smile kwa kila mwanafunzi'
      },
      personal: {
        title: 'Mkopo Binafsi',
        desc: 'Kwa mahitaji yako yoyote ya dharura. Tunakupatia fedha ndani ya dakika chache baada ya uhakiki.',
        badge1: 'Nafuu Sana',
        badge2: 'Riba Rafiki'
      }
    },
    process: {
      title: 'Hatua 3 za',
      accent: 'Mafanikio',
      desc: 'Rahisi, Haraka, na Wazi kabisa. Hakuna ada zilizofichwa.',
      steps: [
        { title: 'Wasilisha Maombi', desc: 'Jaza fomu ya maombi mtandaoni au ofisini kwetu Millennium Tower.' },
        { title: 'Tathmini ya Haraka', desc: 'Timu yetu itakagua maombi yako na kufanya uhakiki ndani ya saa chache.' },
        { title: 'Pokea Fedha Yako', desc: 'Baada ya kuidhinishwa, fedha huingizwa kwenye akaunti yako papo hapo.' }
      ]
    },
    calc: {
      title: 'Panga',
      accent: 'Mustakabali',
      desc: 'Tumia kikokotoo hiki cha pekee kupata makadirio ya mkopo wako. Tunazingatia uwezo wa kila mteja.',
      amount: 'Kiasi cha Mkopo',
      period: 'Muda wa Marejesho',
      monthly: 'Marejesho ya Kila Mwezi',
      total: 'Jumla ya Marejesho',
      cta: 'Omba Sasa Hivi',
      note: '* Makadirio kulingana na riba ya wastani ya 12% kwa miezi 6.'
    },
    contact: {
      title: 'Tunapatikana',
      accent: 'Millennium Tower II',
      desc: 'Ofisi zetu ni rafiki na ziko wazi kwa ajili yako. Iwe ni kwa barua pepe, simu, au kututembelea, tabasamu linakusubiri.',
      hq: 'Makao Makuu',
      hours: 'Lunes - Juma: 09:00 - 17:00',
      formTitle: 'Anzisha Safari Yako Hapa',
      name: 'Jina lako Kamili',
      phone: 'Namba ya Simu',
      type: 'Aina ya Mkopo',
      amount: 'Kiasi (TZS)',
      submit: 'TUMA MAOMBI',
      types: ['Mkopo Binafsi', 'Mkopo wa Biashara', 'Mkopo wa Kodi', 'Mkopo wa Ada']
    }
  },
  en: {
    nav: { home: 'Home', services: 'Services', about: 'About', process: 'Process', apply: 'Apply Now' },
    hero: {
      badge: 'Tier 2 Microfinance • BoT Licensed',
      title: 'Your',
      smile: 'Smile.',
      desc: 'Transforming lives through affordable, fast, and hassle-free loans. Get your financial solution today.',
      cta: 'Start Application',
      stats: '5k+ Customers',
      fast: 'Fast Disbursement'
    },
    services: {
      title: 'Financial',
      accent: 'Solutions',
      desc: 'We have designed products aimed at solving real challenges of Tanzanians, from rent to business capital.',
      business: {
        title: 'Business Loan',
        desc: 'Grow your business today with affordable capital. We value your business cash flow.',
        features: ['Up to TZS 10M', 'One-day process', 'Free business advice']
      },
      rental: {
        title: 'Rental Loan',
        desc: '"No more rent stress!" We pay your house rent at once and you repay us gradually.'
      },
      education: {
        title: 'School Fees Loan',
        desc: 'Ensure your loved one\'s education continues without interruption. This loan pays directly to the school.',
        accent: 'Smile for every student'
      },
      personal: {
        title: 'Personal Loan',
        desc: 'For all your emergency needs. Get funds within minutes after a quick verification process.',
        badge1: 'Very Affordable',
        badge2: 'Friendly Interest'
      }
    },
    process: {
      title: '3 Steps to',
      accent: 'Success',
      desc: 'Simple, Fast, and Transparent. No hidden fees or charges.',
      steps: [
        { title: 'Submit Application', desc: 'Fill out the application form online or at our Millennium Tower office.' },
        { title: 'Quick Assessment', desc: 'Our team will review your application and verify it within a few hours.' },
        { title: 'Receive Your Funds', desc: 'Once approved, the funds are deposited directly into your account instantly.' }
      ]
    },
    calc: {
      title: 'Plan Your',
      accent: 'Future',
      desc: 'Use this unique calculator to get your loan estimates. We consider each customer\'s individual capacity.',
      amount: 'Loan Amount',
      period: 'Repayment Period',
      monthly: 'Monthly Repayment',
      total: 'Total Repayment',
      cta: 'Apply Right Now',
      note: '* Estimates based on an average 12% interest for 6 months.'
    },
    contact: {
      title: 'We are at',
      accent: 'Millennium Tower II',
      desc: 'Our offices are friendly and open for you. Whether by email, phone, or visiting us, a smile awaits you.',
      hq: 'Headquarters',
      hours: 'Mon - Fri: 09:00 - 17:00',
      formTitle: 'Start Your Journey Here',
      name: 'Full Name',
      phone: 'Phone Number',
      type: 'Loan Type',
      amount: 'Amount (TZS)',
      submit: 'SUBMIT APPLICATION',
      types: ['Personal Loan', 'Business Loan', 'Rental Loan', 'School Fees Loan']
    }
  }
};

// --- Navbar Component ---
const Navbar = ({ lang, setLang, activeView, setActiveView, user, appConfig, setAppConfig, setShowingSupport }: { lang: Language, setLang: (l: Language) => void, activeView: string, setActiveView: (v: string) => void, user: any, appConfig: AppConfig, setAppConfig: (c: AppConfig) => void, setShowingSupport: (s: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = activeView === 'home';
  const forceSolid = !isHome || scrolled;
  const textColor = forceSolid ? 'text-brand-blue dark:text-white' : 'text-white';
  const iconColor = forceSolid ? 'text-brand-blue dark:text-brand-gold' : 'text-white';

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${forceSolid ? 'py-3' : 'py-5 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className={`rounded-3xl px-4 md:px-6 py-3 flex justify-between items-center transition-all duration-500 ${forceSolid ? 'glass shadow-2xl shadow-brand-blue/5 border-gray-100' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 mr-2 cursor-pointer" onClick={() => setActiveView('home')}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 overflow-hidden shrink-0 ${forceSolid ? 'bg-brand-blue dark:bg-brand-gold/10 shadow-brand-blue/20' : 'bg-white/10 shadow-none'}`}>
                {appConfig.logoUrl ? (
                  <img src={appConfig.logoUrl} className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className={`${iconColor} w-5 h-5 md:w-6 md:h-6 transition-colors`} />
                )}
              </div>
              <span className={`text-xs md:text-xl font-display font-bold tracking-tight truncate whitespace-nowrap transition-colors ${textColor}`}>
                {appConfig.name}<span className="text-brand-gold">.</span>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => setActiveView('home')} className={`font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${activeView === 'home' ? 'text-brand-gold' : forceSolid ? 'text-brand-blue' : 'text-white'}`}>{t.home}</button>
              <button onClick={() => setActiveView('services')} className={`font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${activeView === 'services' ? 'text-brand-gold' : forceSolid ? 'text-brand-blue/60 hover:text-brand-blue' : 'text-white/60 hover:text-white'}`}>{t.services}</button>
              
              <button 
                onClick={() => setShowingSupport(true)}
                className={`flex items-center gap-2 font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${forceSolid ? 'text-brand-blue/60 hover:text-brand-blue' : 'text-white/60 hover:text-white'}`}
              >
                <Phone size={14} /> {lang === 'sw' ? 'Msaada' : 'Support'}
              </button>

              <div className="h-4 w-px bg-gray-200 mx-2" />

              <button 
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue hover:bg-brand-blue/5' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                <Globe size={14} /> {lang.toUpperCase()}
              </button>

              <button 
                onClick={() => setAppConfig({ ...appConfig, themeMode: appConfig.themeMode === 'dark' ? 'light' : 'dark' })}
                className={`p-2 rounded-xl border transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue hover:bg-brand-blue/5' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                {appConfig.themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <a href="#apply" className="btn-primary py-3 px-6 shadow-brand-blue/30">
                {t.apply}
              </a>
            </div>

            <div className="flex lg:hidden items-center gap-1.5 md:gap-3">
              <button 
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border font-black text-[9px] transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue dark:text-brand-gold' : 'border-white/20 text-white bg-white/10'}`}
              >
                <Globe size={11} /> {lang.toUpperCase()}
              </button>

              <button 
                onClick={() => setAppConfig({ ...appConfig, themeMode: appConfig.themeMode === 'dark' ? 'light' : 'dark' })}
                className={`p-1.5 rounded-xl border transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue dark:text-brand-gold' : 'border-white/20 text-white bg-white/10'}`}
              >
                {appConfig.themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button className={`p-1.5 rounded-xl ${scrolled ? 'text-brand-blue dark:text-brand-gold bg-brand-blue/5 dark:bg-white/5' : 'text-white bg-white/10'}`}>
                <Bell size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

    </>
  );
};

// --- Hero Component ---
const Hero = ({ lang, users, appConfig }: { lang: Language, users: any[], appConfig: AppConfig }) => {
  const t = translations[lang].hero;
  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-[95vh] flex items-center pt-24 pb-12 md:pb-24 overflow-hidden bg-brand-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-blue/40 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-brand-gold/20 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-6 md:mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brand-gold rounded-full animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-brand-gold uppercase tracking-[0.15em] md:tracking-[0.2em]">{t.badge}</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-bold text-white leading-[1.1] md:leading-[0.95] mb-6 md:mb-8">
            {appConfig.name} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">{t.smile}</span>
          </h1>
          
          <p className="text-base md:text-xl xl:text-2xl text-slate-300 mb-8 md:mb-10 max-w-lg leading-relaxed font-medium">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5">
            <a href="#services" className="group bg-brand-gold text-brand-blue px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl shadow-brand-gold/20">
              {t.cta} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </a>
            {users.length > 0 && (
              <div className="flex -space-x-4 items-center justify-center sm:justify-start">
                {users.map((u, i) => (
                  <div key={u.id || i} className="w-10 h-10 md:w-14 md:h-14 rounded-full border-4 border-brand-dark bg-slate-800 flex items-center justify-center overflow-hidden hover:scale-110 hover:z-10 transition-all cursor-pointer">
                    <img src={u.photoURL || `https://i.pravatar.cc/100?u=${u.id}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="pl-8">
                  <p className="text-white font-black text-xs md:text-sm tracking-tight">{t.stats}</p>
                  <div className="flex gap-1 text-brand-gold">
                    {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-[10px] md:text-xs">★</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white/5 aspect-square">
            <img 
              src="https://images.unsplash.com/photo-1573164067005-446df1668c18?auto=format&fit=crop&q=80&w=1200" 
              alt="Successful entrepreneur"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/60 to-transparent" />
          </div>
          
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -left-6 glass p-5 rounded-3xl shadow-2xl"
          >
            <div className="bg-brand-gold w-10 h-10 rounded-2xl flex items-center justify-center mb-3">
              <HandCoins className="text-brand-blue w-5 h-5" />
            </div>
            <p className="text-white font-bold text-xl">24 Hours</p>
            <p className="text-slate-400 text-[10px] font-semibold uppercase">{t.fast}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Services Component ---
const Services = ({ lang, loanProducts, onSelect }: { lang: Language, loanProducts: LoanProduct[], onSelect: (p: LoanProduct) => void }) => {
  const t = translations[lang].services;
  return (
    <section id="services" className="py-20 md:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="max-w-xl">
            <span className="text-brand-blue font-black uppercase tracking-widest text-xs md:text-sm mb-3 md:mb-4 block">{lang === 'sw' ? 'Huduma Zetu' : 'Our Services'}</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-brand-blue leading-tight">
              {t.title} <span className="text-brand-gold">{t.accent}</span>
            </h2>
          </div>
          <p className="text-slate-500 text-base md:text-lg max-w-md font-medium leading-relaxed">
            {t.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {loanProducts.map((p, idx) => {
            const IconMap: Record<string, any> = { User, Home, Briefcase, GraduationCap, Wallet, HandCoins, Building2, Clock };
            const IconComponent = IconMap[p.icon] || Briefcase;
            
            return (
              <motion.div 
                key={p.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative h-full flex flex-col p-8 md:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-brand-gold/30 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-brand-gold/10"
              >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                
                <div className="flex items-start justify-between mb-10 relative z-10">
                   <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl ${p.color} shadow-inner-white ring-8 ring-white/50 dark:ring-slate-800/50 group-hover:rotate-6 transition-transform duration-500`}>
                      {p.iconType === 'emoji' ? p.icon : (p.iconType === 'url' ? <img src={p.icon} className="w-10 h-10 object-contain" /> : <IconComponent size={32} strokeWidth={1.5} />)}
                   </div>
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold py-1 px-3 bg-brand-gold/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                     {lang === 'sw' ? 'Mkopo Bora' : 'Top Choice'}
                   </div>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-display font-bold text-brand-blue dark:text-white mb-4 group-hover:text-brand-gold transition-colors leading-tight">
                  {p.title} <span className="font-serif italic font-normal text-brand-gold/60">{lang === 'sw' ? 'Mkopo' : 'Loan'}</span>
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-auto pb-10">
                  {p.description || translations[lang].hero.desc}
                </p>

                <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50">
                  <button 
                    onClick={() => onSelect(p)}
                    className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-brand-blue dark:text-white group-hover:text-brand-gold transition-all"
                  >
                    <span className="relative overflow-hidden group/btn">
                      <span className="block group-hover/btn:-translate-y-full transition-transform duration-300">
                        {lang === 'sw' ? 'Omba Sasa' : 'Apply Now'}
                      </span>
                      <span className="absolute top-0 left-0 block translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 text-brand-gold">
                        {lang === 'sw' ? 'Anza Maombi' : 'Get Started'}
                      </span>
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// --- Process Component ---
const Process = ({ lang }: { lang: Language }) => {
  const t = translations[lang].process;
  return (
    <section id="process" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-brand-blue mb-4 md:mb-6 tracking-tight">
            {t.title} <span className="text-brand-gold">{t.accent}</span>
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto font-medium">
            {t.desc}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16 relative">
          <div className="hidden md:block absolute top-[2.25rem] left-0 w-full h-0.5 bg-slate-100 -z-10" />
          
          {t.steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative group text-center md:text-left"
            >
              <div className="w-16 h-16 md:w-18 md:h-18 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center text-brand-blue text-2xl font-black mb-6 md:mb-8 mx-auto md:mx-0 group-hover:border-brand-gold group-hover:text-brand-gold transition-all">
                {idx + 1}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-blue mb-3 md:mb-4">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-lg font-medium">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Loan Calculator ---
const LoanCalculator = ({ lang }: { lang: Language }) => {
  const [amount, setAmount] = useState(1000000);
  const [months, setMonths] = useState(6);
  const t = translations[lang].calc;
  
  const totalRepayment = amount * (1 + (0.12 * (months / 6)));
  const monthlyRepayment = totalRepayment / months;

  return (
    <section className="py-20 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-brand-blue rounded-[3rem] md:rounded-[4rem] p-6 md:p-20 text-white overflow-hidden relative shadow-3xl">
          <div className="absolute top-0 right-0 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-brand-gold/10 rounded-full blur-[80px] md:blur-[100px] -mr-48 md:-mr-64 -mt-48 md:-mt-64" />
          
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6 md:mb-8 leading-tight">
                {t.title} <span className="text-brand-gold">{t.accent}</span>
              </h2>
              <p className="text-base md:text-xl text-slate-300 mb-10 md:mb-12 leading-relaxed">
                {t.desc}
              </p>
              
              <div className="space-y-12 md:space-y-16">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>{t.amount}</span>
                    <span className="text-brand-gold">TZS {amount.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="100000" max="10000000" step="100000" value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-1 md:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-gold"
                  />
                </div>

                <div className="space-y-4 md:space-y-6">
                   <div className="flex justify-between items-center text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>{t.period}</span>
                    <span className="text-brand-gold">{months} {lang === 'sw' ? 'Miezi' : 'Months'}</span>
                  </div>
                  <input 
                    type="range" min="1" max="24" value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full h-1 md:h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-gold"
                  />
                </div>
              </div>
            </div>

            <div className="glass rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-3 md:mb-4">{t.monthly}</p>
              <h3 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-brand-gold mb-8 md:mb-10">
                <span className="text-base md:text-2xl text-white opacity-50 mr-2">TZS</span>
                {Math.round(monthlyRepayment).toLocaleString()}
              </h3>
              
              <div className="space-y-4 mb-10 md:mb-12">
                <div className="flex justify-between text-xs md:text-sm py-3 md:py-4 border-b border-white/5">
                  <span className="opacity-60 font-medium">{t.amount}</span>
                  <span className="font-bold">TZS {amount.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-xs md:text-sm py-3 md:py-4 border-b border-white/5">
                  <span className="opacity-60 font-medium">{t.total}</span>
                  <span className="font-bold text-brand-gold">TZS {Math.round(totalRepayment).toLocaleString()}</span>
                </div>
              </div>

              <a href="#apply" className="block w-full bg-brand-gold text-brand-blue py-5 md:py-6 rounded-2xl font-black text-lg md:text-xl hover:bg-white transition-all shadow-xl shadow-brand-gold/10">
                {t.cta}
              </a>
              <p className="mt-6 text-[10px] md:text-xs text-slate-500 italic opacity-80">{t.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Contact Form ---
const ContactForm = ({ lang, user }: { lang: Language, user: any }) => {
  const t = translations[lang].contact;
  return (
    <section id="apply" className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24">
          <div className="space-y-10 md:space-y-12">
            <div>
              <span className="text-brand-gold font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs mb-4 block">{lang === 'sw' ? 'Wasiliana' : 'Contact Us'}</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-brand-blue mb-6 md:mb-8 leading-tight">
                {t.title} <br /> <span className="text-brand-gold">{t.accent}</span>
              </h2>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                {t.desc}
              </p>
            </div>

            <div className="grid gap-8 md:gap-10">
              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                   <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">{t.hq}</h4>
                   <p className="text-lg md:text-xl font-bold text-brand-blue leading-snug">
                     Millennium Tower II, Floor 20, <br />
                     Makumbusho, Kijitonyama, Dar.
                   </p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-blue flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                   <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">{lang === 'sw' ? 'Wasiliana' : 'Call'}</h4>
                   <p className="text-lg md:text-xl font-bold text-brand-blue">0767 991 718 / 0776 629 590</p>
                   <p className="text-slate-400 font-medium text-sm">{t.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-dark rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 shadow-3xl text-white relative h-fit overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-brand-gold/10 rounded-full blur-2xl -ml-12 -mt-12" />
            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 md:mb-10">{t.formTitle}</h3>
            
            <form className="space-y-6 md:space-y-8" onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                fullName: formData.get('fullName'),
                phone: formData.get('phone'),
                loanType: formData.get('loanType'),
                amount: formData.get('amount'),
                timestamp: new Date().toISOString(),
                status: 'Pending',
                userId: user?.uid || null // Link to user if logged in
              };
              
              try {
                const { collection, addDoc } = await import('firebase/firestore');
                const { db } = await import('./lib/firebase');
                await addDoc(collection(db, 'applications'), data);
                alert(lang === 'sw' ? 'Ombi lako limepokelewa! Tutakucheki hivi punde.' : 'Application received! We will contact you soon.');
                (e.target as HTMLFormElement).reset();
              } catch (err) {
                console.error(err);
                alert(lang === 'sw' ? 'Mmh, kuna tatizo. Jaribu tena baadae.' : 'Something went wrong. Please try again later.');
              }
            }}>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t.name}</label>
                <input name="fullName" required type="text" className="w-full bg-white/5 border-b border-white/10 py-2.5 focus:outline-none focus:border-brand-gold transition-colors font-semibold" placeholder="e.g. John Mussa" />
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                 <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t.phone}</label>
                  <input name="phone" required type="text" className="w-full bg-white/5 border-b border-white/10 py-2.5 focus:outline-none focus:border-brand-gold transition-colors font-semibold" placeholder="07XX XXX XXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t.type}</label>
                  <select name="loanType" className="w-full bg-transparent border-b border-white/10 py-2.5 focus:outline-none focus:border-brand-gold transition-colors font-semibold appearance-none">
                    {t.types.map((type) => (
                      <option key={type} value={type} className="text-brand-dark">{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-40">{t.amount}</label>
                <input name="amount" required type="number" className="w-full bg-white/5 border-b border-white/10 py-2.5 focus:outline-none focus:border-brand-gold transition-colors font-semibold" placeholder="e.g. 2M" />
              </div>

              <button type="submit" className="w-full bg-brand-gold text-brand-blue py-5 md:py-6 rounded-2xl font-black text-base md:text-lg hover:bg-white hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-brand-gold/10">
                {t.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Footer ---
const Footer = ({ lang, appConfig }: { lang: Language, appConfig: AppConfig }) => {
  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-brand-blue/10 rounded-full blur-[100px] md:blur-[150px] -mr-48 md:-mr-96 -mt-24 md:-mt-32" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-24 border-b border-white/5 pb-16 md:pb-24 relative z-10">
          <div className="space-y-8 md:space-y-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 overflow-hidden">
                {appConfig.logoUrl ? (
                  <img src={appConfig.logoUrl} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="text-brand-gold w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold">{appConfig.name}<span className="text-brand-gold">.</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed font-medium text-sm md:text-base">
              {lang === 'sw' 
                ? 'Hatupokei dhamana za maana isiyo thabiti. Tunajenga uaminifu na kutoa msaada pale unapohitajika.' 
                : 'We prioritize trust and reliable support. Your smile is our best profit.'}
            </p>
            <div className="flex gap-2">
              {[Instagram, Phone].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-brand-gold hover:text-brand-blue transition-all border border-white/10">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:col-span-2 gap-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-brand-gold mb-8 md:mb-10">{lang === 'sw' ? 'Kampuni' : 'Company'}</h4>
              <ul className="space-y-4 md:space-y-6 text-slate-400 font-bold text-sm md:text-base">
                <li><a href="#home" className="hover:text-white transition-colors">{translations[lang].nav.home}</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">{translations[lang].nav.services}</a></li>
                <li><a href="#process" className="hover:text-white transition-colors">{translations[lang].nav.process}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-brand-gold mb-8 md:mb-10">{lang === 'sw' ? 'Msaada' : 'Support'}</h4>
              <ul className="space-y-4 md:space-y-6 text-slate-400 font-bold text-sm md:text-base">
                <li>Vigezo & Masharti</li>
                <li>Sera ya Faragha</li>
              </ul>
            </div>
          </div>

          <div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-brand-gold mb-8 md:mb-10">{lang === 'sw' ? 'Jiunge Nasi' : 'Stay Connected'}</h4>
             <p className="text-slate-400 mb-6 md:mb-8 font-medium text-sm">{lang === 'sw' ? 'Pata taarifa za bidhaa mpya na ushauri wa kifedha.' : 'Get update on our new financial products.'}</p>
             <div className="relative">
                <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 py-4 md:py-5 px-5 md:px-6 rounded-2xl focus:outline-none focus:border-brand-gold font-semibold text-sm" />
                <button className="absolute right-2.5 top-2.5 md:right-3 md:top-3 bg-brand-gold text-brand-blue p-2 rounded-xl">
                  <ChevronRight size={18} />
                </button>
             </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest relative z-10 text-center md:text-left">
          <p>© {new Date().getFullYear()} {appConfig.name} Ltd. Licensed Tier 2 Microfinance.</p>
          <div className="flex items-center gap-4 md:gap-8">
             <span>Dar es Salaam, TZ</span>
             <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
             <span>BoT Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function App() {
  const [lang, setLang] = useState<Language>('sw');
  const [activeView, setActiveView] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [publicUsers, setPublicUsers] = useState<any[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ 
    name: 'Coshve', 
    logoUrl: '',
    primaryColor: '#0A3665', // Default brand-blue
    secondaryColor: '#D4AF37', // Default brand-gold
    fontFamily: 'Inter',
    themeMode: 'system',
    helpPhone: '+255 700 000 000',
    helpEmail: 'support@coshve.co.tz',
    helpWhatsapp: '+255 700 000 000'
  });
  const [calcAmount, setCalcAmount] = useState<number>(0);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showingSupport, setShowingSupport] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', fullName: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
  const [adminTab, setAdminTab] = useState<'loans' | 'users' | 'products' | 'settings' | 'notifs'>('loans');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState({ title: '', message: '', userId: 'all' });

  useEffect(() => {
    // Apply Branding
    const root = document.documentElement;
    root.style.setProperty('--primary-color', appConfig.primaryColor);
    root.style.setProperty('--secondary-color', appConfig.secondaryColor);
    root.style.setProperty('--app-font', appConfig.fontFamily);
    
    // Theme Mode
    const isDark = appConfig.themeMode === 'dark' || (appConfig.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist to Firebase if Admin
    if (ADMIN_EMAILS.includes(user?.email || '')) {
      const saveConfig = async () => {
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        await setDoc(doc(db, 'appConfig', 'main'), appConfig, { merge: true });
      };
      // We don't want to save on EVERY keystroke necessarily, but for now it's okay for simpler implementation
      // or we can add a save button in admin settings (preferred)
    }
  }, [appConfig, user]);

  useEffect(() => {
    // Real-time config sync
    let unsub: () => void;
    const setupSync = async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      unsub = onSnapshot(doc(db, 'appConfig', 'main'), (docSnap: any) => {
        if (docSnap.exists()) {
          setAppConfig(docSnap.data() as AppConfig);
        }
      }, (error: any) => {
        console.error("Config sync error:", error);
      });
    };
    setupSync();
    
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const askAi = async (message: string) => {
    if (!message.trim()) return;
    setIsAiLoading(true);
    const newHistory: any = [...aiHistory, { role: 'user', parts: [{ text: message }] }];
    setAiHistory(newHistory);

    try {
      const statsContext = `The user has ${applications.length} loan applications. ${applications.length > 0 ? `Current latest loan status: ${applications[0].status} for a ${applications[0].loanType} loan of ${applications[0].amount}.` : 'They have not applied for any loans yet.'}`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: newHistory,
        config: {
          systemInstruction: `You are the AI Assistant for ${appConfig.name}, a microfinance institution licensed by BoT. 
          The customer's current language preference is ${lang === 'sw' ? 'Swahili' : 'English'}.
          CONTEXT: ${statsContext}
          Answer questions about loans (Business, Rental, School Fees, Personal), application processes, and other microfinance services.
          Be helpful, professional, and friendly. You can see the user's loan status above; use it to answer questions about their specific situation if they ask.`
        }
      });

      const text = response.text || "Pardon, I couldn't process that.";
      setAiHistory([...newHistory, { role: 'model', parts: [{ text }] }]);
    } catch (err) {
      console.error(err);
      setAiHistory([...newHistory, { role: 'model', parts: [{ text: "Error: AI service is currently unavailable." }] }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    pending: applications.filter(a => a.status === 'Pending').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    totalUsers: allUsers.length
  };

  const filteredLoans = applications.filter(a => 
    a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.loanType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const fetchConfig = async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      return onSnapshot(doc(db, 'appConfig', 'main'), (snap) => {
        if (snap.exists()) setAppConfig(snap.data() as AppConfig);
      });
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    let unsubUsers: (() => void) | undefined;
    let unsubApps: (() => void) | undefined;
    let unsubPublicUsers: (() => void) | undefined;
    let unsubNotifs: (() => void) | undefined;

    const initDataFetching = async () => {
      const { collection, onSnapshot, query, orderBy, where, limit } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');

      // Always fetch a few public users for social proof
      unsubPublicUsers = onSnapshot(query(collection(db, 'users'), limit(5)), (snapshot) => {
        setPublicUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      if (user) {
        // Fetch notifications for current user or broadcast
        unsubNotifs = onSnapshot(
          query(collection(db, 'notifications'), where('userId', 'in', [user.uid, 'all'])),
          (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
            setNotifications(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          }
        );

        if (user && ADMIN_EMAILS.includes(user.email || '')) {
          // Admin fetches everything
          unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });

          unsubApps = onSnapshot(query(collection(db, 'applications'), orderBy('timestamp', 'desc')), (snapshot) => {
            setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });
        } else {
          // Normal user fetches only their applications
          unsubApps = onSnapshot(
            query(collection(db, 'applications'), where('userId', '==', user.uid)), 
            (snapshot) => {
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setApplications(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }
          );
        }
      } else {
        setApplications([]);
        setAllUsers([]);
        setNotifications([]);
      }
    };

    initDataFetching();
    return () => {
      unsubUsers?.();
      unsubApps?.();
      unsubPublicUsers?.();
      unsubNotifs?.();
    };
  }, [user]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const fetchProducts = async () => {
      const { collection, onSnapshot, query, addDoc, getDocs } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      unsub = onSnapshot(query(collection(db, 'loanProducts')), async (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (products.length === 0 && user && ADMIN_EMAILS.includes(user?.email || '')) {
          // Auto-seed for admin if empty
          const defaults = [
            { icon: 'User', title: 'Personal', color: 'bg-blue-50 text-blue-600' },
            { icon: 'Home', title: 'House', color: 'bg-emerald-50 text-emerald-600' },
            { icon: 'Briefcase', title: 'Business', color: 'bg-amber-50 text-amber-600' },
            { icon: 'Clock', title: 'Emergency', color: 'bg-rose-50 text-rose-600' },
          ];
          for (const d of defaults) {
            await addDoc(collection(db, 'loanProducts'), d);
          }
        } else {
          setLoanProducts(products);
        }
      });
    };

    fetchProducts();
    return () => unsub?.();
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const { auth, db } = await import('./lib/firebase');
      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');
      
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          const docRef = doc(db, 'users', u.uid);
          const { getDoc, setDoc } = await import('firebase/firestore');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.isBlocked) {
              await auth.signOut();
              alert('Your account is blocked. Please contact support.');
              return;
            }
            setProfileData(data);
          } else {
            // Create user profile on first login
            const newProfile = {
              fullName: u.displayName || 'Client',
              email: u.email,
              photoURL: u.photoURL,
              phone: '',
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, newProfile);
            setProfileData(newProfile);
          }
        } else {
          setProfileData(null);
        }
      });
    };
    initAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const { auth } = await import('./lib/firebase');
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="font-sans antialiased text-brand-dark bg-brand-light min-h-screen scroll-smooth overflow-x-hidden selection:bg-brand-gold/30 selection:text-brand-blue">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        activeView={activeView} 
        setActiveView={setActiveView} 
        user={user} 
        appConfig={appConfig}
        setAppConfig={setAppConfig}
        setShowingSupport={setShowingSupport}
      />

      {/* Notification Center Popover */}
      <AnimatePresence>
        {showNotifCenter && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifCenter(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed top-20 right-4 md:right-10 w-[90vw] md:w-96 z-50 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-brand-blue text-white">
                <h3 className="font-bold flex items-center gap-2"><Bell size={18} /> Notifications</h3>
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg uppercase font-black">{notifications.length} New</span>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-gray-300">
                    <p className="text-sm font-bold">Inbox is empty</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={async () => {
                        if (n.read) return;
                        const { doc, updateDoc } = await import('firebase/firestore');
                        const { db } = await import('./lib/firebase');
                        if (n.id) await updateDoc(doc(db, 'notifications', n.id), { read: true });
                      }}
                      className={`p-5 border-b border-gray-50 hover:bg-gray-50 transition-all cursor-pointer relative group ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                       {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-gold rounded-full" />}
                       <div className="flex justify-between items-start mb-1 pl-2">
                          <p className={`font-bold text-sm ${!n.read ? 'text-brand-blue' : 'text-gray-500'}`}>{n.title}</p>
                          <span className="text-[8px] text-gray-400 font-bold uppercase">{new Date(n.timestamp).toLocaleDateString()}</span>
                       </div>
                       <p className="text-xs text-gray-500 leading-relaxed pl-2">{n.message}</p>
                       {!n.read && <span className="absolute right-4 bottom-2 text-[8px] font-black uppercase text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">Click to read</span>}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className={activeView !== 'home' ? 'pt-24 pb-32' : ''}>
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero lang={lang} users={publicUsers} appConfig={appConfig} />
              <Services 
                lang={lang} 
                loanProducts={loanProducts} 
                onSelect={(p) => {
                  setSelectedProduct(p);
                  setActiveView('apply');
                  window.scrollTo(0, 0);
                }} 
              />
              <Process lang={lang} />
              <LoanCalculator lang={lang} />
              <ContactForm lang={lang} user={user} />
            </motion.div>
          )}

          {activeView === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 md:px-6"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-brand-blue">Available Loans</h1>
                <p className="text-gray-500">Pick the best plan for your needs</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {loanProducts.map((item: LoanProduct, i) => {
                  const IconMap: Record<string, any> = { User, Home, Briefcase, GraduationCap, Wallet, HandCoins, Building2, Clock };
                  const IconComponent = IconMap[item.icon] || Briefcase;

                  return (
                    <motion.button 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 text-center flex flex-col items-center gap-4 border border-slate-100 dark:border-slate-800 hover:border-brand-gold transition-all duration-300 shadow-lg shadow-slate-200/40 dark:shadow-none" 
                      onClick={() => {
                        setSelectedProduct(item);
                        setActiveView('apply');
                      }}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${item.color} group-hover:rotate-12 transition-transform duration-500 text-3xl shadow-lg ring-4 ring-white/50`}>
                        {item.iconType === 'emoji' ? item.icon : (item.iconType === 'url' ? <img src={item.icon} className="w-8 h-8 object-contain" /> : <IconComponent size={28} />)}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-brand-blue dark:text-white group-hover:text-brand-gold transition-colors">{item.title}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{lang === 'sw' ? 'Omba Sasa' : 'Apply Now'}</p>
                      </div>
                    </motion.button>
                  );
                })}
                {user && ADMIN_EMAILS.includes(user?.email || '') && (
                  <button className="app-card border-dashed border-2 border-gray-200 flex flex-col items-center gap-4 justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue" onClick={() => setActiveView('history')}>
                    <History size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">Manage Items</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeView === 'apply' && (
            <motion.div
              key="apply"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto px-4"
            >
              <button onClick={() => setActiveView('services')} className="mb-8 flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-brand-blue transition-colors">
                <ChevronRight size={16} className="rotate-180" /> Back to Loans
              </button>

              <div className="app-card space-y-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl ${selectedProduct?.color}`}>
                    {selectedProduct?.iconType === 'emoji' ? selectedProduct.icon : (selectedProduct?.iconType === 'url' ? <img src={selectedProduct.icon} className="w-10 h-10" /> : <Briefcase size={32} />)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-brand-blue">{selectedProduct?.title} Loan</h1>
                    <p className="text-gray-400 text-sm mt-1">{selectedProduct?.description}</p>
                  </div>
                </div>

                {/* Loan Calculator */}
                <div className="bg-brand-blue/5 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-brand-blue/10 slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                      <History size={18} />
                    </div>
                    <h4 className="font-bold text-sm text-brand-blue dark:text-white">{lang === 'sw' ? 'Kikokotoo cha Mkopo' : 'Loan Calculator'}</h4>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-3">{lang === 'sw' ? 'Weka Kiasi cha Mkopo' : 'Enter Loan Amount'}</p>
                      <input 
                        type="number" 
                        placeholder={lang === 'sw' ? 'Mfano: 1,000,000' : 'e.g. 1,000,000'}
                        value={calcAmount || ''}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl py-4 px-6 font-display font-black text-xl text-brand-blue dark:text-brand-gold focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">{lang === 'sw' ? 'Marejesho / Mwezi' : 'Monthly Payment'}</p>
                        <p className="font-display font-bold text-brand-blue dark:text-white">
                          {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(
                            calcAmount ? (calcAmount * 1.15 / 12) : 0
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">{lang === 'sw' ? 'Jumla (Riba 15%)' : 'Total (15% Interest)'}</p>
                        <p className="font-display font-bold text-emerald-600">
                          {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(
                            calcAmount ? (calcAmount * 1.15) : 0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    alert('Please sign in first');
                    setActiveView('profile');
                    return;
                  }
                  
                  const formData = new FormData(e.currentTarget);
                  const data: any = {};
                  
                  // Helper function to convert File to Base64
                  const fileToBase64 = (file: File): Promise<string> => {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = error => reject(error);
                    });
                  };

                  for (const f of (selectedProduct?.formFields || [])) {
                    if (f.type === 'file' || f.type === 'image') {
                      const file = formData.get(f.label) as File;
                      if (file && file.size > 0) {
                        data[f.label] = await fileToBase64(file);
                      }
                    } else if (f.type === 'guarantors') {
                      data[f.label] = {
                        name1: formData.get(`${f.label}_name1`),
                        phone1: formData.get(`${f.label}_phone1`),
                        residence1: formData.get(`${f.label}_res1`),
                        name2: formData.get(`${f.label}_name2`),
                        phone2: formData.get(`${f.label}_phone2`),
                        residence2: formData.get(`${f.label}_res2`),
                      };
                    } else {
                      data[f.label] = formData.get(f.label);
                    }
                  }

                  try {
                    const { collection, addDoc } = await import('firebase/firestore');
                    const { db } = await import('./lib/firebase');
                    await addDoc(collection(db, 'applications'), {
                      userId: user.uid,
                      fullName: user.displayName || profileData?.fullName,
                      phone: profileData?.phone || '',
                      loanType: selectedProduct?.title,
                      timestamp: new Date().toISOString(),
                      status: 'Pending',
                      amount: data['Amount'] || data['Loan Amount'] || 0,
                      customData: data
                    });
                    alert('Application submitted successfully!');
                    setActiveView('history');
                  } catch (err) {
                    console.error(err);
                    alert('Error submitting application');
                  }
                }}>
                  <div className="grid grid-cols-1 gap-6">
                    {(selectedProduct?.formFields || []).map((field, i) => (
                      <div key={i} className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">{field.label} {field.required && <span className="text-rose-500">*</span>}</label>
                        
                        {field.type === 'textarea' ? (
                          <textarea 
                            name={field.label}
                            required={field.required}
                            rows={3}
                            placeholder={`Describe your ${field.label.toLowerCase()}`}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 focus:ring-brand-blue/10 outline-none"
                          />
                        ) : field.type === 'file' || field.type === 'image' ? (
                          <div className="relative">
                            <input 
                              type="file"
                              name={field.label}
                              required={field.required}
                              accept={field.type === 'image' ? 'image/*' : '*/*'}
                              className="w-full bg-gray-50 border-none rounded-2xl py-8 px-6 font-bold text-sm text-center border-2 border-dashed border-gray-200"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 gap-2">
                               <Paperclip size={18} />
                               <span className="text-xs">Click to upload documets</span>
                            </div>
                          </div>
                        ) : field.type === 'guarantors' ? (
                          <div className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                             <div className="space-y-3">
                               <p className="text-[10px] font-bold text-brand-blue uppercase">Guarantor 1</p>
                               <input name={`${field.label}_name1`} placeholder="Full Name" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                               <input name={`${field.label}_phone1`} placeholder="Phone Number" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                               <input name={`${field.label}_res1`} placeholder="Place of Residence" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                             </div>
                             <hr className="border-gray-200/50" />
                             <div className="space-y-3">
                               <p className="text-[10px] font-bold text-brand-blue uppercase">Guarantor 2</p>
                               <input name={`${field.label}_name2`} placeholder="Full Name" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                               <input name={`${field.label}_phone2`} placeholder="Phone Number" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                               <input name={`${field.label}_res2`} placeholder="Place of Residence" className="w-full bg-white rounded-xl py-3 px-4 text-sm font-bold" required={field.required} />
                             </div>
                          </div>
                        ) : field.type === 'location' ? (
                           <div className="grid grid-cols-2 gap-4">
                             <input name={field.label} placeholder="Street/Area" className="col-span-2 w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold" required={field.required} />
                             <input name={`${field.label}_city`} placeholder="City" className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold" required={field.required} />
                             <input name={`${field.label}_house`} placeholder="House No." className="w-full bg-gray-50 rounded-2xl py-4 px-6 text-sm font-bold" required={field.required} />
                           </div>
                        ) : (
                          <input 
                            name={field.label}
                            type={field.type} 
                            required={field.required}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-sm focus:ring-2 focus:ring-brand-blue/10 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="w-full btn-primary py-5 rounded-2xl text-base shadow-xl shadow-brand-blue/20">
                    Submit Application
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto px-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-2xl font-display font-bold text-brand-blue">{ADMIN_EMAILS.includes(user?.email || '') ? 'Admin Dashboard' : 'Application History'}</h1>
                  <p className="text-sm text-gray-500">{ADMIN_EMAILS.includes(user?.email || '') ? 'Monitor all system activities' : 'Real-time update of your requests'}</p>
                </div>
                {user && ADMIN_EMAILS.includes(user?.email || '') && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search users or loans..." 
                        className="pl-12 pr-4 py-3 bg-gray-100 rounded-2xl text-xs font-bold w-full sm:w-64 focus:ring-2 focus:ring-brand-blue/10 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
                      {(['loans', 'users', 'products', 'notifs', 'settings'] as const).map((tab) => (
                        <button 
                          key={tab}
                          onClick={() => {
                            setAdminTab(tab);
                            setSearchTerm('');
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${adminTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user && ADMIN_EMAILS.includes(user?.email || '') && adminTab !== 'settings' && adminTab !== 'notifs' && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'Total Apps', value: stats.total, color: 'text-brand-blue', bg: 'bg-blue-50', icon: <History size={16} /> },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertCircle size={16} /> },
                    { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={16} /> },
                    { label: 'Rejected', value: stats.rejected, color: 'text-rose-600', bg: 'bg-rose-50', icon: <XCircle size={16} /> },
                    { label: 'System Users', value: stats.totalUsers, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Users size={16} /> },
                  ].map((s, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02 }}
                      className={`${s.bg} p-6 rounded-[2rem] border border-white/50 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden`}
                    >
                      <div className="absolute -right-2 -top-2 opacity-5 scale-150">{s.icon}</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500/60 mb-1">{s.label}</p>
                      <div className="flex items-end justify-between">
                        <p className={`text-3xl font-display font-black ${s.color}`}>{s.value}</p>
                        <div className={`p-2 rounded-full bg-white/50 ${s.color}`}>{s.icon}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                {ADMIN_EMAILS.includes(user?.email || '') ? (
                  <>
                        {adminTab === 'notifs' && (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 slide-up">
                             <div className="md:col-span-12 lg:col-span-5 space-y-6">
                                <div className="app-card space-y-6">
                                   <h3 className="font-bold text-brand-blue flex items-center gap-2"><Bell className="text-brand-gold" size={18} /> Send Notification</h3>
                                   <div className="space-y-4">
                                      <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Target Audience</label>
                                        <select 
                                          className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm"
                                          value={broadcastMessage.userId}
                                          onChange={(e) => setBroadcastMessage({ ...broadcastMessage, userId: e.target.value })}
                                        >
                                          <option value="all">Broadcast to All Users</option>
                                          {allUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.fullName}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <input 
                                          placeholder="Notice Title" 
                                          className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm"
                                          value={broadcastMessage.title}
                                          onChange={(e) => setBroadcastMessage({ ...broadcastMessage, title: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <textarea 
                                          placeholder="Type your message here..." 
                                          rows={4}
                                          className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm"
                                          value={broadcastMessage.message}
                                          onChange={(e) => setBroadcastMessage({ ...broadcastMessage, message: e.target.value })}
                                        />
                                      </div>
                                      <button 
                                        onClick={async () => {
                                          if (!broadcastMessage.title || !broadcastMessage.message) return alert('Fill all fields');
                                          const { collection, addDoc } = await import('firebase/firestore');
                                          const { db } = await import('./lib/firebase');
                                          await addDoc(collection(db, 'notifications'), {
                                            ...broadcastMessage,
                                            timestamp: new Date().toISOString(),
                                            read: false,
                                            type: broadcastMessage.userId === 'all' ? 'broadcast' : 'status'
                                          });
                                          setBroadcastMessage({ title: '', message: '', userId: 'all' });
                                          alert('Notification sent!');
                                        }}
                                        className="w-full btn-primary py-4 rounded-xl shadow-xl shadow-brand-blue/20"
                                      >
                                        Send Message
                                      </button>
                                   </div>
                                </div>
                             </div>
                             <div className="md:col-span-12 lg:col-span-7">
                                <div className="space-y-4">
                                   <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Sent History</label>
                                   <div className="space-y-3">
                                      {notifications.filter(n => n.type === 'broadcast').slice(0, 5).map(n => (
                                        <div key={n.id} className="app-card flex justify-between items-center group">
                                           <div>
                                              <p className="font-bold text-brand-blue text-sm">{n.title}</p>
                                              <p className="text-xs text-gray-400 line-clamp-1">{n.message}</p>
                                           </div>
                                           <button 
                                             onClick={async () => {
                                                const { doc, deleteDoc } = await import('firebase/firestore');
                                                const { db } = await import('./lib/firebase');
                                                if(confirm('Delete this broadcast?')) await deleteDoc(doc(db, 'notifications', n.id!));
                                             }}
                                             className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 transition-all"
                                           ><X size={16} /></button>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                        )}
                        {adminTab === 'settings' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-up">
                            <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                              <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><Settings size={18} /> Basic Config</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">App Name</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.name}
                                    onChange={(e) => setAppConfig({ ...appConfig, name: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Logo URL</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.logoUrl}
                                    onChange={(e) => setAppConfig({ ...appConfig, logoUrl: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Default Theme Mode</label>
                                  <div className="flex gap-2">
                                    {(['light', 'dark', 'system'] as const).map(m => (
                                      <button 
                                        key={m}
                                        onClick={() => setAppConfig({ ...appConfig, themeMode: m })}
                                        className={`flex-1 py-3 rounded-xl font-bold text-xs capitalize transition-all ${appConfig.themeMode === m ? 'bg-brand-blue text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}
                                      >
                                        {m}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6 text-brand-blue dark:text-white">
                              <h3 className="font-bold flex items-center gap-2"><PenTool size={18} /> Visual Branding</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Primary Color</label>
                                    <div className="flex gap-2 items-center">
                                      <input type="color" value={appConfig.primaryColor} onChange={(e) => setAppConfig({ ...appConfig, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                                      <input value={appConfig.primaryColor} onChange={(e) => setAppConfig({ ...appConfig, primaryColor: e.target.value })} className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-xs font-mono dark:text-white" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Accent Color</label>
                                    <div className="flex gap-2 items-center">
                                      <input type="color" value={appConfig.secondaryColor} onChange={(e) => setAppConfig({ ...appConfig, secondaryColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0" />
                                      <input value={appConfig.secondaryColor} onChange={(e) => setAppConfig({ ...appConfig, secondaryColor: e.target.value })} className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-xs font-mono dark:text-white" />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Font Family</label>
                                  <select 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.fontFamily}
                                    onChange={(e) => setAppConfig({ ...appConfig, fontFamily: e.target.value })}
                                  >
                                    <option value="Inter">Inter (Modern)</option>
                                    <option value="Plus Jakarta Sans">Plus Jakarta (Elegant)</option>
                                    <option value="Space Grotesk">Space Grotesk (Tech)</option>
                                    <option value="Cormorant Garamond">Cormorant (Luxury)</option>
                                    <option value="system-ui">System Default</option>
                                  </select>
                                </div>
                                <button 
                                  onClick={async () => {
                                    try {
                                      const { doc, setDoc } = await import('firebase/firestore');
                                      const { db } = await import('./lib/firebase');
                                      await setDoc(doc(db, 'appConfig', 'main'), appConfig, { merge: true });
                                      alert(lang === 'sw' ? 'Mipangilio imehifadhiwa kikamilifu!' : 'Settings saved successfully!');
                                    } catch (error: any) {
                                      handleFirestoreError(error, OperationType.WRITE, 'appConfig/main');
                                      alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                                    }
                                  }}
                                  className="w-full btn-primary py-4 rounded-xl"
                                >
                                  Save Branding Settings
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                              <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><Phone size={18} /> Support Contacts</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Support Phone Number</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.helpPhone}
                                    onChange={(e) => setAppConfig({ ...appConfig, helpPhone: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Support Email</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.helpEmail}
                                    onChange={(e) => setAppConfig({ ...appConfig, helpEmail: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">WhatsApp Link/Number</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.helpWhatsapp}
                                    onChange={(e) => setAppConfig({ ...appConfig, helpWhatsapp: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    {adminTab === 'loans' && (
                      <div className="space-y-4">
                        {filteredLoans.map((loan) => (
                          <div key={loan.id} className="app-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                                loan.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                <Building2 size={24} />
                              </div>
                              <div>
                                <h4 className="font-bold text-brand-blue flex items-center gap-2">
                                  {loan.fullName} <span className="text-[10px] bg-gray-100 px-2 rounded text-gray-500">{loan.loanType}</span>
                                </h4>
                                <p className="text-xs text-gray-400">{loan.phone} • {new Date(loan.timestamp).toLocaleString()}</p>
                                <div className="mt-2 grid grid-cols-1 gap-y-2">
                                  {Object.entries(loan.customData || {}).map(([k, v]: [any, any]) => (
                                    <div key={k} className="text-[10px] text-gray-500 border-l-2 border-gray-100 pl-2">
                                      <span className="font-bold capitalize text-brand-blue block mb-1">{k}:</span>
                                      {typeof v === 'object' ? (
                                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg">
                                          {Object.entries(v).map(([subK, subV]: [any, any]) => (
                                            <p key={subK}><span className="capitalize opacity-60">{subK}:</span> {subV}</p>
                                          ))}
                                        </div>
                                      ) : (typeof v === 'string' && v.startsWith('data:image')) ? (
                                        <img src={v} className="w-full max-w-[200px] h-auto rounded-lg border border-gray-100 mt-1" alt={k} />
                                      ) : (typeof v === 'string' && v.startsWith('data:')) ? (
                                        <a href={v} download={k} className="text-brand-blue underline font-bold">Download Attachment</a>
                                      ) : (
                                        <p>{v}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                                  <button 
                                    onClick={async () => {
                                      const { doc, updateDoc, collection, addDoc } = await import('firebase/firestore');
                                      const { db } = await import('./lib/firebase');
                                      await updateDoc(doc(db, 'applications', loan.id), { status: 'Approved' });
                                      await addDoc(collection(db, 'notifications'), {
                                        userId: loan.userId,
                                        title: 'Loan Approved! 🎉',
                                        message: `Your ${loan.loanType} loan application has been approved. Please check your dashboard for details.`,
                                        timestamp: new Date().toISOString(),
                                        read: false,
                                        type: 'status'
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const { doc, updateDoc, collection, addDoc } = await import('firebase/firestore');
                                      const { db } = await import('./lib/firebase');
                                      await updateDoc(doc(db, 'applications', loan.id), { status: 'Rejected' });
                                      await addDoc(collection(db, 'notifications'), {
                                        userId: loan.userId,
                                        title: 'Application Update',
                                        message: `Unfortunately, your ${loan.loanType} loan application was rejected at this time.`,
                                        timestamp: new Date().toISOString(),
                                        read: false,
                                        type: 'status'
                                      });
                                    }}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors"
                                  >
                                    Reject
                                  </button>
                              <button 
                                onClick={async () => {
                                  const { doc, deleteDoc } = await import('firebase/firestore');
                                  const { db } = await import('./lib/firebase');
                                  if(confirm('Delete application?')) await deleteDoc(doc(db, 'applications', loan.id));
                                }}
                                className="p-1.5 text-gray-300 hover:text-rose-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {adminTab === 'users' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map((u) => (
                          <motion.div 
                            key={u.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="app-card group relative overflow-hidden flex flex-col justify-between"
                          >
                            <div className="flex items-start gap-4 mb-6 relative z-10">
                              <div className="relative">
                                <img src={u.photoURL || 'https://i.pravatar.cc/150?u='+u.id} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-brand-blue/5" referrerPolicy="no-referrer" />
                                {u.email?.includes('gmail.com') && <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm"><img src="https://www.google.com/favicon.ico" className="w-3 h-3" /></div>}
                                {u.isBlocked && <div className="absolute -top-1 -left-1 bg-rose-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-lg shadow-lg">BLOCKED</div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-brand-blue truncate group-hover:text-brand-gold transition-colors">{u.fullName || 'Anonymous User'}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                   <Mail size={10} className="shrink-0" /> <span className="truncate">{u.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mt-1">
                                   <Smartphone size={10} className="shrink-0" /> <span>{u.phone || 'No phone'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 relative z-10">
                               <button 
                                 onClick={() => {
                                   setAdminTab('notifs');
                                   setBroadcastMessage({ ...broadcastMessage, userId: u.id });
                                 }}
                                 className="py-2.5 bg-brand-blue/5 text-brand-blue text-[10px] font-black uppercase rounded-xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <Bell size={12} /> Message
                               </button>
                               <button 
                                 onClick={async () => {
                                   const { doc, updateDoc } = await import('firebase/firestore');
                                   const { db } = await import('./lib/firebase');
                                   await updateDoc(doc(db, 'users', u.id), { isBlocked: !u.isBlocked });
                                 }}
                                 className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                               >
                                 {u.isBlocked ? 'Unblock' : 'Block'}
                               </button>
                            </div>
                            
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                    {adminTab === 'products' && (
                      <div className="space-y-8">
                         {editingProduct ? (
                           <div className="app-card space-y-6 slide-up">
                             <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-brand-blue">Edit Loan Form Builder</h2>
                                <button onClick={() => setEditingProduct(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={16} /></button>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-4">
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Loan Title</label>
                                 <input 
                                  className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-sm" 
                                  value={editingProduct.title}
                                  onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                                 />
                               </div>
                               <div className="space-y-4">
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Icon (Emoji/URL/Lucide Name)</label>
                                 <input 
                                  className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-sm" 
                                  value={editingProduct.icon}
                                  onChange={(e) => setEditingProduct({...editingProduct, icon: e.target.value, iconType: e.target.value.includes('http') ? 'url' : (e.target.value.length > 2 ? 'lucide' : 'emoji')})}
                                 />
                               </div>
                             </div>

                             <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Application Form Fields</label>
                                  <button 
                                    onClick={() => setEditingProduct({
                                      ...editingProduct, 
                                      formFields: [...(editingProduct.formFields || []), { label: 'Field Name', type: 'text', required: true }]
                                    })}
                                    className="text-[10px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                                  >+ Add New Field</button>
                               </div>
                               
                               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                  {(editingProduct.formFields || []).map((field, idx) => (
                                    <div key={idx} className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group">
                                      <div className="flex-1 min-w-[150px]">
                                        <input 
                                          className="bg-white px-3 py-2 rounded-lg text-xs font-bold w-full border border-gray-100" 
                                          value={field.label}
                                          onChange={(e) => {
                                            const newFields = [...editingProduct.formFields];
                                            newFields[idx].label = e.target.value;
                                            setEditingProduct({...editingProduct, formFields: newFields});
                                          }}
                                        />
                                      </div>
                                      <select 
                                        className="bg-white px-3 py-2 rounded-lg text-xs font-bold border border-gray-100"
                                        value={field.type}
                                        onChange={(e) => {
                                          const newFields = [...editingProduct.formFields];
                                          newFields[idx].type = e.target.value as any;
                                          setEditingProduct({...editingProduct, formFields: newFields});
                                        }}
                                      >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="tel">Phone</option>
                                        <option value="textarea">Long Text</option>
                                        <option value="file">File Upload</option>
                                        <option value="image">Image Only</option>
                                        <option value="location">Location Info</option>
                                        <option value="guarantors">Guarantors (Group)</option>
                                      </select>
                                      <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 select-none">
                                        <input 
                                          type="checkbox" 
                                          checked={field.required}
                                          onChange={(e) => {
                                            const newFields = [...editingProduct.formFields];
                                            newFields[idx].required = e.target.checked;
                                            setEditingProduct({...editingProduct, formFields: newFields});
                                          }}
                                        /> Required
                                      </label>
                                      <button 
                                        onClick={() => {
                                          const newFields = editingProduct.formFields.filter((_, i) => i !== idx);
                                          setEditingProduct({...editingProduct, formFields: newFields});
                                        }}
                                        className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-white rounded-lg transition-colors"
                                      ><X size={14} /></button>
                                    </div>
                                  ))}
                               </div>
                             </div>

                             <div className="flex gap-4">
                                <button 
                                  onClick={() => setEditingProduct(null)}
                                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl text-sm font-bold"
                                >Cancel</button>
                                <button 
                                  onClick={async () => {
                                    const { doc, updateDoc, collection, addDoc } = await import('firebase/firestore');
                                    const { db } = await import('./lib/firebase');
                                    if (editingProduct.id) {
                                      await updateDoc(doc(db, 'loanProducts', editingProduct.id), { ...editingProduct });
                                    } else {
                                      await addDoc(collection(db, 'loanProducts'), { ...editingProduct });
                                    }
                                    setEditingProduct(null);
                                    alert('Loan product updated successfully!');
                                  }}
                                  className="flex-[2] btn-primary py-4 rounded-xl text-sm font-bold shadow-xl shadow-brand-blue/20"
                                >Update Product</button>
                             </div>
                           </div>
                         ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {loanProducts.map((p: LoanProduct) => (
                               <div key={p.id} className="app-card border-none shadow-sm ring-1 ring-gray-100 group hover:ring-brand-blue/30 transition-all">
                                 <div className="flex items-center justify-between mb-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${p.color}`}>
                                      {p.iconType === 'emoji' ? p.icon : (p.iconType === 'url' ? <img src={p.icon} className="w-6 h-6 object-contain" /> : <Briefcase size={20} />)}
                                   </div>
                                   <div className="flex gap-2">
                                     <button 
                                      onClick={() => setEditingProduct(p)}
                                      className="p-2 text-gray-300 hover:text-brand-blue transition-colors"
                                      title="Edit Form"
                                     ><PenTool size={18} /></button>
                                     <button 
                                      onClick={async () => {
                                        const { doc, deleteDoc } = await import('firebase/firestore');
                                        const { db } = await import('./lib/firebase');
                                        if(confirm(`Delete ${p.title} loan?`)) await deleteDoc(doc(db, 'loanProducts', p.id!));
                                      }}
                                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                                      title="Delete"
                                     ><X size={18} /></button>
                                   </div>
                                 </div>
                                 <h4 className="font-bold text-brand-blue mb-1">{p.title}</h4>
                                 <div className="bg-gray-50 rounded-xl p-3">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Active Fields</p>
                                   <div className="flex flex-wrap gap-2">
                                     {p.formFields?.map((f, i) => (
                                       <span key={i} className="text-[9px] bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600 font-bold">{f.label}</span>
                                     ))}
                                   </div>
                                 </div>
                               </div>
                             ))}
                             
                             <button 
                              onClick={() => setEditingProduct({
                                title: 'New Loan',
                                description: 'Describe the loan purpose',
                                icon: '💰',
                                iconType: 'emoji',
                                color: 'bg-indigo-50 text-indigo-600',
                                formFields: [
                                  { label: 'Full Name', type: 'text', required: true },
                                  { label: 'Amount', type: 'number', required: true }
                                ]
                              })}
                              className="app-card border-dashed border-2 border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 py-12 hover:border-brand-blue hover:text-brand-blue group transition-all"
                             >
                               <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-blue/5">
                                 <Plus size={24} />
                               </div>
                               <span className="font-black text-[10px] uppercase tracking-[0.2em]">Add New Product</span>
                             </button>
                           </div>
                         )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {applications.length > 0 ? applications.map((loan, i) => (
                      <motion.div 
                        key={loan.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="app-card group hover:shadow-xl transition-all duration-500 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                              loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                              loan.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {loan.status === 'Approved' ? <CheckCircle2 size={24} /> : (loan.status === 'Rejected' ? <XCircle size={24} /> : <Clock size={24} />)}
                            </div>
                            <div>
                              <h4 className="font-bold text-brand-blue group-hover:text-brand-gold transition-colors">{loan.loanType} Project</h4>
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{new Date(loan.timestamp).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-black text-brand-blue text-lg">
                              {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(loan.amount)}
                            </p>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                               loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                               loan.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                            }`}>{loan.status}</span>
                          </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="flex items-center gap-1 pt-6 border-t border-gray-50 dark:border-slate-800">
                          {[
                            { label: lang === 'sw' ? 'Mapokezi' : 'Submitted', active: true },
                            { label: lang === 'sw' ? 'Uhakiki' : 'Review', active: loan.status !== 'Pending' },
                            { label: lang === 'sw' ? 'Idhini' : 'Approval', active: loan.status === 'Approved' || loan.status === 'Rejected' },
                            { label: lang === 'sw' ? 'Gawio' : 'Payout', active: loan.status === 'Approved' }
                          ].map((step, idx, arr) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/step relative">
                              <div className={`w-3 h-3 rounded-full border-4 ${
                                step.active 
                                ? (loan.status === 'Rejected' && idx === 2 ? 'bg-rose-500 border-rose-100' : 'bg-emerald-500 border-emerald-100') 
                                : 'bg-gray-200 border-white'
                              } relative z-10 transition-all duration-700`} />
                              
                              <span className={`text-[7px] font-black uppercase tracking-tight text-center ${
                                step.active ? 'text-gray-700 dark:text-slate-200' : 'text-gray-300'
                              }`}>{step.label}</span>

                              {idx < arr.length - 1 && (
                                <div className={`absolute h-[2px] w-full top-1.5 left-1/2 -z-0 ${
                                  step.active && arr[idx+1].active 
                                  ? (loan.status === 'Rejected' && idx === 1 ? 'bg-rose-200' : 'bg-emerald-200') 
                                  : 'bg-gray-100'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <History className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-medium whitespace-pre-wrap">
                          {lang === 'sw' ? 'Huna maombi yoyote bado.\nAnza maombi yako leo!' : 'No applications found yet.\nStart your application today!'}
                        </p>
                        <button onClick={() => setActiveView('home')} className="mt-6 text-brand-blue font-bold underline">
                          {lang === 'sw' ? 'Omba Mkopo' : 'Apply Now'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
          
          {activeView === 'profile' && (
             <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto px-4"
            >
              {user ? (
                <div className="text-center mb-8">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src={user.photoURL || profileData?.photoURL || 'https://i.pravatar.cc/150?u=' + user.uid} alt="profile" className="w-full h-full rounded-full border-4 border-white shadow-xl object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-brand-blue">
                    {user.displayName || profileData?.fullName}
                    {user && ADMIN_EMAILS.includes(user.email || '') && <span className="ml-2 text-[10px] bg-brand-gold text-brand-blue px-2 py-0.5 rounded-full">ADMIN</span>}
                  </h2>
                  <p className="text-gray-400">{user.email || profileData?.phone}</p>

                  <div className="flex justify-center gap-4 mt-6">
                    <button 
                      onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                      className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 w-24 group hover:border-brand-gold transition-all"
                    >
                      <Globe className="text-brand-blue dark:text-brand-gold group-hover:scale-110 transition-transform" size={24} />
                      <span className="text-[10px] font-black uppercase tracking-tight text-brand-blue dark:text-slate-200">{lang.toUpperCase()}</span>
                    </button>
                    <button 
                      onClick={() => setAppConfig({ ...appConfig, themeMode: appConfig.themeMode === 'dark' ? 'light' : 'dark' })}
                      className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 w-24 group hover:border-brand-gold transition-all"
                    >
                      {appConfig.themeMode === 'dark' ? <Sun size={24} className="text-brand-gold group-hover:scale-110 transition-transform" /> : <Moon size={24} className="text-brand-blue group-hover:scale-110 transition-transform" />}
                      <span className="text-[10px] font-black uppercase tracking-tight text-brand-blue dark:text-slate-200">{appConfig.themeMode.toUpperCase()}</span>
                    </button>
                  </div>
                  
                  {user && ADMIN_EMAILS.includes(user.email || '') && (
                    <div className="mt-6 bg-brand-blue text-white p-4 rounded-2xl text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Admin Stats</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold">{applications.length}</p>
                            <p className="text-xs opacity-60">Total Apps</p>
                          </div>
                           <div>
                            <p className="text-2xl font-bold">12</p>
                            <p className="text-xs opacity-60">Waitlist</p>
                          </div>
                       </div>
                    </div>
                  )}

                  <button onClick={() => { 
                    import('./lib/firebase').then(({ auth }) => auth.signOut());
                    setUser(null);
                    setProfileData(null);
                  }} className="mt-6 text-xs font-bold text-rose-500 uppercase tracking-widest hover:underline">Sign Out</button>
                </div>
              ) : (
                <AuthView lang={lang} onSuccess={() => setActiveView('profile')} />
              )}

              <div className="space-y-3">
                {[
                  { icon: User, label: lang === 'sw' ? 'Taarifa za Binafsi' : 'Personal Information', action: () => {
                    setEditForm({ phone: profileData?.phone || '', fullName: user?.displayName || profileData?.fullName || '' });
                    setEditingProfile(true);
                  } },
                  { icon: ShieldCheck, label: lang === 'sw' ? 'Ulinzi na Uhakiki' : 'Security & Verification', action: () => setChangingPassword(true) },
                  { icon: Globe, label: lang === 'sw' ? 'Badili Lugha (SW/EN)' : 'Change Language (EN/SW)', action: () => setLang(lang === 'sw' ? 'en' : 'sw') },
                  { icon: appConfig.themeMode === 'dark' ? Sun : Moon, label: lang === 'sw' ? (appConfig.themeMode === 'dark' ? 'Hali ya Mchana' : 'Hali ya Usiku') : (appConfig.themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'), action: () => setAppConfig({ ...appConfig, themeMode: appConfig.themeMode === 'dark' ? 'light' : 'dark' }) },
                  { icon: Bell, label: lang === 'sw' ? 'Mipangilio ya Taarifa' : 'Notification Settings' },
                  { icon: Phone, label: lang === 'sw' ? 'Msaada na Huduma' : 'Help & Support', action: () => setShowingSupport(true) },
                ].map((item, i) => (
                  <button 
                    key={i} 
                    className="app-card w-full flex items-center justify-between py-4 group"
                    onClick={() => item.action && item.action()}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-colors">
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-brand-blue dark:text-slate-200 text-sm">{item.label}</span>
                    </div>
                    {item.action ? (
                      <div className="bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-lg text-[10px] font-black uppercase">Active</div>
                    ) : (
                      <ChevronRight size={18} className="text-gray-300" />
                    )}
                  </button>
                ))}
              </div>

              {/* Edit Profile Modal */}
              <AnimatePresence>
                {editingProfile && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                  >
                    <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-sm" onClick={() => setEditingProfile(false)} />
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-white/20"
                    >
                      <h3 className="text-xl font-display font-bold text-brand-blue dark:text-white mb-6">
                        {lang === 'sw' ? 'Hariri Taarifa' : 'Edit Information'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</label>
                          <input 
                            type="text" 
                            className="app-input w-full"
                            value={editForm.fullName}
                            onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}</label>
                          <input 
                            type="tel" 
                            className="app-input w-full"
                            placeholder="0..."
                            value={editForm.phone}
                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </div>
                        
                        <div className="pt-4 flex gap-3">
                          <button 
                            onClick={() => setEditingProfile(false)}
                            className="flex-1 py-3 rounded-xl border border-gray-100 dark:border-slate-800 font-bold text-xs text-gray-400"
                          >
                            {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                const { doc, setDoc } = await import('firebase/firestore');
                                const { db } = await import('./lib/firebase');
                                await setDoc(doc(db, 'users', user.uid), {
                                  phone: editForm.phone,
                                  fullName: editForm.fullName,
                                  updatedAt: new Date().toISOString()
                                }, { merge: true });
                                
                                setProfileData({ ...profileData, phone: editForm.phone, fullName: editForm.fullName });
                                setEditingProfile(false);
                                alert(lang === 'sw' ? 'Taarifa zimehifadhiwa!' : 'Information saved!');
                              } catch (error: any) {
                                handleFirestoreError(error, OperationType.WRITE, 'users/' + user?.uid);
                              }
                            }}
                            className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-xs shadow-lg shadow-brand-blue/20"
                          >
                            {lang === 'sw' ? 'Hifadhi' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {changingPassword && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                  >
                    <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-sm" onClick={() => setChangingPassword(false)} />
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-white/20"
                    >
                      <h3 className="text-xl font-display font-bold text-brand-blue dark:text-white mb-6">
                        {lang === 'sw' ? 'Badili Nywila' : 'Change Password'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{lang === 'sw' ? 'Nywila Mpya' : 'New Password'}</label>
                          <input 
                            type="password" 
                            className="app-input w-full"
                            value={passwordForm.new}
                            onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          />
                        </div>
                        
                        <p className="text-[10px] text-gray-400 italic">
                          {lang === 'sw' ? 'Kwa usalama, utahitajika kuingia tena baada ya kubadili nywila.' : 'For security, you may be logged out after updating your password.'}
                        </p>

                        <div className="pt-4 flex gap-3">
                          <button 
                            onClick={() => setChangingPassword(false)}
                            className="flex-1 py-3 rounded-xl border border-gray-100 dark:border-slate-800 font-bold text-xs text-gray-400"
                          >
                            {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                          </button>
                          <button 
                            onClick={async () => {
                              try {
                                const { updatePassword } = await import('firebase/auth');
                                const { auth } = await import('./lib/firebase');
                                if (auth.currentUser) {
                                  await updatePassword(auth.currentUser, passwordForm.new);
                                  setChangingPassword(false);
                                  alert(lang === 'sw' ? 'Nywila imebadilishwa kikamilifu!' : 'Password changed successfully!');
                                }
                              } catch (error: any) {
                                alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                              }
                            }}
                            className="flex-1 py-3 rounded-xl bg-brand-blue text-white font-bold text-xs shadow-lg shadow-brand-blue/20"
                          >
                            {lang === 'sw' ? 'Badili' : 'Update'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {showingSupport && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                  >
                    <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-sm" onClick={() => setShowingSupport(false)} />
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-white/20"
                    >
                      <h3 className="text-xl font-display font-bold text-brand-blue dark:text-white mb-6">
                        {lang === 'sw' ? 'Msaada na Huduma' : 'Help & Support'}
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center text-white">
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lang === 'sw' ? 'Tupigie' : 'Call Us'}</p>
                            <p className="font-bold text-brand-blue dark:text-white">{appConfig.helpPhone}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <MessageSquare size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">WhatsApp</p>
                            <p className="font-bold text-brand-blue dark:text-white">{appConfig.helpWhatsapp}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                          <div className="w-10 h-10 bg-brand-gold rounded-xl flex items-center justify-center text-brand-blue">
                             <Mail size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lang === 'sw' ? 'Barua Pepe' : 'Email'}</p>
                            <p className="font-bold text-brand-blue dark:text-white text-xs">{appConfig.helpEmail}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => setShowingSupport(false)}
                          className="w-full py-4 rounded-2xl bg-brand-blue text-white font-bold text-sm shadow-xl shadow-brand-blue/20 mt-4"
                        >
                          {lang === 'sw' ? 'Funga' : 'Close'}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto px-4"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold text-brand-blue dark:text-white">{lang === 'sw' ? 'Mipangilio' : 'Settings'}</h2>
                <p className="text-gray-500 text-sm">{lang === 'sw' ? 'Marekebisho ya programu' : 'App preferences'}</p>
              </div>

              <div className="space-y-6">
                <div className="app-card p-6 border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{lang === 'sw' ? 'Lugha ya Programu' : 'App Language'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'sw', label: 'Kiswahili' },
                      { id: 'en', label: 'English' }
                    ].map(l => (
                      <button 
                        key={l.id}
                        onClick={() => setLang(l.id as Language)}
                        className={`py-3 rounded-2xl font-bold text-sm transition-all ${lang === l.id ? 'bg-brand-blue text-white shadow-xl' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="app-card p-6 border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{lang === 'sw' ? 'Muonekano' : 'Appearance'}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'light', label: lang === 'sw' ? 'Mchana' : 'Light', icon: Sun },
                      { id: 'dark', label: lang === 'sw' ? 'Usiku' : 'Dark', icon: Moon },
                      { id: 'system', label: lang === 'sw' ? 'Mfumo' : 'System', icon: Laptop }
                    ].map(m => (
                      <button 
                        key={m.id}
                        onClick={() => setAppConfig({ ...appConfig, themeMode: m.id as any })}
                        className={`flex flex-col items-center gap-2 py-4 rounded-2xl font-bold text-xs transition-all ${appConfig.themeMode === m.id ? 'bg-brand-blue text-white shadow-xl' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}
                      >
                        <m.icon size={18} />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-amber-100 dark:border-slate-700">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-blue dark:text-brand-gold">{lang === 'sw' ? 'Faragha na Usalama' : 'Privacy & Security'}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{lang === 'sw' ? 'Taarifa zako ni salama kabisa nasi.' : 'Your data is strictly encrypted and safe.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer lang={lang} appConfig={appConfig} />

      {/* AI Assistant */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[60]">
        <AnimatePresence>
          {showAiAssistant && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white dark:bg-slate-900 w-[90vw] max-w-[380px] h-[500px] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col overflow-hidden mb-4"
            >
              <div className="bg-brand-blue p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles className="text-brand-gold" size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{appConfig.name} AI Assistant</h4>
                    <p className="text-[10px] opacity-60">Powered by Gemini</p>
                  </div>
                </div>
                <button onClick={() => setShowAiAssistant(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {aiHistory.length === 0 && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare className="text-brand-gold" size={30} />
                    </div>
                    <p className="text-gray-400 text-sm px-10">
                      {lang === 'sw' 
                        ? `Habari! Mimi ni msaidizi wako wa ${appConfig.name}. Una swali lolote kuhusu mikopo yetu?` 
                        : `Hello! I'm your ${appConfig.name} assistant. Do you have any questions about our loans?`}
                    </p>
                  </div>
                )}
                {aiHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm ${
                      msg.role === 'user' 
                      ? 'bg-brand-blue text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-tl-none pr-8 relative'
                    }`}>
                      {msg.parts[0].text}
                    </div>
                  </div>
                ))}
                {isAiLoading && <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-tl-none"><div className="flex gap-1"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" /></div></div>
                </div>}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as any).message;
                    askAi(input.value);
                    input.value = '';
                  }}
                  className="relative"
                >
                  <input 
                    name="message"
                    autoComplete="off"
                    placeholder={lang === 'sw' ? 'Andika swali lako...' : 'Type your question...'} 
                    className="w-full bg-white dark:bg-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue dark:text-white"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-blue text-white rounded-xl hover:scale-105 transition-all">
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          className="bg-brand-gold text-brand-blue p-4 rounded-full shadow-2xl relative group"
        >
          <Sparkles size={28} />
          {!showAiAssistant && (
             <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
               {lang === 'sw' ? 'Uliza AI Assistant' : 'Ask AI Assistant'}
             </div>
          )}
        </motion.button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[85vw] max-w-[400px]">
         <div className="bg-brand-blue/80 backdrop-blur-xl text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(10,54,101,0.3)] px-10 py-5 flex justify-between items-center border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
            
            <button onClick={() => setActiveView('home')} className={`flex flex-col items-center transition-all duration-300 relative z-10 ${activeView === 'home' ? 'scale-110 text-brand-gold' : 'opacity-50 hover:opacity-100'}`}>
               <Home size={22} strokeWidth={activeView === 'home' ? 2.5 : 2} />
               <span className="text-[7px] font-black mt-1.5 uppercase tracking-[0.2em]">{lang === 'sw' ? 'Mwanzo' : 'Home'}</span>
               {activeView === 'home' && <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_#D4AF37]" />}
            </button>
            
            <button onClick={() => setActiveView('history')} className={`flex flex-col items-center transition-all duration-300 relative z-10 ${activeView === 'history' || activeView === 'apply' ? 'scale-110 text-brand-gold' : 'opacity-50 hover:opacity-100'}`}>
               <LayoutDashboard size={22} strokeWidth={activeView === 'history' || activeView === 'apply' ? 2.5 : 2} />
               <span className="text-[7px] font-black mt-1.5 uppercase tracking-[0.2em]">{lang === 'sw' ? 'Mkopo' : 'Dash'}</span>
               {(activeView === 'history' || activeView === 'apply') && <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_#D4AF37]" />}
            </button>
            
            <button onClick={() => setActiveView('profile')} className={`flex flex-col items-center transition-all duration-300 relative z-10 ${activeView === 'profile' ? 'scale-110 text-brand-gold' : 'opacity-50 hover:opacity-100'}`}>
               <User size={22} strokeWidth={activeView === 'profile' ? 2.5 : 2} />
               <span className="text-[7px] font-black mt-1.5 uppercase tracking-[0.2em]">{lang === 'sw' ? 'Akaunti' : 'Me'}</span>
               {activeView === 'profile' && <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_#D4AF37]" />}
            </button>
         </div>
      </div>
    </div>
  );
}
