import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { EventPlan, BudgetCategory, BudgetItem, Expense } from '../types';
import { formatCurrency, calculateBudgetStats } from '../utils/formatters';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { optimizeBudgetWithAI } from '../services/gemini';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

interface BudgetViewProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue',
  'Catering',
  'Decoration',
  'Photography',
  'Entertainment',
  'Invitations',
  'Transportation',
  'Clothing',
  'Miscellaneous',
];

const COLORS = [
  '#c23c57', // brand-600
  '#4b61cb', // royal-600
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#8b5cf6', // purple-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
  '#f97316', // orange-500
];

export const BudgetView: React.FC<BudgetViewProps> = ({ event, onUpdateEvent }) => {
  const { showToast } = useToast();
  const stats = calculateBudgetStats(event);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Expense form state
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmountStr, setExpenseAmountStr] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<BudgetCategory>('Catering');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expensePaidTo, setExpensePaidTo] = useState('');

  // AI Optimizer Modal state
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<{
    summary: string;
    recommendations: { category: string; currentShare: number; suggestedShare: number; advice: string }[];
  } | null>(null);

  // Handle opening add expense
  const openAddModal = (presetCategory?: BudgetCategory) => {
    setEditingExpense(null);
    setExpenseTitle('');
    setExpenseAmountStr('');
    setExpenseCategory(presetCategory || 'Catering');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpensePaidTo('');
    setIsAddExpenseOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseTitle(exp.title);
    setExpenseAmountStr(exp.amount ? String(exp.amount) : '');
    setExpenseCategory(exp.category);
    setExpenseDate(exp.date);
    setExpensePaidTo(exp.paidTo || '');
    setIsAddExpenseOpen(true);
  };

  const handleSaveExpense = () => {
    const parsedAmount = Number(expenseAmountStr.replace(/[^0-9.]/g, ''));
    if (!expenseTitle.trim() || !parsedAmount || parsedAmount <= 0) {
      showToast('Please enter an expense description and valid positive amount', 'error');
      return;
    }

    let updatedExpenses: Expense[];
    if (editingExpense) {
      updatedExpenses = event.expenses.map((e) =>
        e.id === editingExpense.id
          ? {
              ...e,
              title: expenseTitle,
              amount: parsedAmount,
              category: expenseCategory,
              date: expenseDate,
              paidTo: expensePaidTo,
            }
          : e
      );
      showToast('Expense updated successfully!', 'success');
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        title: expenseTitle,
        amount: parsedAmount,
        category: expenseCategory,
        date: expenseDate,
        paidTo: expensePaidTo,
      };
      updatedExpenses = [newExp, ...event.expenses];
      showToast('New expense recorded!', 'success');
    }

    // Recompute budget item spent amounts based on expenses
    const updatedBudgetPlan = event.budgetPlan.map((b) => {
      const categoryExpenses = updatedExpenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        ...b,
        spentAmount: categoryExpenses,
      };
    });

    onUpdateEvent({
      ...event,
      expenses: updatedExpenses,
      budgetPlan: updatedBudgetPlan,
      updatedAt: new Date().toISOString(),
    });

    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = event.expenses.filter((e) => e.id !== id);
    const updatedBudgetPlan = event.budgetPlan.map((b) => {
      const categoryExpenses = updatedExpenses
        .filter((e) => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        ...b,
        spentAmount: categoryExpenses,
      };
    });

    onUpdateEvent({
      ...event,
      expenses: updatedExpenses,
      budgetPlan: updatedBudgetPlan,
      updatedAt: new Date().toISOString(),
    });

    showToast('Expense removed', 'info');
  };

  // Run AI Budget Optimizer
  const handleOptimizeBudget = async () => {
    setIsOptimizeOpen(true);
    setIsOptimizing(true);
    try {
      const result = await optimizeBudgetWithAI(event);
      setOptimizationResult(result);
    } catch (err) {
      console.error(err);
      showToast('Failed to optimize budget', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Prepare chart data
  const pieData = event.budgetPlan
    .filter((b) => b.plannedAmount > 0)
    .map((b) => ({
      name: b.category,
      value: b.plannedAmount,
    }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Financial Management
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Budget & Expense Tracker
          </h2>
          <p className="text-xs text-slate-500">
            Real-time balance, category allocations, and GenAI cost optimization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOptimizeBudget}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-royal-600 hover:from-purple-500 hover:to-royal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Optimize My Budget</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Budget
          </span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(stats.totalBudget, event.currency)}
          </p>
          <span className="text-[11px] text-slate-500">Target Ceiling</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Planned
          </span>
          <p className="text-xl font-black text-royal-700 mt-1">
            {formatCurrency(stats.totalPlanned, event.currency)}
          </p>
          <span className="text-[11px] text-slate-500">Sum of categories</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Spent
          </span>
          <p className="text-xl font-black text-brand-700 mt-1">
            {formatCurrency(stats.totalSpent, event.currency)}
          </p>
          <span className="text-[11px] text-slate-500">Recorded payments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Remaining Buffer
          </span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(stats.remaining, event.currency)}
          </p>
          <span className="text-[11px] text-slate-500">Available funds</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Percentage Used
          </span>
          <p className="text-xl font-black text-purple-700 mt-1">
            {stats.percentageSpent}%
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                stats.isOverBudget ? 'bg-rose-500' : 'bg-brand-600'
              } transition-all duration-500`}
              style={{ width: `${Math.min(100, stats.percentageSpent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Charts: Pie and Bar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-600" />
            <span>Category Share Distribution</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Planned percentage by category</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value, event.currency),
                    'Planned',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-royal-600" />
            <span>Category Spending Comparison</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">Planned vs Actual spent</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={event.budgetPlan}
                margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
              >
                <XAxis dataKey="category" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value, event.currency),
                    'Amount',
                  ]}
                />
                <Bar dataKey="plannedAmount" fill="#4b61cb" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="spentAmount" fill="#c23c57" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Categories Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category Budgets</h3>
            <p className="text-xs text-slate-500">Planned vs spent balance across 9 standard areas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Planned</th>
                <th className="px-5 py-3">Spent</th>
                <th className="px-5 py-3">Remaining</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {event.budgetPlan.map((b) => {
                const remaining = Math.max(0, b.plannedAmount - b.spentAmount);
                const percent = b.plannedAmount > 0 ? Math.round((b.spentAmount / b.plannedAmount) * 100) : 0;
                const isOver = b.spentAmount > b.plannedAmount;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div>
                        <span>{b.category}</span>
                        {b.notes && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">
                            {b.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {formatCurrency(b.plannedAmount, event.currency)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-brand-700">
                      {formatCurrency(b.spentAmount, event.currency)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-600">
                      {formatCurrency(remaining, event.currency)}
                    </td>
                    <td className="px-5 py-3.5 w-40">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isOver ? 'bg-rose-500' : 'bg-brand-600'}`}
                            style={{ width: `${Math.min(100, percent)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] font-bold ${isOver ? 'text-rose-600' : 'text-slate-600'}`}>
                          {percent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openAddModal(b.category)}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        + Add Expense
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Expenses & Payments</h3>
            <p className="text-xs text-slate-500">
              {event.expenses.length} disbursements recorded
            </p>
          </div>
          <button
            onClick={() => openAddModal()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>

        {event.expenses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No expenses recorded yet. Click "+ Add Expense" above to record receipts.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Expense Item</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Paid To</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {event.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{exp.title}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{exp.date}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {exp.paidTo || '—'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {formatCurrency(exp.amount, event.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
        subtitle="Track payment receipts and vendor advance disbursements"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Expense Title / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="e.g., Caterer Advance Token (40%)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Amount ({event.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={expenseAmountStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                  setExpenseAmountStr(cleaned);
                }}
                placeholder="e.g., 25000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Category
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as BudgetCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Date of Payment
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Paid To (Vendor / Recipient)
              </label>
              <input
                type="text"
                value={expensePaidTo}
                onChange={(e) => setExpensePaidTo(e.target.value)}
                placeholder="e.g., Sovabazar Heritage Banquet"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddExpenseOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveExpense}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {editingExpense ? 'Save Updates' : 'Add Expense'}
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Budget Optimizer Modal */}
      <Modal
        isOpen={isOptimizeOpen}
        onClose={() => setIsOptimizeOpen(false)}
        title="GenAI Budget Optimization Engine"
        subtitle="Gemini financial analysis to unlock savings and rebalance allocations"
        maxWidth="xl"
      >
        {isOptimizing ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">Analyzing budget allocations...</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmarking against {event.type} industry standards for {event.guestCount} guests
              </p>
            </div>
          </div>
        ) : optimizationResult ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" /> Executive AI Recommendation
              </span>
              {optimizationResult.summary}
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Category Optimization Advice
              </h4>
              {optimizationResult.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{rec.category}</span>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-rose-600">Current: {rec.currentShare}%</span>
                      <span>→</span>
                      <span className="text-emerald-600 font-bold">Suggested: {rec.suggestedShare}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.advice}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOptimizeOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

