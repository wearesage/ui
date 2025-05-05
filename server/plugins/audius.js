const PACKAGE_NAME = `@audius`;
const yapEnv = envar => console.warn(`${PACKAGE_NAME}: environment variable "${envar}" is undefined.`);

function parseConfig(config = {}) {
  const { baseUrl, env, appName } = {
    baseUrl: '/api/audius',
    appName: 'AudiusApp',
    ...config,
  };

  if (!env?.AUDIUS_API_KEY) yapEnv('AUDIUS_API_KEY');
  if (!env?.AUDIUS_API_SECRET) yapEnv('AUDIUS_API_SECRET');

  return {
    apiKey: env.AUDIUS_API_KEY,
    apiSecret: env.AUDIUS_API_SECRET,
    baseUrl,
    appName,
  };
}

let node = null;

const sample = arr => arr[Math.floor(Math.random() * arr.length)];
const getNodes = () => fetch('https://api.audius.co').then(res => res.json());

async function selectRandomNode() {
  const { data } = await getNodes();
  node = sample(data);
}

const CACHE = {};

export default async (app, config = {}) => {
  const { apiKey, apiSecret, baseUrl, appName } = parseConfig(config);

  async function get(url, retry = 0) {
    try {
      if (node === null) await selectRandomNode();

      if (CACHE[url]) {
        if (Date.now() - CACHE[url].timestamp > 86400000 /* 24 hours */) {
          CACHE[url] = null;
        } else {
          return CACHE[url].data;
        }
      }

      const hasQuery = url.indexOf('?') !== -1;
      const data = await fetch(`${node}${url}${hasQuery ? '&' : '?'}app_name=${appName}`).then(res => res.json());

      if (!data) return null

      CACHE[url] = {
        timestamp: Date.now(),
        data,
      };

      return data;
    } catch (e) {
      if (retry < 3) {
        await selectRandomNode();
        return get(url, retry + 1);
      } else {
        return null
      }
    }
  }

  function cache(data) {
    data.forEach(async ({ id }) => {
      const {
        data: [playlist],
      } = await get(`/v1/playlists/${id}`);
      const { data: tracks } = await get(`/v1/playlists/${id}/tracks`);
      if (!tracks) playlist.playlist_contents.map(({ track_id }) => get(`/v1/tracks/${track_id}`));
    });
  }

  app.get(baseUrl + '/playlists/trending/:time', async (req, res) => {
    try {
      const { time } = req.params;
      const { data } = await get(`/v1/playlists/trending?time=${time}`);
      res.status(200).send(data);
      cache(data);
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/playlists/:playlistId', async (req, res) => {
    try {
      const { playlistId } = req.params;
      const {
        data: [playlist],
      } = await get(`/v1/playlists/${playlistId}`);

      let { data: tracks } = await get(`/v1/playlists/${playlistId}/tracks`);

      if (!tracks) {
        tracks = await Promise.all(playlist.playlist_contents.map(async ({ track_id }) => (await get(`/v1/tracks/${track_id}`)).data));
      }

      res.status(200).send({ ...playlist, tracks });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/tracks/trending/:time', async (req, res) => {
    try {
      const { time } = req.params;
      const { data } = await get(`/v1/tracks/trending?time=${time}`);
      res.status(200).send(data);
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/stream/:trackId', async (req, res) => {
    try {
      const { trackId } = req.params;
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/${trackId}/stream?app_name=${appName}`);
      res.status(200).send({ url: response.url });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/search/:query', async (req, res) => {
    try {
      const { query } = req.params;

      const [playlists, users, tracks] = await Promise.all([
        get(`/v1/playlists/search?query=${query}`),
        get(`/v1/users/search?query=${query}`),
        get(`/v1/tracks/search?query=${query}`),
      ]);

      res.status(200).send({
        playlists: playlists.data,
        users: users.data,
        tracks: tracks.data,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/users/:handle', async (req, res) => {
    try {
      const { handle } = req.params;
      const { data: user } = await get(`/v1/users/handle/${handle}`);
      const { data: tracks } = await get(`/v1/users/${user.id}/tracks`);
      const { data: related } = await get(`/v1/users/${user.id}/related`);
      res.status(200).send({ ...user, tracks, related });
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });

  app.get(baseUrl + '/infinity/:trackId', async (req, res) => {
    try {
      const { trackId } = req.params;
      const { data: track } = await get(`/v1/tracks/${trackId}`);
      const { data: related } = await get(`/v1/users/${track.user.id}/related`);
      const responses = await Promise.all(related.map(({ id }) => get(`/v1/users/${id}/tracks`)));
      const tracks = responses.reduce((acc, res) => [...acc, ...res.data], []);
      res.status(200).send(tracks);
    } catch (e) {
      console.log(e);
      res.status(500).send({ success: false });
    }
  });
};
