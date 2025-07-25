
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface VerificationResult {
  shipment_id: string;
  blockchain_hash: string;
  owner: string;
  timestamp: string;
  verified: boolean;
  verification_status: string;
  error?: string;
}

export default function VerifyPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shipmentId.trim()) {
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:5000/api/verify/${shipmentId}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        shipment_id: shipmentId,
        blockchain_hash: '',
        owner: '',
        timestamp: '',
        verified: false,
        verification_status: 'Network error occurred',
        error: 'Failed to connect to verification service'
      });
    } finally {
      setVerifying(false);
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
            🔗 Blockchain Verification
          </h1>

          <form onSubmit={handleVerify} className="space-y-6 mb-8">
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
                placeholder="Enter shipment ID to verify"
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Verify on Blockchain'}
            </button>
          </form>

          {result && (
            <div className={`p-6 rounded-lg ${
              result.verified 
                ? 'bg-green-100 border border-green-300' 
                : 'bg-red-100 border border-red-300'
            }`}>
              <h2 className="text-xl font-semibold mb-4">
                {result.verified ? '✅ Verification Successful' : '❌ Verification Failed'}
              </h2>
              
              <div className="space-y-2 text-sm">
                <p><strong>Shipment ID:</strong> {result.shipment_id}</p>
                <p><strong>Status:</strong> {result.verification_status}</p>
                
                {result.verified && (
                  <>
                    <p><strong>Blockchain Hash:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{result.blockchain_hash}</code></p>
                    <p><strong>Owner:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{result.owner}</code></p>
                    <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                  </>
                )}
                
                {result.error && (
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
