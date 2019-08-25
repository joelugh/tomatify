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
    let remainingMs = items.reduce((sum, item) => sum + item.track.duration_ms, 0);
    const tracks = items.reduce((acc, {track : {name, duration_ms, uri, artists, album}}) => {
        acc.push({
            title: name,
            artists: artists.map((artist) => artist.name),
            album: album.name,
            remaining: `${Math.round(remainingMs/1000/60)} m`,
            duration: `${Math.floor(duration_ms/1000/60)}:${(Math.floor(duration_ms/1000%60)+'').padStart(2, '0')}`,
            duration_ms,
            uri,
        });
        remainingMs -= duration_ms;
        return acc;
    }, []);
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