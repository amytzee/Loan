import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Building2, 
  HandCoins, 
  GraduationCap, 
  Home, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Star,
  CheckCircle,
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
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
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
  Laptop,
  Lock,
  LogOut,
  Calendar,
  Send,
  Trash2,
  Gift,
  Heart,
  Smile,
  HelpCircle,
  ExternalLink,
  Download,
  Share2,
  MessagesSquare,
  Link as LinkIcon,
  Camera,
  Image,
  Loader2,
  LineChart as LineChartIcon,
  FileText
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';

interface ChatMessage {
  id?: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
  likes?: string[];
}
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  deleteDoc 
} from 'firebase/firestore';

import { auth, db } from './lib/firebase';
import { AuthView } from './components/AuthView';

// --- Types ---
type Language = 'sw' | 'en';
const ADMIN_EMAILS = ['amytzee@gmail.com'];

interface Translation {
  nav: { home: string; services: string; about: string; process: string; apply: string; login: string; register: string };
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
  metrics: {
    customers: string;
    disbursed: string;
    experience: string;
    success: string;
  };
  profile: {
    title: string;
    loanSummary: string;
    activeLoans: string;
    nextPayment: string;
    history: string;
    status: string;
    notifs: string;
    settings: string;
    repay: string;
    statement: string;
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
  aiEnabled?: boolean;
  geminiApiKey?: string;
  address?: string;
  tin?: string;
  vrn?: string;
  heroGallery?: { url: string; caption: string }[];
  homeTitleSw?: string;
  homeTitleEn?: string;
  homeSubtitleSw?: string;
  homeSubtitleEn?: string;
  aboutContentSw?: string;
  aboutContentEn?: string;
}

interface LoanFormField {
  label: string;
  type: 'text' | 'number' | 'image' | 'file' | 'tel' | 'textarea' | 'location' | 'guarantors';
  required: boolean;
  multiple?: boolean;
}

interface Notification {
  id?: string;
  userId: string; // 'all' for broadcast
  title: string;
  message: string;
  imageUrl?: string;
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
  gallery?: { type: 'file' | 'link', data: string, name?: string }[];
}

// --- Translations Data ---
const translations: Record<Language, Translation> = {
  sw: {
    nav: { home: 'Nyumbani', services: 'Huduma', about: 'Kuhusu', process: 'Mchakato', apply: 'Omba Mkopo', login: 'Ingia', register: 'Jiunge' },
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
        features: ['Hadi TSh 10M', 'Mchakato wa siku moja', 'Ushauri wa bure']
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
      amount: 'Kiasi (TSh)',
      submit: 'TUMA MAOMBI',
      types: ['Mkopo Binafsi', 'Mkopo wa Biashara', 'Mkopo wa Kodi', 'Mkopo wa Ada']
    },
    metrics: {
      customers: 'Wateja Waliofikiwa',
      disbursed: 'Mikopo Inayozunguka',
      experience: 'Miaka ya Uzoefu',
      success: 'Viwango vya Mafanikio'
    },
    profile: {
      title: 'Dashibodi Yangu',
      loanSummary: 'Muhtasari wa Mkopo',
      activeLoans: 'Mikopo Amilifu',
      nextPayment: 'Malipo Yajayo',
      history: 'Historia ya Maombi',
      status: 'Hali ya Mkopo',
      notifs: 'Taarifa',
      settings: 'Mipangilio',
      repay: 'Lipa Sasa',
      statement: 'Download Statement'
    }
  },
  en: {
    nav: { home: 'Home', services: 'Services', about: 'About', process: 'Process', apply: 'Apply Now', login: 'Login', register: 'Sign Up' },
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
        features: ['Up to TSh 10M', 'One-day process', 'Free business advice']
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
      amount: 'Amount (TSh)',
      submit: 'SUBMIT APPLICATION',
      types: ['Personal Loan', 'Business Loan', 'Rental Loan', 'School Fees Loan']
    },
    metrics: {
      customers: 'Happy Customers',
      disbursed: 'Total Disbursed',
      experience: 'Years of Experience',
      success: 'Success Rate'
    },
    profile: {
      title: 'My Dashboard',
      loanSummary: 'Loan Summary',
      activeLoans: 'Active Loans',
      nextPayment: 'Next Payment',
      history: 'Application History',
      status: 'Loan Status',
      notifs: 'Notifications',
      settings: 'Account Settings',
      repay: 'Repay Now',
      statement: 'Download Statement'
    }
  }
};

const downloadPDFStatement = (user: any, applications: any[], lang: Language, appConfig: AppConfig) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // Receipt style (80mm width)
  });

  const t = lang === 'sw' ? {
    title: 'RESITI YA KIFISKO (EFD)',
    user: 'Mteja',
    date: 'Tarehe',
    phone: 'Simu',
    summary: 'Miamala ya Mikopo',
    id: 'Na.',
    loan: 'Aina',
    amount: 'Kiasi',
    status: 'Hali',
    time: 'Muda',
    tin: 'TIN ya Kampuni',
    vrn: 'VRN',
    receipt: 'Namba ya Resiti',
    footer: 'ASANTE KWA KUTUMIA HUDUMA ZETU'
  } : {
    title: 'FISCAL RECEIPT (EFD)',
    user: 'Customer',
    date: 'Date',
    phone: 'Phone',
    summary: 'Loan Transactions',
    id: 'No.',
    loan: 'Type',
    amount: 'Amount',
    status: 'Status',
    time: 'Time',
    tin: 'Company TIN',
    vrn: 'VRN',
    receipt: 'Receipt No',
    footer: 'THANK YOU FOR CHOOSING US'
  };

  const receiptNo = 'SM-' + Math.random().toString(36).substring(7).toUpperCase();
  const companyTIN = appConfig.tin || '123-456-789'; 
  const companyVRN = appConfig.vrn || '40012345X';
  const companyAddress = appConfig.address || 'P.O. BOX 1234, DAR ES SALAAM';

  // Header - Centered for receipt look
  if (appConfig.logoUrl) {
    try {
      doc.addImage(appConfig.logoUrl, 'PNG', 30, 5, 20, 20); // Center logo
    } catch (e) {
      console.warn("Could not add logo to PDF:", e);
    }
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const companyName = appConfig.name.toUpperCase();
  const startYHeader = appConfig.logoUrl ? 30 : 10;
  doc.text(companyName, 40, startYHeader, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(companyAddress, 40, startYHeader + 5, { align: 'center' });
  doc.text(`${t.tin}: ${companyTIN}`, 40, startYHeader + 9, { align: 'center' });
  doc.text(`${t.vrn}: ${companyVRN}`, 40, startYHeader + 13, { align: 'center' });
  
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, startYHeader + 17, 75, startYHeader + 17);

  doc.setFont('helvetica', 'bold');
  doc.text(t.title, 40, startYHeader + 23, { align: 'center' });
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, startYHeader + 26, 75, startYHeader + 26);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const metadataStart = startYHeader + 32;
  doc.text(`${t.receipt}: ${receiptNo}`, 10, metadataStart);
  doc.text(`${t.date}: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 10, metadataStart + 4);
  doc.text(`${t.user}: ${user.displayName || user.fullName || user.email}`, 10, metadataStart + 8);
  doc.text(`${t.phone}: ${user.phone || 'N/A'}`, 10, metadataStart + 12);

  // Table using autoTable for receipt width
  const tableData = applications.map((app, index) => [
    index + 1,
    app.loanType?.split(' ')[0] || 'Gen',
    Number(app.amount).toLocaleString(),
    app.status.charAt(0)
  ]);

  autoTable(doc, {
    startY: metadataStart + 18,
    margin: { left: 5, right: 5 },
    head: [[t.id, t.loan, t.amount, t.status]],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 5 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 10, halign: 'center' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setLineDashPattern([1, 1], 0);
  doc.line(5, finalY, 75, finalY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const total = applications.reduce((acc, app) => acc + (app.status === 'Approved' ? Number(app.amount) : 0), 0);
  doc.text(`TOTAL APPROVED: TSh ${total.toLocaleString()}`, 10, finalY + 7);
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(t.footer, 40, finalY + 15, { align: 'center' });
  doc.text('FISCAL DEVICE SIMULATION', 40, finalY + 19, { align: 'center' });

  doc.save(`EFD_Receipt_${receiptNo}.pdf`);
};

// --- SupportChat Component ---
const SupportChat = ({ lang, user, isAdmin = false, targetUserId }: { lang: Language, user: any, isAdmin?: boolean, targetUserId?: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const chatId = isAdmin ? targetUserId : user.uid;

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'support_messages', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setMessages(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      await addDoc(collection(db, 'support_messages', chatId, 'messages'), {
        senderId: user.uid,
        text: newMessage,
        timestamp: new Date().toISOString(),
        isAdmin: isAdmin,
        likes: []
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (msgId: string) => {
    if (!chatId || !msgId) return;
    try {
      await deleteDoc(doc(db, 'support_messages', chatId, 'messages', msgId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const toggleReaction = async (msg: ChatMessage, emoji: string) => {
    if (!chatId || !msg.id) return;
    const currentReactions = (msg as any).reactions || {};
    const usersWhoReacted = currentReactions[emoji] || [];
    
    let newUsers;
    if (usersWhoReacted.includes(user.uid)) {
      newUsers = usersWhoReacted.filter((id: string) => id !== user.uid);
    } else {
      newUsers = [...usersWhoReacted, user.uid];
    }
    
    const newReactions = { ...currentReactions, [emoji]: newUsers };
    
    try {
      await updateDoc(doc(db, 'support_messages', chatId, 'messages', msg.id), {
        reactions: newReactions
      });
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const bottom = document.getElementById('chat-bottom');
      bottom?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const REACTION_EMOJIS = ['❤️', '👍', '🔥', '👏', '😂'];

  return (
    <div className={`flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 ${isAdmin ? '' : 'shadow-2xl shadow-brand-blue/10 relative z-[60]'}`}>
      <div className={`p-6 ${isAdmin ? 'bg-slate-800' : 'bg-brand-blue'} text-white flex items-center justify-between shadow-lg relative z-20`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-brand-gold shadow-inner">
            <MessagesSquare size={24} />
          </div>
          <div>
            <h4 className="font-bold text-base tracking-tight">{lang === 'sw' ? 'Msaada wa Moja kwa Moja' : 'Live Support Chat'}</h4>
            <p className="text-[10px] opacity-60 font-black uppercase tracking-widest flex items-center gap-2">
              {isAdmin ? 'Customer Support Agent' : 'Support Team Online'}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isAdmin && messages.length > 0 && (
             <button 
               onClick={async () => {
                 if (!confirm(lang === 'sw' ? 'Futa mazungumzo yote?' : 'Delete all conversation?')) return;
                 for (const m of messages) {
                   if (m.id) await deleteMessage(m.id);
                 }
               }}
               className="p-2.5 bg-white/10 hover:bg-rose-500/30 rounded-xl text-white transition-all transform hover:scale-110 active:scale-95"
               title="Clear Chat"
             >
               <Trash2 size={18} />
             </button>
           )}
           <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full shadow-inner border border-white/5">
              <span className="text-xs font-black">{messages.length}</span>
              <MessageSquare size={14} className="opacity-60" />
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 dark:bg-slate-950/20 scroll-smooth custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin shadow-lg shadow-brand-gold/20" />
            <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em]">Loading Chat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
            <div className="w-24 h-24 bg-brand-gold/5 rounded-full flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 bg-brand-gold/10 rounded-full animate-ping opacity-20" />
              <MessagesSquare className="text-brand-gold group-hover:scale-110 transition-transform" size={48} />
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-gray-800 dark:text-white">Andika hapa kuanza</h5>
              <p className="text-xs font-medium text-gray-400 max-w-[200px] leading-relaxed mx-auto">
                {lang === 'sw' ? 'Tuko online sasa hivi kukusaidia na maswali yoyote uliyonayo.' : 'We are online now to help with any questions you may have.'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = (isAdmin && m.isAdmin) || (!isAdmin && !m.isAdmin) || (m.senderId === user.uid);
            const canDelete = isAdmin || (m.senderId === user.uid);
            const reactions = (m as any).reactions || {};

            return (
              <div key={m.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group slide-up`}>
                <div className={`relative flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Bubble */}
                  <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium transition-all hover:shadow-xl relative ${
                    isMe 
                      ? 'bg-gradient-to-br from-brand-blue to-slate-800 text-white rounded-tr-none shadow-lg shadow-brand-blue/10 border border-white/5'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5 shadow-sm'
                  }`}>
                    {m.text}
                    <div className={`text-[9px] mt-3 opacity-50 font-black uppercase tracking-widest flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {m.isAdmin && <span className="bg-brand-gold text-brand-blue px-1.5 py-0.5 rounded-sm text-[8px] font-black">SUPPORT</span>}
                    </div>
                  </div>

                  {/* Quick Reactions Selector (appears on hover) */}
                  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform ${isMe ? 'translate-x-[-10px]' : 'translate-x-[10px]'}`}>
                    <div className="flex bg-white dark:bg-slate-800 shadow-xl rounded-full p-1 border border-gray-100 dark:border-white/5">
                      {REACTION_EMOJIS.slice(0, 3).map(emoji => (
                        <button 
                          key={emoji}
                          onClick={() => toggleReaction(m, emoji)}
                          className={`p-1.5 hover:scale-125 transition-transform text-sm ${reactions[emoji]?.includes(user.uid) ? 'bg-brand-gold/20 rounded-full' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                      {canDelete && (
                        <button 
                          onClick={() => m.id && deleteMessage(m.id)}
                          className="p-1.5 hover:scale-125 transition-transform text-gray-300 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visible Reactions */}
                {Object.keys(reactions).length > 0 && (
                  <div className={`mt-[-10px] flex flex-wrap gap-1 relative z-10 ${isMe ? 'mr-6' : 'ml-6'}`}>
                    {Object.entries(reactions).map(([emoji, users]: [string, any]) => users.length > 0 && (
                      <button 
                        key={emoji}
                        onClick={() => toggleReaction(m, emoji)}
                        className={`flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] shadow-sm border border-gray-100 dark:border-white/5 hover:scale-105 transition-transform ${users.includes(user.uid) ? 'border-brand-gold bg-brand-gold/5' : ''}`}
                      >
                        <span>{emoji}</span>
                        <span className="font-bold opacity-60">{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div id="chat-bottom" />
      </div>

      <form onSubmit={sendMessage} className="p-5 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-white/10 flex gap-3 relative z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex-1 relative flex items-center">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={lang === 'sw' ? 'Andika ujumbe wako...' : 'Type a message...'}
            className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-brand-gold/30 rounded-2xl pl-5 pr-14 py-4 text-sm font-semibold focus:ring-0 transition-all dark:text-white placeholder:text-gray-400"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
             <button type="button" className="text-gray-400 hover:text-brand-gold transition-all hover:scale-110">
               <Smile size={22} />
             </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="w-14 h-14 bg-brand-gold text-brand-blue rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-gold/30 disabled:opacity-30 disabled:scale-100 flex items-center justify-center shrink-0"
        >
          <Send size={24} className="translate-x-0.5 -translate-y-0.5" />
        </button>
      </form>
    </div>
  );
};

// --- RepaymentModal Component ---
const RepaymentModal = ({ lang, loan, onClose }: { lang: Language, loan: any, onClose: () => void }) => {
  const [step, setStep] = useState<'method' | 'prompt' | 'pin' | 'success'>('method');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState<'mpesa' | 'tigopesa' | 'airtel'>('mpesa');

  const startPayment = () => {
    if (!phone) return alert('Daka namba ya simu');
    setStep('prompt');
    setTimeout(() => setStep('pin'), 3000);
  };

  const verifyPIN = () => {
    setStep('success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-brand-blue/20"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-brand-blue transition-colors z-10">
          <X size={24} />
        </button>

        <div className="p-8">
          {step === 'method' && (
            <div>
              <h3 className="text-2xl font-bold text-brand-blue dark:text-white mb-2">
                {lang === 'sw' ? 'Lipa Mkopo' : 'Repay Loan'}
              </h3>
              <p className="text-sm text-gray-400 mb-8 font-medium">TSh {Number(loan.amount).toLocaleString()} • {loan.loanType}</p>
              
              <div className="space-y-4 mb-8">
                <button 
                  onClick={() => setProvider('mpesa')}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${provider === 'mpesa' ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-black italic">M</div>
                    <span className="font-bold text-brand-blue dark:text-white">M-Pesa</span>
                  </div>
                  {provider === 'mpesa' && <CheckCircle className="text-brand-gold" size={20} />}
                </button>
                <button 
                  onClick={() => setProvider('tigopesa')}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${provider === 'tigopesa' ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/5'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-black italic">T</div>
                    <span className="font-bold text-brand-blue dark:text-white">Tigo Pesa</span>
                  </div>
                  {provider === 'tigopesa' && <CheckCircle className="text-brand-gold" size={20} />}
                </button>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">{lang === 'sw' ? 'Namba ya Simu' : 'Phone Number'}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0XXX XXX XXX"
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl font-bold focus:ring-2 focus:ring-brand-gold transition-all"
                />
              </div>

              <button 
                onClick={startPayment}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2"
              >
                {lang === 'sw' ? 'ENDELEA' : 'CONTINUE'} <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 'prompt' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                 <div className="absolute inset-0 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
                 <Smartphone className="text-brand-gold" size={32} />
              </div>
              <h4 className="text-xl font-bold text-brand-blue dark:text-white mb-2">Simulating Push Prompt...</h4>
              <p className="text-sm text-gray-400">Tafadhali kagua simu yako kupokea ujumbe wa {provider.toUpperCase()}.</p>
            </div>
          )}

          {step === 'pin' && (
            <div className="py-8 text-center">
              <Lock className="mx-auto text-brand-gold mb-6" size={48} />
              <h4 className="text-xl font-bold text-brand-blue dark:text-white mb-2">Enter PIN simulated</h4>
              <p className="text-sm text-gray-400 mb-8">Ingiza PIN yako kwenye simu kukamilisha muamala.</p>
              <button 
                onClick={verifyPIN}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/20"
              >
                VERIFY (SIMULATED)
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-emerald-500" size={48} />
              </div>
              <h4 className="text-2xl font-bold text-brand-blue dark:text-white mb-2">Payment Successful!</h4>
              <p className="text-sm text-gray-400 mb-8">Malipo yako ya TSh {Number(loan.amount).toLocaleString()} yamepokelewa. Hali ya mkopo itabadilika muda mfupi.</p>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-brand-blue text-white rounded-2xl font-bold"
              >
                DONE
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
const Navbar = ({ lang, setLang, activeView, setActiveView, user, appConfig, setAppConfig, setShowingSupport, unreadCount, setShowNotifCenter, onLogin }: { lang: Language, setLang: (l: Language) => void, activeView: string, setActiveView: (v: string) => void, user: any, appConfig: AppConfig, setAppConfig: (c: AppConfig) => void, setShowingSupport: (s: boolean) => void, unreadCount: number, setShowNotifCenter: (n: boolean) => void, onLogin: () => void }) => {
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

              <button 
                onClick={() => setShowNotifCenter(true)}
                className={`p-2 rounded-xl border relative transition-all ${scrolled ? 'border-brand-blue/10 text-brand-blue hover:bg-brand-blue/5' : 'border-white/20 text-white hover:bg-white/10'}`}
              >
                <Bell size={14} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-brand-blue text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <button 
                    onClick={() => setActiveView('profile')}
                    className="flex flex-col items-end group"
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest ${scrolled ? 'text-brand-blue/40' : 'text-white/40'} group-hover:text-brand-gold transition-colors`}>{lang === 'sw' ? 'Mteja' : 'Client'}</span>
                    <span className={`text-xs font-bold leading-none ${scrolled ? 'text-brand-blue' : 'text-white'}`}>{user.displayName?.split(' ')[0]}</span>
                  </button>
                  <button 
                    onClick={() => setActiveView('profile')}
                    className="w-10 h-10 rounded-full border-2 border-brand-gold/30 p-0.5 overflow-hidden hover:scale-110 transition-transform shadow-lg shadow-brand-blue/5"
                  >
                    <img src={user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} className="w-full h-full object-cover rounded-full" />
                  </button>
                  {ADMIN_EMAILS.includes(user.email || '') && (
                    <button 
                      onClick={() => setActiveView('history')}
                      className={`p-2 rounded-xl bg-brand-gold text-brand-blue hover:bg-white transition-all shadow-lg shadow-brand-gold/20`}
                      title="Admin Dashboard"
                    >
                      <LayoutDashboard size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onLogin}
                    className={`font-bold text-sm tracking-tight hover:text-brand-gold transition-colors ${forceSolid ? 'text-brand-blue' : 'text-white'}`}
                  >
                    {t.login}
                  </button>
                  <button 
                    onClick={onLogin}
                    className="bg-brand-gold text-brand-blue py-2.5 px-6 rounded-2xl font-black text-xs hover:bg-white transition-all shadow-xl shadow-brand-gold/20"
                  >
                    {t.register}
                  </button>
                  <a href="#apply" className="btn-primary py-2.5 px-6 shadow-brand-blue/30 text-xs">
                    {t.apply}
                  </a>
                </div>
              )}
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

              <button 
                onClick={() => setShowNotifCenter(true)}
                className={`p-1.5 rounded-xl relative ${scrolled ? 'text-brand-blue dark:text-brand-gold bg-brand-blue/5 dark:bg-white/5' : 'text-white bg-white/10'}`}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold text-brand-blue text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded-xl ml-1 ${scrolled ? 'text-brand-blue bg-brand-blue/5' : 'text-white bg-white/10'}`}
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-brand-blue p-8 flex flex-col pt-32"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 p-3 bg-white/10 rounded-2xl text-white">
              <X size={24} />
            </button>

            <div className="space-y-8">
              <button 
                onClick={() => { setActiveView('home'); setIsOpen(false); }}
                className="block text-4xl font-display font-bold text-white hover:text-brand-gold transition-colors"
              >{t.home}</button>
              <button 
                onClick={() => { setActiveView('services'); setIsOpen(false); }}
                className="block text-4xl font-display font-bold text-white hover:text-brand-gold transition-colors"
              >{t.services}</button>
              <button 
                onClick={() => { setShowingSupport(true); setIsOpen(false); }}
                className="block text-4xl font-display font-bold text-white hover:text-brand-gold transition-colors"
              >{lang === 'sw' ? 'Msaada' : 'Support'}</button>
              
              <div className="h-px bg-white/10 w-full" />

              {!user ? (
                <div className="space-y-4">
                  <button 
                    onClick={() => { onLogin(); setIsOpen(false); }}
                    className="w-full py-5 rounded-2xl border-2 border-white/20 text-white font-bold text-xl"
                  >
                    {t.login}
                  </button>
                  <button 
                    onClick={() => { onLogin(); setIsOpen(false); setIsOpen(false); }}
                    className="w-full py-5 rounded-2xl bg-brand-gold text-brand-blue font-black text-xl"
                  >
                    {t.register}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setActiveView('profile'); setIsOpen(false); }}
                  className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl"
                >
                  <img src={user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} className="w-16 h-16 rounded-full border-2 border-brand-gold/30" />
                  <div className="text-left">
                    <p className="text-white font-bold text-xl">{user.displayName || 'Client'}</p>
                    <p className="text-brand-gold text-xs font-black uppercase tracking-widest">{lang === 'sw' ? 'Mteja' : 'Client'}</p>
                  </div>
                </button>
              )}
            </div>
            <div className="mt-auto opacity-40 text-white text-[10px] font-black uppercase tracking-[0.3em] text-center">
              Licensed Microfince • BoT
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

// --- MetricsGrid Component ---
const MetricsGrid = ({ lang }: { lang: Language }) => {
  const t = translations[lang].metrics;
  const metrics = [
    { icon: <Users size={32} />, value: '10,000+', label: t.customers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <HandCoins size={32} />, value: 'TSh 5B+', label: t.disbursed, color: 'text-brand-gold', bg: 'bg-yellow-50' },
    { icon: <History size={32} />, value: '5+', label: t.experience, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: <CheckCircle size={32} />, value: '99%', label: t.success, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-brand-gold/30 hover:bg-white hover:shadow-2xl hover:shadow-brand-blue/5 transition-all group text-center"
            >
              <div className={`w-16 h-16 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                {m.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 tracking-tight">{m.value}</h3>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- UserProfile Component ---
const UserProfile = ({ 
  lang, 
  user, 
  profileData, 
  applications, 
  onEdit, 
  onChangePassword, 
  onSupport, 
  onSignOut, 
  onDeleteAccount,
  onRepay,
  onChat,
  showingChat,
  appConfig
}: { 
  lang: Language, 
  user: any, 
  profileData: any, 
  applications: any[], 
  notifications: Notification[], 
  onEdit: () => void, 
  onChangePassword: () => void, 
  onSupport: () => void, 
  onSignOut: () => void, 
  onDeleteAccount: () => void,
  onRepay: (loan: any) => void,
  onChat: () => void,
  showingChat: boolean,
  appConfig: AppConfig
}) => {
  const t = translations[lang].profile;
  const activeLoans = applications.filter(a => a.status === 'Approved');

  return (
    <div className="pt-24 md:pt-32 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">
      {/* Floating Chat Button for Mobile */}
      <button 
        onClick={onChat}
        className="fixed bottom-8 right-8 z-[60] w-16 h-16 bg-brand-gold text-brand-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all lg:hidden"
      >
        {showingChat ? <X size={28} /> : <MessagesSquare size={28} />}
      </button>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl shadow-brand-blue/5 border border-white dark:border-white/5"
            >
              <div className="text-center mb-6 md:mb-8">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-brand-gold/20 mx-auto mb-4 overflow-hidden p-1 shadow-inner bg-gray-50 dark:bg-slate-900">
                   <img src={profileData?.photoURL || user.photoURL || `https://i.pravatar.cc/200?u=${user.uid}`} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-brand-blue dark:text-white truncate px-2">{profileData?.fullName || user.displayName}</h2>
                <p className="text-gray-400 font-medium text-xs md:text-sm mb-2 truncate px-2">{user.email}</p>
                {profileData?.gender && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full inline-block mb-3">
                    {profileData.gender === 'male' ? (lang === 'sw' ? 'Mwanaume' : 'Male') : 
                     profileData.gender === 'female' ? (lang === 'sw' ? 'Mwanamke' : 'Female') : 
                     (lang === 'sw' ? 'N.k' : 'Other')}
                  </p>
                )}
                <div></div>
                <div className="mt-2 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} /> Verified Account
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-brand-blue text-white shadow-lg shadow-brand-blue/20 font-bold transition-all hover:scale-[1.02] active:scale-95">
                  <LayoutDashboard size={18} /> {t.loanSummary}
                </button>
                <button onClick={() => downloadPDFStatement(user, applications, lang, appConfig)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold transition-all group">
                  <Download size={18} className="group-hover:scale-110 transition-transform" /> {t.statement}
                </button>
                <button onClick={onChat} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all group ${showingChat ? 'bg-brand-gold/10 text-brand-gold' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <MessagesSquare size={18} className="group-hover:rotate-12 transition-transform" /> {lang === 'sw' ? 'Chat ya Msaada' : 'Live Chat'}
                </button>
                <button onClick={onEdit} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 font-bold transition-all hover:text-brand-blue group">
                  <User size={18} className="group-hover:scale-110 transition-transform" /> {lang === 'sw' ? 'Hariri Profaili' : 'Edit Profile'}
                </button>
                <button onClick={onChangePassword} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 font-bold transition-all hover:text-brand-blue group">
                  <Lock size={18} className="group-hover:scale-110 transition-transform" /> {lang === 'sw' ? 'Badili Nywila' : 'Change Password'}
                </button>
                <button onClick={onSignOut} className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-rose-500/10 font-bold transition-all border-t border-gray-100 dark:border-white/5 mt-4 group">
                  <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> {lang === 'sw' ? 'Ondoka' : 'Sign Out'}
                </button>
                <button onClick={onDeleteAccount} className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold transition-all group mt-2">
                  <Trash2 size={18} className="group-hover:scale-110 transition-transform" /> {lang === 'sw' ? 'Futa Akaunti' : 'Delete Account'}
                </button>
              </div>
            </motion.div>

            {/* Chat for Desktop */}
            <div className="hidden lg:block">
              {showingChat && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <SupportChat lang={lang} user={user} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Content: Dashboard */}
          <div className="lg:col-span-8">
            {showingChat && (
              <div className="lg:hidden mb-8">
                <SupportChat lang={lang} user={user} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-brand-blue p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-brand-blue/20"
              >
                <Wallet className="absolute top-[-10%] right-[-10%] w-32 md:w-48 h-32 md:h-48 text-white/5" />
                <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-2">{t.activeLoans}</p>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{activeLoans.length}</h3>
                <div className="flex items-center gap-2 text-brand-gold text-xs md:text-sm font-black group cursor-pointer">
                  <ChevronRight size={14} md:size={16} className="group-hover:translate-x-1 transition-transform" /> Manage Loans
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-brand-gold p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] text-brand-blue overflow-hidden relative shadow-2xl shadow-brand-gold/20"
              >
                <Clock className="absolute top-[-10%] right-[-10%] w-32 md:w-48 h-32 md:h-48 text-brand-blue/5" />
                <p className="text-brand-blue/60 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-2">{t.nextPayment}</p>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">TSh 150,000</h3>
                <div className="flex items-center gap-2 text-brand-blue text-xs md:text-sm font-black">
                  <Calendar size={14} md:size={16} /> 24 May 2024
                </div>
              </motion.div>
            </div>

            {/* Referral Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 bg-emerald-500 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-emerald-500/20"
            >
              <Users className="absolute top-[-10%] right-[-10%] w-32 md:w-48 h-32 md:h-48 text-white/5" />
              <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[10px] mb-2">{lang === 'sw' ? 'MUALIKE RAFIKI' : 'REFER A FRIEND'}</p>
              <h3 className="text-lg md:text-xl font-bold mb-2">{lang === 'sw' ? 'Mualike Rafiki, Pata Zawadi' : 'Refer a Friend, Get Rewards'}</h3>
              <p className="text-[10px] md:text-xs opacity-80 mb-4">{lang === 'sw' ? 'Shiriki namba yako ya upatanishi na marafiki kupata punguzo la riba.' : 'Share your referral code with friends to get interest discounts.'}</p>
              <div className="flex items-center gap-2 bg-white/10 p-3 rounded-xl border border-white/20">
                <code className="flex-1 font-mono font-bold tracking-widest">{user.uid.slice(0, 8).toUpperCase()}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(user.uid.slice(0, 8).toUpperCase());
                    alert(lang === 'sw' ? 'Imenakiliwa!' : 'Copied!');
                  }}
                  className="bg-white text-emerald-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-50 transition-colors"
                >
                  {lang === 'sw' ? 'NAKILI' : 'COPY'}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl shadow-brand-blue/5 border border-white dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-bold text-brand-blue dark:text-white flex items-center gap-3">
                  <History size={20} className="text-brand-gold" /> {t.history}
                </h3>
              </div>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-12 md:py-16 bg-gray-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-white/5">
                    <AlertCircle className="mx-auto text-gray-200 dark:text-gray-800 mb-4" size={48} md:size={64} />
                    <p className="text-xs md:text-sm text-gray-400 font-bold">{lang === 'sw' ? 'Hujatuma maombi yoyote bado.' : 'No applications found'}</p>
                  </div>
                ) : (
                  applications.slice(0, 10).map((app, i) => (
                    <div key={app.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 rounded-3xl bg-gray-50 dark:bg-slate-900/50 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10 border border-transparent hover:border-brand-blue/10 transition-all group gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                          app.status === 'Approved' || app.status === 'Disbursed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 
                          app.status === 'Rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-600' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600'
                        }`}>
                          {(app.status === 'Approved' || app.status === 'Disbursed') ? <CheckCircle2 size={20} md:size={24} /> : 
                           app.status === 'Rejected' ? <XCircle size={20} md:size={24} /> : <Clock size={20} md:size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-brand-blue dark:text-white tracking-tight text-sm md:text-base">{app.loanType || 'General Loan'}</p>
                          <p className="text-[9px] md:text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{new Date(app.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6">
                        <div className="text-left sm:text-right">
                          <p className="font-black text-brand-blue dark:text-white text-sm md:text-base">TSh {Number(app.amount).toLocaleString()}</p>
                          <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 md:px-3 py-0.5 md:py-1 rounded-full ${
                            app.status === 'Approved' || app.status === 'Disbursed' ? 'bg-green-500 text-white' : 
                            app.status === 'Rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        
                        {(app.status === 'Approved' || app.status === 'Disbursed') && (
                          <button 
                            onClick={() => onRepay(app)}
                            className="bg-brand-gold text-brand-blue px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-[10px] md:text-xs shadow-lg shadow-brand-gold/20 hover:scale-105 transition-transform"
                          >
                            {t.repay}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
const Hero = ({ lang, users, appConfig }: { lang: Language, users: any[], appConfig: AppConfig }) => {
  const t = translations[lang].hero;
  
  // Themed images inspired by user posters
  const heroImages = appConfig.heroGallery && appConfig.heroGallery.length > 0 ? appConfig.heroGallery : [
    {
      url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200", 
      caption: lang === 'sw' ? 'Stress za kodi? Sasa Basi!' : 'No more rent stress!'
    },
    {
      url: "https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1200",
      caption: lang === 'sw' ? 'Smile kwa mkopo nafuu na wa haraka!' : 'Smile with fast and affordable loans!'
    }
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-24 pb-16 md:pb-24 overflow-hidden bg-brand-dark">
      {/* Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand-blue/30 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-brand-gold/10 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-2 lg:order-1 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
            <span className="text-[10px] md:text-xs font-black text-brand-gold uppercase tracking-[0.2em]">{t.badge}</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-display font-bold text-white leading-[1.1] md:leading-[1] mb-6 md:mb-8 text-balance">
            {lang === 'sw' ? (appConfig.homeTitleSw || appConfig.name) : (appConfig.homeTitleEn || appConfig.name)} <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold drop-shadow-sm">{t.smile}</span>
          </h1>
          
          <p className="text-base md:text-xl xl:text-2xl text-slate-300 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            {lang === 'sw' ? (appConfig.homeSubtitleSw || t.desc) : (appConfig.homeSubtitleEn || t.desc)}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
            <a href="#apply" className="group bg-brand-gold text-brand-blue px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl shadow-brand-gold/30">
              {t.cta} <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </a>
            {users.length > 0 && (
              <div className="flex items-center gap-4 py-2 justify-center">
                <div className="flex -space-x-3 md:-space-x-4">
                  {users.slice(0, 3).map((u, i) => (
                    <div key={u.id || i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-brand-dark bg-slate-800 flex items-center justify-center overflow-hidden hover:scale-110 hover:z-10 transition-all shadow-xl">
                      <img src={u.photoURL || `https://i.pravatar.cc/100?u=${u.id}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-xs md:text-sm tracking-tight">{t.stats}</p>
                  <div className="flex gap-0.5 text-brand-gold">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} fill="currentColor" />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-1 lg:order-2 relative"
        >
          <div className="relative aspect-[3/4] sm:aspect-square lg:aspect-[4/5] xl:aspect-square w-full max-w-[480px] mx-auto group">
            <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-2 border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={heroImages[currentImage].url} 
                    alt={heroImages[currentImage].caption}
                    className="w-full h-full object-cover transition-transform duration-[12s] group-hover:scale-110 ease-linear"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 via-black/10 to-transparent" />
                  
                  <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10 md:right-10">
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white font-display font-bold text-2xl md:text-3xl lg:text-4xl leading-tight drop-shadow-xl"
                    >
                      {heroImages[currentImage].caption}
                    </motion.p>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "40px" }}
                      className="h-1 bg-brand-gold mt-4 rounded-full"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-2 sm:-top-8 sm:-right-4 glass p-4 md:p-6 rounded-3xl shadow-2xl backdrop-blur-xl border border-white/20 z-20"
            >
              <div className="bg-brand-gold w-10 md:w-12 h-10 md:h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                <HandCoins className="text-brand-blue w-5 md:w-6 h-5 md:h-6" />
              </div>
              <p className="text-white font-black text-lg md:text-xl tracking-tight leading-none mb-1">24 Hour</p>
              <p className="text-brand-gold text-[10px] font-black uppercase tracking-widest leading-none">{t.fast}</p>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 glass p-4 md:p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border border-white/20 z-20 hidden md:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Verified Agent</p>
                  <p className="text-slate-400 text-[10px] font-medium tracking-wide italic leading-none">Tier 2 Licensed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const AboutUs = ({ lang, appConfig }: { lang: Language, appConfig: AppConfig }) => {
  const content = lang === 'sw' ? appConfig.aboutContentSw : appConfig.aboutContentEn;
  const title = lang === 'sw' ? 'Kuhusu Sisi' : 'About Us';
  
  if (!content) return null;

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">HISTORY & MISSION</span>
              <h2 className="text-4xl md:text-5xl font-display font-medium text-brand-blue dark:text-white mb-6">
                {title} <span className="text-brand-gold italic font-serif">Coshve</span>
              </h2>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-500 dark:text-gray-400 whitespace-pre-line font-medium leading-relaxed">
                {content}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <p className="text-3xl font-display font-black text-brand-blue dark:text-white mb-2">5K+</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Wateja' : 'Active Clients'}</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                <p className="text-3xl font-display font-black text-brand-blue dark:text-white mb-2">24/7</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{lang === 'sw' ? 'Msaada' : 'Global Support'}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-brand-blue/10">
              <img 
                src="https://images.unsplash.com/photo-1573164067507-406cd68700ba?auto=format&fit=crop&q=80&w=1000" 
                className="w-full h-full object-cover"
                alt="About us"
              />
              <div className="absolute inset-0 bg-brand-blue/10 mix-blend-overlay" />
            </div>
            {/* Design Accents */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Services Component ---
const Services = ({ lang, loanProducts, onSelect }: { lang: Language, loanProducts: LoanProduct[], onSelect: (p: LoanProduct) => void }) => {
  const t = translations[lang].services;
  return (
    <section id="services" className="py-24 bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-24">
          <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] md:text-xs mb-4 block">{lang === 'sw' ? 'CHAGUA HUDUMA' : 'SELECT SERVICE'}</span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-medium text-brand-blue dark:text-white mb-6">
            {t.title} <span className="text-brand-gold italic font-serif">{t.accent}</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed">
            {t.desc}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {loanProducts.map((p, idx) => {
            const IconMap: Record<string, any> = { User, Home, Briefcase, GraduationCap, Wallet, HandCoins, Building2, Clock };
            const IconComponent = IconMap[p.icon] || Briefcase;
            
            return (
              <motion.div 
                key={p.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                className="group relative bg-[#0F141F] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 flex flex-col items-center justify-center text-center border border-white/5 shadow-2xl overflow-hidden cursor-pointer"
                onClick={() => onSelect(p)}
              >
                {/* Background Glow */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-brand-gold/0 via-brand-gold/0 to-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                
                {/* Icon Container (Themed like the image) */}
                <div className="mb-8 md:mb-12 relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 dark:bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-slate-200/40 relative z-10 group-hover:scale-105 transition-transform duration-500">
                    {p.iconType === 'emoji' ? (
                      <span className="text-4xl md:text-5xl drop-shadow-sm">{p.icon}</span>
                    ) : p.iconType === 'url' ? (
                      <img src={p.icon} className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md" />
                    ) : (
                      <IconComponent size={48} strokeWidth={1} className="text-brand-blue" />
                    )}
                  </div>
                  {/* Subtle holder ring */}
                  <div className="absolute inset-0 -m-3 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 group-hover:border-white/20 transition-colors" />
                </div>
                
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-2 md:mb-4 group-hover:text-brand-gold transition-colors tracking-tight">
                  {p.title}
                </h3>
                
                <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400 group-hover:text-white transition-all transform origin-center">
                  {lang === 'sw' ? 'OMBA SASA' : 'APPLY NOW'}
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-12 h-1 bg-brand-gold rounded-full" />
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
                    <span className="text-brand-gold">TSh {amount.toLocaleString()}</span>
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
                <span className="text-base md:text-2xl text-white opacity-50 mr-2">TSh</span>
                {Math.round(monthlyRepayment).toLocaleString()}
              </h3>
              
              <div className="space-y-4 mb-10 md:mb-12">
                <div className="flex justify-between text-xs md:text-sm py-3 md:py-4 border-b border-white/5">
                  <span className="opacity-60 font-medium">{t.amount}</span>
                  <span className="font-bold">TSh {amount.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between text-xs md:text-sm py-3 md:py-4 border-b border-white/5">
                  <span className="opacity-60 font-medium">{t.total}</span>
                  <span className="font-bold text-brand-gold">TSh {Math.round(totalRepayment).toLocaleString()}</span>
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

// --- FAQ Component ---
const FAQ = ({ lang }: { lang: Language }) => {
  const faqs = lang === 'sw' ? [
    { q: 'Inachukua muda gani kupata mkopo?', a: 'Maombi mengi hukaguliwa na kukamilika ndani ya saa 2 hadi 24 za kazi.' },
    { q: 'Nahitaji dhamana gani?', a: 'Dhamana inategemea aina ya mkopo. Kwa mikopo midogo, vitambulisho na wadhamini wanatosha.' },
    { q: 'Naweza kulipa mkopo kabla ya wakati?', a: 'Ndiyo, unaweza kulipa mapema na kupata punguzo la riba kwa baadhi ya mikopo.' },
    { q: 'Nifanyeje ikiwa siwezi kulipa kwa wakati?', a: 'Tafadhali wasiliana nasi haraka iwezekanavyo kupitia msaada ili kupata ufumbuzi.' }
  ] : [
    { q: 'How long does it take to get a loan?', a: 'Most applications are reviewed and processed within 2 to 24 business hours.' },
    { q: 'What collateral do I need?', a: 'Collateral depends on the loan type. For small loans, IDs and guarantors are sufficient.' },
    { q: 'Can I pay my loan early?', a: 'Yes, early repayment is allowed and may qualify you for interest discounts.' },
    { q: 'What if I cannot pay on time?', a: 'Please contact us immediately via support to discuss possible solutions.' }
  ];

  return (
    <section className="py-24 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-blue dark:text-white mb-4 italic">
            {lang === 'sw' ? 'Maswali Yanayoulizwa Sana' : 'Frequently Asked Questions'}
          </h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full" />
        </div>
        <div className="space-y-6">
          {faqs.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-white/5 hover:border-brand-gold/30 transition-all group"
            >
              <h4 className="font-bold text-lg text-brand-blue dark:text-white mb-3 flex items-center gap-3">
                <HelpCircle className="text-brand-gold group-hover:rotate-12 transition-transform" size={20} />
                {f.q}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- Footer ---
const Footer = ({ lang, appConfig, user, setActiveView }: { lang: Language, appConfig: AppConfig, user: any, setActiveView: (view: string) => void }) => {
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
                <li><button onClick={() => setActiveView('home')} className="hover:text-white transition-colors">{translations[lang].nav.home}</button></li>
                <li><button onClick={() => setActiveView('services')} className="hover:text-white transition-colors">{translations[lang].nav.services}</button></li>
                {!user && <li><button onClick={() => setActiveView('auth')} className="hover:text-white transition-colors">{translations[lang].nav.login}</button></li>}
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

// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
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
    helpWhatsapp: '+255 700 000 000',
    aiEnabled: true,
    geminiApiKey: '',
    address: 'P.O. BOX 1234, DAR ES SALAAM',
    tin: '123-456-789',
    vrn: '40012345X'
  });
  const [calcAmount, setCalcAmount] = useState<number>(0);
  const [formAttachments, setFormAttachments] = useState<Record<string, { type: 'file' | 'link', id: string, value: string, preview?: string }[]>>({});

  const addAttachmentSlot = (fieldLabel: string) => {
    setFormAttachments(prev => ({
      ...prev,
      [fieldLabel]: [...(prev[fieldLabel] || []), { type: 'file', id: Math.random().toString(36).slice(2), value: '' }]
    }));
  };

  const removeAttachmentSlot = (fieldLabel: string, id: string) => {
    setFormAttachments(prev => ({
      ...prev,
      [fieldLabel]: (prev[fieldLabel] || []).filter(a => a.id !== id)
    }));
  };

  const updateAttachment = (fieldLabel: string, id: string, updates: any) => {
    setFormAttachments(prev => ({
      ...prev,
      [fieldLabel]: (prev[fieldLabel] || []).map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiHistory, setAiHistory] = useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showingSupport, setShowingSupport] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState<any | null>(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ phone: '', fullName: '', gender: '', photoURL: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '' });
  const [adminTab, setAdminTab] = useState<'loans' | 'users' | 'products' | 'settings' | 'notifs'>('loans');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [showingChat, setShowingChat] = useState(false);
  const [repayingLoan, setRepayingLoan] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<LoanProduct | null>(null);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [configSaveFeedback, setConfigSaveFeedback] = useState<string | null>(null);

  const analyticsData = useMemo(() => {
    if (!applications.length) return { statusChart: [], typeChart: [], trendChart: [] };

    // 1. Status Distribution
    const statusCounts = applications.reduce((acc, app) => {
      const s = app.status || 'Pending';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusChart = [
      { name: 'Pending', value: statusCounts['Pending'] || 0, color: '#f59e0b' },
      { name: 'Approved', value: statusCounts['Approved'] || 0, color: '#10b981' },
      { name: 'Rejected', value: statusCounts['Rejected'] || 0, color: '#f43f5e' },
      { name: 'Disbursed', value: statusCounts['Disbursed'] || 0, color: '#0A3665' },
    ].filter(d => d.value > 0);

    // 2. Loan Type Distribution
    const typeCounts = applications.reduce((acc, app) => {
      const t = app.loanType || 'General';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeChart = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    // 3. Trends (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      return dateStr;
    }).reverse();

    const trendChart = last7Days.map(date => {
      const dayApps = applications.filter(app => {
        try {
          return app.timestamp && app.timestamp.split('T')[0] === date;
        } catch(e) { return false; }
      });
      return {
        date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        count: dayApps.length,
        approved: dayApps.filter(a => a.status === 'Approved' || a.status === 'Disbursed').length
      };
    });

    return { statusChart, typeChart, trendChart };
  }, [applications]);

  const [broadcastMessage, setBroadcastMessage] = useState({ title: '', message: '', imageUrl: '', userId: 'all' });

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
    // (Manual save button is now used instead of auto-save to prevent infinite loops and race conditions)
  }, [appConfig.primaryColor, appConfig.secondaryColor, appConfig.fontFamily, appConfig.themeMode, user]);

  useEffect(() => {
    // Real-time config sync & application data sync logic
    let unsubConfig: () => void;
    
    const startSync = async () => {
      const { doc, onSnapshot } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      unsubConfig = onSnapshot(doc(db, 'appConfig', 'main'), (snap) => {
        if (snap.exists()) setAppConfig(snap.data() as AppConfig);
      });
    };
    
    startSync();
    return () => {
      unsubConfig?.();
    };
  }, []);

  const askAi = async (message: string) => {
    if (!message.trim()) return;
    setIsAiLoading(true);
    const newHistory: any = [...aiHistory, { role: 'user', parts: [{ text: message }] }];
    setAiHistory(newHistory);

    try {
      const statsContext = `The user has ${applications.length} loan applications. ${applications.length > 0 ? `Current latest loan status: ${applications[0].status} for a ${applications[0].loanType} loan of ${applications[0].amount}.` : 'They have not applied for any loans yet.'}`;

      if (!appConfig.aiEnabled) {
        alert(lang === 'sw' ? 'AI Imezimwa. Tafadhali washa kwenye mipangilio.' : 'AI is disabled. Please enable it in settings.');
        return;
      }
      const ai = new GoogleGenAI({ apiKey: appConfig.geminiApiKey || process.env.GEMINI_API_KEY });
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

  // Removed redundant fetchConfig effect as it's now handled in the main sync effect

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
        unreadCount={unreadCount}
        setShowNotifCenter={setShowNotifCenter}
        onLogin={() => setActiveView('auth')}
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
                <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg uppercase font-black">{unreadCount} New</span>
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
                       {n.imageUrl && (
                         <div className="mt-3 pl-2">
                           <img src={n.imageUrl} className="w-full h-40 object-cover rounded-2xl shadow-sm hover:scale-[1.02] transition-transform duration-300" />
                         </div>
                       )}
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
              <AboutUs lang={lang} appConfig={appConfig} />
              <Services 
                lang={lang} 
                loanProducts={loanProducts} 
                onSelect={(p) => {
                  setSelectedProduct(p);
                  setActiveView('apply');
                  window.scrollTo(0, 0);
                }} 
              />
              <MetricsGrid lang={lang} />
              <Process lang={lang} />
              <LoanCalculator lang={lang} />
              <FAQ lang={lang} />
              <ContactForm lang={lang} user={user} />
            </motion.div>
          )}

          {activeView === 'profile' && user && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <UserProfile 
                lang={lang} 
                user={user} 
                profileData={profileData} 
                applications={applications} 
                notifications={notifications}
                onEdit={() => {
                  setEditForm({ 
                    phone: profileData?.phone || '', 
                    fullName: user?.displayName || profileData?.fullName || '',
                    gender: profileData?.gender || '',
                    photoURL: profileData?.photoURL || user?.photoURL || ''
                  });
                  setEditingProfile(true);
                }}
                onChangePassword={() => setChangingPassword(true)}
                onSupport={() => setShowingSupport(true)}
                onSignOut={() => {
                  import('./lib/firebase').then(({ auth }) => auth.signOut());
                  setUser(null);
                  setProfileData(null);
                  setActiveView('home');
                }}
                onDeleteAccount={() => setIsDeletingAccount(true)}
                onRepay={(loan) => setRepayingLoan(loan)}
                onChat={() => setShowingChat(!showingChat)}
                showingChat={showingChat}
                appConfig={appConfig}
              />
            </motion.div>
          )}

          {activeView === 'auth' && !user && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <AuthView lang={lang} onSuccess={() => setActiveView('profile')} />
              <div className="mt-8 text-center">
                 <p className="text-gray-400 text-sm mb-4">{lang === 'sw' ? 'Au tumia mtandao wako' : 'Or use your social account'}</p>
                 <button 
                  onClick={handleLogin}
                  className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 mx-auto hover:bg-gray-50 transition-all shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" className="w-5 h-5" />
                  {lang === 'sw' ? 'Ingia na Google' : 'Sign in with Google'}
                </button>
              </div>
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

                {selectedProduct?.gallery && selectedProduct.gallery.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-2 custom-scrollbar no-scrollbar">
                    {selectedProduct.gallery.map((img, i) => (
                      <div key={i} className="flex-shrink-0 w-48 h-32 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm bg-gray-50 dark:bg-slate-900 group">
                        <img 
                          src={img.data} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    ))}
                  </div>
                )}

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
                          TSh {Math.round(calcAmount ? (calcAmount * 1.15 / 12) : 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">{lang === 'sw' ? 'Jumla (Riba 15%)' : 'Total (15% Interest)'}</p>
                        <p className="font-display font-bold text-emerald-600">
                          TSh {Math.round(calcAmount ? (calcAmount * 1.15) : 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    alert(lang === 'sw' ? 'Tafadhali ingia kwanza' : 'Please sign in first');
                    setActiveView('auth');
                    return;
                  }
                  
                  const formData = new FormData(e.currentTarget);
                  const data: any = {};
                  
                  for (const f of (selectedProduct?.formFields || [])) {
                    if (f.type === 'file' || f.type === 'image') {
                      const attachments = formAttachments[f.label] || [{ type: 'file', id: 'initial', value: '' }];
                      const attachmentData = [];
                      
                      for (const a of attachments) {
                        if (a.type === 'file') {
                          const fileInput = formData.get(`${f.label}_file_${a.id}`) as File;
                          if (fileInput && fileInput.size > 0) {
                            const b64 = await fileToBase64(fileInput);
                            attachmentData.push({ type: 'file', data: b64, name: fileInput.name });
                          } else if (a.preview) {
                             attachmentData.push({ type: 'file', data: a.preview });
                          }
                        } else {
                          const link = formData.get(`${f.label}_link_${a.id}`) as string;
                          if (link) {
                            attachmentData.push({ type: 'link', data: link });
                          }
                        }
                      }
                      data[f.label] = attachmentData;
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
                          <div className="space-y-4">
                            {(formAttachments[field.label] || [{ type: 'file', id: 'initial', value: '' }]).map((attachment, idx) => (
                              <div key={attachment.id} className="relative bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm">
                                    <button 
                                      type="button"
                                      onClick={() => updateAttachment(field.label, attachment.id, { type: 'file' })}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${attachment.type === 'file' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                                    >Upload</button>
                                    <button 
                                      type="button"
                                      onClick={() => updateAttachment(field.label, attachment.id, { type: 'link' })}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${attachment.type === 'link' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                                    >Link</button>
                                  </div>
                                  {field.multiple && idx > 0 && (
                                    <button 
                                      type="button"
                                      onClick={() => removeAttachmentSlot(field.label, attachment.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                    ><X size={14} /></button>
                                  )}
                                </div>
                                
                                {attachment.type === 'file' ? (
                                  <div className="relative group">
                                    <input 
                                      type="file"
                                      name={`${field.label}_file_${attachment.id}`}
                                      required={field.required && idx === 0}
                                      accept={field.type === 'image' ? 'image/*' : '*/*'}
                                      className="w-full h-16 opacity-0 absolute inset-0 cursor-pointer z-10"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = () => updateAttachment(field.label, attachment.id, { preview: reader.result as string, value: 'file_selected' });
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                    <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl text-gray-400 gap-2 group-hover:border-brand-blue/30 transition-colors">
                                      {attachment.preview ? (
                                        <img src={attachment.preview} className="w-full h-full object-cover rounded-xl" />
                                      ) : (
                                        <>
                                          <Paperclip size={14} />
                                          <span className="text-[10px] font-bold uppercase tracking-widest">{lang === 'sw' ? 'Gusa Kupakia' : 'Click to Upload'}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <input 
                                    name={`${field.label}_link_${attachment.id}`}
                                    type="url"
                                    placeholder="https://example.com/picha.jpg"
                                    required={field.required && idx === 0}
                                    className="w-full bg-white dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-1 focus:ring-brand-blue outline-none"
                                    onChange={(e) => updateAttachment(field.label, attachment.id, { value: e.target.value })}
                                  />
                                )}
                              </div>
                            ))}
                            {field.multiple && (
                              <button 
                                type="button"
                                onClick={() => addAttachmentSlot(field.label)}
                                className="w-full py-3 border-2 border-dashed border-brand-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-blue hover:bg-brand-blue/5 transition-all"
                              >
                                + {lang === 'sw' ? 'Ongeza Picha nyingine' : 'Add Another Attachment'}
                              </button>
                            )}
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
                      {(['analytics', 'loans', 'users', 'products', 'notifs', 'cms', 'settings'] as const).map((tab) => (
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
                        {adminTab === 'analytics' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 slide-up">
                            <div className="lg:col-span-1 app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><TrendingUp size={18} className="text-brand-gold" /> Application Trends</h3>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Last 7 Days</div>
                              </div>
                              <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={analyticsData.trendChart}>
                                    <defs>
                                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0A3665" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0A3665" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="count" name="Total Apps" stroke="#0A3665" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                    <Area type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2} fill="transparent" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            <div className="lg:col-span-1 app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                              <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><PieChartIcon size={18} className="text-brand-gold" /> Status Distribution</h3>
                              <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={analyticsData.statusChart}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={100}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      {analyticsData.statusChart.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase' }} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            <div className="lg:col-span-2 app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                              <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><BarChart3 size={18} className="text-brand-gold" /> Loan Product Popularity</h3>
                              <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={analyticsData.typeChart}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                      cursor={{ fill: 'transparent' }}
                                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                      itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#0A3665' }}
                                    />
                                    <Bar dataKey="value" name="Applications" fill="#0A3665" radius={[10, 10, 0, 0]} barSize={40} />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        )}
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
                                      <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Image Attachment (Optional)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <input 
                                            placeholder="https://example.com/image.jpg" 
                                            className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm"
                                            value={broadcastMessage.imageUrl}
                                            onChange={(e) => setBroadcastMessage({ ...broadcastMessage, imageUrl: e.target.value })}
                                          />
                                          <div className="relative">
                                            <input 
                                              type="file" 
                                              accept="image/*"
                                              className="absolute inset-0 opacity-0 cursor-pointer"
                                              onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  const reader = new FileReader();
                                                  reader.onloadend = () => {
                                                    setBroadcastMessage({ ...broadcastMessage, imageUrl: reader.result as string });
                                                  };
                                                  reader.readAsDataURL(file);
                                                }
                                              }}
                                            />
                                            <div className="w-full bg-gray-50 rounded-xl p-4 font-bold text-sm text-center border-2 border-dashed border-gray-200 text-gray-400">
                                              Upload Photo
                                            </div>
                                          </div>
                                        </div>
                                        {broadcastMessage.imageUrl && (
                                          <div className="mt-2 relative">
                                            <img src={broadcastMessage.imageUrl} className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                                            <button 
                                              onClick={() => setBroadcastMessage({ ...broadcastMessage, imageUrl: '' })}
                                              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-rose-500 hover:bg-white"
                                            ><X size={14} /></button>
                                          </div>
                                        )}
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
                                          setBroadcastMessage({ title: '', message: '', imageUrl: '', userId: 'all' });
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
                                           <div className="flex items-center gap-3">
                                              {n.imageUrl && <img src={n.imageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                                              <div>
                                                 <p className="font-bold text-brand-blue text-sm">{n.title}</p>
                                                 <p className="text-xs text-gray-400 line-clamp-1">{n.message}</p>
                                              </div>
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
                        {adminTab === 'cms' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 slide-up">
                            <div className="space-y-6">
                              <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                                <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><LayoutDashboard size={18} className="text-brand-gold" /> Hero Section CMS</h3>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="block text-[10px] font-black uppercase text-gray-400">Title (Swahili)</label>
                                      <input 
                                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                        value={appConfig.homeTitleSw || ''}
                                        onChange={(e) => setAppConfig({ ...appConfig, homeTitleSw: e.target.value })}
                                        placeholder={translations.sw.hero.title}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-[10px] font-black uppercase text-gray-400">Title (English)</label>
                                      <input 
                                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                        value={appConfig.homeTitleEn || ''}
                                        onChange={(e) => setAppConfig({ ...appConfig, homeTitleEn: e.target.value })}
                                        placeholder={translations.en.hero.title}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400">Subtitle (Swahili)</label>
                                    <textarea 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                      rows={2}
                                      value={appConfig.homeSubtitleSw || ''}
                                      onChange={(e) => setAppConfig({ ...appConfig, homeSubtitleSw: e.target.value })}
                                      placeholder={translations.sw.hero.desc}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400">Subtitle (English)</label>
                                    <textarea 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                      rows={2}
                                      value={appConfig.homeSubtitleEn || ''}
                                      onChange={(e) => setAppConfig({ ...appConfig, homeSubtitleEn: e.target.value })}
                                      placeholder={translations.en.hero.desc}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                                <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2"><FileText size={18} className="text-brand-gold" /> About Us Content</h3>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400">Content (Swahili)</label>
                                    <textarea 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                      rows={6}
                                      value={appConfig.aboutContentSw || ''}
                                      onChange={(e) => setAppConfig({ ...appConfig, aboutContentSw: e.target.value })}
                                      placeholder="Historia na malengo ya kampuni yetu..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-gray-400">Content (English)</label>
                                    <textarea 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-3 text-sm font-bold dark:text-white"
                                      rows={6}
                                      value={appConfig.aboutContentEn || ''}
                                      onChange={(e) => setAppConfig({ ...appConfig, aboutContentEn: e.target.value })}
                                      placeholder="Company history and our mission..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                                <h3 className="font-bold text-emerald-600 flex items-center gap-2"><History size={18} /> CMS Actions</h3>
                                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-2xl">
                                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-2">Live Preview</p>
                                  <p className="text-xs text-emerald-600/80">Changes you make here will be immediately visible to all users once saved.</p>
                                </div>
                                <button 
                                  disabled={isConfigSaving}
                                  onClick={async () => {
                                    setIsConfigSaving(true);
                                    setConfigSaveFeedback(null);
                                    try {
                                      const { doc, setDoc } = await import('firebase/firestore');
                                      const { db } = await import('./lib/firebase');
                                      await setDoc(doc(db, 'appConfig', 'main'), appConfig, { merge: true });
                                      setConfigSaveFeedback(lang === 'sw' ? 'Maudhui yamehifadhiwa!' : 'CMS Content saved!');
                                      setTimeout(() => setConfigSaveFeedback(null), 3000);
                                    } catch (error: any) {
                                      handleFirestoreError(error, OperationType.WRITE, 'appConfig/main');
                                      alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                                    } finally {
                                      setIsConfigSaving(false);
                                    }
                                  }}
                                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isConfigSaving ? 'bg-gray-100 text-gray-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'}`}
                                >
                                  {isConfigSaving ? (
                                    <><Loader2 className="animate-spin" size={18} /> Inahifadhi...</>
                                  ) : (
                                    configSaveFeedback || (lang === 'sw' ? 'Hifadhi Maudhui yote ya CMS' : 'Save all CMS Content')
                                  )}
                                </button>
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Company TIN</label>
                                    <input 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                      value={appConfig.tin}
                                      onChange={(e) => setAppConfig({ ...appConfig, tin: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Company VRN</label>
                                    <input 
                                      className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                      value={appConfig.vrn}
                                      onChange={(e) => setAppConfig({ ...appConfig, vrn: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Company Address (Receipt Header)</label>
                                  <input 
                                    className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                    value={appConfig.address}
                                    onChange={(e) => setAppConfig({ ...appConfig, address: e.target.value })}
                                    placeholder="e.g. P.O. BOX 1234, DAR ES SALAAM"
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
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                  <div className="flex items-center justify-between">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Hero Slideshow</label>
                                    <button 
                                      onClick={() => setAppConfig({
                                        ...appConfig,
                                        heroGallery: [...(appConfig.heroGallery || []), { url: '', caption: '' }]
                                      })}
                                      className="text-[10px] font-bold text-brand-blue bg-blue-50 dark:bg-slate-800 px-3 py-1 rounded-lg"
                                    >+ Add Slide</button>
                                  </div>
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(appConfig.heroGallery || []).map((slide, sIdx) => (
                                      <div key={sIdx} className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 space-y-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-slate-600">
                                            {slide.url ? <img src={slide.url} className="w-full h-full object-cover" /> : <Image size={20} className="text-gray-300 m-auto" />}
                                          </div>
                                          <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                              <input 
                                                type="file" 
                                                accept="image/*"
                                                className="text-[9px] block w-full text-gray-500 file:mr-2 file:py-0.5 file:px-2 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100 cursor-pointer"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    const b64 = await fileToBase64(file);
                                                    const newHero = [...(appConfig.heroGallery || [])];
                                                    newHero[sIdx].url = b64;
                                                    setAppConfig({...appConfig, heroGallery: newHero});
                                                  }
                                                }}
                                              />
                                              <button 
                                                onClick={() => {
                                                  const newHero = (appConfig.heroGallery || []).filter((_, i) => i !== sIdx);
                                                  setAppConfig({...appConfig, heroGallery: newHero});
                                                }}
                                                className="text-rose-500 p-1"
                                              ><X size={14} /></button>
                                            </div>
                                            <input 
                                              className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-[10px] font-bold"
                                              placeholder="Image Link (optional if uploaded)"
                                              value={slide.url.startsWith('data:') ? '' : slide.url}
                                              onChange={(e) => {
                                                const newHero = [...(appConfig.heroGallery || [])];
                                                newHero[sIdx].url = e.target.value;
                                                setAppConfig({...appConfig, heroGallery: newHero});
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <input 
                                          className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-[10px] font-bold"
                                          placeholder="Slide Caption"
                                          value={slide.caption}
                                          onChange={(e) => {
                                            const newHero = [...(appConfig.heroGallery || [])];
                                            newHero[sIdx].caption = e.target.value;
                                            setAppConfig({...appConfig, heroGallery: newHero});
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <button 
                                  disabled={isConfigSaving}
                                  onClick={async () => {
                                    setIsConfigSaving(true);
                                    setConfigSaveFeedback(null);
                                    try {
                                      const { doc, setDoc } = await import('firebase/firestore');
                                      const { db } = await import('./lib/firebase');
                                      await setDoc(doc(db, 'appConfig', 'main'), appConfig, { merge: true });
                                      setConfigSaveFeedback(lang === 'sw' ? 'Mipangilio imehifadhiwa!' : 'Settings saved!');
                                      setTimeout(() => setConfigSaveFeedback(null), 3000);
                                    } catch (error: any) {
                                      handleFirestoreError(error, OperationType.WRITE, 'appConfig/main');
                                      alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                                    } finally {
                                      setIsConfigSaving(false);
                                    }
                                  }}
                                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isConfigSaving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary'}`}
                                >
                                  {isConfigSaving ? (
                                    <><Loader2 className="animate-spin" size={18} /> {lang === 'sw' ? 'Inahifadhi...' : 'Saving...'}</>
                                  ) : (
                                    configSaveFeedback || (lang === 'sw' ? 'Hifadhi Mipangilio ya Brand' : 'Save Branding Settings')
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="space-y-8">
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

                                <div className="app-card dark:bg-slate-900 border-gray-100 dark:border-slate-800 space-y-6">
                                  <h3 className="font-bold text-brand-blue dark:text-white flex items-center gap-2">
                                    <Sparkles size={18} className="text-brand-gold" /> AI Powered Features
                                  </h3>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                      <div>
                                        <p className="font-bold text-sm dark:text-white">{lang === 'sw' ? 'Washa AI' : 'Enable AI'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Auto-process inquiries & applications</p>
                                      </div>
                                      <button 
                                        onClick={() => setAppConfig({ ...appConfig, aiEnabled: !appConfig.aiEnabled })}
                                        className={`w-12 h-6 rounded-full transition-all relative ${appConfig.aiEnabled ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-slate-700'}`}
                                      >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${appConfig.aiEnabled ? 'right-1' : 'left-1'}`} />
                                      </button>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Gemini API Key</label>
                                      <input 
                                        type="password"
                                        placeholder="Enter your Gemini API key"
                                        className="w-full bg-gray-50 dark:bg-slate-800 rounded-xl p-4 font-bold text-sm dark:text-white"
                                        value={appConfig.geminiApiKey || ''}
                                        onChange={(e) => setAppConfig({ ...appConfig, geminiApiKey: e.target.value })}
                                      />
                                      <p className="mt-2 text-[10px] text-gray-400 italic">Leaves empty to use system default key</p>
                                    </div>

                                    <button 
                                      disabled={isConfigSaving}
                                      onClick={async () => {
                                        setIsConfigSaving(true);
                                        setConfigSaveFeedback(null);
                                        try {
                                          const { doc, setDoc } = await import('firebase/firestore');
                                          const { db } = await import('./lib/firebase');
                                          await setDoc(doc(db, 'appConfig', 'main'), appConfig, { merge: true });
                                          setConfigSaveFeedback(lang === 'sw' ? 'Mipangilio ya AI imehifadhiwa!' : 'AI Settings saved!');
                                          setTimeout(() => setConfigSaveFeedback(null), 3000);
                                        } catch (error: any) {
                                          handleFirestoreError(error, OperationType.WRITE, 'appConfig/main');
                                          alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                                        } finally {
                                          setIsConfigSaving(false);
                                        }
                                      }}
                                      className={`w-full py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isConfigSaving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-primary shadow-brand-gold/10'}`}
                                    >
                                      {isConfigSaving ? (
                                        <><Loader2 className="animate-spin" size={18} /> {lang === 'sw' ? 'Inahifadhi...' : 'Saving...'}</>
                                      ) : (
                                        configSaveFeedback || (lang === 'sw' ? 'Hifadhi Mipangilio ya AI' : 'Save AI Settings')
                                      )}
                                    </button>
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
                                      {Array.isArray(v) ? (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {v.map((item, idx) => (
                                            <div key={idx}>
                                              {item.type === 'file' ? (
                                                <a href={item.data} download={item.name || `file_${idx}`} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-brand-blue border border-gray-100">
                                                  <Paperclip size={12} /> <span className="max-w-[80px] truncate">{item.name || 'File'}</span>
                                                </a>
                                              ) : (
                                                <a href={item.data} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg text-brand-blue border border-blue-100">
                                                  <LinkIcon size={12} /> <span className="max-w-[80px] truncate">Link</span>
                                                </a>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : typeof v === 'object' ? (
                                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg">
                                          {Object.entries(v || {}).map(([subK, subV]: [any, any]) => (
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
                            <div 
                              onClick={() => setSelectedAdminUser(u)}
                              className="flex items-start gap-4 mb-6 relative z-10 cursor-pointer hover:opacity-80 transition-opacity"
                            >
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
                            <div className="grid grid-cols-3 gap-2 relative z-10">
                               <button 
                                 onClick={() => {
                                   setAdminTab('notifs');
                                   setBroadcastMessage({ ...broadcastMessage, userId: u.id });
                                 }}
                                 className="py-2.5 bg-brand-blue/5 text-brand-blue text-[10px] font-black uppercase rounded-xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <Bell size={12} />
                               </button>
                               <button 
                                 onClick={async () => {
                                   const { doc, updateDoc } = await import('firebase/firestore');
                                   const { db } = await import('./lib/firebase');
                                   await updateDoc(doc(db, 'users', u.id), { isBlocked: !u.isBlocked });
                                 }}
                                 className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                               >
                                 {u.isBlocked ? 'Un' : <Lock size={12} />}
                               </button>
                               <button 
                                 onClick={() => setIsDeletingUser(u)}
                                 className="py-2.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                               >
                                 <Trash2 size={12} />
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
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Icon / Primary Image</label>
                                 <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit mb-2">
                                   {(['emoji', 'url', 'lucide'] as const).map(type => (
                                     <button 
                                       key={type}
                                       type="button"
                                       onClick={() => setEditingProduct({...editingProduct, iconType: type})}
                                       className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all capitalize ${editingProduct.iconType === type ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                                     >{type}</button>
                                   ))}
                                 </div>
                                 
                                 {editingProduct.iconType === 'url' ? (
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-700">
                                        {editingProduct.icon ? <img src={editingProduct.icon} className="w-full h-full object-cover" /> : <Paperclip className="text-gray-300" />}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                         <input 
                                           type="file" 
                                           accept="image/*"
                                           className="text-[10px] block w-full text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-brand-blue hover:file:bg-blue-100 cursor-pointer"
                                           onChange={async (e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               const b64 = await fileToBase64(file);
                                               setEditingProduct({...editingProduct, icon: b64});
                                             }
                                           }}
                                         />
                                         <input 
                                           className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl p-3 text-xs font-bold" 
                                           placeholder="Or paste link here..."
                                           value={editingProduct.icon.startsWith('data:') ? '' : editingProduct.icon}
                                           onChange={(e) => setEditingProduct({...editingProduct, icon: e.target.value})}
                                         />
                                      </div>
                                   </div>
                                 ) : (
                                   <input 
                                     className="w-full bg-gray-50 dark:bg-slate-900 border-none rounded-xl p-4 font-bold text-sm" 
                                     value={editingProduct.icon}
                                     onChange={(e) => setEditingProduct({...editingProduct, icon: e.target.value})}
                                     placeholder={editingProduct.iconType === 'emoji' ? "Paste emoji" : "Lucide icon name (e.g. Home)"}
                                   />
                                 )}
                               </div>
                             </div>

                             <div className="space-y-4">
                               <div className="flex items-center justify-between">
                                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Product Gallery (Images/Links)</label>
                                 <button 
                                   onClick={() => setEditingProduct({
                                     ...editingProduct, 
                                     gallery: [...(editingProduct.gallery || []), { type: 'link', data: '' }]
                                   })}
                                   className="text-[10px] font-bold text-brand-blue bg-blue-50 px-3 py-1 rounded-lg border border-blue-100"
                                 >+ Add To Gallery</button>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                 {(editingProduct.gallery || []).map((item, gIdx) => (
                                   <div key={gIdx} className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 space-y-2">
                                     <div className="flex items-center justify-between">
                                        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg">
                                          <button 
                                            onClick={() => {
                                              const newGallery = [...(editingProduct.gallery || [])];
                                              newGallery[gIdx].type = 'file';
                                              setEditingProduct({...editingProduct, gallery: newGallery});
                                            }}
                                            className={`px-2 py-1 rounded-md text-[9px] font-bold ${item.type === 'file' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                                          >File</button>
                                          <button 
                                            onClick={() => {
                                              const newGallery = [...(editingProduct.gallery || [])];
                                              newGallery[gIdx].type = 'link';
                                              setEditingProduct({...editingProduct, gallery: newGallery});
                                            }}
                                            className={`px-2 py-1 rounded-md text-[9px] font-bold ${item.type === 'link' ? 'bg-brand-blue text-white' : 'text-gray-400'}`}
                                          >Link</button>
                                        </div>
                                        <button 
                                          onClick={() => {
                                            const newGallery = (editingProduct.gallery || []).filter((_, i) => i !== gIdx);
                                            setEditingProduct({...editingProduct, gallery: newGallery});
                                          }}
                                          className="text-rose-500 hover:bg-rose-50 p-1 rounded"
                                        ><X size={12} /></button>
                                     </div>
                                     
                                     {item.type === 'file' ? (
                                       <div className="relative group">
                                         <input 
                                           type="file" 
                                           accept="image/*"
                                           className="absolute inset-0 opacity-0 cursor-pointer z-10 h-10 w-full"
                                           onChange={async (e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                               const b64 = await fileToBase64(file);
                                               const newGallery = [...(editingProduct.gallery || [])];
                                               newGallery[gIdx].data = b64;
                                               newGallery[gIdx].name = file.name;
                                               setEditingProduct({...editingProduct, gallery: newGallery});
                                             }
                                           }}
                                         />
                                         <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-lg text-gray-400 overflow-hidden h-10">
                                            {item.data ? <img src={item.data} className="h-full w-full object-cover rounded" /> : <Paperclip size={12} />}
                                            <span className="text-[10px] truncate">{item.name || 'Upload Image'}</span>
                                         </div>
                                       </div>
                                     ) : (
                                       <input 
                                         className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2 text-[10px] font-bold" 
                                         placeholder="Image URL"
                                         value={item.data}
                                         onChange={(e) => {
                                           const newGallery = [...(editingProduct.gallery || [])];
                                           newGallery[gIdx].data = e.target.value;
                                           setEditingProduct({...editingProduct, gallery: newGallery});
                                         }}
                                       />
                                     )}
                                   </div>
                                 ))}
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
                                      {(field.type === 'file' || field.type === 'image') && (
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-brand-blue select-none">
                                          <input 
                                            type="checkbox" 
                                            checked={field.multiple}
                                            onChange={(e) => {
                                              const newFields = [...editingProduct.formFields];
                                              newFields[idx].multiple = e.target.checked;
                                              setEditingProduct({...editingProduct, formFields: newFields});
                                            }}
                                          /> Multiple Items
                                        </label>
                                      )}
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
                              TSh {Number(loan.amount || 0).toLocaleString()}
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

      {/* Global Modals */}
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
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group mb-2">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-50 dark:border-slate-800 bg-gray-100 shadow-inner flex items-center justify-center">
                      <img 
                        src={editForm.photoURL || `https://i.pravatar.cc/100?u=${user?.uid}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Camera size={14} className="text-brand-blue" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({ ...editForm, photoURL: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="w-full">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">{lang === 'sw' ? 'Picha Link (URL)' : 'Photo Link (URL)'}</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/picha.jpg"
                      className="app-input w-full text-[10px]"
                      value={editForm.photoURL}
                      onChange={e => setEditForm({ ...editForm, photoURL: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{lang === 'sw' ? 'Jina Kamili' : 'Full Name'}</label>
                  <input 
                    type="text" 
                    className="app-input w-full"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{lang === 'sw' ? 'Jinsia' : 'Gender'}</label>
                    <select 
                      className="app-input w-full"
                      value={editForm.gender}
                      onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="">{lang === 'sw' ? 'Chagua' : 'Select'}</option>
                      <option value="male">{lang === 'sw' ? 'Mwanaume' : 'Male'}</option>
                      <option value="female">{lang === 'sw' ? 'Mwanamke' : 'Female'}</option>
                      <option value="other">{lang === 'sw' ? 'N.k' : 'Other'}</option>
                    </select>
                  </div>
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
                        await setDoc(doc(db, 'users', user!.uid), {
                          phone: editForm.phone,
                          fullName: editForm.fullName,
                          gender: editForm.gender,
                          photoURL: editForm.photoURL,
                          updatedAt: new Date().toISOString()
                        }, { merge: true });
                        
                        setProfileData({ 
                          ...profileData, 
                          phone: editForm.phone, 
                          fullName: editForm.fullName,
                          gender: editForm.gender,
                          photoURL: editForm.photoURL
                        });
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

        {selectedAdminUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-brand-blue/20 backdrop-blur-md" onClick={() => setSelectedAdminUser(null)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 border border-gray-100 dark:border-slate-800 flex flex-col h-[90vh] md:max-h-[85vh] overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative shrink-0">
                      <img 
                        src={selectedAdminUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed='+selectedAdminUser.id} 
                        className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] object-cover ring-4 ring-brand-blue/5 shadow-xl" 
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg ${selectedAdminUser.isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                        {selectedAdminUser.isBlocked ? <Lock size={12} className="text-white" /> : <CheckCircle size={12} className="text-white" />}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-xl md:text-3xl font-display font-medium text-brand-blue dark:text-white truncate">
                          {selectedAdminUser.fullName || 'Anonymous User'}
                        </h3>
                        {selectedAdminUser.isAdmin && <span className="bg-brand-gold/10 text-brand-gold text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0">Admin</span>}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 font-bold truncate">
                          <Mail size={12} className="text-brand-blue/40" /> {selectedAdminUser.email}
                        </span>
                        <span className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 font-bold">
                          <Smartphone size={12} className="text-brand-blue/40" /> {selectedAdminUser.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAdminUser(null)} className="p-3 md:p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-400 hover:text-rose-500 transition-all">
                    <X size={20} md:size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {showingChat ? (
                  <div className="p-4 md:p-8">
                    <SupportChat lang={lang} user={user} isAdmin={true} targetUserId={selectedAdminUser.id} />
                  </div>
                ) : (
                  <div className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {(() => {
                        const userApps = applications.filter(a => a.userId === selectedAdminUser.id);
                        const totalBorrowed = userApps.filter(a => a.status === 'Approved' || a.status === 'Disbursed').reduce((acc, a) => acc + (a.amount || 0), 0);
                        const activeLoansCount = userApps.filter(a => a.status === 'Approved' || a.status === 'Disbursed').length;
                        return (
                          <>
                            <div className="p-5 md:p-6 bg-white dark:bg-slate-800/50 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                              <p className="text-[9px] text-gray-400 font-black tracking-[0.2em] uppercase mb-2">Total Borrowed</p>
                              <p className="text-xl md:text-2xl font-bold font-display text-brand-blue dark:text-white">TSh {totalBorrowed.toLocaleString()}</p>
                            </div>
                            <div className="p-5 md:p-6 bg-amber-50/50 dark:bg-amber-500/10 rounded-[2rem] md:rounded-[2.5rem] border border-amber-100/50 dark:border-amber-500/10 shadow-sm">
                              <p className="text-[9px] text-amber-600/60 font-black tracking-[0.2em] uppercase mb-2">Current Balance</p>
                              <p className="text-xl md:text-2xl font-bold font-display text-amber-600">TSh {totalBorrowed.toLocaleString()}</p>
                            </div>
                            <div className="p-5 md:p-6 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100/50 dark:border-emerald-500/10 shadow-sm">
                              <p className="text-[9px] text-emerald-600/60 font-black tracking-[0.2em] uppercase mb-2">Active Loans</p>
                              <p className="text-xl md:text-2xl font-bold font-display text-emerald-600">{activeLoansCount}</p>
                            </div>
                            <div className="p-5 md:p-6 bg-brand-blue/5 rounded-[2rem] md:rounded-[2.5rem] border border-brand-blue/10 dark:border-brand-blue/20 shadow-sm">
                              <p className="text-[9px] text-brand-blue/60 font-black tracking-[0.2em] uppercase mb-2">{lang === 'sw' ? 'Marejesho' : 'Repayment'}</p>
                              <p className="text-sm md:text-base font-bold font-display text-brand-blue dark:text-white">
                                {userApps.length > 0 
                                  ? new Date(new Date(userApps[0].timestamp).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-brand-gold rounded-full" />
                          <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">{lang === 'sw' ? 'Historia ya Mikopo' : 'Loan History'}</h4>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {applications.filter(a => a.userId === selectedAdminUser.id).length > 0 ? (
                          applications.filter(a => a.userId === selectedAdminUser.id).map(loan => (
                            <div key={loan.id} className="p-5 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-gray-100 dark:border-white/5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                  loan.status === 'Approved' || loan.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 
                                  loan.status === 'Rejected' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10'
                                }`}>
                                  <Building2 size={24} />
                                </div>
                                <div>
                                  <p className="font-bold text-brand-blue dark:text-white text-base capitalize">{loan.loanType || 'General Loan'}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(loan.timestamp).toLocaleDateString('en-GB')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-brand-blue dark:text-white text-base">TSh {(loan.amount || 0).toLocaleString()}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 ${
                                  loan.status === 'Approved' || loan.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 
                                  loan.status === 'Rejected' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/10' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10'
                                }`}>{loan.status}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                              <History size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">{lang === 'sw' ? 'Hakuna mikopo kwa mteja huyu' : 'No loans found for this user'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-8 bg-gray-50/50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
                <button 
                  onClick={() => {
                    setAdminTab('notifs');
                    setBroadcastMessage({ ...broadcastMessage, userId: selectedAdminUser.id });
                    setSelectedAdminUser(null);
                  }}
                  className="py-3 md:py-5 px-3 md:px-4 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-800 text-brand-blue dark:text-white font-bold text-[9px] md:text-[11px] uppercase tracking-widest shadow-sm hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center gap-2 md:gap-3 border border-transparent hover:border-brand-blue/10"
                >
                  <Bell size={18} md:size={22} className="text-brand-blue/30" /> {lang === 'sw' ? 'Taarifa' : 'Notify'}
                </button>
                <button 
                  onClick={() => setShowingChat(!showingChat)}
                  className={`py-3 md:py-5 px-3 md:px-4 rounded-[1.5rem] md:rounded-[2.5rem] font-bold text-[9px] md:text-[11px] uppercase tracking-widest shadow-sm hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center gap-2 md:gap-3 border border-transparent ${showingChat ? 'bg-brand-gold text-brand-blue border-brand-gold/20' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-white'}`}
                >
                  <MessagesSquare size={18} md:size={22} className={showingChat ? 'text-brand-blue/60' : 'text-brand-gold'} /> {lang === 'sw' ? 'Chat' : 'Chat'}
                </button>
                <button 
                  onClick={() => downloadPDFStatement(selectedAdminUser, applications.filter(a => a.userId === selectedAdminUser.id), lang, appConfig)}
                  className="py-3 md:py-5 px-3 md:px-4 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-800 text-emerald-600 font-bold text-[9px] md:text-[11px] uppercase tracking-widest shadow-sm hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center gap-2 md:gap-3 border border-transparent hover:border-emerald-500/10"
                >
                  <Download size={18} md:size={22} className="text-emerald-500/30" /> {lang === 'sw' ? 'Resiti' : 'Receipt'}
                </button>
                <button 
                  onClick={async () => {
                    const confirmAction = window.confirm(selectedAdminUser.isBlocked ? 'Unblock user?' : 'Block user?');
                    if (!confirmAction) return;
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const { db } = await import('./lib/firebase');
                    await updateDoc(doc(db, 'users', selectedAdminUser.id), { isBlocked: !selectedAdminUser.isBlocked });
                    setSelectedAdminUser({ ...selectedAdminUser, isBlocked: !selectedAdminUser.isBlocked });
                  }}
                  className={`py-3 md:py-4 rounded-[1.5rem] md:rounded-3xl font-bold text-[9px] md:text-xs shadow-sm hover:translate-y-[-2px] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedAdminUser.isBlocked ? 'bg-amber-500 text-white' : 'bg-white dark:bg-slate-800 text-rose-500'
                  }`}
                >
                  <Lock size={18} md:size={20} className={selectedAdminUser.isBlocked ? 'text-white/60' : 'text-rose-500/40'} /> {selectedAdminUser.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>

              <AnimatePresence>
                {showingChat && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-100 dark:border-slate-800"
                  >
                    <div className="p-8">
                      <SupportChat lang={lang} user={user} isAdmin={true} targetUserId={selectedAdminUser.id} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {isDeletingUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-sm" onClick={() => setIsDeletingUser(null)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-rose-100"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 text-center">
                {lang === 'sw' ? 'Futa Mtumiaji?' : 'Delete User?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
                {lang === 'sw' 
                  ? `Je, una uhakika unataka kumfuta ${isDeletingUser.fullName}? Taarifa zake zote zitafutwa.` 
                  : `Are you sure you want to delete ${isDeletingUser.fullName}? All their data will be removed.`}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeletingUser(null)}
                  className="flex-1 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 font-bold text-sm text-gray-400"
                >
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const { deleteDoc, doc } = await import('firebase/firestore');
                      const { db } = await import('./lib/firebase');
                      await deleteDoc(doc(db, 'users', isDeletingUser.id));
                      setIsDeletingUser(null);
                      alert(lang === 'sw' ? 'Mtumiaji amefutwa.' : 'User deleted successfully.');
                    } catch (error: any) {
                      alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30"
                >
                  {lang === 'sw' ? 'Futa' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isDeletingAccount && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-rose-500/10 backdrop-blur-sm" onClick={() => setIsDeletingAccount(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-rose-100"
            >
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 text-center">
                {lang === 'sw' ? 'Futa Akaunti yako?' : 'Delete your account?'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
                {lang === 'sw' 
                  ? 'Kitendo hiki hakiwezi kubatilishwa. Taarifa zako zote na maombi ya mkopo yatafutwa kabisa.' 
                  : 'This action cannot be undone. All your data and loan applications will be permanently deleted.'}
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsDeletingAccount(false)}
                  className="flex-1 py-4 rounded-2xl border border-gray-100 dark:border-slate-800 font-bold text-sm text-gray-400"
                >
                  {lang === 'sw' ? 'Hapana, Ghairi' : 'No, Cancel'}
                </button>
                <button 
                  onClick={async () => {
                    try {
                      const { deleteDoc, doc } = await import('firebase/firestore');
                      const { deleteUser } = await import('firebase/auth');
                      const { db, auth } = await import('./lib/firebase');
                      
                      if (auth.currentUser) {
                        const uid = auth.currentUser.uid;
                        // 1. Delete Firestore Data
                        await deleteDoc(doc(db, 'users', uid));
                        // 2. Delete Auth Account
                        await deleteUser(auth.currentUser);
                        
                        setUser(null);
                        setProfileData(null);
                        setIsDeletingAccount(false);
                        setActiveView('home');
                        alert(lang === 'sw' ? 'Akaunti imefutwa kikamilifu.' : 'Account deleted successfully.');
                      }
                    } catch (error: any) {
                      if (error.code === 'auth/requires-recent-login') {
                        alert(lang === 'sw' 
                          ? 'Tafadhali ingia tena na ujaribu kufuta akaunti mara moja kwa sababu za kiusalama.' 
                          : 'Please login again and try deleting your account immediately for security reasons.');
                        import('./lib/firebase').then(({ auth }) => auth.signOut());
                        setUser(null);
                        setProfileData(null);
                        setIsDeletingAccount(false);
                      } else {
                        alert(lang === 'sw' ? 'Hitilafu: ' + error.message : 'Error: ' + error.message);
                      }
                    }
                  }}
                  className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-xl shadow-rose-600/30"
                >
                  {lang === 'sw' ? 'Ndio, Futa' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer lang={lang} appConfig={appConfig} user={user} setActiveView={setActiveView} />

      {/* AI Assistant */}
      <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[60]">
        <AnimatePresence>
          {repayingLoan && (
            <RepaymentModal 
              lang={lang} 
              loan={repayingLoan} 
              onClose={() => setRepayingLoan(null)} 
            />
          )}

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

        {appConfig.aiEnabled && (
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
        )}
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
            
            <button onClick={() => setActiveView(user ? 'profile' : 'auth')} className={`flex flex-col items-center transition-all duration-300 relative z-10 ${activeView === 'profile' || activeView === 'auth' ? 'scale-110 text-brand-gold' : 'opacity-50 hover:opacity-100'}`}>
               <User size={22} strokeWidth={activeView === 'profile' || activeView === 'auth' ? 2.5 : 2} />
               <span className="text-[7px] font-black mt-1.5 uppercase tracking-[0.2em]">{lang === 'sw' ? 'Akaunti' : 'Akaunti'}</span>
               {(activeView === 'profile' || activeView === 'auth') && <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_#D4AF37]" />}
            </button>
         </div>
      </div>
    </div>
  );
}
