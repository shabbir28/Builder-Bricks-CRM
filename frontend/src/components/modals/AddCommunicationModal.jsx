import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import ModalWrapper from './ModalWrapper';
import { FieldSection, Field, Select, Input, ModalFooter, Grid2 } from './formUtils';

const COMMUNICATION_TYPES = [
  { value: 'call', label: '📞 Phone Call' },
  { value: 'message', label: '💬 WhatsApp Message' },
  { value: 'meeting', label: '🤝 Meeting' },
  { value: 'property_shared', label: '🏠 Property Shared' },
  { value: 'note', label: '📝 Note' },
];

const AddCommunicationModal = ({ isOpen, onClose, leadId, agentName, onCommunicationAdded }) => {
  const [form, setForm] = useState({
    type: 'call',
    description: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('leadId', leadId);
      formData.append('type', form.type);
      formData.append('description', form.description);
      formData.append('agentName', agentName);
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await axios.post('/api/communications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        onCommunicationAdded?.(response.data.data);
        toast.success('Interaction logged successfully!', {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' }
        });
        setForm({ type: 'call', description: '' });
        setAttachment(null);
        onClose();
      }
    } catch (err) {
      toast.error('Failed to log interaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Log Interaction"
      subtitle="Record communications for timeline"
      icon={<PencilSquareIcon className="w-5 h-5 text-indigo-400" />}
      iconBg="rgba(99, 102, 241, 0.15)"
      iconColor="#818cf8"
    >
      <FieldSection>
        <Grid2>
          <Field label="Interaction Type">
            <Select value={form.type} onChange={set('type')}>
              {COMMUNICATION_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#111316' }}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Agent Name">
            <Input value={agentName} disabled className="opacity-60 bg-surface-raised cursor-not-allowed" />
          </Field>
        </Grid2>

        <Field label="Description / Notes" required error={errors.description}>
          <textarea
            className="w-full rounded-xl border border-surface-border bg-surface-raised text-ink-primary text-sm px-4 py-3 focus:outline-none focus:border-indigo-500 placeholder-ink-tertiary shadow-inner"
            style={{ minHeight: 120, resize: 'vertical' }}
            value={form.description}
            onChange={set('description')}
            placeholder="Summarize the interaction, outcome, or notes..."
          />
        </Field>

        <Field label="Attachment (Optional)">
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files[0])}
            className="block w-full text-sm text-ink-secondary
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-xs file:font-semibold
              file:bg-indigo-500/10 file:text-indigo-400
              hover:file:bg-indigo-500/20 file:transition-colors cursor-pointer"
          />
          {attachment && (
            <p className="mt-2 text-xs text-ink-tertiary truncate">Selected: {attachment.name}</p>
          )}
        </Field>
      </FieldSection>

      <ModalFooter
        onCancel={onClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Log Interaction"
      />
    </ModalWrapper>
  );
};

export default AddCommunicationModal;
