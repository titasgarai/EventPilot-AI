import React, { useState } from 'react';
import {
  Store,
  Plus,
  Phone,
  Mail,
  Globe,
  Edit2,
  Trash2,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Tag,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { EventPlan, Vendor, VendorCategory, VendorStatus } from '../types';
import { formatCurrency, calculateVendorStats } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { VendorAdviceModal } from '../components/common/VendorAdviceModal';
import { useToast } from '../components/common/Toast';
import { findMissingVendorsWithAI } from '../services/gemini';

interface VendorsViewProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const VENDOR_CATEGORIES: VendorCategory[] = [
  'Venue',
  'Catering',
  'Photographer',
  'Decorator',
  'Entertainment',
  'Cake',
  'Party Favors',
  'AV & Production',
  'Speakers',
  'Platform & Software',
  'Volunteers & Staff',
  'Transportation',
  'Makeup',
  'Security',
  'Printing',
  'Equipment',
  'Other',
];

const STATUS_OPTIONS: VendorStatus[] = ['Not Started', 'Shortlisted', 'Contacted', 'Booked'];

export const VendorsView: React.FC<VendorsViewProps> = ({ event, onUpdateEvent }) => {
  const { showToast } = useToast();
  const stats = calculateVendorStats(event);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VendorCategory>('Catering');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [status, setStatus] = useState<VendorStatus>('Shortlisted');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Missing Vendors AI modal
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [missingResult, setMissingResult] = useState<{
    summary: string;
    missingCategories: { category: string; reason: string; estimatedBudgetShare: string; urgency: 'high' | 'medium' | 'low' }[];
  } | null>(null);

  // Vendor Advice AI modal
  const [adviceModalCategory, setAdviceModalCategory] = useState<VendorCategory | null>(null);

  const openAddModal = (presetCategory?: VendorCategory) => {
    setEditingVendor(null);
    setName('');
    setCategory(presetCategory || 'Catering');
    setEstimatedCost(0);
    setActualCost(0);
    setStatus('Shortlisted');
    setContact('');
    setEmail('');
    setWebsite('');
    setNotes('');
    setIsVendorModalOpen(true);
  };

  const openEditModal = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setEstimatedCost(v.estimatedCost);
    setActualCost(v.actualCost || 0);
    setStatus(v.status);
    setContact(v.contact);
    setEmail(v.email || '');
    setWebsite(v.website || '');
    setNotes(v.notes || '');
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = () => {
    if (!name.trim()) {
      showToast('Please enter vendor name', 'error');
      return;
    }

    let updatedVendors: Vendor[];
    if (editingVendor) {
      updatedVendors = event.vendors.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              name: name.trim(),
              category,
              estimatedCost,
              actualCost: actualCost > 0 ? actualCost : undefined,
              status,
              contact: contact.trim(),
              email: email.trim() || undefined,
              website: website.trim() || undefined,
              notes: notes.trim(),
            }
          : v
      );
      showToast('Vendor updated!', 'success');
    } else {
      const newVendor: Vendor = {
        id: `v-${Date.now()}`,
        name: name.trim(),
        category,
        estimatedCost,
        actualCost: actualCost > 0 ? actualCost : undefined,
        status,
        contact: contact.trim(),
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim(),
      };
      updatedVendors = [...event.vendors, newVendor];
      showToast('New vendor added!', 'success');
    }

    onUpdateEvent({
      ...event,
      vendors: updatedVendors,
      updatedAt: new Date().toISOString(),
    });

    setIsVendorModalOpen(false);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = event.vendors.filter((v) => v.id !== id);
    onUpdateEvent({
      ...event,
      vendors: updated,
      updatedAt: new Date().toISOString(),
    });
    showToast('Vendor removed', 'info');
  };

  const handleFindMissingVendors = async () => {
    setIsMissingModalOpen(true);
    setIsAnalyzing(true);
    try {
      const result = await findMissingVendorsWithAI(event);
      setMissingResult(result);
    } catch (err) {
      console.error(err);
      showToast('Failed to analyze vendors', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddMissingCategory = (catName: string) => {
    const newVendor: Vendor = {
      id: `v-${Date.now()}`,
      name: `TBD (${catName})`,
      category: 'Other',
      estimatedCost: Math.round(event.totalBudget * 0.03),
      status: 'Not Started',
      contact: '',
      notes: `Identified by EventPilot AI during missing vendors scan`,
    };
    onUpdateEvent({
      ...event,
      vendors: [...event.vendors, newVendor],
      updatedAt: new Date().toISOString(),
    });
    showToast(`Added ${catName} slot to vendors checklist!`, 'success');
  };

  // Filter vendors
  const filteredVendors = event.vendors.filter((v) => {
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Supplier Operations
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Vendor Directory & Outreach
          </h2>
          <p className="text-xs text-slate-500">
            Track contracts, direct contact options, and GenAI supplier advice
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFindMissingVendors}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-royal-600 hover:from-purple-500 hover:to-royal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Find Missing Vendors</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Vendors
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">{stats.total}</p>
          <span className="text-[11px] text-slate-500">Registered in plan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            Booked & Confirmed
          </span>
          <p className="text-xl font-black text-emerald-600 mt-1">{stats.booked}</p>
          <span className="text-[11px] text-slate-500">Contracts locked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-royal-600 uppercase tracking-wider">
            In Negotiation
          </span>
          <p className="text-xl font-black text-royal-600 mt-1">
            {stats.contacted + stats.shortlisted}
          </p>
          <span className="text-[11px] text-slate-500">
            {stats.contacted} contacted • {stats.shortlisted} shortlisted
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Not Started
          </span>
          <p className="text-xl font-black text-amber-600 mt-1">{stats.notStarted}</p>
          <span className="text-[11px] text-slate-500">Needs initial outreach</span>
        </div>
      </div>

      {/* AI Transparency & Guidance Banner */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl px-4 py-3 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
        <p className="text-xs text-sky-950 leading-relaxed">
          <span className="font-bold">Planning Tip:</span> Vendor estimates and suggestions are AI-generated based on typical local costs for your event style and guest count. Contact and verify providers directly before signing contracts or paying deposits.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories ({event.vendors.length})
          </button>
          {VENDOR_CATEGORIES.map((cat) => {
            const count = event.vendors.filter((v) => v.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const statusClass = {
            Booked: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Contacted: 'bg-sky-50 text-sky-700 border-sky-200',
            Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
            'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
          }[vendor.status];

          return (
            <div
              key={vendor.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {vendor.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                    {vendor.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-2.5">{vendor.name}</h3>

                {vendor.notes && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {vendor.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Estimated Fee</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(vendor.estimatedCost, event.currency)}
                  </span>
                </div>

                {vendor.actualCost && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Actual Contract</span>
                    <span className="font-bold text-brand-700">
                      {formatCurrency(vendor.actualCost, event.currency)}
                    </span>
                  </div>
                )}

                {/* Direct Action Contact Buttons (only if information exists) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {vendor.contact && (
                    <a
                      href={`tel:${vendor.contact}`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title={`Call ${vendor.contact}`}
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}
                  {vendor.email && (
                    <a
                      href={`mailto:${vendor.email}`}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title={`Email ${vendor.email}`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title={vendor.website}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}

                  {/* AI Advice & Alternatives Trigger */}
                  <button
                    type="button"
                    onClick={() => setAdviceModalCategory(vendor.category)}
                    className="px-2.5 py-1 rounded-lg bg-royal-50 text-royal-700 border border-royal-200 hover:bg-royal-100 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                    title="Get AI alternatives, negotiation questions & pricing advice"
                  >
                    <Sparkles className="w-3 h-3 text-royal-600" />
                    <span>AI Advice</span>
                  </button>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px]">
                  <span className="text-slate-400">
                    {vendor.contact || vendor.email || 'No contact saved'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Add New Vendor'}
        subtitle="Manage contact information, estimated fees, and contracts"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Vendor / Business Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sovabazar Heritage Banquet"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as VendorCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VendorStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Cost ({event.currency})
              </label>
              <input
                type="number"
                min={0}
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Actual Agreed Cost ({event.currency})
              </label>
              <input
                type="number"
                min={0}
                value={actualCost}
                onChange={(e) => setActualCost(Number(e.target.value) || 0)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98300 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@mail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Website Link
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://vendor.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notes & Contract Terms
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Includes air conditioned hall and stage lighting."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsVendorModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveVendor}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {editingVendor ? 'Save Updates' : 'Add Vendor'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Find Missing Vendors Audit Modal */}
      <Modal
        isOpen={isMissingModalOpen}
        onClose={() => setIsMissingModalOpen(false)}
        title="GenAI Missing Vendor Audit"
        subtitle="Gemini gap analysis of your booked supplier roster"
        maxWidth="xl"
      >
        {isAnalyzing ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">Scanning vendor categories...</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparing current bookings with requirements for a {event.guestCount}-guest {event.type}
              </p>
            </div>
          </div>
        ) : missingResult ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" /> Audit Findings
              </span>
              {missingResult.summary}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Identified Missing Service Categories
              </h4>
              {missingResult.missingCategories.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {item.estimatedBudgetShare}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.reason}</p>
                  </div>

                  <button
                    onClick={() => handleAddMissingCategory(item.category)}
                    className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-colors shrink-0"
                  >
                    + Add to Roster
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMissingModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Close Audit
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Vendor Advice Modal */}
      {adviceModalCategory && (
        <VendorAdviceModal
          isOpen={Boolean(adviceModalCategory)}
          onClose={() => setAdviceModalCategory(null)}
          category={adviceModalCategory}
          event={event}
        />
      )}
    </div>
  );
};
