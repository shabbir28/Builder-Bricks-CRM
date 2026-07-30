import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPinIcon } from '@heroicons/react/24/outline';
import ModalWrapper from '../modals/ModalWrapper';
import { Field, Input, Select, ModalFooter, FieldSection, Grid2 } from '../modals/formUtils';

const EMPTY = {
  leadId: '', propertyId: '', visitDate: '', visitTime: '', notes: ''
};

const validate = (form) => {
  const errors = {};
  if (!form.leadId)     errors.leadId = 'Lead is required';
  if (!form.propertyId) errors.propertyId = 'Property is required';
  if (!form.visitDate)  errors.visitDate = 'Date is required';
  if (!form.visitTime)  errors.visitTime = 'Time is required';
  return errors;
};

const ScheduleVisitModal = ({ isOpen, onClose, onVisitScheduled, leads = [] }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axios.get('/api/properties').then(res => {
        if (res.data.success) {
          setProperties(res.data.data);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = { ...form };
      const response = await axios.post('/api/visits', payload);

      if (response.data.success) {
        onVisitScheduled?.(response.data.data);
        toast.success(`Visit scheduled successfully!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        setForm(EMPTY);
        setErrors({});
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule visit';
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
      title="Schedule Visit"
      subtitle="Plan a property tour with your client"
      icon={<MapPinIcon className="w-4 h-4" />}
      iconBg="rgba(56,189,248,0.15)"
      iconColor="#38bdf8"
      maxWidth="max-w-md"
    >
      <FieldSection>
        <Field label="Client (Lead)" required error={errors.leadId}>
          <Select value={form.leadId} onChange={set('leadId')}>
            <option value="" style={{ background: '#111316' }}>-- Select Client --</option>
            {leads.map(l => (
              <option key={l.id} value={l.id} style={{ background: '#111316' }}>{l.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Property" required error={errors.propertyId}>
          <Select value={form.propertyId} onChange={set('propertyId')}>
            <option value="" style={{ background: '#111316' }}>-- Select Property --</option>
            {properties.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#111316' }}>{p.title} - {p.location}</option>
            ))}
          </Select>
        </Field>

        <Grid2>
          <Field label="Visit Date" required error={errors.visitDate}>
            <Input type="date" value={form.visitDate} onChange={set('visitDate')} />
          </Field>
          <Field label="Time" required error={errors.visitTime}>
            <Input type="time" value={form.visitTime} onChange={set('visitTime')} />
          </Field>
        </Grid2>
        
        <Field label="Notes">
          <Input placeholder="Any special requirements..." value={form.notes} onChange={set('notes')} />
        </Field>
      </FieldSection>

      <ModalFooter
        onCancel={handleClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Confirm Visit"
      />
    </ModalWrapper>
  );
};

export default ScheduleVisitModal;
