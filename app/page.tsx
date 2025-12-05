'use client';

import { useEffect, useState } from 'react';
import type { PNode } from '@/lib/types';

export default function Home() {
  const [pNodes, setPNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Xandeum pNode Analytics
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Real-time analytics for Xandeum Provider Nodes
          </p>
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Network Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total pNodes</p>
                  <p className="mt-2 text-3xl font-bold text-blue-900 dark:text-blue-100">{pNodes.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active pNodes</p>
                  <p className="mt-2 text-3xl font-bold text-green-900 dark:text-green-100">
                    {pNodes.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Stake</p>
                  <p className="mt-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {pNodes.reduce((sum, p) => sum + p.stake, 0).toLocaleString()} XAND
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  pNode List
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pNodes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No pNodes found on the network. This could mean:
                          <ul className="mt-2 text-sm list-disc list-inside">
                            <li>No pNodes are registered yet on devnet</li>
                            <li>The program is on a different network</li>
                            <li>Account data parsing needs implementation</li>
                          </ul>
                        </td>
                      </tr>
                    ) : (
                      pNodes.map((pNode) => (
                        <tr key={pNode.publicKey} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                            {pNode.stake.toLocaleString()} XAND
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {pNode.commission}%
                          </td>
                        </tr>
                      ))
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
