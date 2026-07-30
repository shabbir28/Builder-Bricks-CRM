import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import ModalWrapper from '../modals/ModalWrapper';
import { Field, Input, Select, ModalFooter, FieldSection, Grid2 } from '../modals/formUtils';

const TASK_TYPES = [
  { value: 'task',      label: 'General Task' },
  { value: 'followup',  label: 'Follow Up'    },
  { value: 'call',      label: 'Call'         },
  { value: 'meeting',   label: 'Meeting'      },
];

const EMPTY = {
  title: '', description: '', leadId: '', type: 'task', dueDate: ''
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.dueDate)      errors.dueDate = 'Due date is required';
  return errors;
};

const AddTaskModal = ({ isOpen, onClose, onTaskAdded, leads = [], agents = [], userRole = 'agent' }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        leadId: form.leadId || undefined,
        agentId: form.agentId || undefined,
        type: form.type,
        dueDate: form.dueDate,
      };

      const response = await axios.post('/api/tasks', payload);

      if (response.data.success) {
        onTaskAdded?.(response.data.data);
        toast.success(`Task "${form.title}" added!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        setForm(EMPTY);
        setErrors({});
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check task';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      subtitle="Schedule a task or follow-up activity"
      icon={<ClipboardDocumentListIcon className="w-4 h-4" />}
      iconBg="rgba(139,92,246,0.15)"
      iconColor="#8b5cf6"
      maxWidth="max-w-md"
    >
      <FieldSection>
        <Field label="Task Title" required error={errors.title}>
          <Input placeholder="e.g. Call client about property" value={form.title} onChange={set('title')} />
        </Field>

        <Field label="Description">
          <Input placeholder="Optional details..." value={form.description} onChange={set('description')} />
        </Field>

        {userRole === 'admin' && (
          <Field label="Assign to Agent (Optional)">
            <Select value={form.agentId || ''} onChange={set('agentId')}>
              <option value="" style={{ background: '#111316' }}>-- Self (Unassigned) --</option>
              {agents.map(a => (
                <option key={a.id || a.name} value={a.id || a.name} style={{ background: '#111316' }}>{a.name}</option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Associated Lead (Optional)">
          <Select value={form.leadId} onChange={set('leadId')}>
            <option value="" style={{ background: '#111316' }}>-- No Lead --</option>
            {leads.map(l => (
              <option key={l.id} value={l.id} style={{ background: '#111316' }}>{l.name}</option>
            ))}
          </Select>
        </Field>

        <Grid2>
          <Field label="Task Type">
            <Select value={form.type} onChange={set('type')}>
              {TASK_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#111316' }}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Due Date & Time" required error={errors.dueDate}>
            <Input type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
          </Field>
        </Grid2>
      </FieldSection>

      <ModalFooter
        onCancel={handleClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Task"
      />
    </ModalWrapper>
  );
};

export default AddTaskModal;
