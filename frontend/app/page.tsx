
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Shipment {
  shipment_id: string;
  product_id: number;
  supplier_id: number;
  transporter_id: number;
  origin: string;
  destination: string;
  timestamp: string;
  status: string;
  blockchain_hash: string;
}

export default function Dashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/shipments');
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTracking = () => {
    if (trackingId.trim()) {
      window.location.href = `/track/${trackingId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📦 Supply Chain Transparency Platform
          </h1>
          <p className="text-xl text-gray-600">
            Track, Verify, and Ensure Integrity of Your Supply Chain
          </p>
        </header>

        {/* Quick Track Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">🔍 Quick Track</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Shipment ID (e.g., SH001)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleTracking}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Track Shipment
            </button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/shipments" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-semibold">All Shipments</h3>
            <p className="text-gray-600">View all active shipments</p>
          </Link>

          <Link href="/admin/upload" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📤</div>
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <p className="text-gray-600">Add certificates & invoices</p>
          </Link>

          <Link href="/blockchain-verification" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="text-lg font-semibold">Blockchain Verify</h3>
            <p className="text-gray-600">Verify shipment integrity</p>
          </Link>

          <Link href="/analytics" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold">Analytics</h3>
            <p className="text-gray-600">Supply chain insights</p>
          </Link>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📦 Recent Shipments</h2>
          {loading ? (
            <div className="text-center py-8">Loading shipments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Shipment ID</th>
                    <th className="text-left p-4">Origin</th>
                    <th className="text-left p-4">Destination</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.shipment_id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono">{shipment.shipment_id}</td>
                      <td className="p-4">{shipment.origin}</td>
                      <td className="p-4">{shipment.destination}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          shipment.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                          shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="p-4">{new Date(shipment.timestamp).toLocaleDateString()}</td>
                      <td className="p-4">
                        <Link 
                          href={`/track/${shipment.shipment_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tech Stack Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Technology Stack</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Oracle DB:</strong> Metadata storage
            </div>
            <div>
              <strong>MinIO:</strong> Document storage
            </div>
            <div>
              <strong>Blockchain:</strong> Integrity verification
            </div>
            <div>
              <strong>Next.js:</strong> Frontend dashboard
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
