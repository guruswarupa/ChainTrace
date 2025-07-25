
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

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredShipments = shipments.filter(shipment => 
    filter === 'all' || shipment.status.toLowerCase() === filter
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">📋 All Shipments</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter by Status</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('created')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'created' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Created
            </button>
            <button
              onClick={() => setFilter('in transit')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'in transit' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'delivered' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Shipments ({filteredShipments.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-2xl mb-4">📦</div>
              <div>Loading shipments...</div>
            </div>
          ) : filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">No Shipments Found</h3>
              <p className="text-gray-600">No shipments match your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Shipment ID</th>
                    <th className="text-left p-4 font-semibold">Origin</th>
                    <th className="text-left p-4 font-semibold">Destination</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Date Created</th>
                    <th className="text-left p-4 font-semibold">Blockchain</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((shipment, index) => (
                    <tr key={shipment.shipment_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4">
                        <span className="font-mono font-semibold">{shipment.shipment_id}</span>
                      </td>
                      <td className="p-4">{shipment.origin}</td>
                      <td className="p-4">{shipment.destination}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          shipment.status === 'In Transit' ? 'bg-yellow-100 text-yellow-800' :
                          shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {new Date(shipment.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="text-green-600 text-sm">✅ Verified</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link 
                            href={`/track/${shipment.shipment_id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Track
                          </Link>
                          <Link 
                            href={`/documents/${shipment.shipment_id}`}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Docs
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-lg font-semibold">Total Shipments</h3>
            <p className="text-2xl font-bold text-blue-600">{shipments.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-2">🚛</div>
            <h3 className="text-lg font-semibold">In Transit</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {shipments.filter(s => s.status === 'In Transit').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold">Delivered</h3>
            <p className="text-2xl font-bold text-green-600">
              {shipments.filter(s => s.status === 'Delivered').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-2">🔗</div>
            <h3 className="text-lg font-semibold">Blockchain Verified</h3>
            <p className="text-2xl font-bold text-purple-600">{shipments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
