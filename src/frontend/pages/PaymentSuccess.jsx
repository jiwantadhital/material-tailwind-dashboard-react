import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';
import { authService } from '../../services/apiService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isUpdatingBackend, setIsUpdatingBackend] = useState(true);
  const [backendUpdateError, setBackendUpdateError] = useState(null);
  
  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/documents');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const merchantTxnId = searchParams.get('MerchantTxnId');
  const gatewayTxnId = searchParams.get('GatewayTxnId');
  const docId = searchParams.get('docId');
  const amount = searchParams.get('Amount');
  const bankName = searchParams.get('BankName');
  const paymentType = searchParams.get('PaymentType');

  // Update backend with payment success
  useEffect(() => {
    const updateBackendPaymentStatus = async () => {
      if (!merchantTxnId || !docId) {
        setIsUpdatingBackend(false);
        return;
      }

      try {
        // Update payment status in backend
        const paymentUpdateData = {
          merchant_txn_id: merchantTxnId,
          gateway_txn_id: gatewayTxnId,
          payment_status: 'paid',
          transaction_completed: true
        };
        
        await authService.paymentForDocument(docId, paymentUpdateData);
        setIsUpdatingBackend(false);
      } catch (error) {
        console.error('Failed to update payment status in backend:', error);
        setBackendUpdateError('Failed to update payment status. Please contact support.');
        setIsUpdatingBackend(false);
      }
    };

    updateBackendPaymentStatus();
  }, [merchantTxnId, gatewayTxnId, docId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will be redirected to your documents shortly.
          </p>
          
          {merchantTxnId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Merchant Transaction ID</p>
                  <p className="font-mono text-sm text-gray-900">{merchantTxnId}</p>
                </div>
                {gatewayTxnId && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gateway Transaction ID</p>
                    <p className="font-mono text-sm text-gray-900">{gatewayTxnId}</p>
                  </div>
                )}
                {amount && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="font-semibold text-lg text-green-600">Rs. {amount}</p>
                  </div>
                )}
                {bankName && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    <p className="text-sm text-gray-900">{bankName}</p>
                  </div>
                )}
                {paymentType && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Type</p>
                    <p className="text-sm text-gray-900">{paymentType}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/documents')}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          
          <p className="text-xs text-gray-500 mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 