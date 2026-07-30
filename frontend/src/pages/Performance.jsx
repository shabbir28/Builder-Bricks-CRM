import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CircleStackIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Performance = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPerformanceStats();
    }
  }, [user]);

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      toast.error('Performance synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-14 h-14 border-[3px] border-builders-surface border-t-builders-blue rounded-full animate-spin"></div>
        <span className="mt-6 text-builders-text-secondary font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Analyzing Operational Performance...</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Conversion Efficiency', value: `${stats.conversionRate}%`, icon: BoltIcon, color: 'text-builders-blue', bg: 'bg-builders-blue/10' },
    { label: 'Transactions Secured', value: stats.closedDeals, icon: CheckBadgeIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Estimated Revenue', value: `Rs. ${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: CurrencyDollarIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Lead Velocity', value: stats.totalLeads, icon: UserGroupIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-12 pb-24 animate-fade-in">
      {/* Strategic Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
           <div className="h-4 w-1 bg-builders-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
           <span className="text-builders-blue font-black uppercase text-[10px] tracking-[0.4em]">Resource Intel</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Operational Performance</h1>
        <p className="text-builders-text-secondary font-bold text-lg max-w-lg">Personalized efficiency trace and acquisition metrics for {user?.name}.</p>
      </div>

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="stat-card group">
            <div className="flex items-center justify-between mb-8">
               <div className={`p-4 rounded-2xl ${kpi.bg} border border-white/5 group-hover:border-builders-blue transition-all duration-500`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
               </div>
               <div className="h-2 w-2 rounded-full bg-builders-blue animate-pulse"></div>
            </div>
            <p className="text-[10px] font-black text-builders-text-muted uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">{kpi.value}</h4>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Projection Card */}
        <div className="lg:col-span-2 card p-10 bg-builders-sidebar group overflow-hidden relative">
           <div className="relative z-10">
              <div className="mb-10">
                 <h3 className="text-xl font-black text-white mb-1">Fiscal Trajectory</h3>
                 <p className="text-xs font-bold text-builders-text-muted uppercase tracking-widest">Revenue vs Acquisition Cycles</p>
              </div>
              
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueStats}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
           <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
              <CurrencyDollarIcon className="h-64 w-64 text-white" />
           </div>
        </div>

        {/* Source Breakdown (Pie Chart) */}
        <div className="card p-10 bg-builders-sidebar overflow-hidden relative">
           <div className="relative z-10 h-full flex flex-col">
              <div className="mb-10">
                 <h3 className="text-xl font-black text-white mb-1">Target Origin Trace</h3>
                 <p className="text-xs font-bold text-builders-text-muted uppercase tracking-widest">Lead Acquistion Channels</p>
              </div>

              <div className="flex-1 h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={stats.sourceBreakdown} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={8} 
                          dataKey="value"
                       >
                          {stats.sourceBreakdown.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} 
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-white">{stats.totalLeads}</span>
                    <span className="text-[8px] font-black text-builders-text-muted uppercase tracking-widest">Total</span>
                 </div>
              </div>

              <div className="space-y-4 mt-10">
                 {stats.sourceBreakdown.map((source, i) => (
                    source.value > 0 && (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{source.name}</span>
                         </div>
                         <span className="text-[10px] font-black text-builders-text-muted">{source.value}</span>
                      </div>
                    )
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Secondary Data Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="card p-8">
            <h3 className="text-xl font-black text-white mb-8">Acquisition Phase Efficiency</h3>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Month 1', deals: 2 },
                    { name: 'Month 2', deals: 5 },
                    { name: 'Month 3', deals: 3 },
                    { name: 'Month 4', deals: 8 },
                    { name: 'Month 5', deals: 6 },
                    { name: 'Month 6', deals: stats.closedDeals },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                    <Bar dataKey="deals" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="card p-8 bg-builders-sidebar flex flex-col justify-center items-center text-center">
            <div className="p-8 rounded-[3rem] bg-builders-surface border border-builders-border mb-8 shadow-inner ring-1 ring-white/5 group">
                <CheckBadgeIcon className="h-16 w-16 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h3 className="text-3xl font-black text-white mb-2">Acquisition Verified</h3>
            <p className="text-sm font-bold text-builders-text-muted max-w-md mx-auto">You have successfully mediated {stats.closedDeals} high-value asset transitions this fiscal cycle.</p>
            <div className="mt-8 flex items-center gap-6">
               <div className="text-center">
                  <p className="text-[10px] font-black text-builders-text-muted uppercase tracking-widest mb-1">Status</p>
                  <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase">Elite Performer</span>
               </div>
               <div className="h-10 w-[1px] bg-builders-border"></div>
               <div className="text-center">
                  <p className="text-[10px] font-black text-builders-text-muted uppercase tracking-widest mb-1">Trace</p>
                  <span className="text-white font-black text-lg">99.8%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Performance;
