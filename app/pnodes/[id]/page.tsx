'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PNode } from '@/lib/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function PNodeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pNode, setPNode] = useState<PNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPNode() {
      try {
        setLoading(true);
        const response = await fetch(`/api/pnodes/${params.id}`);
        const result = await response.json();

        if (result.ok) {
          setPNode(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pNode');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchPNode();
    }
  }, [params.id]);

  const calculateScore = (pNode: PNode): number => {
    let score = 0;
    score += Math.min((pNode.stake / 10000000) * 50, 50);
    score += Math.max(30 - pNode.commission * 3, 0);
    score += pNode.status === 'active' ? 20 : 0;
    return Math.round(score);
  };

  // Mock historical data for demonstration
  const historicalData = [
    { date: 'Nov 30', stake: pNode ? pNode.stake * 0.8 : 0, commission: pNode?.commission || 0 },
    { date: 'Dec 1', stake: pNode ? pNode.stake * 0.9 : 0, commission: pNode?.commission || 0 },
    { date: 'Dec 2', stake: pNode ? pNode.stake * 0.95 : 0, commission: pNode?.commission || 0 },
    { date: 'Dec 3', stake: pNode ? pNode.stake * 0.98 : 0, commission: pNode?.commission || 0 },
    { date: 'Dec 4', stake: pNode?.stake || 0, commission: pNode?.commission || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="text-gray-700 dark:text-gray-300">Loading pNode details...</span>
        </div>
      </div>
    );
  }

  if (error || !pNode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">pNode Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The requested pNode could not be found.'}
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score = calculateScore(pNode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">pNode Details</h1>
              <p className="mt-1 text-sm font-mono text-gray-600 dark:text-gray-400">{pNode.publicKey}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  pNode.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}
              >
                {pNode.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Performance Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance Score</h2>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  } transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white">{score}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {score >= 70 ? 'Excellent' : score >= 40 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Stake</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {(pNode.stake / 1000000).toFixed(2)}M
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">XAND Tokens</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Commission Rate</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{pNode.commission}%</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {pNode.commission < 5 ? 'Low' : pNode.commission < 10 ? 'Average' : 'High'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Registration Status</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {pNode.registered ? 'Registered' : 'Unregistered'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">On Solana Blockchain</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stake History</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stake" stroke="#8b5cf6" name="Stake (XAND)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="commission" fill="#3b82f6" name="Commission (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Information</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Public Key</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                  {pNode.publicKey}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      pNode.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    }`}
                  >
                    {pNode.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stake</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {pNode.stake.toLocaleString()} XAND
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pNode.commission}%</dd>
              </div>
              {pNode.transactionHash && (
                <div>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration TX</dt>
                  <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {pNode.transactionHash}
                  </dd>
                </div>
              )}
              {pNode.lastUpdated && (
                <div>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(pNode.lastUpdated).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Performance Metrics (if available) */}
        {(pNode.networkSpeed || pNode.serverInfo || pNode.versions || pNode.storage) && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Advanced Metrics
              </h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pNode.networkSpeed && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Download Speed</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {pNode.networkSpeed.download} Mbps
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Speed</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {pNode.networkSpeed.upload} Mbps
                      </dd>
                    </div>
                  </>
                )}
                {pNode.serverInfo && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">IP Address</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{pNode.serverInfo.ip}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600 dark:text-gray-400">Hostname</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {pNode.serverInfo.hostname}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
