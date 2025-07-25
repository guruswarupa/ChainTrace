
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TrackingData {
  shipment_id: string;
  product: {
    product_id: number;
    name: string;
    category: string;
  };
  supplier: {
    supplier_id: number;
    name: string;
    location: string;
  };
  transporter: {
    transporter_id: number;
    name: string;
    vehicle_no: string;
  };
  origin: string;
  destination: string;
  timestamp: string;
  status: string;
  blockchain_hash: string;
}

export default function TrackShipment() {
  const params = useParams();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchTrackingData(params.id as string);
    }
  }, [params.id]);

  const fetchTrackingData = async (shipmentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/track/${shipmentId}`);
      if (!response.ok) {
        throw new Error('Shipment not found');
      }
      const data = await response.json();
      setTrackingData(data);

      // Fetch blockchain verification
      const verifyResponse = await fetch(`http://localhost:5000/api/verify/${shipmentId}`);
      const verifyData = await verifyResponse.json();
      setVerification(verifyData);
    } catch (error) {
      setError('Shipment not found or error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">🔍</div>
          <div>Loading shipment details...</div>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Shipment Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            📦 Tracking: {trackingData.shipment_id}
          </h1>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Shipment Status</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              trackingData.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
              trackingData.status === 'Delivered' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {trackingData.status}
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">From</p>
              <p className="font-semibold text-lg">{trackingData.origin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">To</p>
              <p className="font-semibold text-lg">{trackingData.destination}</p>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📦 Product Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Product Name</p>
              <p className="font-semibold">{trackingData.product.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-semibold">{trackingData.product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Product ID</p>
              <p className="font-semibold font-mono">{trackingData.product.product_id}</p>
            </div>
          </div>
        </div>

        {/* Supply Chain Entities */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Supplier */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🏭 Supplier</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold">{trackingData.supplier.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">{trackingData.supplier.location}</p>
              </div>
            </div>
          </div>

          {/* Transporter */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🚛 Transporter</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Company</p>
                <p className="font-semibold">{trackingData.transporter.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-semibold font-mono">{trackingData.transporter.vehicle_no}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Verification */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Blockchain Verification</h2>
          {verification ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="font-semibold text-green-700">Verified on Blockchain</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blockchain Hash</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                  {trackingData.blockchain_hash}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timestamp</p>
                <p className="font-semibold">{new Date(trackingData.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="text-yellow-600">⚠️ Blockchain verification pending</div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📅 Shipment Timeline</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-semibold">Shipment Created</p>
                <p className="text-sm text-gray-600">{new Date(trackingData.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-semibold">In Transit</p>
                <p className="text-sm text-gray-600">Currently being transported</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div>
                <p className="text-gray-500">Delivery Pending</p>
                <p className="text-sm text-gray-400">Awaiting delivery confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
