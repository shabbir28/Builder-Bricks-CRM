import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import ModalWrapper from './ModalWrapper';
import { Field, Input, Select, ModalFooter, FieldSection, Grid2 } from './formUtils';

// Must match backend enum: lead / qualified / proposal / negotiation / closing / won
const DEAL_STAGES = [
  { value: 'lead',        label: 'New Opportunity'  },
  { value: 'qualified',   label: 'Qualified'        },
  { value: 'proposal',    label: 'Proposal Sent'    },
  { value: 'negotiation', label: 'Negotiation'      },
  { value: 'closing',     label: 'Closing'          },
  { value: 'won',         label: 'Closed Won'       },
];

const EMPTY = {
  title: '', leadId: '', propertyId: '', dealValue: '',
  commissionRate: '2.5', closingDate: '', stage: 'negotiation',
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim())     errors.title      = 'Deal title is required';
  if (!form.leadId)           errors.leadId     = 'Please select a lead';
  if (!form.propertyId)       errors.propertyId = 'Please select a property';
  if (!form.dealValue.trim() || isNaN(Number(form.dealValue)))
    errors.dealValue = 'Valid deal value (numbers only) is required';
  if (!form.closingDate)      errors.closingDate = 'Closing date is required';
  return errors;
};

const CreateDealModal = ({ isOpen, onClose, onDealCreated }) => {
  const [form, setForm]           = useState(EMPTY);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);

  // Real data fetched from the API
  const [leads, setLeads]         = useState([]);
  const [properties, setProperties] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  // Load real leads & properties when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setFetchingData(true);
    Promise.all([
      axios.get('/api/leads'),
      axios.get('/api/properties'),
    ])
      .then(([leadsRes, propsRes]) => {
        if (leadsRes.data.success)  setLeads(leadsRes.data.data);
        if (propsRes.data.success)  setProperties(propsRes.data.data);
      })
      .catch(() => toast.error('Could not load leads/properties'))
      .finally(() => setFetchingData(false));
  }, [isOpen]);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const selectedLead     = leads.find(l => l.id === form.leadId);
  const selectedProperty = properties.find(p => p.id === form.propertyId);

  const commissionAmount = () => {
    const val = parseFloat(form.dealValue) || 0;
    const pct = parseFloat(form.commissionRate) || 0;
    if (!val || !pct) return null;
    return `Rs. ${(val * pct / 100).toLocaleString()}`;
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        title:               form.title,
        lead:                form.leadId,      // MongoDB ObjectId
        property:            form.propertyId,  // MongoDB ObjectId
        dealValue:           Number(form.dealValue),
        commissionRate:      Number(form.commissionRate) || 2.5,
        expectedClosingDate: form.closingDate,
        pipelineStage:       form.stage,
      };

      const response = await axios.post('/api/deals', payload);

      if (response.data.success) {
        onDealCreated?.(response.data.data);
        toast.success(`Deal "${form.title}" created! Check Deals module.`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
          duration: 4000,
        });
        setForm(EMPTY);
        setErrors({});
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create deal';
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

  const commAmt = commissionAmount();

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Deal"
      subtitle="Link a lead + property — deal will appear in the Deals module"
      icon={<BriefcaseIcon className="w-4 h-4" />}
      iconBg="rgba(139,92,246,0.12)"
      iconColor="#a78bfa"
      maxWidth="max-w-xl"
    >
      <FieldSection>
        {/* Deal Title */}
        <Field label="Deal Title" required error={errors.title}>
          <Input placeholder="e.g. DHA Phase 6 Apartment Acquisition" value={form.title} onChange={set('title')} />
        </Field>

        {/* Lead + Property */}
        {fetchingData ? (
          <div className="flex items-center gap-2 py-2" style={{ color: '#545769', fontSize: 13 }}>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading leads & properties…
          </div>
        ) : (
          <Grid2>
            <Field label="Select Lead" required error={errors.leadId}>
              <Select value={form.leadId} onChange={set('leadId')} placeholder="Choose lead">
                {leads.map(l => (
                  <option key={l.id} value={l.id} style={{ background: '#111316' }}>
                    {l.name}{l.budget ? ` — ${l.budget}` : ''}
                  </option>
                ))}
              </Select>
              {leads.length === 0 && (
                <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>No leads found. Add leads first.</p>
              )}
            </Field>
            <Field label="Select Property" required error={errors.propertyId}>
              <Select value={form.propertyId} onChange={set('propertyId')} placeholder="Choose property">
                {properties.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#111316' }}>
                    {p.title}
                  </option>
                ))}
              </Select>
              {properties.length === 0 && (
                <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>No properties found. Add properties first.</p>
              )}
            </Field>
          </Grid2>
        )}

        {/* Connection preview */}
        {selectedLead && selectedProperty && (
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-medium"
            style={{ background: 'rgba(92,107,192,0.06)', border: '1px solid rgba(92,107,192,0.18)' }}
          >
            <span style={{ color: '#9fa8da' }}>👤 {selectedLead.name}</span>
            <span style={{ color: '#545769' }}>→</span>
            <span style={{ color: '#9fa8da' }}>🏠 {selectedProperty.title}</span>
          </div>
        )}

        {/* Deal Value + Commission */}
        <Grid2>
          <Field label="Deal Value (Rs.)" required error={errors.dealValue}>
            <Input type="number" placeholder="e.g. 25000000" value={form.dealValue} onChange={set('dealValue')} min="0" />
          </Field>
          <Field label={`Commission %${commAmt ? ` → ${commAmt}` : ''}`}>
            <Input type="number" placeholder="e.g. 2.5" value={form.commissionRate} onChange={set('commissionRate')} min="0" step="0.1" />
          </Field>
        </Grid2>

        {/* Closing Date */}
        <Field label="Expected Closing Date" required error={errors.closingDate}>
          <input
            type="date"
            value={form.closingDate}
            onChange={set('closingDate')}
            min={new Date().toISOString().split('T')[0]}
            className="input"
            style={{ height: 38, colorScheme: 'dark' }}
          />
        </Field>

        {/* Pipeline Stage */}
        <Field label="Pipeline Stage">
          <div className="flex flex-wrap gap-2 mt-1">
            {DEAL_STAGES.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, stage: s.value }))}
                className="btn text-xs"
                style={{
                  padding: '4px 12px',
                  background: form.stage === s.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)',
                  borderColor: form.stage === s.value ? 'rgba(139,92,246,0.5)' : '#1e2025',
                  color: form.stage === s.value ? '#c4b5fd' : '#545769',
                  fontWeight: form.stage === s.value ? 600 : 400,
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
        submitLabel="Create Deal"
        submitColor="#7c3aed"
      />
    </ModalWrapper>
  );
};

export default CreateDealModal;
