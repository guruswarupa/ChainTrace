
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Supplier {
  supplier_id: number;
  name: string;
  location: string;
}

interface Transporter {
  transporter_id: number;
  name: string;
  vehicle_no: string;
}

interface Product {
  product_id: number;
  name: string;
  category: string;
}

export default function AdminPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('suppliers');
  const [loading, setLoading] = useState(true);

  // Form states
  const [supplierForm, setSupplierForm] = useState({ name: '', location: '' });
  const [transporterForm, setTransporterForm] = useState({ name: '', vehicle_no: '' });
  const [productForm, setProductForm] = useState({ name: '', category: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [suppliersRes, transportersRes, productsRes] = await Promise.all([
        fetch('http://localhost:5000/api/suppliers'),
        fetch('http://localhost:5000/api/transporters'),
        fetch('http://localhost:5000/api/products')
      ]);

      setSuppliers(await suppliersRes.json());
      setTransporters(await transportersRes.json());
      setProducts(await productsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      
      if (response.ok) {
        setSupplierForm({ name: '', location: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const handleTransporterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/transporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transporterForm)
      });
      
      if (response.ok) {
        setTransporterForm({ name: '', vehicle_no: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding transporter:', error);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      
      if (response.ok) {
        setProductForm({ name: '', category: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ⚙️ Database Administration
          </h1>

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            {['suppliers', 'transporters', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Suppliers Tab */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <form onSubmit={handleSupplierSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({...supplierForm, name: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={supplierForm.location}
                  onChange={(e) => setSupplierForm({...supplierForm, location: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Supplier
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.supplier_id} className="border-t">
                        <td className="px-4 py-2">{supplier.supplier_id}</td>
                        <td className="px-4 py-2">{supplier.name}</td>
                        <td className="px-4 py-2">{supplier.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transporters Tab */}
          {activeTab === 'transporters' && (
            <div className="space-y-6">
              <form onSubmit={handleTransporterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Transporter Name"
                  value={transporterForm.name}
                  onChange={(e) => setTransporterForm({...transporterForm, name: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Vehicle Number"
                  value={transporterForm.vehicle_no}
                  onChange={(e) => setTransporterForm({...transporterForm, vehicle_no: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Transporter
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Vehicle No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transporters.map((transporter) => (
                      <tr key={transporter.transporter_id} className="border-t">
                        <td className="px-4 py-2">{transporter.transporter_id}</td>
                        <td className="px-4 py-2">{transporter.name}</td>
                        <td className="px-4 py-2">{transporter.vehicle_no}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="px-3 py-2 border rounded-md"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Add Product
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id} className="border-t">
                        <td className="px-4 py-2">{product.product_id}</td>
                        <td className="px-4 py-2">{product.name}</td>
                        <td className="px-4 py-2">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
