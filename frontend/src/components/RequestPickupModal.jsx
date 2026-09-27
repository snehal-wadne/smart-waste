import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from './CategoryIcon';
import { createCollectionRequest } from '../api/client';
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Truck,
  FileText,
  Weight,
  Sparkles,
} from 'lucide-react';

export default function RequestPickupModal({
  isOpen,
  onClose,
  categories = [],
  preselectedCategory = null,
}) {
  const navigate = useNavigate();

  // Step state: 1 = Category & Guidance, 2 = Contact, 3 = Location & Schedule, 4 = Success
  const [step, setStep] = useState(1);

  // Form Fields
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Metro City');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('Morning (08:00 AM - 11:00 AM)');
  const [notes, setNotes] = useState('');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdRequest, setCreatedRequest] = useState(null);
  const [copied, setCopied] = useState(false);

  // Set default minimum date to today (or tomorrow)
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      if (preselectedCategory) {
        setSelectedCategoryId(preselectedCategory.id);
      } else if (categories.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(categories[0].id);
      }
      if (!pickupDate) {
        setPickupDate(todayString);
      }
    }
  }, [isOpen, preselectedCategory, categories]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const handleNextStep = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (step === 1) {
      if (!selectedCategoryId) {
        setErrorMessage('Please select a waste category.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!userName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!userPhone.trim() || userPhone.trim().length < 7) {
        setErrorMessage('Please enter a valid phone number for SMS pickup updates.');
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setErrorMessage('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!address.trim()) {
      setErrorMessage('Please provide a complete pickup address.');
      return;
    }
    if (!pickupDate) {
      setErrorMessage('Please select a pickup date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        wasteCategoryId: selectedCategoryId,
        userName,
        userPhone,
        userEmail,
        address,
        city,
        pickupDate,
        pickupTimeSlot,
        pickupAddress: address,
        preferredDate: pickupDate,
        preferredTime: pickupTimeSlot,
        notes,
        estimatedWeightKg: estimatedWeightKg ? parseFloat(estimatedWeightKg) : null,
      };

      const res = await createCollectionRequest(payload);
      if (res.data?.requestNumber) {
        localStorage.setItem('ecocollect_last_request', res.data.requestNumber);
        localStorage.setItem('ecocollect_last_phone', userPhone.trim());
      }
      setCreatedRequest(res.data);
      setStep(4);
    } catch (err) {
      console.error('Request creation error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit pickup request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const requestNum = createdRequest?.requestNumber || createdRequest?.trackingCode || '';

  const copyToClipboard = () => {
    if (requestNum) {
      navigator.clipboard.writeText(requestNum);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackDirect = () => {
    onClose();
    if (requestNum) {
      navigate(`/track?code=${encodeURIComponent(requestNum)}`);
    } else {
      navigate('/track');
    }
  };

  const handleHistoryDirect = () => {
    onClose();
    const phone = createdRequest?.userPhone || userPhone;
    if (phone) {
      navigate(`/history?phone=${encodeURIComponent(phone)}`);
    } else {
      navigate('/history');
    }
  };

  const resetForm = () => {
    setStep(1);
    setCreatedRequest(null);
    setUserName('');
    setUserPhone('');
    setUserEmail('');
    setAddress('');
    setNotes('');
    setEstimatedWeightKg('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 transition-all">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-eco-border animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-eco-dark to-[#0f4021] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-eco-light">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Schedule Waste Pickup</h2>
                <p className="text-xs text-white/70">Civic On-Demand Waste Collection Request</p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/15">
              {[
                { num: 1, title: 'Category' },
                { num: 2, title: 'Citizen Info' },
                { num: 3, title: 'Location & Time' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-eco-primary text-white ring-2 ring-white/50'
                        : step > s.num
                        ? 'bg-eco-light text-eco-dark'
                        : 'bg-white/15 text-white/50'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline ${
                      step >= s.num ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Category & Guidance */}
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-2">
                  Choose Waste Stream
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = cat.id === selectedCategoryId;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-eco-primary bg-eco-light/30 shadow-sm ring-1 ring-eco-primary'
                            : 'border-eco-border hover:border-eco-primary/40 bg-white'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                          }}
                        >
                          <CategoryIcon name={cat.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-eco-dark truncate">{cat.name}</p>
                          <p className="text-[11px] text-eco-muted truncate">{cat.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disposal Guidance Box */}
              {currentCategory && (
                <div className="mt-4 p-4 rounded-2xl bg-eco-bg border border-eco-border">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{
                        backgroundColor: `${currentCategory.color}20`,
                        color: currentCategory.color,
                      }}
                    >
                      <CategoryIcon name={currentCategory.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-eco-dark mb-1">
                        Disposal Protocol: {currentCategory.name}
                      </h4>
                      <p className="text-xs text-eco-charcoal/80 leading-relaxed">
                        {currentCategory.disposalInstructions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white font-semibold px-6 py-2.5 rounded-xl shadow-eco transition-all"
                >
                  <span>Continue to Citizen Info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Citizen Contact Information */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Patel"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                  />
                </div>
                <p className="text-[11px] text-eco-muted mt-1">
                  We send SMS status alerts and driver arrival notifications to this number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                  Email Address <span className="text-eco-muted text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-eco-charcoal/70 hover:text-eco-dark px-4 py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white font-semibold px-6 py-2.5 rounded-xl shadow-eco transition-all"
                >
                  <span>Continue to Pickup Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Location & Schedule */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                  Pickup Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Building name, flat/room #, street, landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                    <input
                      type="date"
                      required
                      min={todayString}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Time Window <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                    <select
                      value={pickupTimeSlot}
                      onChange={(e) => setPickupTimeSlot(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm bg-white"
                    >
                      <option value="Morning (08:00 AM - 11:00 AM)">Morning (08:00 AM - 11:00 AM)</option>
                      <option value="Afternoon (12:00 PM - 03:00 PM)">Afternoon (12:00 PM - 03:00 PM)</option>
                      <option value="Evening (04:00 PM - 07:00 PM)">Evening (04:00 PM - 07:00 PM)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    Est. Weight (kg) <span className="text-eco-muted text-xs font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Weight className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="e.g. 5"
                      value={estimatedWeightKg}
                      onChange={(e) => setEstimatedWeightKg(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                    City / Zone
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-eco-dark mb-1.5">
                  Driver Notes / Gate Code <span className="text-eco-muted text-xs font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-eco-muted absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Leave bags near front porch; gate bell #14"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-eco-border focus:outline-none focus:ring-2 focus:ring-eco-primary/30 focus:border-eco-primary text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-eco-charcoal/70 hover:text-eco-dark px-4 py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white font-semibold px-6 py-2.5 rounded-xl shadow-eco transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Confirm & Schedule Pickup</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success & Confirmation */}
          {step === 4 && createdRequest && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-eco-light flex items-center justify-center text-eco-primary mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="inline-block bg-eco-light px-3 py-1 rounded-full text-xs font-bold text-eco-dark mb-2">
                Request Submitted Successfully
              </span>

              <h3 className="text-2xl font-bold text-eco-dark mb-2">
                Collection Pickup Scheduled!
              </h3>
              <p className="text-sm text-eco-charcoal/70 max-w-md mx-auto mb-6">
                Your municipal collection team has received your request. Save your unique tracking code below.
              </p>

              {/* Request Number Highlight Box */}
              <div className="bg-eco-bg rounded-2xl p-5 border-2 border-dashed border-eco-primary/40 max-w-md mx-auto mb-6">
                <span className="text-xs uppercase font-bold text-eco-muted block mb-1">
                  Your Request Number
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-eco-dark font-mono">
                    {requestNum}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-xl bg-white border border-eco-border hover:bg-eco-light text-eco-dark transition-colors shadow-sm"
                    title="Copy Request Number"
                  >
                    {copied ? <Check className="w-5 h-5 text-eco-primary" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-eco-primary font-semibold mt-1">Copied to clipboard!</p>
                )}
              </div>

              {/* Request Summary Pills */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-left text-xs mb-8 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-gray-500 block">Category:</span>
                  <span className="font-bold text-gray-800">{createdRequest.wasteCategory?.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Pickup Date:</span>
                  <span className="font-bold text-gray-800">{createdRequest.preferredDate || createdRequest.pickupDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Time Slot:</span>
                  <span className="font-bold text-gray-800 truncate block">{createdRequest.preferredTime || createdRequest.pickupTimeSlot}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Initial Status:</span>
                  <span className="inline-block bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded">
                    {createdRequest.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleTrackDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-eco-primary hover:bg-eco-dark text-white font-semibold px-5 py-2.5 rounded-xl shadow-eco transition-all text-xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Status</span>
                </button>
                <button
                  onClick={handleHistoryDirect}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-eco-bg text-eco-dark font-semibold px-5 py-2.5 rounded-xl border border-eco-border shadow-sm transition-all text-xs"
                >
                  <Clock3 className="w-4 h-4 text-eco-primary" />
                  <span>View History</span>
                </button>
                <button
                  onClick={resetForm}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-xs"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
