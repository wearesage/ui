import api from './base';

export function useAudiusAPI() {
  const API = api('audius');

  async function fetchTrendingPlaylists(range: 'week' | 'month' | 'year') {
    const { status, data } = (await API.get(`playlists/trending/${range}`)) as any;

    if (status < 300) {
      return {
        success: true,
        playlists: data,
      };
    }
  }

  async function fetchTrendingTracks(range: 'week' | 'month' | 'year') {
    const { status, data } = (await API.get(`tracks/trending/${range}`)) as any;

    if (status < 300) {
      return {
        success: true,
        tracks: data,
      };
    }
  }

  async function fetchPlaylist(playlistId: string) {
    const { status, data } = (await API.get(`playlists/${playlistId}`)) as any;

    if (status < 300) {
      return {
        success: true,
        playlist: data,
      };
    }
  }

  async function search(query: string) {
    const { status, data } = (await API.get(`search/${query}`)) as any;

    if (status < 300) {

      return {
        success: true,
        data,
      };
    }
  }

  async function fetchUserByHandle(handle: string) {
    const { status, data } = (await API.get(`users/${handle}`)) as any;

    if (status < 300) {
      return {
        success: true,
        user: data,
      };
    }
  }

  async function stream(trackId: string) {
    const { status, data: track } = (await API.get(`stream/${trackId}`)) as any;

    if (status < 300) {
      return {
        success: true,
        track,
      };
    }
  }

  async function buildPlaylistFromTrackId(trackId: string) {
    const { status, data: tracks } = (await API.get(`infinity/${trackId}`)) as any;

    if (status < 300) {
      return {
        success: true,
        tracks,
      };
    }
  }

  return {
    fetchTrendingPlaylists,
    fetchPlaylist,
    fetchTrendingTracks,
    search,
    fetchUserByHandle,
    stream,
    buildPlaylistFromTrackId
  };
}
