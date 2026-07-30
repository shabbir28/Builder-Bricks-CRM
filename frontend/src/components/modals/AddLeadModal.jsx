import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import ModalWrapper from './ModalWrapper';
import { Field, Input, Select, ModalFooter, FieldSection, Grid2 } from './formUtils';
import { useFollowUp } from '../../context/FollowUpContext';

// Must match backend enums exactly
const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Apartment'  },
  { value: 'house',      label: 'House'      },
  { value: 'villa',      label: 'Villa'      },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land',       label: 'Plot / Land'},
  { value: 'other',      label: 'Other'      },
];

// Backend accepted values for source
const LEAD_SOURCES = [
  { value: 'website',   label: 'Website'     },
  { value: 'referral',  label: 'Referral'    },
  { value: 'social',    label: 'Social Media'},
  { value: 'phone',     label: 'Phone'       },
  { value: 'walk-in',   label: 'Walk-in'     },
  { value: 'other',     label: 'Other'       },
];

// Backend accepted values for status
const STATUSES = [
  { value: 'new',         label: 'New'         },
  { value: 'contacted',   label: 'Contacted'   },
  { value: 'visit',       label: 'Site Visit'  },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed',      label: 'Closed'      },
  { value: 'lost',        label: 'Lost'        },
];

const EMPTY = {
  name: '', phone: '', email: '', budget: '',
  preferredPropertyType: 'apartment', location: '',
  source: 'website', status: 'new',
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim())  errors.name  = 'Client name is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Invalid email address';
  return errors;
};

const AddLeadModal = ({ isOpen, onClose, onLeadAdded }) => {
  const { createFollowUp } = useFollowUp();
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
        name:                  form.name,
        phone:                 form.phone,
        email:                 form.email || undefined,
        budget:                form.budget || undefined,
        preferredPropertyType: form.preferredPropertyType,
        preferredLocation:     form.location || undefined,
        source:                form.source,
        status:                form.status,
      };

      const response = await axios.post('/api/leads', payload);

      if (response.data.success) {
        onLeadAdded?.(response.data.data);
        createFollowUp(response.data.data);
        toast.success(`Lead "${form.name}" added! Check the Leads module.`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
          duration: 4000,
        });
        setForm(EMPTY);
        setErrors({});
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save lead';
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
      title="Add New Lead"
      subtitle="Capture a new client — lead will appear in the Leads module"
      icon={<UserPlusIcon className="w-4 h-4" />}
      iconBg="rgba(92,107,192,0.15)"
      iconColor="#7986cb"
      maxWidth="max-w-xl"
    >
      <FieldSection>
        {/* Row 1 */}
        <Grid2>
          <Field label="Client Name" required error={errors.name}>
            <Input placeholder="e.g. Ahmed Raza" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Phone Number" required error={errors.phone}>
            <Input placeholder="e.g. 0300-1234567" value={form.phone} onChange={set('phone')} />
          </Field>
        </Grid2>

        {/* Row 2 */}
        <Grid2>
          <Field label="Email Address" error={errors.email}>
            <Input type="email" placeholder="client@example.com" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Budget">
            <Input placeholder="e.g. Rs. 1.2 Cr" value={form.budget} onChange={set('budget')} />
          </Field>
        </Grid2>

        {/* Row 3 */}
        <Grid2>
          <Field label="Property Type">
            <Select value={form.preferredPropertyType} onChange={set('preferredPropertyType')}>
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#111316' }}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Preferred Location">
            <Input placeholder="e.g. DHA Phase 6" value={form.location} onChange={set('location')} />
          </Field>
        </Grid2>

        {/* Row 4 */}
        <Field label="Lead Source">
          <Select value={form.source} onChange={set('source')}>
            {LEAD_SOURCES.map(s => (
              <option key={s.value} value={s.value} style={{ background: '#111316' }}>{s.label}</option>
            ))}
          </Select>
        </Field>

        {/* Status pills */}
        <Field label="Lead Status">
          <div className="flex flex-wrap gap-2 mt-1">
            {STATUSES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, status: s.value }))}
                className="btn text-xs"
                style={{
                  padding: '4px 12px',
                  background: form.status === s.value ? 'rgba(92,107,192,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: form.status === s.value ? 'rgba(92,107,192,0.5)' : '#1e2025',
                  color: form.status === s.value ? '#9fa8da' : '#545769',
                  fontWeight: form.status === s.value ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Field>
      </FieldSection>

      <ModalFooter
        onCancel={handleClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Save Lead"
      />
    </ModalWrapper>
  );
};

export default AddLeadModal;
