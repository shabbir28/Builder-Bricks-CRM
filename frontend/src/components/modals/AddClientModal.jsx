import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, DocumentTextIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const generateReference = (type, unitNo) => {
  if (!unitNo) return 'EO-FL-FLT';
  
  const unitUpper = unitNo.toUpperCase();
  
  if (unitUpper.startsWith('LG')) {
    const num = unitUpper.replace('LG', '');
    return `EO-LGS-SP${num}`;
  }

  let floor = '';
  const firstChar = unitNo.charAt(0);
  if (/\d/.test(firstChar)) {
    floor = firstChar;
  } else {
    floor = firstChar.toUpperCase();
  }
  let code = 'FLT';
  if (type && type.toLowerCase().includes('shop')) {
    code = 'SHP';
  }
  return `EO-FL${floor}-${code}${unitNo}`;
};

const AddClientModal = ({ isOpen, onClose, onClientAdded, initialUnitNo }) => {
  const [step, setStep] = useState(1);
  const [clientData, setClientData] = useState({
    // Step 1: Booking Form
    bookingReferenceNo: 'EO-FL-FLT',
    type: '',
    unitNo: initialUnitNo || '',
    size: '',
    name: '',
    fatherOrHusbandName: '',
    cnic: '',
    presentAddress: '',
    permanentAddress: '',
    residentialTel: '',
    mobileNo: '',
    email: '',
    nominee1Name: '',
    nominee1Relation: '',
    nominee1Cnic: '',
    nominee1Mobile: '',
    nominee2Name: '',
    nominee2Relation: '',
    nominee2Cnic: '',
    nominee2Mobile: '',
    // Step 2: Payment Plan
    totalPrice: '',
    discount: '',
    netPrice: '',
    downPayment: '',
    possessionPayment: '',
    installmentsCount: '24 Months',
    perMonthInstallment: '',
    month: '',
    otherCharges: 'Nill',
    location: 'Elite One Tower, Plot 30, Block A, Faisal Margalla city, Islamabad',
    paymentDate: '',
    witness1Name: '',
    witness1Relation: '',
    witness1Cnic: '',
    witness1Date: '',
    witness2Name: '',
    witness2Relation: '',
    witness2Cnic: '',
    witness2Date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSearchingUnit, setIsSearchingUnit] = useState(false);
  const [searchedProperty, setSearchedProperty] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const u = initialUnitNo || '';
      setClientData(prev => ({ 
        ...prev, 
        unitNo: u,
        bookingReferenceNo: generateReference(prev.type, u)
      }));
    }
  }, [isOpen, initialUnitNo]);

  const handleSearchUnit = async () => {
    if (!clientData.unitNo) return;
    try {
      setIsSearchingUnit(true);
      const res = await axios.get(`/api/properties/search-unit?unit=${clientData.unitNo}`);
      if (res.data.success) {
        const prop = res.data.data;
        setSearchedProperty(prop);
        setClientData(prev => {
          const newType = prop.type ? prop.type : prev.type;
          return {
            ...prev,
            size: prop.area ? String(prop.area) : prev.size,
            type: newType,
            totalPrice: prop.price ? String(prop.price) : prev.totalPrice,
            netPrice: prop.price ? String(prop.price) : prev.netPrice,
            downPayment: prop.downPaymentAmount ? String(prop.downPaymentAmount) : prev.downPayment,
            possessionPayment: prop.possessionAmount ? String(prop.possessionAmount) : prev.possessionPayment,
            perMonthInstallment: prop.monthlyInstallment ? String(prop.monthlyInstallment) : prev.perMonthInstallment,
            bookingReferenceNo: generateReference(newType, prev.unitNo)
          };
        });
        toast.success('Property details autofilled!');
      }
    } catch (err) {
      setSearchedProperty(null);
      // Don't toast error if just not found, let them type normally
    } finally {
      setIsSearchingUnit(false);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!clientData.name) {
      toast.error('Name is required on Booking Form');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...clientData };
      if (payload.email === "") {
        delete payload.email;
      }
      
      const res = await axios.post('/api/clients', payload);
      if (res.data.success) {
        toast.success('Client booking and payment plan added successfully!');
        onClientAdded(res.data.data);
        onClose();
        setStep(1);
        setClientData({
          bookingReferenceNo: 'EO-FL-FLT', type: '', unitNo: '', size: '', name: '', fatherOrHusbandName: '', cnic: '', presentAddress: '', permanentAddress: '', residentialTel: '', mobileNo: '', email: '', nominee1Name: '', nominee1Relation: '', nominee1Cnic: '', nominee1Mobile: '', nominee2Name: '', nominee2Relation: '', nominee2Cnic: '', nominee2Mobile: '',
          totalPrice: '', discount: '', netPrice: '', downPayment: '', possessionPayment: '', installmentsCount: '24 Months', perMonthInstallment: '', month: '', otherCharges: 'Nill', location: 'Elite One Tower, Plot 30, Block A, Faisal Margalla city, Islamabad', paymentDate: '', witness1Name: '', witness1Relation: '', witness1Cnic: '', witness1Date: '', witness2Name: '', witness2Relation: '', witness2Cnic: '', witness2Date: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add client booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-4xl rounded-3xl border border-surface-border flex flex-col max-h-[90vh]" style={{ background: '#0f1520', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step === 1 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}>
              {step === 1 ? <DocumentTextIcon className="w-5 h-5" /> : <CreditCardIcon className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{step === 1 ? 'BOOKING FORM' : 'PAYMENT PLAN'}</h2>
              <p className="text-sm text-ink-secondary mt-0.5">{step === 1 ? "Owner's Copy - Step 1 of 2" : "Payment Details - Step 2 of 2"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
          <form id="add-client-form" onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">
            
            {step === 1 && (
              <>
                {/* Booking Ref */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold text-ink-tertiary tracking-wide whitespace-nowrap">Booking Reference No:</label>
                  <input
                    type="text"
                    value={clientData.bookingReferenceNo}
                    onChange={e => setClientData({...clientData, bookingReferenceNo: e.target.value})}
                    className="w-48 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* Section I */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">I. We, the undersigned, hereby request you to book the following unit in your captioned project.</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">TYPE:</label>
                      <select
                        value={clientData.type}
                        onChange={e => {
                          const newType = e.target.value;
                          setClientData({...clientData, type: newType, bookingReferenceNo: generateReference(newType, clientData.unitNo)});
                        }}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50 appearance-none"
                      >
                        <option value="">-- Select Type --</option>
                        <option value="1 Bed Apartment">1 Bed Apartment</option>
                        <option value="2 Bed Apartment">2 Bed Apartment</option>
                        <option value="Ground Floor Shop">Ground Floor Shop</option>
                        <option value="Lower Ground Shop">Lower Ground Shop</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">UNIT NO:</label>
                      <input
                        type="text"
                        value={clientData.unitNo}
                        onChange={e => {
                          const newUnit = e.target.value;
                          setClientData({...clientData, unitNo: newUnit, bookingReferenceNo: generateReference(clientData.type, newUnit)});
                        }}
                        onBlur={handleSearchUnit}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">SIZE (IN SQUARE FEET):</label>
                    <input
                      type="text"
                      value={clientData.size}
                      onChange={e => setClientData({...clientData, size: e.target.value})}
                      className="w-48 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  
                  {isSearchingUnit && <div className="mt-2 text-sm text-emerald-400">Searching property...</div>}
                  {searchedProperty && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <h4 className="text-sm font-bold text-emerald-400 mb-1">Property Found & Autofilled</h4>
                      <p className="text-xs text-ink-secondary">
                        {searchedProperty.title} • Rs. {Number(searchedProperty.price).toLocaleString()} • {searchedProperty.area} sqft • {searchedProperty.bedrooms || 0} Beds
                      </p>
                    </div>
                  )}
                </div>

                {/* Section II */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">II. My/Our details are as follows</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Name:</label>
                      <input
                        type="text"
                        value={clientData.name}
                        onChange={e => setClientData({...clientData, name: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Father's/Husband's Name:</label>
                      <input
                        type="text"
                        value={clientData.fatherOrHusbandName}
                        onChange={e => setClientData({...clientData, fatherOrHusbandName: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">CNIC Number:</label>
                      <input
                        type="text"
                        value={clientData.cnic}
                        onChange={e => setClientData({...clientData, cnic: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Present Address:</label>
                      <input
                        type="text"
                        value={clientData.presentAddress}
                        onChange={e => setClientData({...clientData, presentAddress: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Permanent Address:</label>
                      <input
                        type="text"
                        value={clientData.permanentAddress}
                        onChange={e => setClientData({...clientData, permanentAddress: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Residential Tel:</label>
                      <input
                        type="text"
                        value={clientData.residentialTel}
                        onChange={e => setClientData({...clientData, residentialTel: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-4">
                        <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Mobile No:</label>
                        <input
                          type="text"
                          value={clientData.mobileNo}
                          onChange={e => setClientData({...clientData, mobileNo: e.target.value})}
                          className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">Email:</label>
                        <input
                          type="email"
                          value={clientData.email}
                          onChange={e => setClientData({...clientData, email: e.target.value})}
                          className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nominee Details 1 */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">Nominee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Name:</label>
                      <input
                        type="text"
                        value={clientData.nominee1Name}
                        onChange={e => setClientData({...clientData, nominee1Name: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">Relationship:</label>
                      <input
                        type="text"
                        value={clientData.nominee1Relation}
                        onChange={e => setClientData({...clientData, nominee1Relation: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">CNIC Number:</label>
                      <input
                        type="text"
                        value={clientData.nominee1Cnic}
                        onChange={e => setClientData({...clientData, nominee1Cnic: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">Mobile No:</label>
                      <input
                        type="text"
                        value={clientData.nominee1Mobile}
                        onChange={e => setClientData({...clientData, nominee1Mobile: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Nominee Details 2 */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">Nominee Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">Name:</label>
                      <input
                        type="text"
                        value={clientData.nominee2Name}
                        onChange={e => setClientData({...clientData, nominee2Name: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">Relationship:</label>
                      <input
                        type="text"
                        value={clientData.nominee2Relation}
                        onChange={e => setClientData({...clientData, nominee2Relation: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-56 text-sm font-bold text-ink-tertiary tracking-wide">CNIC Number:</label>
                      <input
                        type="text"
                        value={clientData.nominee2Cnic}
                        onChange={e => setClientData({...clientData, nominee2Cnic: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-32 text-sm font-bold text-ink-tertiary tracking-wide">Mobile No:</label>
                      <input
                        type="text"
                        value={clientData.nominee2Mobile}
                        onChange={e => setClientData({...clientData, nominee2Mobile: e.target.value})}
                        className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Total Price of Unit:</label>
                  <input
                    type="text"
                    value={clientData.totalPrice}
                    onChange={e => setClientData({...clientData, totalPrice: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Discount (if any):</label>
                  <input
                    type="text"
                    value={clientData.discount}
                    onChange={e => setClientData({...clientData, discount: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Net Price of Unit:</label>
                  <input
                    type="text"
                    value={clientData.netPrice}
                    onChange={e => setClientData({...clientData, netPrice: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Down Payment 25% (On Booking):</label>
                  <input
                    type="text"
                    value={clientData.downPayment}
                    onChange={e => setClientData({...clientData, downPayment: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Possession Payment 20%:</label>
                  <input
                    type="text"
                    value={clientData.possessionPayment}
                    onChange={e => setClientData({...clientData, possessionPayment: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Total No. of Monthly Installments:</label>
                  <input
                    type="text"
                    value={clientData.installmentsCount}
                    onChange={e => setClientData({...clientData, installmentsCount: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Per Month Installment:</label>
                  <input
                    type="text"
                    value={clientData.perMonthInstallment}
                    onChange={e => setClientData({...clientData, perMonthInstallment: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Month:</label>
                  <input
                    type="text"
                    value={clientData.month}
                    onChange={e => setClientData({...clientData, month: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Other Charges:</label>
                  <input
                    type="text"
                    value={clientData.otherCharges}
                    onChange={e => setClientData({...clientData, otherCharges: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Location:</label>
                  <input
                    type="text"
                    value={clientData.location}
                    onChange={e => setClientData({...clientData, location: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Date:</label>
                  <input
                    type="date"
                    value={clientData.paymentDate}
                    onChange={e => setClientData({...clientData, paymentDate: e.target.value})}
                    className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-surface-border">
                  <p className="text-sm font-bold text-ink-tertiary mb-6">Please ensure following documents are attached with Booking Form:<br/>
                  1. Photocopy of CNIC of the Purchaser(s)<br/>
                  2. Photocopy of CNIC of the Joint Purchaser(s) (if applicable)<br/>
                  3. Copy of Payment Plan.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Witness I */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">On behalf of Builder Bricks Marketing & Developers,<br/>Witness I</h4>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">Name:</label>
                        <input type="text" value={clientData.witness1Name} onChange={e => setClientData({...clientData, witness1Name: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">S/O / D/O / W/O:</label>
                        <input type="text" value={clientData.witness1Relation} onChange={e => setClientData({...clientData, witness1Relation: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">CNIC Number:</label>
                        <input type="text" value={clientData.witness1Cnic} onChange={e => setClientData({...clientData, witness1Cnic: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">Date:</label>
                        <input type="date" value={clientData.witness1Date} onChange={e => setClientData({...clientData, witness1Date: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                    </div>
                    {/* Witness II */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Signature and Thumb Impression<br/>of Purchaser(s):<br/>Witness II</h4>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">Name:</label>
                        <input type="text" value={clientData.witness2Name} onChange={e => setClientData({...clientData, witness2Name: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">S/O / D/O / W/O:</label>
                        <input type="text" value={clientData.witness2Relation} onChange={e => setClientData({...clientData, witness2Relation: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">CNIC Number:</label>
                        <input type="text" value={clientData.witness2Cnic} onChange={e => setClientData({...clientData, witness2Cnic: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-32 text-sm font-bold text-ink-tertiary">Date:</label>
                        <input type="date" value={clientData.witness2Date} onChange={e => setClientData({...clientData, witness2Date: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-border bg-surface-base/50 flex justify-end gap-3 rounded-b-3xl">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-emerald-500/20"
                style={{ background: '#10b981', border: '1px solid #059669' }}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="px-5 py-2.5 rounded-xl font-bold text-sm text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
                Back
              </button>
              <button 
                type="submit"
                form="add-client-form"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-500/20"
                style={{ background: '#3b82f6', border: '1px solid #2563eb' }}
              >
                {submitting ? 'Saving...' : 'Submit Forms'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddClientModal;
