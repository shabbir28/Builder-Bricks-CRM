import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PlusIcon, 
  CalendarIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  BoltIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';

const Activities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [agents, setAgents] = useState([]);

  const [formData, setFormData] = useState({
    type: 'call',
    title: '',
    description: '',
    lead: '',
    deal: '',
    property: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
      fetchSelectionData();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/activities');
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectionData = async () => {
    try {
      const [leadsRes, dealsRes, agentsRes] = await Promise.all([
        axios.get('/api/leads'),
        axios.get('/api/deals'),
        axios.get('/api/users'),
      ]);
      if (leadsRes.data.success) setLeads(leadsRes.data.data);
      if (dealsRes.data.success) setDeals(dealsRes.data.data);
      if (agentsRes.data.success) setAgents(agentsRes.data.data);
    } catch (error) {
      console.error('Error fetching selection data:', error);
    }
  };

  const handleOpenModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        lead: activity.lead?.id || '',
        deal: activity.deal?.id || '',
        property: activity.property?.id || '',
        assignedTo: activity.assignedToUser?.id || activity.assignedTo || '',
        priority: activity.priority,
        status: activity.status,
        dueDate: new Date(activity.dueDate).toISOString().slice(0, 16),
      });
    } else {
      setEditingActivity(null);
      setFormData({
        type: 'call', title: '', description: '', lead: '', deal: '', property: '',
        assignedTo: '', priority: 'medium', status: 'pending',
        dueDate: new Date().toISOString().slice(0, 16),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this operational trace?')) {
      try {
        const response = await axios.delete(`/api/activities/${id}`);
        if (response.data.success) {
          toast.success('Activity Deleted');
          fetchActivities();
        }
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleStatusToggle = async (activity) => {
    const newStatus = activity.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await axios.put(`/api/activities/${activity.id}`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Protocol ${newStatus}`);
        fetchActivities();
      }
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.lead) delete payload.lead;
      if (!payload.deal) delete payload.deal;
      if (!payload.property) delete payload.property;

      const resp = editingActivity 
        ? await axios.put(`/api/activities/${editingActivity.id}`, payload)
        : await axios.post('/api/activities', payload);

      if (resp.data.success) {
        toast.success(editingActivity ? 'Activity Updated' : 'Activity Deployed');
        handleCloseModal();
        fetchActivities();
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      call: PhoneIcon,
      email: EnvelopeIcon,
      meeting: UserGroupIcon,
      'site-visit': MapPinIcon,
      note: PencilSquareIcon,
      task: BoltIcon,
      reminder: ClockIcon,
    };
    return icons[type] || CalendarIcon;
  };

  const getTypeStyle = (type) => {
    const styles = {
      call: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      email: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      meeting: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      'site-visit': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      note: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      task: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      reminder: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    };
    return styles[type] || 'text-white bg-builders-surface border-builders-border';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-14 h-14 border-[3px] border-builders-surface border-t-builders-blue rounded-full animate-spin"></div>
        <span className="mt-6 text-builders-text-secondary font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Pulse...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24 animate-fade-in">
      {/* Precision Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="h-4 w-1 bg-builders-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
             <span className="text-builders-blue font-black uppercase text-[10px] tracking-[0.4em]">Operational Stream</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Intelligence Pulse</h1>
          <p className="text-builders-text-secondary font-bold text-lg max-w-lg">Monitoring {activities.length} Active Synchronization Protocols.</p>
        </div>
        
        <button onClick={() => handleOpenModal()} className="btn-primary w-full sm:w-auto">
          <PlusIcon className="h-5 w-5" />
          <span className="uppercase text-[11px] tracking-[0.2em]">Deploy Activity</span>
        </button>
      </div>

      {/* High-Impact Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {[
          { label: 'Total Syncs', value: activities.length, color: 'text-white', icon: BoltIcon, bg: 'bg-builders-surface' },
          { label: 'Pending Engagement', value: activities.filter(a => a.status === 'pending').length, color: 'text-amber-400', icon: ClockIcon, bg: 'bg-amber-500/10' },
          { label: 'Successfully Completed', value: activities.filter(a => a.status === 'completed').length, color: 'text-emerald-400', icon: CheckCircleIcon, bg: 'bg-emerald-500/10' },
          { label: 'Critical Urgency', value: activities.filter(a => a.priority === 'high').length, color: 'text-rose-400', icon: BoltIcon, bg: 'bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="stat-card group">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-2">
                <p className="text-[9px] font-black text-builders-text-muted uppercase tracking-[0.2em]">{stat.label}</p>
                <h4 className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} border border-white/5 group-hover:border-builders-blue transition-all duration-500`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <stat.icon className="h-24 w-24 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="card">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-builders-border bg-builders-surface/30">
                <th className="px-10 py-6 text-[10px] font-black uppercase text-builders-text-secondary tracking-[0.25em]">Strategic Activity</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-builders-text-secondary tracking-[0.25em]">Linkage</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-builders-text-secondary tracking-[0.25em]">Timeline</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-builders-text-secondary tracking-[0.25em]">Urgency</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase text-builders-text-secondary tracking-[0.25em]">Resolution</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-builders-border">
              {activities.map((activity) => {
                const Icon = getTypeIcon(activity.type);
                const style = getTypeStyle(activity.type);
                return (
                  <tr key={activity.id} className="hover:bg-builders-surface/20 transition-all group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl border ${style} shadow-2xl`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-base font-black text-white group-hover:text-builders-blue transition-colors">{activity.title}</div>
                          <div className="text-[11px] font-bold text-builders-text-secondary mt-1 max-w-xs truncate uppercase tracking-wider">{activity.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="space-y-2">
                        {activity.lead?.name && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-white/70 uppercase">
                            <span className="h-1 w-1 bg-builders-blue rounded-full"></span>
                            <span>{activity.lead.name}</span>
                          </div>
                        )}
                        {activity.deal?.title && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-builders-blue uppercase">
                             <span className="h-1 w-1 bg-white rounded-full"></span>
                             <span>{activity.deal.title}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="text-sm font-black text-white">{new Date(activity.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[10px] font-black text-builders-text-muted uppercase mt-1">{new Date(activity.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-10 py-7">
                      <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border 
                        ${activity.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                          activity.priority === 'medium' ? 'bg-builders-blue/10 text-builders-blue border-builders-blue/20' : 
                          'bg-builders-surface text-builders-text-secondary border-builders-border'}`}>
                        {activity.priority}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <button 
                        onClick={() => handleStatusToggle(activity)}
                        className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border transition-all duration-500 hover:scale-105 shadow-2xl
                          ${activity.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-builders-surface text-amber-400 border-amber-500/20'}`}
                      >
                        {activity.status}
                      </button>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => handleOpenModal(activity)} className="p-2.5 bg-builders-surface border border-builders-border rounded-xl text-builders-text-secondary hover:text-white transition-all shadow-xl"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(activity.id)} className="p-2.5 bg-builders-surface border border-builders-border rounded-xl text-builders-text-secondary hover:text-builders-rose transition-all shadow-xl"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activities.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center">
               <div className="p-8 rounded-[3rem] bg-builders-surface border border-builders-border mb-8 shadow-inner ring-1 ring-white/5">
                  <CalendarIcon className="h-20 w-20 text-builders-text-muted opacity-20" />
               </div>
               <p className="font-black uppercase text-[10px] tracking-[0.5em] text-builders-text-muted">Operational Void Detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Persistence Modal Overlay */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingActivity ? 'Modify Synchronization' : 'Deploy Operational Activity'}
      >
        <form onSubmit={handleSubmit} className="space-y-10 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="label-text">Activity Logic Segment</label>
              <div className="relative">
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                  required
                >
                  <option value="call">Voice Engagement (Call)</option>
                  <option value="email">Digital Protocol (Email)</option>
                  <option value="meeting">Physical Briefing (Meeting)</option>
                  <option value="site-visit">Asset Evaluation (Site Visit)</option>
                  <option value="note">Intelligence Log (Note)</option>
                  <option value="task">Operational Task</option>
                  <option value="reminder">Strategic Reminder</option>
                </select>
                <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-builders-text-muted rotate-90 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="label-text">Urgency Vector</label>
              <div className="relative">
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="low">Standard Priority</option>
                  <option value="medium">Elevated Priority</option>
                  <option value="high">Critical Priority</option>
                </select>
                <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-builders-text-muted rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="label-text">Protocol Objective</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="Enter Strategic Aim..." required />
          </div>

          <div className="space-y-3">
            <label className="label-text">Intelligence Overview</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field min-h-[120px]" placeholder="Detailed operational briefing..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="label-text">Linked Prospect</label>
              <div className="relative">
                <select 
                  value={formData.lead}
                  onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="">No Lead Linked</option>
                  {leads.map(lead => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                </select>
                <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-builders-text-muted rotate-90 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="label-text">Strategic Deal Association</label>
              <div className="relative">
                <select 
                  value={formData.deal}
                  onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="">No Active Association</option>
                  {deals.map(deal => <option key={deal.id} value={deal.id}>{deal.title}</option>)}
                </select>
                <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-builders-text-muted rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="label-text">Executing Agent</label>
                <div className="relative">
                  <select 
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="input-field appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Primary Stakeholder...</option>
                    {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                  <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-builders-text-muted rotate-90 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="label-text">Timeline Deadline</label>
                <input type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="input-field cursor-pointer" required />
              </div>
          </div>

          <div className="pt-10 flex flex-col-reverse sm:flex-row justify-end gap-6 border-t border-builders-border/50">
            <button type="button" onClick={handleCloseModal} className="px-10 py-4 bg-builders-surface text-builders-text-secondary rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-all border border-builders-border">Abort Protocol</button>
            <button type="submit" className="btn-primary px-12 py-4 text-[11px] tracking-[0.25em]">
              {editingActivity ? 'Commit Sync' : 'Initialize Trace'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Activities;

