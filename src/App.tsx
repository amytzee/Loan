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
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AuthView } from './components/AuthView';

// --- Types ---
type Language = 'sw' | 'en';

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
const Navbar = ({ lang, setLang, activeView, setActiveView, user }: { lang: Language, setLang: (l: Language) => void, activeView: string, setActiveView: (v: string) => void, user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang].nav;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-5 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className={`glass rounded-3xl px-6 py-3 flex justify-between items-center transition-all duration-500 ${scrolled ? 'shadow-2xl shadow-brand-blue/5 border-gray-100' : 'bg-transparent border-transparent'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <span className={`text-xl font-display font-bold tracking-tight ${scrolled ? 'text-brand-blue' : 'text-white'}`}>
                Coshve<span className="text-brand-gold">.</span>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => setActiveView('home')} className={`font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${activeView === 'home' ? 'text-brand-gold' : scrolled ? 'text-brand-blue' : 'text-white'}`}>{t.home}</button>
              <button onClick={() => setActiveView('services')} className={`font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${activeView === 'services' ? 'text-brand-blue/60 hover:text-brand-blue' : scrolled ? 'text-brand-blue/60 hover:text-brand-blue' : 'text-white/60 hover:text-white'}`}>{t.services}</button>
              
              <div className="h-4 w-px bg-gray-200 mx-2" />

              <button 
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue hover:bg-brand-blue/5' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                <Globe size={14} /> {lang.toUpperCase()}
              </button>

              <a href="#apply" className="btn-primary py-3 px-6 shadow-brand-blue/30">
                {t.apply}
              </a>
            </div>

            <div className="flex lg:hidden items-center gap-4">
              <button className={`p-2 rounded-xl ${scrolled ? 'text-brand-blue bg-brand-blue/5' : 'text-white bg-white/10'}`}>
                <Bell size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-3 flex justify-between items-center">
          <button 
            onClick={() => setActiveView('home')}
            className={`nav-item flex-1 ${activeView === 'home' ? 'text-brand-blue' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl ${activeView === 'home' ? 'bg-brand-blue text-white' : ''}`}>
              <LayoutDashboard size={20} />
            </div>
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveView('services')}
            className={`nav-item flex-1 ${activeView === 'services' ? 'text-brand-blue' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl ${activeView === 'services' ? 'bg-brand-blue text-white' : ''}`}>
              <PieChart size={20} />
            </div>
            <span className="text-[10px] font-bold mt-1">Loans</span>
          </button>

          <button 
            onClick={() => setActiveView('history')}
            className={`nav-item flex-1 ${activeView === 'history' ? 'text-brand-blue' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl ${activeView === 'history' ? 'bg-brand-blue text-white' : ''}`}>
              <History size={20} />
            </div>
            <span className="text-[10px] font-bold mt-1">{user?.email === 'admin@gmail.com' ? 'Admin' : 'History'}</span>
          </button>

          <button 
            onClick={() => setActiveView('profile')}
            className={`nav-item flex-1 ${activeView === 'profile' ? 'text-brand-blue' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl ${activeView === 'profile' ? 'bg-brand-blue text-white' : ''}`}>
              <User size={20} />
            </div>
            <span className="text-[10px] font-bold mt-1">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

// --- Hero Component ---
const Hero = ({ lang }: { lang: Language }) => {
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
            {t.title} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">{t.smile}</span>
          </h1>
          
          <p className="text-base md:text-xl xl:text-2xl text-slate-300 mb-8 md:mb-10 max-w-lg leading-relaxed font-medium">
            {t.desc}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5">
            <a href="#apply" className="group bg-brand-gold text-brand-blue px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl shadow-brand-gold/20">
              {t.cta} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="flex -space-x-3 items-center justify-center sm:justify-start">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-brand-dark bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${lang}${i}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
              <div className="pl-6">
                <p className="text-white font-bold text-xs md:text-sm">{t.stats}</p>
                <div className="flex gap-0.5 text-brand-gold">
                  {[1, 2, 3, 4, 5].map((s) => <span key={s} className="text-[8px] md:text-[10px]">★</span>)}
                </div>
              </div>
            </div>
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
const Services = ({ lang }: { lang: Language }) => {
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-12 lg:col-span-8 bento-card flex flex-col md:flex-row gap-8 lg:gap-10 items-center overflow-hidden group"
          >
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                <Briefcase size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-blue">{t.business.title}</h3>
              <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                {t.business.desc}
              </p>
              <ul className="space-y-2 md:space-y-3">
                {t.business.features.map(item => (
                  <li key={item} className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                    <CheckCircle2 size={16} className="text-brand-gold" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full h-full min-h-[250px] md:min-h-[300px] rounded-3xl overflow-hidden shadow-inner">
               <img src="https://images.unsplash.com/photo-1621348161746-b2955ecaedc4?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-6 lg:col-span-4 bento-card bg-brand-blue text-white group"
          >
            <div className="space-y-6 md:space-y-8 h-full flex flex-col">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-brand-gold border border-white/5">
                <Home size={28} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">{t.rental.title}</h3>
              <p className="text-slate-300 leading-relaxed text-base md:text-lg">
                {t.rental.desc}
              </p>
              <div className="mt-auto">
                <a href="#apply" className="flex items-center gap-3 font-bold text-brand-gold hover:translate-x-2 transition-transform underline decoration-brand-gold/30">
                  {lang === 'sw' ? 'Omba Sasa' : 'Apply Now'} <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-6 lg:col-span-4 bento-card group"
          >
            <div className="space-y-4 md:space-y-6 h-full flex flex-col">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-blue/5 rounded-2xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-brand-blue">{t.education.title}</h3>
              <p className="text-slate-500 text-sm md:text-base">{t.education.desc}</p>
              <div className="mt-auto pt-4 md:pt-6">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.education.accent}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-12 lg:col-span-8 bento-card bg-brand-gold/10 border-brand-gold/20 flex flex-col md:flex-row gap-8 md:gap-10 items-center"
          >
             <div className="flex-1 space-y-4 md:space-y-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-blue shadow-lg shadow-brand-gold/20">
                  <UserCheck size={28} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-brand-blue">{t.personal.title}</h3>
                <p className="text-slate-600 text-base md:text-lg">
                  {t.personal.desc}
                </p>
                <div className="flex gap-3 md:gap-4">
                  <div className="bg-white px-3 md:px-4 py-2 rounded-xl shadow-sm border border-brand-gold/20">
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{lang === 'sw' ? 'Kuhusu' : 'About'}</p>
                    <p className="text-brand-blue font-bold text-xs md:text-sm">{t.personal.badge1}</p>
                  </div>
                   <div className="bg-white px-3 md:px-4 py-2 rounded-xl shadow-sm border border-brand-gold/20">
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase">{lang === 'sw' ? 'Ofa' : 'Offer'}</p>
                    <p className="text-brand-blue font-bold text-xs md:text-sm">{t.personal.badge2}</p>
                  </div>
                </div>
             </div>
             <div className="flex-1 w-full flex justify-center">
                <div className="relative w-40 h-40 md:w-48 md:h-48">
                   <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-dashed border-brand-gold/30 rounded-full" 
                   />
                   <div className="absolute inset-3 md:inset-4 bg-brand-blue rounded-full flex items-center justify-center text-white font-display font-bold text-base md:text-lg text-center p-4">
                      {lang === 'sw' ? 'Tunasitiri Tabasamu' : 'Smile for you'}
                   </div>
                </div>
             </div>
          </motion.div>
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
const Footer = ({ lang }: { lang: Language }) => {
  return (
    <footer className="bg-brand-dark text-white pt-24 pb-12 md:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
        <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-brand-blue/10 rounded-full blur-[100px] md:blur-[150px] -mr-48 md:-mr-96 -mt-24 md:-mt-32" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-20 mb-16 md:mb-24 border-b border-white/5 pb-16 md:pb-24 relative z-10">
          <div className="space-y-8 md:space-y-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Building2 className="text-brand-gold w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-2xl md:text-3xl font-display font-bold">Coshve<span className="text-brand-gold">.</span></span>
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
          <p>© {new Date().getFullYear()} Coshve Finance Ltd. Licensed Tier 2 Microfinance.</p>
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

export default function App() {
  const [lang, setLang] = useState<Language>('sw');
  const [activeView, setActiveView] = useState('home');
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loanProducts, setLoanProducts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [adminTab, setAdminTab] = useState<'loans' | 'users' | 'products'>('loans');

  useEffect(() => {
    const fetchProducts = async () => {
      const { collection, onSnapshot, query } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      return onSnapshot(query(collection(db, 'loanProducts')), (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (products.length === 0) {
          // Initialize with defaults if empty
          const defaults = [
            { icon: 'User', title: 'Personal', color: 'bg-blue-50 text-blue-600' },
            { icon: 'Home', title: 'House', color: 'bg-emerald-50 text-emerald-600' },
            { icon: 'Briefcase', title: 'Business', color: 'bg-amber-50 text-amber-600' },
            { icon: 'GraduationCap', title: 'Education', color: 'bg-purple-50 text-purple-600' },
          ];
          setLoanProducts(defaults);
        } else {
          setLoanProducts(products);
        }
      });
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (user?.email !== 'admin@gmail.com') return;
      const { collection, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      return onSnapshot(collection(db, 'users'), (snapshot) => {
        setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    };
    fetchAllUsers();
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
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          }
        } else {
          setProfileData(null);
        }
      });
    };
    initAuth();
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      const { collection, query, orderBy, onSnapshot, where } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      let q;
      if (user?.email === 'admin@gmail.com') {
        q = query(collection(db, 'applications'), orderBy('timestamp', 'desc'));
      } else if (user) {
        q = query(collection(db, 'applications'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
      } else {
        setApplications([]);
        return;
      }

      return onSnapshot(q, (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(apps);
      });
    };
    if (activeView === 'history') {
      fetchApps();
    }
  }, [activeView, user]);

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
      <Navbar lang={lang} setLang={setLang} activeView={activeView} setActiveView={setActiveView} user={user} />
      <main className={activeView !== 'home' ? 'pt-24 pb-32' : ''}>
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Hero lang={lang} />
              <Services lang={lang} />
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
                {loanProducts.map((item, i) => {
                  const IconMap: Record<string, any> = { User, Home, Briefcase, GraduationCap, Wallet, HandCoins, Building2, Clock };
                  const IconComponent = IconMap[item.icon] || Briefcase;

                  return (
                    <button key={i} className="app-card text-center flex flex-col items-center gap-4 hover:border-brand-blue group" onClick={() => setActiveView('home')}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent size={28} />
                      </div>
                      <span className="font-bold text-sm text-brand-blue">{item.title} Loan</span>
                    </button>
                  );
                })}
                {user?.email === 'admin@gmail.com' && (
                  <button className="app-card border-dashed border-2 border-gray-200 flex flex-col items-center gap-4 justify-center text-gray-400 hover:border-brand-blue hover:text-brand-blue" onClick={() => setActiveView('history')}>
                    <History size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">Manage Items</span>
                  </button>
                )}
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
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-brand-blue">{user?.email === 'admin@gmail.com' ? 'Admin Management' : 'Application History'}</h1>
                  <p className="text-sm text-gray-500">{user?.email === 'admin@gmail.com' ? 'Monitor all system activities' : 'Real-time update of your requests'}</p>
                </div>
                {user?.email === 'admin@gmail.com' && (
                  <div className="flex bg-gray-100 p-1 rounded-2xl">
                    {(['loans', 'users', 'products'] as const).map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setAdminTab(tab)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${adminTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {user?.email === 'admin@gmail.com' ? (
                  <>
                    {adminTab === 'loans' && (
                      <div className="space-y-4">
                        {applications.map((loan) => (
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
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={async () => {
                                  const { doc, updateDoc } = await import('firebase/firestore');
                                  const { db } = await import('./lib/firebase');
                                  await updateDoc(doc(db, 'applications', loan.id), { status: 'Approved' });
                                }}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={async () => {
                                  const { doc, updateDoc } = await import('firebase/firestore');
                                  const { db } = await import('./lib/firebase');
                                  await updateDoc(doc(db, 'applications', loan.id), { status: 'Rejected' });
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allUsers.map((u) => (
                          <div key={u.id} className="app-card flex items-center gap-4">
                            <img src={u.photoURL || 'https://i.pravatar.cc/150?u='+u.id} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="font-bold text-brand-blue text-sm">{u.fullName}</h4>
                              <p className="text-xs text-gray-400">{u.phone}</p>
                              <p className="text-[10px] text-gray-300 font-mono mt-1">{u.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {adminTab === 'products' && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {loanProducts.map((p) => (
                           <div key={p.id || p.title} className="app-card border-2 border-gray-50 flex flex-col items-center gap-2">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                                {p.title[0]}
                             </div>
                             <span className="font-bold text-xs">{p.title}</span>
                             {p.id && (
                               <button 
                                onClick={async () => {
                                  const { doc, deleteDoc } = await import('firebase/firestore');
                                  const { db } = await import('./lib/firebase');
                                  await deleteDoc(doc(db, 'loanProducts', p.id));
                                }}
                                className="text-[10px] text-rose-500 font-bold mt-2"
                               >Delete</button>
                             )}
                           </div>
                         ))}
                         <button 
                          onClick={async () => {
                            const title = prompt('Loan Title?');
                            if (!title) return;
                            const { collection, addDoc } = await import('firebase/firestore');
                            const { db } = await import('./lib/firebase');
                            await addDoc(collection(db, 'loanProducts'), {
                              title,
                              icon: 'Briefcase',
                              color: 'bg-gray-100 text-gray-600'
                            });
                          }}
                          className="app-card border-dashed border-2 flex items-center justify-center text-gray-400 text-xs font-bold"
                         >+ Add New</button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {applications.length > 0 ? applications.map((loan, i) => (
                      <div key={loan.id} className="app-card flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            loan.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                            loan.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {loan.status === 'Approved' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-brand-blue">{loan.loanType}</h4>
                            <p className="text-xs text-gray-400">{new Date(loan.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-blue">TZS {Number(loan.amount).toLocaleString()}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                             loan.status === 'Approved' ? 'text-emerald-500' : 
                             loan.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'
                          }`}>{loan.status}</p>
                        </div>
                      </div>
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
                    {user.email === 'admin@gmail.com' && <span className="ml-2 text-[10px] bg-brand-gold text-brand-blue px-2 py-0.5 rounded-full">ADMIN</span>}
                  </h2>
                  <p className="text-gray-400">{user.email || profileData?.phone}</p>
                  
                  {user.email === 'admin@gmail.com' && (
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
                  { icon: User, label: 'Personal Information' },
                  { icon: ShieldCheck, label: 'Security & Verification' },
                  { icon: Bell, label: 'Notification Settings' },
                  { icon: Globe, label: 'App Language' },
                  { icon: Phone, label: 'Help & Support' },
                ].map((item, i) => (
                  <button key={i} className="app-card w-full flex items-center justify-between py-4 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand-blue/5 group-hover:text-brand-blue transition-colors">
                        <item.icon size={20} />
                      </div>
                      <span className="font-bold text-brand-blue text-sm">{item.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
