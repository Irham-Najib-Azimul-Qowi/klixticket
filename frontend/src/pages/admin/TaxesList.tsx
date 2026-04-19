import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Edit, Trash2, Percent, CheckCircle, XCircle } from 'lucide-react';
import { taxApi } from '@/services/api';
import type { Tax } from '@/types';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const TaxesList: React.FC = () => {
  const { showToast } = useToast();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State for Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taxToDelete, setTaxToDelete] = useState<number | null>(null);

  // Modal State for Create/Update
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0,
    active_status: true
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const data = await taxApi.getAllTaxes();
      setTaxes(data);
    } catch (error) {
      setTaxes([]);
      showToast('Failed to fetch tax records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingTax(null);
    setFormData({ name: '', percentage: 0, active_status: true });
    setIsFormModalOpen(true);
  };

  const handleEditClick = (tax: Tax) => {
    setEditingTax(tax);
    setFormData({ 
      name: tax.name, 
      percentage: tax.percentage, 
      active_status: tax.active_status 
    });
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setTaxToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (taxToDelete === null) return;
    try {
      await taxApi.deleteTax(taxToDelete);
      showToast('Tax record deleted successfully.', 'success');
      fetchTaxes();
    } catch (err: any) {
      showToast('Deletion failed: ' + err.message, 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingTax) {
        await taxApi.updateTax(editingTax.id, formData);
        showToast('Tax record updated successfully.', 'success');
      } else {
        await taxApi.createTax(formData);
        showToast('New tax record initialized.', 'success');
      }
      setIsFormModalOpen(false);
      fetchTaxes();
    } catch (err: any) {
      showToast('Submission failed: ' + err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (tax: Tax) => {
    try {
      await taxApi.updateTax(tax.id, { active_status: !tax.active_status });
      showToast(`Tax ${tax.active_status ? 'deactivated' : 'activated'} successfully.`, 'success');
      fetchTaxes();
    } catch (err: any) {
      showToast('Status update failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Tax Management</h2>
          <p className="text-sm text-slate-500 font-medium">Configure taxes and service fees applied at checkout.</p>
        </div>
        <button 
          onClick={handleCreateClick} 
          className="bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center gap-2 w-fit uppercase tracking-widest"
        >
          <Plus size={16} /> Add New Tax
        </button>
      </div>

      {/* List Area */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Name</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Rate (%)</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-slate-300 w-8 h-8 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Syncing tax records...</p>
                  </div>
                </td>
              </tr>
            ) : taxes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Percent className="w-12 h-12 text-slate-100 mb-4" />
                    <p className="text-slate-500 font-bold">No taxes defined</p>
                    <p className="text-slate-400 mt-1">Add a tax to start applying it during checkout.</p>
                  </div>
                </td>
              </tr>
            ) : (
              taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{tax.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-600 font-mono text-sm">{tax.percentage}%</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(tax)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        tax.active_status 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {tax.active_status ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {tax.active_status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditClick(tax)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"
                        title="Edit Tax"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(tax.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Delete Tax"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Tax Configuration"
        message="Are you sure you want to terminate this tax record? This will permanently remove it from the system and it will no longer be applied to future checkouts."
        confirmText="Confirm Deletion"
        cancelText="Cancel"
      />

      {/* Form Modal for Create/Update */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm">
                {editingTax ? 'Update Tax Record' : 'Initialize New Tax'}
              </h3>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-900"
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tax Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. VAT, Service Fee"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Percentage Rate (%)</label>
                <div className="relative">
                  <input 
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={formData.percentage}
                    onChange={(e) => setFormData({...formData, percentage: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 transition-all pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none font-bold">%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox"
                  id="active_status"
                  checked={formData.active_status}
                  onChange={(e) => setFormData({...formData, active_status: e.target.checked})}
                  className="w-4 h-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                />
                <label htmlFor="active_status" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer">Set as Active</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2.5 bg-slate-950 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {formLoading ? <Loader2 className="animate-spin" size={14} /> : (editingTax ? 'Update' : 'Initialize')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxesList;
