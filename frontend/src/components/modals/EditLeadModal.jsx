import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import ModalWrapper from './ModalWrapper';
import { Field, Input, Select, ModalFooter, FieldSection, Grid2 } from './formUtils';

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

const validate = (form) => {
  const errors = {};
  if (!form.name.trim())  errors.name  = 'Client name is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Invalid email address';
  return errors;
};

const EditLeadModal = ({ isOpen, onClose, onLeadUpdated, lead }) => {
  const [form, setForm]       = useState({
    name: '', phone: '', email: '', budget: '',
    preferredPropertyType: 'apartment', location: '',
    source: 'website', status: 'new',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      setForm({
        name: lead.name || '',
        phone: lead.phone || '',
        email: lead.email || '',
        budget: lead.budget || '',
        preferredPropertyType: lead.preferredPropertyType || 'apartment',
        location: lead.preferredLocation || '',
        source: lead.source || 'website',
        status: lead.status || 'new',
      });
      setErrors({});
    }
  }, [lead, isOpen]);

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

      const response = await axios.put(`/api/leads/${lead.id}`, payload);

      if (response.data.success) {
        onLeadUpdated?.(response.data.data);
        toast.success(`Lead "${form.name}" updated successfully!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#3B82F6', secondary: '#111316' },
          duration: 4000,
        });
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update lead';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Lead Specs"
      subtitle="Modify parameters and adjust strategic trajectory"
      icon={<PencilSquareIcon className="w-4 h-4" />}
      iconBg="rgba(59,130,246,0.15)"
      iconColor="#60A5FA"
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
                  background: form.status === s.value ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: form.status === s.value ? 'rgba(59,130,246,0.5)' : '#1e2025',
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
        submitLabel="Update Lead"
      />
    </ModalWrapper>
  );
};

export default EditLeadModal;
