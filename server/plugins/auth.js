import { generateJWT } from '../util/jwt.js';
import { hash, compare, randomID } from '../util/hash.js';
import sgMail from '@sendgrid/mail';
import { log } from '../util/log.js';

const PACKAGE_NAME = `@auth`;

const yapEnv = envar => console.warn(`${PACKAGE_NAME}: environment variable "${envar}" is undefined.`);
const yapConfig = configvar => console.warn(`${PACKAGE_NAME}: "${configvar}" is a required configuration parameter.`);

function parseConfig(config = {}) {
  const { baseUrl, userCollection, tokenKey, models, publicUserKeys, env } = {
    userCollection: 'User',
    tokenKey: 'tokens',
    baseUrl: `/api/auth`,
    publicUserKeys: ['_id'],
    onError: e => e,
    ...config,
  };

  const sendgridKey = env.SENDGRID_API_KEY;

  if (!sendgridKey) yapEnv('SENDGRID_API_KEY');

  return {
    baseUrl,
    userCollection,
    publicUserKeys,
    tokenKey,
    models,
    sendgridKey,
    env,
  };
}

export default (app, config = {}) => {
  const { baseUrl, userCollection, models, tokenKey, publicUserKeys, sendgridKey } = parseConfig(config);

  sgMail.setApiKey(sendgridKey);

  app.get(baseUrl + '/user/:email', async (req, res) => {
    try {
      const user = await models[userCollection].find({ email: req.params.email });

      if (user?.[0]) {
        res.status(200).send({ exists: true, hasPassword: !!user[0].password?.length });
      } else {
        res.status(200).send({ exists: false });
      }
    } catch (e) {
      res.status(200).send({ exists: false });
    }
  });

  app.post(baseUrl + '/signup', async (req, res) => {
    try {
      const {
        headers,
        body: { email, password },
      } = req;

      const user = await models[userCollection].findOrCreate({ email });

      if (user) {
        user.password = await hash(password);
        user[tokenKey] = user[tokenKey] || {};
        user[tokenKey][headers['user-agent']] = generateJWT({ userId: user._id, userAgent: headers['user-agent'] });
        await user.save();
        return res.status(200).send(
          publicUserKeys.reduce(
            (acc, key) => {
              acc[key] = user[key];
              return acc;
            },
            { token: user[tokenKey][headers['user-agent']] }
          )
        );
      }

      res.status(500).send({ success: false });
    } catch (e) {
      res.status(500).send({ success: false });
    }
  });

  app.post(baseUrl + '/login', async (req, res) => {
    try {
      const {
        headers,
        body: { email, password },
      } = req;

      const user = await models[userCollection].findOrCreate({ email });

      if (user) {
        const valid = await compare(password, user.password);
        if (!valid) return res.status(400).send({ error: 'Password incorrect.' });
        user[tokenKey] = user[tokenKey] || {};
        user[tokenKey][headers['user-agent']] = generateJWT({ userId: user._id, userAgent: headers['user-agent'] });
        await user.save();
        return res.status(200).send(
          publicUserKeys.reduce(
            (acc, key) => {
              acc[key] = user[key];
              return acc;
            },
            { token: user[tokenKey][headers['user-agent']] }
          )
        );
      }

      res.status(404).send({ error: 'User does not exist.' });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.post(baseUrl + '/reset', async (req, res) => {
    try {
      const { email } = req.body;
      const [user] = await models[userCollection].find({ email });

      if (user) {
        user.passwordResetCode = randomID();
        await user.save();
        await sgMail.send({
          to: email,
          from: 'admin@kaleidosync.com',
          subject: 'Reset your password • 5HT',
          text: 'Reset your password with this one-time code.',
          html: `<strong>${user.passwordResetCode}</strong>`,
        });

        res.status(200).send({ success: true });
      } else {
        res.status(400).send({ error: 'User does not exist.' });
      }
    } catch (e) {
      log(e);
      res.status(500).send({ error: 'Error creating reset request.' });
    }
  });

  app.post(baseUrl + '/finish-reset', async (req, res) => {
    try {
      const {
        headers,
        body: { email, code, password },
      } = req;

      const [user] = await models[userCollection].find({ email });

      if (user && user.passwordResetCode === code) {
        user.password = await hash(password);
        user.passwordResetCode = null;
        user[tokenKey] = user[tokenKey] || {};
        user[tokenKey][headers['user-agent']] = generateJWT({ userId: user._id, userAgent: headers['user-agent'] });
        await user.save()
        res.status(200).send({ success: true });
      } else {
        res.status(400).send({ error: 'Invalid code.' });
      }
    } catch (e) {
      log(e);
      res.status(500).send({ error: 'Could not reset password.' });
    }
  });
};
