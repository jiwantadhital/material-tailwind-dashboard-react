import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, RefreshCw } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const transactionId = searchParams.get('TransactionId');
  const processId = searchParams.get('ProcessId');
  const errorMessage = searchParams.get('ErrorMessage');

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          
          <p className="text-gray-600 mb-6">
            Unfortunately, your payment could not be processed. Please try again or contact support if the problem persists.
          </p>
          
          {errorMessage && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-500 mb-1">Error Details</p>
              <p className="text-sm text-gray-900">{errorMessage}</p>
            </div>
          )}
          
          {transactionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
              <p className="font-mono text-sm text-gray-900">{transactionId}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Try Again
            </button>
            
            <button
              onClick={() => navigate('/documents')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Documents
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Home
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Need help? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure; 