import he from 'he';
import readableTime from 'readable-timestamp';

export const selectPomData = pom => {
    const {
        spotify: {
            images = [],
            description: _description = '',
        },
        userName = '',
        userId,
        title = '',
        duration: _duration = 0,
        createTime = 0,
        uri,
    } = pom;
    const imageSrc = images && ((images.length > 1 && images[1].url) || (images.length > 0 && images[0].url) || null);
    const duration = Math.round(parseInt(_duration,10)/60);
    const description = he.decode(_description);
    const lastModified = (global.window) ? readableTime({ getTime: () => createTime }) : "";
    return {
        description,
        duration,
        imageSrc,
        lastModified,
        title,
        uri,
        userName,
        userId,
    }
}