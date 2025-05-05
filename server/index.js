import path from 'path';
import * as url from 'url';
import { config } from 'dotenv';
import { createApp } from './base.js'
import { log } from './util/log.js';
import * as schemas from './schemas/index.js';

config();

const plugins = {
  '@spotify': {
    targetUrl: process.env.UI + '/visualizer',
  },

  '@s3': {
    region: 'us-west-1',
    bucket: 'kaleidosync.com',
    folders: ['thumbs', 'og-images'],
  },

  '@stripe': {
    secretKey: process.env.VITE_STRIPE_SECRET_KEY,
  },

  '@audius': {
    baseUrl: '/api/audius',
    appName: 'Kaleidosync',
  },

  '@auth': {
    baseUrl: '/api/auth',
    publicUserKeys: ['_id', 'email', 'phone', 'visualizer', 'spotify', 'subscription', 'stripe']
  },
};

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const root = path.join(__dirname, '../dist');

const { models } = await createApp({
  env: process.env,
  schemas,
  httpsRedirect: false,
  staticDirectory: root,
  plugins,
  register(app, { models: { Study } }) {
    app.get('/api/public/sketches', async (req, res) => {
      try {
        const study = await Study.model.findById(process.env.KALEIDOSYNC_PUBLISHED).populate('iterations');
        res.status(200).send(study.iterations);
      } catch (e) {
        log(e);
        res.status(500).send({ error: 'Could not load sketches.' });
      }
    });

    app.get('/api/radio/radio-paradise/now-playing', async (req, res) => {
      try {
        const response = await fetch('https://api.radioparadise.com/api/now_playing?chan=0');
        res.status(200).send({ data: response.json() });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });
  },
});