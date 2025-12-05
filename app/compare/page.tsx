'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PNode } from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pNodes, setPNodes] = useState<PNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparedPNodes, setComparedPNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPNodes() {
      try {
        const response = await fetch('/api/pnodes');
        const result = await response.json();
        if (result.ok) {
          setPNodes(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch pNodes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPNodes();
  }, []);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    setSelectedIds(ids);
    setComparedPNodes(pNodes.filter(p => ids.includes(p.publicKey)));
  }, [searchParams, pNodes]);

  const calculateScore = (pNode: PNode): number => {
    let score = 0;
    score += Math.min((pNode.stake / 10000000) * 50, 50);
    score += Math.max(30 - pNode.commission * 3, 0);
    score += pNode.status === 'active' ? 20 : 0;
    return Math.round(score);
  };

  const handleSelectChange = (publicKey: string, checked: boolean) => {
    let newSelected = [...selectedIds];
    if (checked) {
      if (newSelected.length < 5) {
        newSelected.push(publicKey);
      } else {
        alert('Maximum 5 pNodes can be compared');
        return;
      }
    } else {
      newSelected = newSelected.filter(id => id !== publicKey);
    }
    setSelectedIds(newSelected);
    router.push(`/compare?ids=${newSelected.join(',')}`);
  };

  // Prepare radar chart data
  const radarData = ['Stake', 'Low Commission', 'Status'].map(metric => {
    const data: Record<string, any> = { metric };
    comparedPNodes.forEach((pNode, idx) => {
      const key = `pNode${idx + 1}`;
      if (metric === 'Stake') {
        data[key] = Math.min((pNode.stake / 10000000) * 100, 100);
      } else if (metric === 'Low Commission') {
        data[key] = Math.max(100 - pNode.commission * 10, 0);
      } else if (metric === 'Status') {
        data[key] = pNode.status === 'active' ? 100 : 0;
      }
    });
    return data;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compare pNodes</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Select up to 5 pNodes to compare their performance metrics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select pNodes ({selectedIds.length}/5)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pNodes.map(pNode => (
              <label
                key={pNode.publicKey}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(pNode.publicKey)}
                  onChange={(e) => handleSelectChange(pNode.publicKey, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
                    {pNode.publicKey.substring(0, 12)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(pNode.stake / 1000000).toFixed(2)}M XAND • {pNode.commission}% comm
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {comparedPNodes.length > 0 && (
          <>
            {/* Radar Chart Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Performance Comparison
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {comparedPNodes.map((_, idx) => (
                    <Radar
                      key={idx}
                      name={`pNode ${idx + 1}`}
                      dataKey={`pNode${idx + 1}`}
                      stroke={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx]}
                      fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detailed Comparison
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Metric
                      </th>
                      {comparedPNodes.map((pNode, idx) => (
                        <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          pNode {idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Public Key
                      </td>
                      {comparedPNodes.map((pNode, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                          {pNode.publicKey.substring(0, 8)}...
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Performance Score
                      </td>
                      {comparedPNodes.map((pNode, idx) => {
                        const score = calculateScore(pNode);
                        return (
                          <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-3 py-1 rounded-full font-bold ${
                              score >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                              score >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {score}/100
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Status
                      </td>
                      {comparedPNodes.map((pNode, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            pNode.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {pNode.status}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Total Stake
                      </td>
                      {comparedPNodes.map((pNode, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {(pNode.stake / 1000000).toFixed(2)}M XAND
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Commission
                      </td>
                      {comparedPNodes.map((pNode, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {pNode.commission}%
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Registered
                      </td>
                      {comparedPNodes.map((pNode, idx) => (
                        <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {pNode.registered ? '✅ Yes' : '❌ No'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {comparedPNodes.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No pNodes Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Select 2-5 pNodes above to see a detailed comparison
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
