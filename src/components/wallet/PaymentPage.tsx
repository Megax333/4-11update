import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { supabase } from '../../lib/supabase';
import useAuth from '../../hooks/useAuth';
import CoinIcon from '../CoinIcon';
import { ArrowLeft, CreditCard } from 'lucide-react';
import StripePaymentContainer from './StripePaymentForm';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe'); // Default to Stripe
  const [packageDetails, setPackageDetails] = useState<{
    id: string;
    name: string;
    xce_amount: number;
    price_usd: number;
  } | null>(null);

  // Get package ID from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const packageId = searchParams.get('packageId');

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!packageId) {
        setError('No package selected');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('xce_packages')
          .select('*')
          .eq('id', packageId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Package not found');

        setPackageDetails(data);
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Could not load package details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetails();
  }, [packageId]);

  const handlePaymentSuccess = async (orderId: string) => {
    if (!user || !packageDetails) return;
    
    try {
      setIsProcessing(true);
      
      // Record the successful payment in your database
      const { error } = await supabase.rpc('complete_xce_purchase', {
        p_user_id: user.id,
        p_package_id: packageDetails.id,
        p_payment_id: orderId,
        p_amount: packageDetails.xce_amount
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        
        if (error.message.includes('function "complete_xce_purchase" does not exist')) {
          setError('The payment system is not fully configured. Please contact support with error: "Missing SQL function".');
        } else {
          setError(`Error processing payment: ${error.message}`);
        }
        return;
      }

      // Redirect back to the home page with success message
      navigate('/?status=success');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Payment was received but there was an error adding XCE to your account. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121218] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !packageDetails) {
    return (
      <div className="min-h-screen bg-[#121218] flex flex-col items-center justify-center p-6">
        <div className="bg-[#1E1E2A] p-8 rounded-2xl max-w-md w-full">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error || 'Package not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-[#2A2A3A] hover:bg-[#3A3A4A] px-6 py-3 rounded-xl transition-colors w-full justify-center"
          >
            <ArrowLeft size={18} />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121218] flex flex-col items-center justify-center p-6">
      <div className="bg-[#1E1E2A] p-8 rounded-2xl max-w-md w-full relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        
        <div className="relative">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>

          <h2 className="text-2xl font-bold mb-6">Complete Your Purchase</h2>
          
          <div className="bg-[#2A2A3A] p-6 rounded-xl mb-8 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Package</span>
              <span className="font-medium">{packageDetails.name}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Price</span>
              <span className="font-medium">${packageDetails.price_usd.toFixed(2)} USD</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">You'll receive</span>
              <div className="flex items-center gap-2">
                <CoinIcon size={18} />
                <span className="font-medium">{packageDetails.xce_amount.toLocaleString()} XCE</span>
              </div>
            </div>
          </div>
          
          {/* Payment method selection */}
          <div className="flex mb-6 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`flex items-center justify-center gap-2 py-3 flex-1 transition-colors ${paymentMethod === 'stripe' 
                ? 'bg-[#2A2A3A] text-cyber-blue' 
                : 'bg-[#1E1E2A] text-gray-400 hover:text-white'}`}
            >
              <CreditCard size={18} />
              <span>Credit Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex items-center justify-center gap-2 py-3 flex-1 transition-colors ${paymentMethod === 'paypal' 
                ? 'bg-[#2A2A3A] text-cyber-blue' 
                : 'bg-[#1E1E2A] text-gray-400 hover:text-white'}`}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.568 4.64-5.873 4.64h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.227.732-4.649.047-.257a.56.56 0 0 1 .554-.48h.348c2.265 0 4.03-.728 4.556-2.83a2.12 2.12 0 0 0 .304-1.265c-.087-.568-.39-1.043-.737-1.426z"/>
              </svg>
              <span>PayPal</span>
            </button>
          </div>
          
          {isProcessing ? (
            <div className="flex items-center justify-center p-6">
              <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mr-3"></div>
              <span>Processing payment...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethod === 'stripe' ? (
                <StripePaymentContainer
                  selectedPackage={{
                    id: packageDetails.id,
                    name: packageDetails.name,
                    xce_amount: packageDetails.xce_amount,
                    price: packageDetails.price_usd
                  }}
                  onSuccess={() => navigate('/?status=success')}
                  onCancel={() => setError(null)}
                />
              ) : (
                <PayPalButtons
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'pill',
                    label: 'pay',
                    tagline: false,
                    height: 45
                  }}
                  fundingSource={undefined}
                  createOrder={(_data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [
                        {
                          amount: {
                            value: packageDetails.price_usd.toString(),
                            currency_code: 'USD'
                          },
                          description: `${packageDetails.xce_amount} XCE Credits for Celflicks`
                        },
                      ],
                    });
                  }}
                  onApprove={async (_data, actions) => {
                    const details = await actions.order!.capture();
                    const orderId = _data.orderID;

                    try {
                      const { error } = await supabase.functions.invoke('verify-paypal-payment', {
                        body: {
                          order_id: orderId,
                          user_id: user.id,
                          package_id: packageDetails.id
                        }
                      });

                      if (error) {
                        console.error('Verification error:', error);
                        setError('Payment verified but failed to add credits. Please contact support.');
                        return;
                      }

                      navigate('/?status=success');
                    } catch (err) {
                      console.error('Supabase function error:', err);
                      setError('An error occurred while verifying the payment.');
                    }
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    setError('There was an error processing your payment. Please try again.');
                  }}
                />
              )}
              
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
