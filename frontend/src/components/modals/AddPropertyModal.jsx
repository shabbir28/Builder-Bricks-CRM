import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BuildingOfficeIcon, PhotoIcon } from '@heroicons/react/24/outline';
import ModalWrapper from './ModalWrapper';
import { Field, Input, Select, Textarea, ModalFooter, FieldSection, Grid2 } from './formUtils';

// Must match backend enum exactly
const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house',     label: 'House'     },
  { value: 'villa',     label: 'Villa'     },
  { value: 'commercial',label: 'Commercial'},
  { value: 'land',      label: 'Plot / Land'},
];

const STATUSES = [
  { value: 'available',      label: 'Available'      },
  { value: 'sold',           label: 'Sold'           },
  { value: 'rented',         label: 'Rented'         },
  { value: 'under-contract', label: 'Under Contract' },
];

const EMPTY = {
  title: '', description: '', type: 'apartment', status: 'available',
  price: '', city: '', street: '', bedrooms: '', bathrooms: '', area: '',
};

const validate = (form) => {
  const errors = {};
  if (!form.title.trim())       errors.title       = 'Property title is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.price.trim() || isNaN(Number(form.price))) errors.price = 'Valid price (numbers only) is required';
  if (!form.city.trim())        errors.city        = 'City is required';
  if (!form.area.trim()  || isNaN(Number(form.area)))  errors.area  = 'Valid area in sq ft is required';
  return errors;
};

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef               = useRef(null);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      // Build payload matching the backend schema exactly
      const payload = {
        title:       form.title,
        description: form.description,
        type:        form.type,
        status:      form.status,
        price:       Number(form.price),
        address: {
          street:  form.street || '',
          city:    form.city,
          state:   '',
          zipCode: '',
        },
        features: {
          bedrooms:  Number(form.bedrooms) || 0,
          bathrooms: Number(form.bathrooms) || 0,
          area:      Number(form.area),
        },
      };

      const response = await axios.post('/api/properties', payload);

      if (response.data.success) {
        onPropertyAdded?.(response.data.data);
        toast.success(`"${form.title}" listed in Properties!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
          duration: 4000,
        });
        setForm(EMPTY);
        setErrors({});
        setPreview(null);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save property';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    setPreview(null);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Property"
      subtitle="List a property — it will appear in the Properties module"
      icon={<BuildingOfficeIcon className="w-4 h-4" />}
      iconBg="rgba(16,185,129,0.12)"
      iconColor="#34d399"
      maxWidth="max-w-xl"
    >
      <FieldSection>
        {/* Title */}
        <Field label="Property Title" required error={errors.title}>
          <Input placeholder="e.g. 3-Bed Apartment DHA Phase 6" value={form.title} onChange={set('title')} />
        </Field>

        {/* Type + Status */}
        <Grid2>
          <Field label="Property Type" required>
            <Select value={form.type} onChange={set('type')}>
              {PROPERTY_TYPES.map(t => (
                <option key={t.value} value={t.value} style={{ background: '#111316' }}>{t.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Listing Status">
            <Select value={form.status} onChange={set('status')}>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value} style={{ background: '#111316' }}>{s.label}</option>
              ))}
            </Select>
          </Field>
        </Grid2>

        {/* Price */}
        <Field label="Price (Rs.)" required error={errors.price}>
          <Input type="number" placeholder="e.g. 25000000" value={form.price} onChange={set('price')} min="0" />
        </Field>

        {/* Location */}
        <Grid2>
          <Field label="City" required error={errors.city}>
            <Input placeholder="e.g. Lahore" value={form.city} onChange={set('city')} />
          </Field>
          <Field label="Street / Area">
            <Input placeholder="e.g. DHA Phase 6" value={form.street} onChange={set('street')} />
          </Field>
        </Grid2>

        {/* Specs */}
        <Grid2>
          <Field label="Area (sq ft)" required error={errors.area}>
            <Input type="number" placeholder="e.g. 1800" value={form.area} onChange={set('area')} min="0" />
          </Field>
          <Grid2>
            <Field label="Beds">
              <Select value={form.bedrooms} onChange={set('bedrooms')} placeholder="—">
                {['0','1','2','3','4','5','6'].map(b => (
                  <option key={b} value={b} style={{ background: '#111316' }}>{b}</option>
                ))}
              </Select>
            </Field>
            <Field label="Baths">
              <Select value={form.bathrooms} onChange={set('bathrooms')} placeholder="—">
                {['0','1','2','3','4','5'].map(b => (
                  <option key={b} value={b} style={{ background: '#111316' }}>{b}</option>
                ))}
              </Select>
            </Field>
          </Grid2>
        </Grid2>

        {/* Description */}
        <Field label="Description" required error={errors.description}>
          <Textarea
            placeholder="Describe the property — location highlights, features, nearby landmarks…"
            value={form.description}
            onChange={set('description')}
            rows={3}
          />
        </Field>

        {/* Image Upload (preview only — not sent to API in this version) */}
        <Field label="Property Image (Preview)">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200"
            style={{
              border: `2px dashed ${preview ? '#5c6bc0' : '#252830'}`,
              background: preview ? 'rgba(92,107,192,0.04)' : 'rgba(255,255,255,0.02)',
              minHeight: preview ? 'auto' : 80,
              padding: preview ? 0 : '16px',
              overflow: 'hidden',
            }}
          >
            {preview ? (
              <div className="relative w-full">
                <img src={preview} alt="Preview" className="w-full rounded-lg object-cover" style={{ maxHeight: 140 }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
                  <span className="text-xs font-medium text-white">Click to change</span>
                </div>
              </div>
            ) : (
              <>
                <PhotoIcon className="w-6 h-6 mb-1.5" style={{ color: '#545769' }} />
                <p className="text-xs font-medium" style={{ color: '#545769' }}>Click to upload image</p>
                <p className="text-xs mt-0.5" style={{ color: '#3a3d4a' }}>PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </Field>
      </FieldSection>

      <ModalFooter
        onCancel={handleClose}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="List Property"
        submitColor="#10b981"
      />
    </ModalWrapper>
  );
};

export default AddPropertyModal;
