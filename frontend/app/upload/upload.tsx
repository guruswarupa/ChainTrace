
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shipmentId || !file) {
      setMessage('Please provide shipment ID and select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`http://localhost:5000/api/upload/${shipmentId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('File uploaded successfully!');
        setFile(null);
        setShipmentId('');
      } else {
        setMessage(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      setMessage('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            📤 Upload Documents
          </h1>

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label htmlFor="shipmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Shipment ID
              </label>
              <input
                type="text"
                id="shipmentId"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shipment ID (e.g., SH001)"
                required
              />
            </div>

            <div>
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Document
              </label>
              <input
                type="file"
                id="document"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG, DOC, DOCX
              </p>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
