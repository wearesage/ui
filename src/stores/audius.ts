type TrendingRange = 'week' | 'month' | 'year';

export const useAudius = defineStore('audius', () => {
  const playlistRange = ref<TrendingRange>('week');
  const trackRange = ref<TrendingRange>('week');
  const audio = useAudio();
  const visualizer = useVisualizer();
  const API = useAudiusAPI();
  const route = useRoute();
  const router = useRouter();
  const playlist = usePlaylist();
  const initialized = ref(false);
  const searching = ref(false);

  const trendingPlaylists = reactive<Record<TrendingRange, any[]>>({
    week: [],
    month: [],
    year: [],
  });

  const trendingTracks = reactive<Record<TrendingRange, any[]>>({
    week: [],
    month: [],
    year: [],
  });

  const query = ref('');

  const searchResults = ref({
    playlists: [],
    tracks: [],
    users: [],
  });

  const hasSearchResults = computed(() => {
    const { playlists, tracks, users } = searchResults.value;
    return !!playlists.length || !!tracks.length || !!users.length;
  });

  let timeout: any = null;

  watch(
    () => query.value,
    val => {
      clearTimeout(timeout);
      if (val.length > 1) {
        timeout = setTimeout(search, 350);
      } else {
        searchResults.value = {
          playlists: [],
          tracks: [],
          users: [],
        };
      }
    }
  );

  watch(
    () => playlist.currentTrack,
    async val => {
      if (val && val.id && visualizer.source === 'AUDIUS') {
        const { url } = await fetch(`${import.meta.env.VITE_SERVER}/api/audius/stream/${val.id}`).then(res => res.json());
        audio.player.src = url;
      }
    }
  );

  watch(
    () => playlist.finished,
    async val => {
      if (visualizer.source === 'AUDIUS' && val && visualizer.settings?.infinitePlay) {
        buildRadioStation(playlist.currentTrack.id)
      }
    }
  );

  async function buildRadioStation (trackId: string) {
    const { success, tracks } = await API.buildPlaylistFromTrackId(trackId);
    if (success) playlist.set(shuffle(tracks))
  }

  async function fetchTrendingPlaylists() {
    if (!trendingPlaylists.week.length || !trendingPlaylists.month.length || !trendingPlaylists.year.length) {
      try {
        const [week, month, year] = await Promise.all([
          API.fetchTrendingPlaylists('week'),
          API.fetchTrendingPlaylists('month'),
          API.fetchTrendingPlaylists('year'),
        ]);

        trendingPlaylists.week = week.success ? week.playlists : [];
        trendingPlaylists.month = month.success ? month.playlists : [];
        trendingPlaylists.year = year.success ? year.playlists : [];
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function fetchTrendingTracks() {
    if (!trendingTracks.week.length || !trendingTracks.month.length || !trendingTracks.year.length) {
      try {
        const [week, month, year] = await Promise.all([
          API.fetchTrendingTracks('week'),
          API.fetchTrendingTracks('month'),
          API.fetchTrendingTracks('year'),
        ]);

        trendingTracks.week = week.success ? week.tracks : [];
        trendingTracks.month = month.success ? month.tracks : [];
        trendingTracks.year = year.success ? year.tracks : [];
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function initialize() {
    if (initialized.value) return;
    if (route.path === '/visualizer') router.push('/audius');

    fetchTrendingPlaylists();
    fetchTrendingTracks();

    initialized.value = true;
  }

  async function search(limit = 10) {
    searching.value = true;

    const {
      data: { playlists, users, tracks },
    } = await API.search(query.value);

    searchResults.value = {
      playlists: playlists.slice(0, limit),
      users: users.slice(0, limit),
      tracks: tracks.slice(0, limit),
    };

    searching.value = false;
  }

  return {
    trendingPlaylists,
    trendingTracks,
    initialize,
    playlistRange,
    trackRange,
    query,
    search,
    searchResults,
    hasSearchResults,
    searching,
    buildRadioStation
  };
});
