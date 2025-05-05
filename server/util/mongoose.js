import mongoose, { Schema, model, Types } from 'mongoose';
import { pluralize } from './strings.js';
import { protectRouteMiddleware } from './jwt.js';
import { log } from './log.js';

const MODELS = {};
const ROUTES = [];

export function connect(url) {
  return mongoose.connect(url);
}

export function buildModels({ schemas }) {
  Object.keys(schemas).forEach(key => {
    MODELS[key] = {
      model: model(key, new Schema(schemas[key])),
    };

    MODELS[key].find = (data = {}) => MODELS[key].model.find(data);
    MODELS[key].findOne = data => MODELS[key].model.findOne(data);
    MODELS[key].findById = id => MODELS[key].model.findById(id);
    MODELS[key].createNew = async data => {
      try {
        const document = new MODELS[key].model(data);
        return document.save();
      } catch (e) {
        log(e);
        return null;
      }
    };

    MODELS[key].findOrCreate = async data => {
      try {
        const existing = await MODELS[key].model.findOne(data);
        if (existing) return existing;
        const document = new MODELS[key].model(data);
        await document.save();
        return document;
      } catch (e) {
        log(e);
        return null;
      }
    };

    MODELS[key].updateOne = async (id, data) => {
      try {
        const document = await MODELS[key].model.findById(id);
        if (!document) return null;
        Object.keys(data).forEach(key => {
          document[key] = data[key];
        });
        return document.save();
      } catch (e) {
        log(e);
        return null;
      }
    };

    MODELS[key].deleteOne = async id => {
      try {
        const document = await MODELS[key].model.findById(id);
        await document?.remove?.();
        return true;
      } catch (e) {
        log(e);
        return null;
      }
    };
  });

  return MODELS;
}

function confirmRouteRegistration(method, route, key) {
  ROUTES.push([method.trim(), route, key]);
  console.log(`${method}: ${route}`);
}

export function buildRoutes({ app, schemas, apiRoot, plugins }) {
  function send({ req, res, document, documents }) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const response = document
      ? plugins['@auth'].publicUserKeys.reduce(
          (acc, key) => {
            acc[key] = document[key];
            return acc;
          },
          {
            token,
          }
        )
      : documents.map(document => {
          return plugins['@auth'].publicUserKeys.reduce((acc, key) => {
            acc[key] = document[key];
            return acc;
          });
        });

    res.status(200).send(response);
  }

  Object.keys(schemas).forEach(key => {
    const route = `${apiRoot}/${pluralize(key.toLowerCase(), 0)}`;

    console.log(`\nRegistering routes for collection: ${key.toUpperCase()}\n`);

    app.get(route, protectRouteMiddleware, async (req, res) => {
      try {
        const documents = await MODELS[key].find(req.query || {});

        if (key.toUpperCase() === 'USER') {
          return send({ req, res, documents });
        }

        res.status(200).send(documents);
      } catch (e) {
        log(e);
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('GET    ', route, key);

    app.get(`${route}/:id`, protectRouteMiddleware, async (req, res) => {
      try {
        const document = await MODELS[key].findById(req.params.id);

        if (key.toUpperCase() === 'USER') {
          return send({ req, res, document });
        }

        res.status(200).send(document);
      } catch (e) {
        log(e);
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('GET    ', `${route}/:id`, key);

    app.post(`${route}`, protectRouteMiddleware, async (req, res) => {
      try {
        const document = await MODELS[key].createNew(req.body);
        res.status(200).send(document);
      } catch (e) {
        log(e);
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('POST   ', `${route}`, key);

    app.put(`${route}/:id`, protectRouteMiddleware, async (req, res) => {
      try {
        const document = await MODELS[key].updateOne(req.params.id, req.body);

        if (key.toUpperCase() === 'USER') {
          return send({ req, res, document });
        }

        res.status(200).send(document);
      } catch (e) {
        log(e);
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('PUT    ', `${route}/:id`, key);

    app.delete(`${route}/:id`, protectRouteMiddleware, async (req, res) => {
      try {
        await MODELS[key].deleteOne(req.params.id);
        res.status(200).send({ success: true });
      } catch (e) {
        log(e);
        res.status(500).send(e);
      }
    });

    confirmRouteRegistration('DELETE ', `${route}/:id`, key);
  });

  console.log('\n');

  return ROUTES;
}
