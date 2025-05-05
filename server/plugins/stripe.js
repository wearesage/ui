import cron from 'node-cron';
import Stripe from 'stripe';
import { addDays } from 'date-fns';

export default (app, config = {}) => {
  const {
    secretKey,
    apiVersion,
    baseUrl,
    models: { User, Subscription },
  } = {
    apiVersion: '2023-10-16',
    baseUrl: '/api/stripe',
    ...config,
  };

  const stripe = Stripe(secretKey, { apiVersion });

  app.post(`${baseUrl}/payment-intent`, async (req, res) => {
    try {
      const { amount } = req.body;
      const { client_secret } = await stripe.paymentIntents.create({
        currency: 'usd',
        amount,
        automatic_payment_methods: { enabled: true },
      });

      res.status(200).send({ clientSecret: client_secret });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false, error: 'Could not create payment intent.' });
    }
  });

  app.post(`${baseUrl}/setup-intent`, async (req, res) => {
    try {
      const { customer } = req.body;
      const { client_secret } = await stripe.setupIntents.create({
        customer,
        payment_method_types: ['card'],
      });

      res.status(200).send({ clientSecret: client_secret });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false, error: 'Could not create setup intent.' });
    }
  });

  app.post(`${baseUrl}/save-payment-method`, async (req, res) => {
    try {
      const { paymentMethodId, customerId } = req.body;
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      const customer = await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      res.status(200).send({ paymentMethod, customer });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  });

  app.post(`${baseUrl}/customer`, async (req, res) => {
    try {
      const { email, name, address } = req.body;
      const customer = await stripe.customers.create({ email, name, address });
      res.status(200).send(customer);
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false, error: 'Could not create payment intent.' });
    }
  });

  cron.schedule('0 0 0 * * *', () => {
    
  });
};
