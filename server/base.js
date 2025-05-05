import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import fallback from 'express-history-api-fallback';
export * from './util/index.js';
import { parseConfig, connect, buildModels, buildRoutes } from './util/index.js';
import SpotifyOauth from './plugins/spotify.js';
import StripePayments from './plugins/stripe.js';
import OTP from './plugins/twilio.js';
import S3 from './plugins/s3.js';
import Audius from './plugins/audius.js';
import Auth from './plugins/auth.js';

const PLUGINS = {
  '@auth': Auth,
  '@spotify': SpotifyOauth,
  '@stripe': StripePayments,
  '@s3': S3,
  '@twilio': OTP,
  '@audius': Audius,
};

export async function createApp(configuration = {}) {
  const { env, apiRoot, staticDirectory, trustProxy, httpsRedirect, middleware, schemas, plugins, register } = parseConfig(configuration || {});

  const app = express();

  await connect(env.DATABASE);

  const models = schemas ? buildModels({ schemas }) : null;

  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', trustProxy);
    app.use((req, res, next) => {
      if (httpsRedirect && req.headers.host.protocol !== 'https' && req.url.indexOf('localhost') === -1) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }

      next();
    });
  }

  app.use(compression());
  app.use(morgan(middleware.morgan.format, middleware.morgan.options));
  app.use(express.json(middleware.json));
  app.use(cors(middleware.cors));

  const routes = schemas ? buildRoutes({ app, schemas, apiRoot, plugins }) : null;

  Object.keys(plugins).forEach(key => {
    const config = plugins[key];
    PLUGINS[key](app, { ...config, env, models });
  });

  register?.(app, { models })

  if (env.NODE_ENV === 'production') {
    app.use(express.static(staticDirectory));
    app.use(fallback('index.html', { root: staticDirectory }));
  }

  const port = env.PORT || 2223

  app.listen(port, () => `Listening on port ${port}.`)

  return {
    app,
    models,
    routes
  };
}
