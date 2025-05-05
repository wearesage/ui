import jwt from 'jsonwebtoken';
import { log } from './log.js';

export function generateJWT(data, options = {}) {
  if (!process.env.EXPRESS_BASE_SERVER_SECRET)
    console.error(`@shaderpad/express: environment variable "EXPRESS_BASE_SERVER_SECRET" is undefined.`);
  return jwt.sign(data, process.env.EXPRESS_BASE_SERVER_SECRET, options);
}

export function protectRouteMiddleware (req, res, next) {
  if (!process.env.EXPRESS_BASE_SERVER_SECRET)
    console.error(`@shaderpad/express: environment variable "EXPRESS_BASE_SERVER_SECRET" is undefined.`);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) res.sendStatus(401); 

  jwt.verify(token, process.env.EXPRESS_BASE_SERVER_SECRET, (err, decoded) => {
    if (err) {
      log(err)
      return res.sendStatus(403)
    }

    log(decoded)
    req.user = decoded;
    next();
  });
}