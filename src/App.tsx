// Force rebuild to clear any potential cache
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  QrCode, 
  GraduationCap, 
  LayoutDashboard, 
  Upload, 
  Download, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Camera,
  Trash2,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  UserPlus,
  Sun,
  Moon,
  Languages,
  Check,
  BookOpen,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { Student, AttendanceSession, Module } from './types';
import { auth, db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';

// --- Translations ---

const translations = {
  en: {
    overview: 'Overview',
    students: 'Students',
    attendance: 'Attendance',
    performance: 'Performance',
    totalStudents: 'Total Students',
    totalSessions: 'Total Sessions',
    attendanceRate: 'Attendance Rate',
    groups: 'Groups',
    gradeDistribution: 'Grade Distribution',
    recentActivity: 'Recent Activity',
    searchPlaceholder: 'Search by name, group, or ID...',
    importExcel: 'Import Excel',
    addStudent: 'Add Student',
    idRef: 'ID Reference',
    fullName: 'Full Name',
    group: 'Group',
    actions: 'Actions',
    generateQR: 'Generate Session QR',
    startSession: 'Initialize Session',
    finalizeSession: 'Finalize Session',
    discard: 'Discard',
    presentNow: 'Present Now',
    checkIn: 'Check-in',
    studentId: 'Student ID',
    enterId: 'Enter your Student ID',
    fullNameLabel: 'Full Name',
    classLabel: 'Class / Group',
    enterFullName: 'Enter your full name',
    enterClass: 'Enter your class (e.g. DEV101)',
    submit: 'Submit Presence',
    success: 'Success!',
    alreadyMarked: 'Already marked present',
    studentNotFound: 'Student not found',
    notInGroup: 'Not in this group',
    welcome: 'Welcome to eNote',
    scanToJoin: 'Scan to join the session',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    academicTerm: 'Academic Term 2025/26',
    managementConsole: 'Management Console v2.0',
    digitalFaculty: 'Digital Faculty',
    leadInstructor: 'Lead Instructor',
    efmPerformance: 'EFM Performance',
    viewAll: 'View All',
    noSessions: 'No sessions recorded yet',
    present: 'Present',
    attendanceLogged: 'Attendance Logged',
    waitingForScans: 'Waiting for scans...',
    exportGrades: 'Export Grade Sheet',
    studentIdentity: 'Student Identity',
    finalAverage: 'Final Average',
    ccGrade: 'CC (/20)',
    efmGrade: 'EFM (/20)',
    modules: 'Modules',
    addModule: 'Add Module',
    moduleName: 'Module Name',
    coursHours: 'Cours (h)',
    tpHours: 'TP (h)',
    tdHours: 'TD (h)',
    totalHours: 'Total',
    evaluationHours: 'Evaluation (h)',
    enterModuleName: 'Enter module name',
    saveModule: 'Save Module',
    deleteModule: 'Delete Module',
    sessionExpires: 'Session expires in',
    sessionExpired: 'This session has expired',
    invalidGrade: 'Grade must be between 0 and 20',
    login: 'Login with Google',
    logout: 'Logout',
    accessDenied: 'Access Denied',
    onlyInstructor: 'Only the lead instructor can access this console.',
    minutes: 'm',
    seconds: 's'
  },
  fr: {
    overview: 'Aperçu',
    students: 'Étudiants',
    attendance: 'Présence',
    performance: 'Performance',
    totalStudents: 'Total Étudiants',
    totalSessions: 'Total Sessions',
    attendanceRate: 'Taux de Présence',
    groups: 'Groupes',
    gradeDistribution: 'Répartition des Notes',
    recentActivity: 'Activité Récente',
    searchPlaceholder: 'Rechercher par nom, groupe ou ID...',
    importExcel: 'Importer Excel',
    addStudent: 'Ajouter Étudiant',
    idRef: 'Référence ID',
    fullName: 'Nom Complet',
    group: 'Groupe',
    actions: 'Actions',
    generateQR: 'Générer QR de Session',
    startSession: 'Initialiser Session',
    finalizeSession: 'Finaliser Session',
    discard: 'Annuler',
    presentNow: 'Présents Maintenant',
    checkIn: 'Pointer',
    studentId: 'ID Étudiant',
    enterId: 'Entrez votre ID Étudiant',
    fullNameLabel: 'Nom Complet',
    classLabel: 'Classe / Groupe',
    enterFullName: 'Entrez votre nom complet',
    enterClass: 'Entrez votre classe (ex: DEV101)',
    submit: 'Valider la Présence',
    success: 'Succès !',
    alreadyMarked: 'Déjà marqué présent',
    studentNotFound: 'Étudiant non trouvé',
    notInGroup: 'Pas dans ce groupe',
    welcome: 'Bienvenue sur eNote',
    scanToJoin: 'Scannez pour rejoindre la session',
    language: 'Langue',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    academicTerm: 'Année Académique 2025/26',
    managementConsole: 'Console de Gestion v2.0',
    digitalFaculty: 'Faculté Digitale',
    leadInstructor: 'Instructeur Principal',
    efmPerformance: 'Performance EFM',
    viewAll: 'Voir Tout',
    noSessions: 'Aucune session enregistrée',
    present: 'Présent',
    attendanceLogged: 'Présence Enregistrée',
    waitingForScans: 'En attente de scans...',
    exportGrades: 'Exporter les Notes',
    studentIdentity: 'Identité de l\'Étudiant',
    finalAverage: 'Moyenne Finale',
    ccGrade: 'CC (/20)',
    efmGrade: 'EFM (/20)',
    modules: 'Modules',
    addModule: 'Ajouter Module',
    moduleName: 'Nom du Module',
    coursHours: 'Cours (h)',
    tpHours: 'TP (h)',
    tdHours: 'TD (h)',
    totalHours: 'Total',
    evaluationHours: 'Évaluation (h)',
    enterModuleName: 'Entrez le nom du module',
    saveModule: 'Enregistrer Module',
    deleteModule: 'Supprimer Module',
    sessionExpires: 'La session expire dans',
    sessionExpired: 'Cette session a expiré',
    invalidGrade: 'La note doit être comprise entre 0 et 20',
    login: 'Se connecter avec Google',
    logout: 'Se déconnecter',
    accessDenied: 'Accès Refusé',
    onlyInstructor: 'Seul l\'instructeur principal peut accéder à cette console.',
    minutes: 'm',
    seconds: 's'
  }
};

// --- Components ---

const CheckInPage = ({ t }: { t: any }) => {
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<AttendanceSession | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId');

  useEffect(() => {
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId);
      const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as AttendanceSession;
          setSession(data);
          if (data.expiresAt && new Date() > new Date(data.expiresAt)) {
            setStatus('error');
            setMessage(t.sessionExpired);
          }
        } else {
          setStatus('error');
          setMessage('Session not found');
        }
      }, (error) => {
        console.error("Firestore Error:", error);
        setStatus('error');
        setMessage('Error loading session');
      });
      return () => unsubscribe();
    }
  }, [sessionId, t.sessionExpired]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !sessionId || !session) return;
    
    if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
      setStatus('error');
      setMessage(t.sessionExpired);
      return;
    }

    if (session.isFinalized) {
      setStatus('error');
      setMessage(t.finalizeSession);
      return;
    }

    setStatus('loading');

    try {
      // Find student by name within the session's group
      const studentsRef = collection(db, 'students');
      const q = query(
        studentsRef, 
        where('name', '==', fullName),
        where('group', '==', session.group)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus('error');
        setMessage(t.studentNotFound);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;

      if (session.presentStudents.includes(studentId)) {
        setStatus('success');
        setMessage(t.alreadyMarked);
        return;
      }

      // Update session with new present student
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        presentStudents: [...session.presentStudents, studentId]
      });

      setStatus('success');
      setMessage(t.attendanceLogged);
    } catch (err) {
      console.error('Check-in error:', err);
      setStatus('error');
      setMessage('An error occurred during check-in');
    }
  };

  return (
    <div className="min-h-screen bg-app-main flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-app-card border border-app-main p-10 rounded-[2.5rem] shadow-2xl space-y-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto text-emerald-500">
          <QrCode className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-app-strong">{t.checkIn}</h1>
          <p className="text-app-muted text-sm">{t.welcome}</p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="py-10 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-black">
              <Check className="w-8 h-8" />
            </div>
            <p className="text-emerald-500 font-bold text-xl">{message}</p>
            <p className="text-app-dim text-xs uppercase tracking-widest">You can close this tab now</p>
          </motion.div>
        ) : (
          <form onSubmit={handleCheckIn} className="space-y-6">
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.fullNameLabel}</label>
                <input 
                  type="text" 
                  placeholder={t.enterFullName}
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {status === 'error' && (
              <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{message}</p>
            )}

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50"
            >
              {status === 'loading' ? '...' : t.submit}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

const ModuleManagement = ({ modules, setModules, t, theme }: { modules: Module[], setModules: any, t: any, theme: string }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', cours: 0, tp: 0, td: 0, evaluation: 0 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const module: Module = {
      id,
      ...newModule
    };
    try {
      await setDoc(doc(db, 'modules', id), module);
      setNewModule({ name: '', cours: 0, tp: 0, td: 0, evaluation: 0 });
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding module:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'modules', id));
    } catch (err) {
      console.error('Error deleting module:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-app-strong">{t.modules}</h2>
          <p className="text-app-muted text-xs font-bold uppercase tracking-widest">Manage academic workload</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full md:w-auto px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-emerald-500/20 uppercase tracking-widest text-xs"
        >
          <Plus className="w-5 h-5" />
          {t.addModule}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-app-card border border-app-main p-10 rounded-[2.5rem] shadow-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.moduleName}</label>
                <input 
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  placeholder={t.enterModuleName}
                  value={newModule.name}
                  onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.coursHours}</label>
                <input 
                  type="number"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  value={newModule.cours}
                  onChange={(e) => setNewModule({...newModule, cours: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.tpHours}</label>
                <input 
                  type="number"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  value={newModule.tp}
                  onChange={(e) => setNewModule({...newModule, tp: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.tdHours}</label>
                <input 
                  type="number"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  value={newModule.td}
                  onChange={(e) => setNewModule({...newModule, td: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-app-dim ml-2">{t.evaluationHours || 'Evaluation'}</label>
                <input 
                  type="number"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 font-medium text-sm text-app-strong"
                  value={newModule.evaluation}
                  onChange={(e) => setNewModule({...newModule, evaluation: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="lg:col-span-5 flex gap-4 pt-4">
                <button type="submit" className="px-10 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs">{t.saveModule}</button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-10 py-4 bg-white/5 border border-app-main font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">{t.discard}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-app-card border border-app-main rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-app-main">
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.moduleName}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.coursHours}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.tpHours}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.tdHours}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.evaluationHours || 'Evaluation'}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.totalHours}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-main">
              {modules.map((module) => (
                <tr key={module.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-app-strong">{module.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-sm text-app-muted">{module.cours}h</td>
                  <td className="px-8 py-6 font-mono text-sm text-app-muted">{module.tp}h</td>
                  <td className="px-8 py-6 font-mono text-sm text-app-muted">{module.td}h</td>
                  <td className="px-8 py-6 font-mono text-sm text-app-muted">{module.evaluation}h</td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl font-black text-xs">
                      {module.cours + module.tp + module.td + module.evaluation}h
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleDelete(module.id)}
                      className="p-3 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ students, sessions, t, theme }: { students: Student[], sessions: AttendanceSession[], t: any, theme: string }) => {
  const totalStudents = students.length;
  const totalSessions = sessions.length;
  
  const attendanceRate = totalStudents > 0 && totalSessions > 0 
    ? Math.round((sessions.reduce((acc, s) => acc + s.presentStudents.length, 0) / (totalStudents * totalSessions)) * 100)
    : 0;

  const gradeDistribution = [
    { name: 'Pass', value: students.filter(s => (s.grades.efm || 0) >= 10).length },
    { name: 'Fail', value: students.filter(s => s.grades.efm !== undefined && (s.grades.efm || 0) < 10).length },
    { name: 'No Grade', value: students.filter(s => s.grades.efm === undefined).length },
  ];

  const COLORS = ['#10b981', '#f43f5e', '#64748b'];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t.totalStudents, value: totalStudents, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: t.totalSessions, value: totalSessions, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: t.attendanceRate, value: `${attendanceRate}%`, icon: CheckCircle2, color: 'text-sky-400', bg: 'bg-sky-400/10' },
          { label: t.groups, value: [...new Set(students.map(s => s.group))].length, icon: LayoutDashboard, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-app-card border border-app-main p-6 rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-500"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] transition-all" />
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            <div className="text-4xl font-bold tracking-tight text-app-strong">{stat.value}</div>
            <div className="text-sm font-medium text-app-muted mt-1 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-app-card border border-app-main p-10 rounded-[2.5rem] shadow-2xl"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold tracking-tight text-app-strong">{t.gradeDistribution}</h3>
            <div className="text-xs font-bold text-app-dim uppercase tracking-widest">{t.efmPerformance}</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#111111' : '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', padding: '12px' }}
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-10 mt-6">
            {gradeDistribution.map((entry, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i], boxShadow: `0 0 10px ${COLORS[i]}44` }} />
                <span className="text-xs font-bold text-app-muted uppercase tracking-wider">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-app-card border border-app-main p-10 rounded-[2.5rem] shadow-2xl"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold tracking-tight text-app-strong">{t.recentActivity}</h3>
            <button className="text-xs font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">{t.viewAll}</button>
          </div>
          <div className="space-y-5">
            {sessions.slice(-5).reverse().map((session, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-all group cursor-default"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-app-strong">{session.group}</div>
                    <div className="text-xs font-medium text-app-muted uppercase tracking-wider">{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm font-bold text-emerald-400">
                    {session.presentStudents.length} {t.present}
                  </div>
                  <div className="text-[10px] text-app-dim uppercase tracking-widest mt-1">{t.attendanceLogged}</div>
                </div>
              </motion.div>
            ))}
            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-app-dim space-y-4">
                <Calendar className="w-16 h-16 opacity-20" />
                <p className="text-sm font-medium uppercase tracking-[0.2em]">{t.noSessions}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StudentList = ({ students, setStudents, t, theme }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, t: any, theme: string }) => {
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      const newStudents: Student[] = data.map((row: any, i) => ({
        id: row.ID?.toString() || row.id?.toString() || `S${Date.now()}${i}`,
        name: row.Name || row.name || row.Nom || 'Unknown',
        group: row.Group || row.group || row.Groupe || 'Default',
        attendance: [],
        grades: {
          cc: row.CC || row.cc || row.Controle || row.controle,
          efm: row.EFM || row.efm || row.Examen || row.examen,
        }
      }));

      try {
        const batch = newStudents.map(s => setDoc(doc(db, 'students', s.id), s));
        await Promise.all(batch);
      } catch (err) {
        console.error('Error importing students:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.group.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-app-dim" />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="w-full pl-14 pr-6 py-4 bg-app-card border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.02] transition-all placeholder:text-app-dim text-sm font-medium text-app-strong"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <label className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl cursor-pointer hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 active:scale-95">
            <Upload className="w-5 h-5" />
            {t.importExcel}
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <button className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/5 font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 text-app-strong">
            <UserPlus className="w-5 h-5" />
            {t.addStudent}
          </button>
        </div>
      </div>

      <div className="bg-app-card border border-app-main rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-app-main">
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.idRef}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.fullName}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.group}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.attendance}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em] text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono text-xs text-emerald-500/60 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                      {student.id}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center font-bold text-app-muted text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-app-strong">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/10">
                      {student.group}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                      <span className="text-sm font-bold text-app-muted">
                        {student.attendance.length} <span className="text-[10px] uppercase tracking-widest text-app-dim ml-1">Sessions</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-app-dim hover:text-app-strong hover:bg-white/5 rounded-xl transition-all">
                        <QrCode className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id)}
                        className="p-2.5 text-app-dim hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                      <Users className="w-16 h-16" />
                      <p className="text-sm font-medium uppercase tracking-[0.2em]">
                        {search ? 'No matches found' : 'No students in database'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AttendanceScanner = ({ students, sessions, setSessions, t, theme }: { students: Student[], sessions: AttendanceSession[], setSessions: React.Dispatch<React.SetStateAction<AttendanceSession[]>>, t: any, theme: string }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<AttendanceSession | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [manualId, setManualId] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const groups = [...new Set(students.map(s => s.group))];

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (isSessionActive && currentSession?.expiresAt) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(currentSession.expiresAt!).getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) {
          clearInterval(timer);
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [isSessionActive, currentSession]);

  // Real-time listener for current session
  useEffect(() => {
    if (isSessionActive && currentSession) {
      const sessionRef = doc(db, 'sessions', currentSession.id);
      const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
        if (docSnap.exists()) {
          setCurrentSession(docSnap.data() as AttendanceSession);
        }
      });
      return () => unsubscribe();
    }
  }, [isSessionActive, currentSession?.id]);

  const startSession = async () => {
    if (!selectedGroup) return alert('Please select a group first');
    const sessionId = `SES-${Date.now()}`;
    const newSession: AttendanceSession = {
      id: sessionId,
      date: new Date().toISOString(),
      group: selectedGroup,
      presentStudents: [],
      isFinalized: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    try {
      await setDoc(doc(db, 'sessions', sessionId), newSession);
      setCurrentSession(newSession);
      setIsSessionActive(true);
    } catch (err) {
      console.error('Error starting session:', err);
      alert('Failed to start session');
    }
  };

  const markPresence = async (studentId: string) => {
    if (!currentSession) return;
    
    // Check if student exists and is in the correct group
    const student = students.find(s => s.id === studentId);
    if (!student) return alert(t.studentNotFound);
    if (student.group !== currentSession.group) return alert(t.notInGroup);
    
    if (currentSession.presentStudents.includes(studentId)) {
      return alert(t.alreadyMarked);
    }

    try {
      const sessionRef = doc(db, 'sessions', currentSession.id);
      await updateDoc(sessionRef, {
        presentStudents: [...currentSession.presentStudents, studentId]
      });
      setManualId('');
    } catch (err) {
      console.error('Check-in error:', err);
      alert('Check-in failed');
    }
  };

  const saveSession = async () => {
    if (currentSession) {
      try {
        const sessionRef = doc(db, 'sessions', currentSession.id);
        await updateDoc(sessionRef, { isFinalized: true });
        setIsSessionActive(false);
        setCurrentSession(null);
        alert('Attendance session finalized and saved!');
      } catch (err) {
        console.error('Error finalizing session:', err);
        alert('Failed to finalize session');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {!isSessionActive ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-app-card border border-app-main p-12 rounded-[3rem] text-center space-y-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
            <QrCode className="w-12 h-12" />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black tracking-tight text-app-strong">{t.generateQR}</h3>
            <p className="text-app-muted max-w-sm mx-auto text-sm leading-relaxed">
              {t.scanToJoin}
            </p>
          </div>
          
          <div className="space-y-6 max-w-sm mx-auto">
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-dim" />
              <select 
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/50 appearance-none font-bold text-sm text-app-strong"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="" className="bg-app-main">{t.groups}</option>
                {groups.map(g => <option key={g} value={g} className="bg-app-main">{g}</option>)}
              </select>
            </div>

            <button 
              onClick={startSession}
              className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-sm"
            >
              <Plus className="w-5 h-5" />
              {t.startSession}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-app-card border border-app-main p-12 rounded-[3rem] text-center space-y-8 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    timeLeft && timeLeft > 0 ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                  <span className={cn(
                    "text-xs font-black uppercase tracking-[0.2em]",
                    timeLeft && timeLeft > 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {timeLeft && timeLeft > 0 ? "Live Session" : "Session Expired"}
                  </span>
                </div>
                <span className="text-xs font-bold text-app-dim uppercase tracking-widest">{selectedGroup}</span>
              </div>

              {timeLeft && timeLeft > 0 ? (
                <div className="bg-white p-10 rounded-[2.5rem] inline-block shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                  <QRCodeSVG 
                    value={`${window.location.origin}${window.location.pathname}?page=check-in&sessionId=${currentSession?.id}&group=${selectedGroup}`} 
                    size={280}
                    level="H"
                  />
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500">
                    <Clock className="w-10 h-10" />
                  </div>
                  <p className="text-rose-500 font-bold uppercase tracking-widest text-sm">{t.sessionExpired}</p>
                </div>
              )}

              <div className="space-y-4">
                {timeLeft !== null && timeLeft > 0 && (
                  <div className="flex items-center justify-center gap-2 text-app-strong font-mono text-xl bg-white/5 py-3 px-6 rounded-2xl w-fit mx-auto">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-lg font-bold text-app-strong">{timeLeft && timeLeft > 0 ? t.scanToJoin : t.sessionExpired}</p>
                  <p className="text-xs text-app-dim uppercase tracking-[0.2em]">Session ID: {currentSession?.id}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex gap-4">
                <button 
                  onClick={saveSession}
                  className="flex-1 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-widest text-xs"
                >
                  {t.finalizeSession}
                </button>
                <button 
                  onClick={() => { setIsSessionActive(false); setCurrentSession(null); }}
                  className="px-8 py-5 bg-white/5 border border-white/5 font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs text-app-strong"
                >
                  {t.discard}
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-app-card border border-app-main p-8 rounded-[2.5rem] space-y-6"
            >
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-app-muted">{t.checkIn} (Simulation)</h4>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder={t.enterId} 
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:border-emerald-500/50 font-mono text-sm text-app-strong"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && markPresence(manualId)}
                />
                <button 
                  onClick={() => markPresence(manualId)}
                  className="px-8 py-4 bg-white/10 text-app-strong font-bold rounded-2xl hover:bg-white/20 transition-all active:scale-95"
                >
                  {t.checkIn}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-2 bg-app-card border border-app-main p-10 rounded-[3rem] space-y-8 shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight text-app-strong">{t.presentNow}</h3>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                  {currentSession?.presentStudents.length || 0}
                </span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
              <AnimatePresence initial={false}>
                {currentSession?.presentStudents.map(id => {
                  const student = students.find(s => s.id === id);
                  return (
                    <motion.div 
                      key={id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-5 bg-white/[0.02] rounded-3xl border border-white/5 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-app-strong">{student?.name}</div>
                          <div className="text-[10px] font-mono text-app-dim uppercase tracking-widest">{id}</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {currentSession?.presentStudents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-app-dim space-y-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 animate-spin-slow flex items-center justify-center">
                    <QrCode className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em]">{t.waitingForScans}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GradeManagement = ({ students, setStudents, t, theme }: { students: Student[], setStudents: React.Dispatch<React.SetStateAction<Student[]>>, t: any, theme: string }) => {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const groups = [...new Set(students.map(s => s.group))];

  const updateGrade = async (studentId: string, field: keyof Student['grades'], value: string) => {
    const errorKey = `${studentId}-${field}`;
    
    if (value === '') {
      setErrors(prev => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
      try {
        const studentRef = doc(db, 'students', studentId);
        const student = students.find(s => s.id === studentId);
        if (student) {
          await updateDoc(studentRef, {
            [`grades.${field}`]: null
          });
        }
      } catch (err) {
        console.error('Error updating grade:', err);
      }
      return;
    }

    const num = parseFloat(value);
    
    if (isNaN(num) || num < 0 || num > 20) {
      setErrors(prev => ({ ...prev, [errorKey]: t.invalidGrade }));
      return;
    }

    setErrors(prev => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });

    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, {
        [`grades.${field}`]: num
      });
    } catch (err) {
      console.error('Error updating grade:', err);
    }
  };

  const filtered = selectedGroup 
    ? students.filter(s => s.group === selectedGroup)
    : students;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-64">
          <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-dim" />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-app-card border border-app-main rounded-2xl focus:outline-none focus:border-emerald-500/50 appearance-none font-bold text-sm text-app-strong"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="" className="bg-app-main">{t.groups}</option>
            {groups.map(g => <option key={g} value={g} className="bg-app-main">{g}</option>)}
          </select>
        </div>
        <button className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/5 font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest text-xs text-app-strong">
          <Download className="w-5 h-5" />
          {t.exportGrades}
        </button>
      </div>

      <div className="bg-app-card border border-app-main rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-app-main">
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.studentIdentity}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.group}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.ccGrade}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.efmGrade}</th>
                <th className="px-8 py-6 text-[10px] font-bold text-app-dim uppercase tracking-[0.2em]">{t.finalAverage}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((student) => {
                const cc = student.grades.cc || 0;
                const efm = student.grades.efm || 0;
                const avg = (cc * 0.4) + (efm * 0.6); // Example weighting: 40% CC, 60% EFM
                
                return (
                  <tr key={student.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500 text-sm">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-app-strong">{student.name}</div>
                          <div className="text-[10px] font-mono text-app-dim uppercase tracking-widest">{student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">{student.group}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative w-24">
                        <input 
                          type="number" 
                          min="0" max="20"
                          step="0.25"
                          className={cn(
                            "w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none font-bold text-sm text-center text-app-strong",
                            errors[`${student.id}-cc`] ? "border-rose-500/50" : "border-white/5 focus:border-emerald-500/50"
                          )}
                          value={student.grades.cc ?? ''}
                          onChange={(e) => updateGrade(student.id, 'cc', e.target.value)}
                        />
                        {errors[`${student.id}-cc`] && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-rose-500 uppercase tracking-widest">
                            {errors[`${student.id}-cc`]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative w-24">
                        <input 
                          type="number" 
                          min="0" max="20"
                          step="0.25"
                          className={cn(
                            "w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none font-bold text-sm text-center text-app-strong",
                            errors[`${student.id}-efm`] ? "border-rose-500/50" : "border-white/5 focus:border-emerald-500/50"
                          )}
                          value={student.grades.efm ?? ''}
                          onChange={(e) => updateGrade(student.id, 'efm', e.target.value)}
                        />
                        {errors[`${student.id}-efm`] && (
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-rose-500 uppercase tracking-widest">
                            {errors[`${student.id}-efm`]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg",
                          avg >= 10 ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5" : "bg-rose-500/10 text-rose-500 shadow-rose-500/5"
                        )}>
                          {avg.toFixed(1)}
                        </div>
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            avg >= 10 ? "text-emerald-500/50" : "text-rose-500/50"
                          )}>
                            {avg >= 10 ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center opacity-20">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-sm font-medium uppercase tracking-[0.2em]">No performance data available</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'attendance' | 'grades' | 'modules'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('ofppt_theme') as any) || 'dark');
  const [lang, setLang] = useState<'en' | 'fr'>(() => (localStorage.getItem('ofppt_lang') as any) || 'en');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    // Real-time listeners
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceSession)));
    }, (error) => {
      console.error("Sessions listener error:", error);
    });

    let unsubStudents = () => {};
    let unsubModules = () => {};

    // Only listen to students and modules if user is the instructor
    if (user && user.email === 'ilyaspay0@gmail.com') {
      unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
        setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
      }, (error) => {
        console.error("Students listener error:", error);
      });

      unsubModules = onSnapshot(collection(db, 'modules'), (snapshot) => {
        setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Module)));
        setIsLoading(false);
      }, (error) => {
        console.error("Modules listener error:", error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      unsubStudents();
      unsubSessions();
      unsubModules();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('ofppt_theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ofppt_lang', lang);
  }, [lang]);

  // Simple routing for check-in page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('page') === 'check-in' || window.location.pathname === '/check-in') {
    return <CheckInPage t={t} />;
  }

  if (!isAuthReady) return null;

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
        theme === 'dark' ? "bg-app-main" : "bg-slate-50"
      )}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-app-card border border-app-main p-12 rounded-[3rem] shadow-2xl text-center space-y-8"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <GraduationCap className="w-10 h-10 text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-app-strong">eNote <span className="text-emerald-500">OFPPT</span></h1>
            <p className="text-app-muted text-sm uppercase tracking-widest font-bold">{t.managementConsole}</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-sm"
          >
            {t.login}
          </button>
        </motion.div>
      </div>
    );
  }

  // Check if user is the lead instructor
  const isInstructor = user.email === 'ilyaspay0@gmail.com';

  if (!isInstructor) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center p-6 transition-colors duration-500",
        theme === 'dark' ? "bg-app-main" : "bg-slate-50"
      )}>
        <div className="max-w-md w-full bg-app-card border border-app-main p-12 rounded-[3rem] shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
            <XCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-app-strong">{t.accessDenied}</h1>
          <p className="text-app-muted text-sm leading-relaxed">{t.onlyInstructor}</p>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white/5 border border-app-main text-app-strong font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
          >
            {t.logout}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: t.overview, icon: LayoutDashboard },
    { id: 'students', label: t.students, icon: Users },
    { id: 'modules', label: t.modules, icon: BookOpen },
    { id: 'attendance', label: t.attendance, icon: QrCode },
    { id: 'grades', label: t.performance, icon: GraduationCap },
  ];

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-emerald-500/30 flex overflow-hidden transition-colors duration-500",
      theme === 'dark' ? "bg-app-main text-white" : "bg-[#f8fafc] text-black"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "w-80 border-r hidden lg:flex flex-col sticky top-0 h-screen z-50 transition-colors duration-500",
        theme === 'dark' ? "bg-app-card border-app-main" : "bg-white border-slate-200"
      )}>
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 group cursor-pointer">
            <GraduationCap className="w-7 h-7 text-black fill-current group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-app-strong">eNote <span className="text-emerald-500">OFPPT</span></h1>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-app-dim">{t.digitalFaculty}</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-emerald-500 text-black font-black shadow-2xl shadow-emerald-500/10" 
                  : "text-app-muted hover:text-app-strong hover:bg-white/[0.03]"
              )}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-emerald-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={cn("w-5 h-5 relative z-10", activeTab === tab.id ? "text-black" : "group-hover:text-emerald-400 transition-colors")} />
              <span className="relative z-10 text-sm tracking-tight">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto relative z-10" />}
            </button>
          ))}
        </nav>

        <div className={cn("p-8 border-t", theme === 'dark' ? "border-app-main" : "border-slate-100")}>
          <div className={cn(
            "flex items-center gap-4 p-5 rounded-[2rem] border transition-all cursor-pointer group",
            theme === 'dark' ? "bg-white/[0.02] border-app-main hover:bg-white/[0.04]" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
          )}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-black shadow-lg group-hover:rotate-6 transition-transform">
              IP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black truncate text-app-strong">Ilyas Pay</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-app-dim">{t.leadInstructor}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative custom-scrollbar">
        {/* Background Glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <header className={cn(
          "h-28 border-b flex items-center justify-between px-12 backdrop-blur-3xl sticky top-0 z-40 transition-colors duration-500",
          theme === 'dark' ? "bg-app-main/60 border-app-main" : "bg-white/60 border-slate-200"
        )}>
          <div className="flex items-center gap-4 lg:hidden">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-black" />
             </div>
             <h1 className="text-xl font-black tracking-tighter">eNote</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-3xl font-black tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] mt-1 text-app-dim">{t.managementConsole}</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Theme & Lang Toggles */}
            <div className={cn(
              "flex items-center gap-1 p-1.5 rounded-2xl border",
              theme === 'dark' ? "bg-white/5 border-app-main" : "bg-slate-100 border-slate-200"
            )}>
              <button 
                onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
                className={cn(
                  "p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  theme === 'dark' ? "hover:bg-white/5" : "hover:bg-white"
                )}
              >
                <Languages className="w-4 h-4" />
                {lang}
              </button>
              <div className={cn("w-px h-4", theme === 'dark' ? "bg-white/10" : "bg-slate-300")} />
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  "p-2.5 rounded-xl transition-all",
                  theme === 'dark' ? "hover:bg-white/5" : "hover:bg-white"
                )}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div className="hidden md:flex flex-col items-end text-right">
              <div className="text-sm font-black text-app-strong">
                {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-[10px] uppercase font-black tracking-widest mt-0.5 text-app-dim">{t.academicTerm}</div>
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl mx-auto pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTab === 'dashboard' && <Dashboard students={students} sessions={sessions} t={t} theme={theme} />}
              {activeTab === 'students' && <StudentList students={students} setStudents={setStudents} t={t} theme={theme} />}
              {activeTab === 'modules' && <ModuleManagement modules={modules} setModules={setModules} t={t} theme={theme} />}
              {activeTab === 'attendance' && <AttendanceScanner students={students} sessions={sessions} setSessions={setSessions} t={t} theme={theme} />}
              {activeTab === 'grades' && <GradeManagement students={students} setStudents={setStudents} t={t} theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-app-card/80 backdrop-blur-2xl border border-app-main px-6 py-4 rounded-[2.5rem] flex justify-around items-center z-50 shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "p-4 rounded-2xl transition-all relative",
              activeTab === tab.id ? "text-emerald-500" : "text-app-dim"
            )}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="mobileActiveTab"
                className="absolute inset-0 bg-emerald-500/10 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon className="w-6 h-6 relative z-10" />
          </button>
        ))}
      </nav>
    </div>
  );
}
