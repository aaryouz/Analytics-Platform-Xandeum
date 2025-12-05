'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { PNode } from '@/lib/types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Home() {
  const [pNodes, setPNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stake' | 'commission'>('stake');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    async function fetchPNodes() {
      try {
        setLoading(true);
        const response = await fetch('/api/pnodes');
        const result = await response.json();

        if (result.ok) {
          setPNodes(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pNodes');
      } finally {
        setLoading(false);
      }
    }

    fetchPNodes();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchPNodes, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pnode-favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (publicKey: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(publicKey)) {
      newFavorites.delete(publicKey);
    } else {
      newFavorites.add(publicKey);
    }
    setFavorites(newFavorites);
    localStorage.setItem('pnode-favorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Calculate performance score
  const calculateScore = (pNode: PNode): number => {
    let score = 0;
    // Higher stake = better (max 50 points)
    score += Math.min((pNode.stake / 10000000) * 50, 50);
    // Lower commission = better (max 30 points)
    score += Math.max(30 - pNode.commission * 3, 0);
    // Active status (20 points)
    score += pNode.status === 'active' ? 20 : 0;
    return Math.round(score);
  };

  // Filter and sort pNodes
  const filteredPNodes = useMemo(() => {
    let filtered = pNodes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.publicKey.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const aVal = sortBy === 'stake' ? a.stake : a.commission;
      const bVal = sortBy === 'stake' ? b.stake : b.commission;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [pNodes, searchTerm, filterStatus, sortBy, sortOrder]);

  // Chart data
  const stakeDistribution = useMemo(() => {
    const ranges = [
      { name: '0-1M', min: 0, max: 1000000, count: 0 },
      { name: '1M-5M', min: 1000000, max: 5000000, count: 0 },
      { name: '5M-10M', min: 5000000, max: 10000000, count: 0 },
      { name: '10M+', min: 10000000, max: Infinity, count: 0 },
    ];
    pNodes.forEach(p => {
      const range = ranges.find(r => p.stake >= r.min && p.stake < r.max);
      if (range) range.count++;
    });
    return ranges;
  }, [pNodes]);

  const commissionData = useMemo(() => {
    const data = pNodes.reduce((acc, p) => {
      const comm = `${p.commission}%`;
      acc[comm] = (acc[comm] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [pNodes]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Xandeum pNode Analytics
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Real-time analytics for Xandeum Provider Nodes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/compare"
                className="px-4 py-2 rounded-lg font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-all"
              >
                📊 Compare pNodes
              </Link>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  autoRefresh
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️ Auto-Refresh OFF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading pNodes from blockchain...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Network Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total pNodes</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{pNodes.length}</p>
                <p className="mt-1 text-xs text-gray-500">Registered on network</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Active pNodes</p>
                <p className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                  {pNodes.filter(p => p.status === 'active').length}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {((pNodes.filter(p => p.status === 'active').length / pNodes.length) * 100).toFixed(1)}% uptime
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Stake</p>
                <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {(pNodes.reduce((sum, p) => sum + p.stake, 0) / 1000000).toFixed(2)}M
                </p>
                <p className="mt-1 text-xs text-gray-500">XAND tokens staked</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg Commission</p>
                <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {(pNodes.reduce((sum, p) => sum + p.commission, 0) / pNodes.length).toFixed(1)}%
                </p>
                <p className="mt-1 text-xs text-gray-500">Network average</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Stake Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stakeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="pNodes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Commission Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={commissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search pNodes
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by public key..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'stake' | 'commission')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="stake">Stake</option>
                      <option value="commission">Commission</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* pNode List with Enhanced Features */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  pNode List ({filteredPNodes.length} {filterStatus !== 'all' ? filterStatus : 'total'})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ⭐
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Public Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stake
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPNodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          {searchTerm || filterStatus !== 'all'
                            ? 'No pNodes match your filters'
                            : 'No pNodes found on the network'}
                        </td>
                      </tr>
                    ) : (
                      filteredPNodes.map((pNode) => {
                        const score = calculateScore(pNode);
                        return (
                          <tr key={pNode.publicKey} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleFavorite(pNode.publicKey)}
                                className="text-2xl hover:scale-110 transition-transform"
                              >
                                {favorites.has(pNode.publicKey) ? '⭐' : '☆'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-100">
                              {pNode.publicKey.substring(0, 8)}...{pNode.publicKey.substring(pNode.publicKey.length - 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                pNode.status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                  : pNode.status === 'inactive'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {pNode.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {(pNode.stake / 1000000).toFixed(2)}M XAND
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {pNode.commission}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {score}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/pnodes/${pNode.publicKey}`}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                              >
                                View Details →
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="mt-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Built with NASA-quality standards for the Xandeum pNodes Bounty
          </p>
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-2">
            Querying Solana Program: 3hMZVwdgRHYSyqkdK3Y8MdZzNwLkjzXod1XrKcniXw56
          </p>
        </div>
      </footer>
    </div>
  );
}
