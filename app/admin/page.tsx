'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, Vendor } from '@/lib/supabase';

export default function AdminPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    earlyBird: 0,
    regular: 0,
    dayOf: 0,
    totalRevenue: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVendors(data || []);
      
      // Calculate stats
      const stats = (data || []).reduce((acc, vendor) => {
        acc.total++;
        acc[vendor.registration_type.replace('-', '') as 'earlyBird' | 'regular' | 'dayOf']++;
        if (vendor.payment_status === 'completed') {
          acc.totalRevenue += vendor.total_amount;
          acc.completed++;
        } else {
          acc.pending++;
        }
        return acc;
      }, {
        total: 0,
        earlyBird: 0,
        regular: 0,
        dayOf: 0,
        totalRevenue: 0,
        completed: 0,
        pending: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id: number, status: 'completed' | 'failed') => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ 
          payment_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      fetchVendors(); // Refresh data
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'Address', 'Registration Type', 'Spaces', 'Amount', 'Payment Status', 'Items', 'Registration Date'].join(','),
      ...vendors.map(vendor => [
        vendor.id,
        `"${vendor.full_name}"`,
        vendor.email,
        vendor.phone,
        `"${vendor.address}"`,
        vendor.registration_type,
        vendor.number_of_spaces,
        vendor.total_amount,
        vendor.payment_status,
        `"${vendor.items_description || ''}"`,
        vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yard-sale-vendors-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line w-8 h-8 flex items-center justify-center animate-spin text-blue-600 mx-auto mb-4"></i>
          <p className="text-gray-600">Loading vendor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
              <p className="text-gray-600">Lyons Community Yard Sale - September 13, 2025</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-download-line w-4 h-4 flex items-center justify-center"></i>
                Export CSV
              </button>
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
              >
                <i className="ri-home-line w-4 h-4 flex items-center justify-center"></i>
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-group-line w-6 h-6 flex items-center justify-center text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-money-dollar-circle-line w-6 h-6 flex items-center justify-center text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line w-6 h-6 flex items-center justify-center text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-time-line w-6 h-6 flex items-center justify-center text-orange-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration Types</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">Early Bird</span>
                <span className="text-2xl font-bold text-green-600">{stats.earlyBird}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Regular</span>
                <span className="text-2xl font-bold text-blue-600">{stats.regular}</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-orange-700 font-medium">Day Of</span>
                <span className="text-2xl font-bold text-orange-600">{stats.dayOf}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Vendor Registrations</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vendor.full_name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{vendor.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{vendor.email}</div>
                      <div className="text-sm text-gray-500">{vendor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize">{vendor.registration_type.replace('-', ' ')}</div>
                      <div className="text-sm text-gray-500">{vendor.number_of_spaces} space(s)</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">${vendor.total_amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        vendor.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : vendor.payment_status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vendor.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.payment_status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePaymentStatus(vendor.id!, 'completed')}
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                            title="Mark as completed"
                          >
                            <i className="ri-check-line w-4 h-4 flex items-center justify-center"></i>
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(vendor.id!, 'failed')}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Mark as failed"
                          >
                            <i className="ri-close-line w-4 h-4 flex items-center justify-center"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}