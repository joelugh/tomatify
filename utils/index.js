import he from 'he';

export const selectPomData = pom => {
    const {
        spotify = {},
        userName = '',
        userId = '',
        title = '',
        duration: _duration = 0,
        createTime = 0,
        uri ='',
    } = pom;

    const {
        images = [],
        description: _description = '',
        tracks: _tracks = [],
    } = spotify;
    const {items = []} = _tracks;
    const tracks = items.map(({track : {name, duration_ms, uri, artists, album}}) => ({
        title: name,
        artists: artists.map((artist) => artist.name),
        album: album.name,
        duration: `${Math.floor(duration_ms/1000/60)}:${(Math.floor(duration_ms/1000%60)+'').padStart(2, '0')}`,
        duration_ms,
        uri,
    }));
    const imageSrc = images && ((images.length > 1 && images[1].url) || (images.length > 0 && images[0].url) || null);
    const duration = Math.floor(parseInt(_duration,10)/60);
    const description = he.decode(_description);
    const lastModified = createTime;
    return {
        description,
        duration,
        imageSrc,
        lastModified,
        title,
        tracks,
        uri,
        userName,
        userId,
    }
}