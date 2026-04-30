'use client';

import React from 'react';
import { useGlobalUploads } from '@/hooks/use-global-uploads';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { CloudUpload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cn from '@core/utils/class-names';

export default function HeaderUploadProgress() {
  const { uploads } = useGlobalUploads();
  const { openModal } = useUploadModal();

  if (uploads.length === 0) return null;

  // Find most important status
  const isUploading = uploads.some(u => u.status === 'uploading');
  const isError = uploads.some(u => u.status === 'error');
  const isSuccess = uploads.every(u => u.status === 'success');
  
  // Get latest progress
  const activeUpload = uploads.find(u => u.status === 'uploading') || uploads[uploads.length - 1];
  const progress = activeUpload?.progress || 0;

  return (
    <motion.button
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={openModal}
      className={cn(
        "relative flex items-center justify-center p-2 rounded-full transition-all border",
        isUploading ? "bg-atelier-primary/5 border-atelier-primary/20 text-atelier-primary" : 
        isError ? "bg-red-50 border-red-100 text-atelier-error" : 
        "bg-green-50 border-green-100 text-green-600"
      )}
    >
      <div className="relative">
        {isUploading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-atelier-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-atelier-primary"></span>
            </span>
          </>
        ) : isError ? (
          <AlertCircle size={20} />
        ) : (
          <CheckCircle2 size={20} />
        )}
      </div>

      {isUploading && (
        <span className="ml-2 text-[10px] font-bold font-plus-jakarta hidden sm:block">
          {progress}%
        </span>
      )}
      
      {/* Tooltip / Status hint */}
      <div className="absolute top-full mt-2 right-0 bg-white shadow-xl rounded-xl p-3 border border-slate-100 min-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 hidden md:block">
         <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Tiến trình tải lên</p>
         <div className="space-y-2">
            {uploads.slice(-3).reverse().map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                 <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">{u.fileName}</p>
                    <div className="h-1 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                       <div 
                        className={cn("h-full transition-all", u.status === 'error' ? 'bg-red-500' : 'bg-atelier-primary')} 
                        style={{ width: `${u.progress}%` }} 
                       />
                    </div>
                 </div>
                 {u.status === 'success' && <CheckCircle2 size={12} className="text-green-500" />}
                 {u.status === 'error' && <AlertCircle size={12} className="text-red-500" />}
              </div>
            ))}
         </div>
      </div>
    </motion.button>
  );
}
