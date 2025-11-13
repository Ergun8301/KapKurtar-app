import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { 
  getGenericOffers, 
  getNearbyOffers, 
  createOffer, 
  setClientLocation, 
  setMerchantLocation 
} from '../api';

const DevTestPage = () => {
  const { user } = useAuthStore();
  const [testResults, setTestResults] = useState<Record<string, 'PASS' | 'FAIL' | 'PENDING'>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    setTestResults(prev => ({ ...prev, [testName]: 'PENDING' }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: result ? 'PASS' : 'FAIL' }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({ ...prev, [testName]: 'FAIL' }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Test 1: Can read public offers
    await runTest('Read Generic Offers', async () => {
      const offers = await getGenericOffers();
      return Array.isArray(offers);
    });

    // Test 2: Supabase connection
    await runTest('Supabase Connection', async () => {
      const { data, error } = await supabase.from('offers').select('count').limit(1);
      return !error;
    });

    // Test 3: Fetch sample offers with merchants
    await runTest('Fetch Offers with Merchants', async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('id,title,price_after,created_at,merchant_id, merchants(company_name)')
        .order('created_at', { ascending: false })
        .limit(3);
      console.log(error ? '❌ Supabase select error:' : '✅ Offers result:', error || data);
      return !error && Array.isArray(data);
    });

    // Test 4: Auth state
    await runTest('Auth State', async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session !== null;
    });

    // Test 5: Location functions (if user is logged in)
    if (user) {
      await runTest('Set Client Location', async () => {
        try {
          await setClientLocation(48.8566, 2.3522); // Paris coordinates
          return true;
        } catch (error) {
          return false;
        }
      });

      await runTest('Nearby Offers', async () => {
        try {
          const offers = await getNearbyOffers(48.8566, 2.3522, 5);
          return Array.isArray(offers);
        } catch (error) {
          return false;
        }
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: 'PASS' | 'FAIL' | 'PENDING') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-5 h-5 text-tilkapp-green" />;
      case 'FAIL':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Development Test Suite</h1>
          
          <div className="mb-8">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-green-600 hover:bg-tilkapp-orange disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            
            {Object.entries(testResults).map(([testName, status]) => (
              <div key={testName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{testName}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`font-medium ${
                    status === 'PASS' ? 'text-green-600' : 
                    status === 'FAIL' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Setup Instructions</h3>
            <p className="text-green-800 text-sm">
              Make sure to run the SQL functions in Supabase SQL Editor from: 
              <code className="bg-green-100 px-2 py-1 rounded ml-1">/supabase/sql/rpc.sql</code>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Current User</h3>
            <p className="text-gray-700">
              {user ? `Logged in as: ${user.email}` : 'Not logged in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevTestPage;