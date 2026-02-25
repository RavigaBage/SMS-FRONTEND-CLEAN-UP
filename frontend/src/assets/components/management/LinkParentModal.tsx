import React, { useState, ChangeEvent } from 'react';
import ParentForm, { MyFormData } from './ParentForm';
import { apiRequest } from '@/src/lib/apiClient';
import { X, Link2, UserPlus, Search, Phone, Check, Heart } from 'lucide-react';

/* 1. Types */
interface ParentSummary {
  id: number;
  full_name: string;
  phone_number: string;
}

interface LinkParentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: number;
  onLinked: (data: unknown) => void;
  parentsList: ParentSummary[];
}

export default function LinkParentModal({
  open,
  onClose,
  studentId,
  onLinked,
  parentsList,
}: LinkParentModalProps) {

  const [showCreate, setShowCreate] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!open) return null;

  /* 2. Handlers */
  const csrfToken =
    document.cookie
      .split('; ')
      .find(c => c.startsWith('csrftoken='))?.split('=')[1] || '';

  /* Updated Handler for linking an existing record */
  const linkExistingParent = async () => {
    if (!selectedParentId) {
      alert('Select a parent first');
      return;
    }

    const payload = {
      student: studentId,
      parent: selectedParentId,
      is_primary_contact: true,
      can_pickup: true,
    };

    try {
      const res = await apiRequest(`/student-parents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(payload),
      });

      onLinked(res.data || res);
      onClose();
    } catch (err) {
      console.error('Link parent error', err);
      alert('Could not link parent. Check if this link already exists.');
    }
  };

  // Filter parents by search
  const filteredParents = parentsList.filter(parent =>
    parent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.phone_number.includes(searchQuery)
  );

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(217, 119, 6, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0);
          }
        }

        .modal-overlay {
          animation: overlayFadeIn 0.2s ease-out;
        }

        .modal-content {
          animation: modalSlideIn 0.3s ease-out;
        }

        .pulse-ring {
          animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
        
        {/* Modal Container */}
        <div className="modal-content bg-white w-full max-w-2xl max-h-[90vh] my-auto rounded-3xl shadow-2xl overflow-hidden border-2 border-stone-200 flex flex-col">
          
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 px-6 py-4 border-b-2 border-amber-200 flex-shrink-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-lg pulse-ring">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-stone-900">Create Family Connection</h3>
                  <p className="text-xs text-stone-600 mt-0.5">Link this student with their parent or guardian</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {/* Quick Create Button */}
            <button 
              onClick={() => setShowCreate(true)}
              className="w-full mb-4 p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Create New Parent & Link
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-stone-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs font-semibold text-stone-500 bg-white uppercase tracking-wider">
                  Or Select Existing
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none transition-all text-stone-900 placeholder:text-stone-400 text-sm"
                placeholder="Search by name or phone..."
              />
            </div>

            {/* Parents List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
              {filteredParents.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <UserPlus className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm">No parents found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredParents.map((parent, idx) => (
                  <button
                    key={parent.id}
                    onClick={() => setSelectedParentId(parent.id)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedParentId === parent.id
                        ? 'border-amber-500 bg-amber-50 shadow-lg'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                    }`}
                    style={{ 
                      animationDelay: `${idx * 30}ms`,
                      animation: 'modalSlideIn 0.3s ease-out backwards'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-display text-base font-bold shadow-md flex-shrink-0 ${
                        selectedParentId === parent.id
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                          : 'bg-gradient-to-br from-stone-400 to-stone-500'
                      }`}>
                        {parent.full_name.charAt(0)}
                        {selectedParentId === parent.id && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-900 truncate text-sm">{parent.full_name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {parent.phone_number}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedParentId === parent.id && (
                        <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-xs flex-shrink-0">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          Selected
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-stone-50 border-t-2 border-stone-200 flex items-center justify-between gap-3 flex-shrink-0">
            <button 
              onClick={onClose}
              className="px-5 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-200 rounded-xl font-medium transition-all text-sm"
            >
              Cancel
            </button>
            
            <button 
              onClick={linkExistingParent}
              disabled={!selectedParentId}
              className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg text-sm ${
                selectedParentId
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {selectedParentId ? 'Link Parent to Student' : 'Select a Parent'}
            </button>
          </div>
        </div>

        {/* Nested Create Form Modal */}
        {showCreate && (
          <ParentForm
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onSaved={async (parentFormData: MyFormData) => {
              try {
                const payload = {
                  ...parentFormData,
                  is_primary_contact: true, 
                  can_pickup: true
                };

                const res = await apiRequest(
                  `/students/${studentId}/add_parent/`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify(payload),
                  }
                );

                setShowCreate(false);
                onLinked(res.data || res);
                onClose();
              } catch (err) {
                console.error('Create & link error', err);
                alert('Failed to create/link parent.');
              }
            }}
          />
        )}
      </div>
    </>
  );
}