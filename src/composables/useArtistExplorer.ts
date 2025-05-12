export function useArtistExplorer(artist: string) {
  const albums = ref<any[]>([])

  async function fetchAlbums() {
    const data = await fetch(`/music/${artist.toLowerCase()}/library.json`).then(res => res.json())
    albums.value = data.albums
    console.log(data.albums)
  }

  watch(() => artist, () => {
    fetchAlbums()
  }, {
    immediate: true
  })

  return {
    albums
  }
}