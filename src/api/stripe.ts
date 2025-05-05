import api from './base';

export function useStripeAPI() {
  const API = api('stripe');

  async function createPaymentIntent(amount: number) {
    const { status, data: paymentIntent } = (await API.post(`payment-intent`, { amount })) as any;

    if (status < 300) {
      return {
        success: true,
        paymentIntent,
      };
    }
  }

  async function createSetupIntent({ customer }: any) {
    const { status, data } = (await API.post(`setup-intent`, { customer })) as any;

    if (status < 300) {
      return {
        success: true,
        data,
      };
    }
  }

  async function createCustomer({ name, email, address }: any) {
    const { status, data } = (await API.post(`customer`, { name, email, address })) as any;

    if (status < 300) {
      return {
        success: true,
        data,
      };
    }
  }

  async function savePaymentMethod({ paymentMethodId, customerId }: any) {
    const { status, data } = (await API.post(`save-payment-method`, { paymentMethodId, customerId })) as any;

    if (status < 300) {
      return {
        success: true,
        data,
      };
    }
  }

  return {
    createPaymentIntent,
    createSetupIntent,
    createCustomer,
    savePaymentMethod,
  };
}
