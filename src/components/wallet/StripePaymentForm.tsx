import React, { useState, useEffect } from 'react';
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from '../../api/stripe';
import useAuth from '../../hooks/useAuth';

// Load Stripe outside of the component to avoid recreating the Stripe object on renders
// Use your own Stripe publishable key from your Stripe dashboard
// Make sure to use the test key (starts with pk_test_) for development
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY; 

// Log the key to help diagnose issues (only logging the first few characters for security)
console.log('Stripe key being used:', STRIPE_PUBLISHABLE_KEY ? 
  `${STRIPE_PUBLISHABLE_KEY.substring(0, 12)}...` : 'Key not found in environment');

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface Package {
  id: string;
  name: string;
  xce_amount: number;
  price: number;
  badge_url?: string;
}

interface StripePaymentContainerProps {
  selectedPackage: Package | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Wrapper component that sets up Stripe Elements with the payment intent
export const StripePaymentContainer: React.FC<StripePaymentContainerProps> = ({ 
  selectedPackage, 
  onSuccess, 
  onCancel 
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request a payment intent when the selected package changes
  useEffect(() => {
    const getPaymentIntent = async () => {
      if (!selectedPackage) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Make sure we're using the correct amount format
        // Stripe expects amounts in cents/smallest currency unit
        const amountInSmallestUnit = Math.round(selectedPackage.price * 100);
        
        console.log('Creating payment intent for package:', {
          id: selectedPackage.id,
          price: selectedPackage.price,
          amountInSmallestUnit
        });
        
        // This calls the createPaymentIntent function from the API
        // But the response is just the 'data' portion of what the Edge Function returns
        const rawResponse = await createPaymentIntent(
          selectedPackage.id,
          amountInSmallestUnit,
          'usd'
        );
        
        console.log('Raw payment intent response:', rawResponse);
        console.log('Response type:', typeof rawResponse);
        
        // The response might be a string if it wasn't automatically parsed by the Supabase client
        // We need to handle both cases to be safe
        let response: any;
        if (typeof rawResponse === 'string') {
          try {
            response = JSON.parse(rawResponse);
            console.log('Parsed string response into JSON:', response);
          } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            throw new Error('Invalid response format from payment service');
          }
        } else {
          // Already an object
          response = rawResponse;
        }
        
        // Safety check before proceeding
        if (!response) {
          throw new Error('Empty response from payment service');
        }
        
        // At this point, we should have a response from the Edge Function
        // Let's check the exact structure for debugging purposes
        console.log('Response keys:', Object.keys(response));
        
        // Extract clientSecret and paymentIntentId directly from the response
        // These property names match what our Edge Function returns
        const clientSecret = response.clientSecret;
        const paymentIntentId = response.paymentIntentId;
        
        console.log('Extracted values:', { 
          hasClientSecret: !!clientSecret, 
          hasPaymentIntentId: !!paymentIntentId,
          clientSecretStart: clientSecret ? clientSecret.substring(0, 15) + '...' : 'missing',
          paymentIntentIdStart: paymentIntentId ? paymentIntentId.substring(0, 10) + '...' : 'missing'
        });
        
        // Verify we have the required values
        if (!clientSecret) {
          throw new Error('Missing client secret in payment service response');
        }
        
        if (!paymentIntentId) {
          throw new Error('Missing payment intent ID in payment service response');
        }
        
        // Store the values for use in the Stripe Elements
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
        
        console.log('Successfully stored client secret and payment intent ID');
      } catch (err: any) {
        console.error('Error getting payment intent:', err);
        setError('Failed to initialize payment. Our servers might be experiencing issues. Please try again in a few moments.');
      } finally {
        setLoading(false);
      }
    };
    
    getPaymentIntent();
  }, [selectedPackage]);
  
  if (!selectedPackage) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-blue"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white">
        <p>{error}</p>
        <div className="mt-4 flex gap-4">
          <button 
            onClick={onCancel}
            className="px-4 py-2 bg-ui-dark rounded-lg hover:bg-ui-light transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  if (!clientSecret) {
    return (
      <div className="bg-ui-dark/50 p-6 rounded-xl">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white">
            <p>{error}</p>
            <div className="mt-4 flex gap-4">
              <button 
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Try again in 1 second
                  setTimeout(() => {
                    if (selectedPackage) {
                      createPaymentIntent(
                        selectedPackage.id,
                        Math.round(selectedPackage.price * 100),
                        'usd'
                      ).then(response => {
                        setClientSecret(response.clientSecret);
                        setPaymentIntentId(response.paymentIntentId);
                        setLoading(false);
                      }).catch(err => {
                        console.error('Retry error:', err);
                        setError('Still having trouble. Please try again later.');
                        setLoading(false);
                      });
                    }
                  }, 1000);
                }}
                className="px-4 py-2 bg-ui-dark rounded-lg hover:bg-cyber-blue/20 border border-cyber-blue/50 transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={onCancel}
                className="px-4 py-2 bg-ui-dark rounded-lg hover:bg-ui-light transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-blue"></div>
            <p className="text-cyber-blue">Initializing payment...</p>
          </div>
        ) : null}
      </div>
    );
  }
  
  // Only define options and render Elements when clientSecret is available
  if (!clientSecret || !paymentIntentId) {
    return (
      <div className="p-5 bg-ui-dark/50 rounded-xl shadow-inner border border-cyber-blue/20 text-center">
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white mb-4">
            <p>{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyber-blue"></div>
            <span className="text-cyber-blue">Initializing payment...</span>
          </div>
        ) : (
          <div className="text-cyber-blue">Loading payment form...</div>
        )}
      </div>
    );
  }

  // Only create options when we have a clientSecret
  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#3d5afe',
        colorBackground: '#1E1E2A',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };
  
  // Only render Elements once we have clientSecret
  return (
    <Elements stripe={stripePromise} options={options}>
      <StripePaymentForm 
        paymentIntentId={paymentIntentId}
        selectedPackage={selectedPackage}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

// The actual form that collects payment details
interface StripePaymentFormProps {
  paymentIntentId: string;
  selectedPackage: Package | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  paymentIntentId,
  selectedPackage, 
  onSuccess, 
  onCancel 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment form submitted');
    
    // Check if all required objects are available
    console.log('Payment dependencies check:', { 
      hasStripe: !!stripe, 
      hasElements: !!elements, 
      hasUser: !!user, 
      hasPackage: !!selectedPackage,
      paymentIntentId: paymentIntentId,
      userType: user?.id === 'test-user-123' ? 'mock' : 'real'
    });
    
    if (!stripe || !elements || !user || !selectedPackage) {
      console.error('Missing required payment dependencies');
      if (!stripe) setErrorMessage('Stripe not initialized. Please refresh the page and try again.');
      if (!elements) setErrorMessage('Payment elements not loaded. Please refresh the page and try again.');
      if (!user) setErrorMessage('User not authenticated. Please log in and try again.');
      if (!selectedPackage) setErrorMessage('No package selected. Please select a package and try again.');
      return;
    }
    
    // In production, all users go through the same payment flow
    // No special handling for different user types
    
    setProcessing(true);
    setErrorMessage(null);
    console.log('Processing payment...');
    
    try {
      // Confirm the payment with Stripe
      console.log('Calling stripe.confirmPayment...');
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-success',
        },
        redirect: 'if_required',
      });
      
      console.log('Stripe confirmation result:', result);
      
      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        setErrorMessage(result.error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }
      
      // If we get here, the payment succeeded or doesn't require additional action
      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment intent succeeded:', result.paymentIntent);
        
        try {
          // We'll test the actual backend verification for both real and mock users
          // to properly verify our Edge Function changes
          
          // Verify the payment on our server and add credits
          console.log('Verifying payment with our server...');
          console.log('User ID for verification:', user.id);
          console.log('Payment Intent ID for verification:', paymentIntentId);
          console.log('Package ID for verification:', selectedPackage.id);
          
          // Make sure we're sending the correct casing for API parameters
          const verificationResult = await confirmPayment(
            paymentIntentId,
            user.id,
            selectedPackage.id
          );
          
          console.log('Payment verification result:', verificationResult);
          onSuccess();
        } catch (verificationError) {
          console.error('Error during payment verification:', verificationError);
          
          // No more special handling for mock users - test the actual Edge Function response
          // Display the full error details for debugging
          let errorMessage = 'Payment was processed but verification failed. ';
          if (verificationError instanceof Error) {
            errorMessage += verificationError.message;
          } else {
            errorMessage += 'Please check the console for details.';
          }
          
          setErrorMessage(errorMessage);
          setProcessing(false);
          return;
        }
      } else {
        console.log('Payment intent status not succeeded:', result.paymentIntent?.status);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'Payment processing error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  console.log('Rendering StripePaymentForm with:', {
    stripeAvailable: !!stripe,
    elementsAvailable: !!elements,
    userAvailable: !!user,
    packageAvailable: !!selectedPackage,
    processing: processing
  });

  const handlePayButtonClick = (e: React.MouseEvent) => {
    console.log('Pay button clicked directly');
    // We'll let the form submission handle it, this is just for debugging
  };

  return (
    <form 
      onSubmit={(e) => {
        console.log('Form onSubmit event triggered');
        handleSubmit(e);
      }} 
      className="space-y-6"
    >
      <div className="bg-ui-dark/50 rounded-xl p-5 shadow-inner border border-cyber-blue/20">
        <PaymentElement />
      </div>
      
      {errorMessage && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-white">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="flex justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-ui-dark text-cyber-blue/70 hover:bg-ui-light hover:text-cyber-blue transition-all w-1/2"
          disabled={processing}
        >
          Cancel
        </button>
        
        <button
          type="submit"
          onClick={handlePayButtonClick}
          disabled={!stripe || processing}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-purple to-cyber-blue hover:from-cyber-blue hover:to-cyber-purple text-cyber-black font-semibold transition-all w-1/2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyber-black"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <span>Pay ${selectedPackage?.price.toFixed(2)}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default StripePaymentContainer;
