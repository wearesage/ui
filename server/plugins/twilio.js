import twilio from 'twilio';
import { generateJWT } from '../util/jwt.js';

const PACKAGE_NAME = `@twilio`;
const yapEnv = envar => console.warn(`${PACKAGE_NAME}: environment variable "${envar}" is undefined.`);
const yapConfig = configvar => console.warn(`${PACKAGE_NAME}: "${configvar}" is a required configuration parameter.`);

function parseConfig(config = {}) {
  const { url, userCollection, tokenKey, publicUserKeys, models, onError, env } = {
    userCollection: 'User',
    tokenKey: 'token',
    publicUserKeys: ['_id', 'token'],
    url: `/api/twilio/:phone`,
    onError: e => e,
    ...config,
  };

  const verifySid = env.EXPRESS_TWILIO_VERIFY_VERIFY_SID;
  const accountSid = env.EXPRESS_TWILIO_VERIFY_ACCOUNT_SID;
  const authToken = env.EXPRESS_TWILIO_VERIFY_AUTH_TOKEN;

  if (!verifySid) yapEnv('EXPRESS_TWILIO_VERIFY_VERIFY_SID');
  if (!accountSid) yapEnv('EXPRESS_TWILIO_VERIFY_ACCOUNT_SID');
  if (!authToken) yapEnv('EXPRESS_TWILIO_VERIFY_AUTH_TOKEN');
  if (!url) yapConfig('url');

  return {
    url,
    verifySid,
    accountSid,
    authToken,
    userCollection,
    tokenKey,
    publicUserKeys,
    models,
    onError,
  };
}

export default (app, config = {}) => {
  const { url, verifySid, accountSid, authToken, userCollection, models, tokenKey, publicUserKeys, onError } = parseConfig(config);

  const {
    verify: {
      v2: { services },
    },
  } = twilio(accountSid, authToken);

  async function authenticate({ phone, email, ip, userAgent }) {
    const params = {}
    if (phone) params.phone = phone
    if (email) params.email = email
    const user = await models[userCollection].findOrCreate(params);
    user.lastSeen = Date.now();
    user[tokenKey] = generateJWT({ userId: user._id, ip, userAgent });
    await user.save();
    return publicUserKeys.reduce((acc, key) => {
      acc[key] = user[key];
      return acc;
    }, {});
  }

  app.get(url, async (req, res) => {
    try {
      if (!req?.params?.phone?.length) return res.status(204).send();
      await services(verifySid).verifications.create({ to: req.params.phone, channel: req.query.method });
      res.status(200).send({ success: true });
    } catch (e) {
      onError(e);
      res.status(500).send({ error: 'Server error.' });
    }
  });

  app.post(url, async (req, res) => {
    try {
      const {
        body: { code, validateOnly, method },
        params: { phone },
        headers,
        ip,
      } = req;

      if (!code?.length) return res.status(204).send();

      const { valid } = await services(verifySid).verificationChecks.create({ to: phone, code });

      if (valid === true) {
        if (validateOnly) {
          res.status(200).send({ valid: true });
          return;
        }

        const user = await authenticate({ [method === 'sms' ? 'phone' : 'email']: phone, ip, userAgent: headers['user-agent'] });
        return res.status(200).send(user);
      }

      res.status(401).send({ error: `One-time code is incorrect.` });
    } catch (e) {
      onError(e);
      res.status(500).send({ error: 'Server error.' });
    }
  });
};
