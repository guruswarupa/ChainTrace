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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/shipments" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="text-lg font-semibold">View Shipments</h3>
            <p className="text-gray-600">Track all shipments</p>
          </Link>

          <Link href="/upload" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">📤</div>
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <p className="text-gray-600">Add certificates & invoices</p>
          </Link>

          <Link href="/verify" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="text-lg font-semibold">Blockchain Verify</h3>
            <p className="text-gray-600">Verify shipment integrity</p>
          </Link>

          <Link href="/admin" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-2">⚙️</div>
            <h3 className="text-lg font-semibold">Admin Panel</h3>
            <p className="text-gray-600">Manage database</p>
          </Link>
        </div>

        {/* Tracking Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Track Shipment
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Shipment ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTracking}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Track
            </button>
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📦 Recent Shipments
          </h2>

          {loading ? (
            <div className="text-center py-8">Loading shipments...</div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No shipments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Shipment ID</th>
                    <th className="px-4 py-2 text-left">Origin</th>
                    <th className="px-4 py-2 text-left">Destination</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.slice(0, 10).map((shipment) => (
                    <tr key={shipment.shipment_id} className="border-t">
                      <td className="px-4 py-2 font-mono text-sm">{shipment.shipment_id}</td>
                      <td className="px-4 py-2">{shipment.origin}</td>
                      <td className="px-4 py-2">{shipment.destination}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          shipment.status === 'Created' ? 'bg-blue-100 text-blue-800' :
                          shipment.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{new Date(shipment.timestamp).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <Link 
                          href={`/track/${shipment.shipment_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
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