'use client';

import { useFileUploader } from '@/hooks/use-file-uploader';
import { Upload, X } from 'lucide-react';
import { useRef } from 'react';

/**
 * Example: Using useFileUploader Hook in a Custom Component
 * 
 * This demonstrates how to use the useFileUploader hook
 * to build custom upload components
 */
export function CustomUploadForm() {
  const { uploads, uploadFile, clearUploads, removeUpload } = useFileUploader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    // Upload multiple files sequentially
    for (const file of Array.from(files)) {
      const result = await uploadFile(file);
      if (result) {
        console.log('✅ Uploaded:', result);
        // You can now use result.file_id to store in database
        // Example: saveToDatabase(result.file_id, result.file_name);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          Choose Files
        </button>
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{upload.fileName}</p>
                
                {/* Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Uploading...</span>
                      <span>{upload.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-1">
                      <div
                        className="bg-blue-600 h-1 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status */}
                {upload.message && (
                  <p className={`text-xs mt-1 ${
                    upload.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {upload.message}
                  </p>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeUpload(idx)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Clear All Button */}
          <button
            onClick={clearUploads}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Advanced Usage with Custom Options
 */
export function AdvancedUploadForm() {
  const { uploads, uploadFile } = useFileUploader({
    maxSize: 50 * 1024 * 1024, // 50MB instead of 20MB
    allowedTypes: ['image/jpeg', 'image/png'], // Only images
  });

  const handleImageUpload = async (file: File) => {
    const result = await uploadFile(file, '-1001234567890'); // Custom chat ID
    if (result?.file_id) {
      // Save to database
      console.log(`Image saved with file_id: ${result.file_id}`);
    }
  };

  return (
    <div>
      {/* Custom UI for image uploads */}
      {uploads.map((upload, idx) => (
        <div key={idx} className="p-2">
          <p>{upload.fileName}</p>
          {upload.result && (
            <img
              src={`data:image/jpeg;base64,...`}
              alt={upload.fileName}
              className="w-32 h-32 object-cover rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
}
