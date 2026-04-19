import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileCheck,
  Gavel,
  Receipt,
  Landmark,
  Mail,
  LayoutGrid,
  List,
  Download,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import type { DocumentCategory, VaultDocument } from '../types';

const CATEGORY_ICON: Record<DocumentCategory, React.ElementType> = {
  Enrollment: FileCheck,
  'Settlement Agreements': FileText,
  Legal: Gavel,
  Statements: Receipt,
  'Tax Forms': Landmark,
  Correspondence: Mail,
};

const STATUS_BADGE: Record<VaultDocument['status'], string> = {
  signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unsigned: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-navy-50 text-navy-700 border-navy-200',
};

const CATEGORIES: DocumentCategory[] = [
  'Enrollment',
  'Settlement Agreements',
  'Legal',
  'Statements',
  'Tax Forms',
  'Correspondence',
];

export default function DocumentVault() {
  const { state } = useApp();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  const docs = useMemo(() => {
    let list = [...state.documents];
    if (activeCategory !== 'All') list = list.filter((d) => d.category === activeCategory);
    return list.sort((a, b) => new Date(b.uploadedDate).getTime() - new Date(a.uploadedDate).getTime());
  }, [state.documents, activeCategory]);

  const unsignedCount = state.documents.filter((d) => d.status === 'unsigned').length;
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    state.documents.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [state.documents]);

  return (
    <div className="space-y-6">
      {/* Action Required Banner */}
      <AnimatePresence>
        {unsignedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-800">
              You have {unsignedCount} document{unsignedCount === 1 ? '' : 's'} awaiting signature
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === 'All' ? 'bg-navy-900 text-cream-50' : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
            }`}
          >
            All ({state.documents.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === cat ? 'bg-navy-900 text-cream-50' : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
              }`}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
        <div className="flex items-center bg-cream-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cream-50 text-navy-900 shadow-sm' : 'text-navy-400'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cream-50 text-navy-900 shadow-sm' : 'text-navy-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
      >
        {docs.map((doc, i) => {
          const Icon = CATEGORY_ICON[doc.category];
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              whileHover={{ y: -3 }}
              className={`bg-cream-50 rounded-2xl border border-cream-300 p-5 shadow-sm hover:shadow-md transition-all ${
                viewMode === 'list' ? 'flex items-center gap-4' : ''
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-navy-100 flex items-center justify-center shrink-0 ${
                  viewMode === 'list' ? '' : 'mb-4'
                }`}
              >
                <Icon className="w-6 h-6 text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-navy-900 truncate">{doc.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-navy-400">
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span>{new Date(doc.uploadedDate).toLocaleDateString()}</span>
                  {doc.dueDate && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 font-medium">Due {new Date(doc.dueDate).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${STATUS_BADGE[doc.status]}`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewDoc(doc)}
                  className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-navy-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-cream-100 hover:bg-cream-200 text-navy-600 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream-50 rounded-2xl border border-cream-300 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-cream-50 border-b border-cream-300 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy-900">{previewDoc.name}</h3>
                  <p className="text-xs text-navy-400 mt-0.5">Simulated document preview for demo purposes</p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg hover:bg-cream-200 text-navy-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="border-b-2 border-navy-900 pb-4">
                  <h1 className="text-2xl font-bold text-navy-900">{previewDoc.name}</h1>
                  <p className="text-sm text-navy-500 mt-1">Document ID: {previewDoc.id.toUpperCase()}</p>
                </div>
                <div className="space-y-4 text-sm text-navy-700">
                  <p>
                    <strong>Client:</strong> {state.profile.firstName} {state.profile.lastName}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(previewDoc.uploadedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span className="capitalize font-bold">{previewDoc.status}</span>
                  </p>
                  <div className="h-32 bg-cream-100 rounded-xl border border-dashed border-cream-300 flex items-center justify-center">
                    <span className="text-xs text-navy-400 font-medium">Document content would render here</span>
                  </div>
                  <p className="text-xs text-navy-400 italic">
                    This is a simulated preview for demonstration purposes only. No actual document content is stored.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
