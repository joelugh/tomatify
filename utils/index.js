import he from 'he';
import {useSelector} from 'react-redux';
import {useFirebaseConnect} from 'react-redux-firebase';
import { useEffect, useState, useCallback, useRef } from 'react';

import {
    isMobile as _isMobile,
    isIOS as _isIOS,
} from "react-device-detect";

export const isMobile = () => _isMobile;
export const isIOS = () => _isIOS;

export const selectPomData = pom => {
    const {
        spotify = {},
        userName = '',
        userId = '',
        title = '',
        description: _description="",
        durationMs: _durationMs = 0,
        createTime = 0,
        tracks: _tracks = [],
        images,
        soundEffect,
    } = pom;
    let remaining_ms = _tracks.reduce((sum, track) => sum + track.duration_ms, 0);
    const selectTrack = ({name, duration_ms, uri, artists, album}, remaining_ms=0) => ({
        title: name,
        artists: artists.map((artist) => artist.name),
        album: album.name,
        albumArt: album.images && album.images[0] && album.images[0].url,
        remaining: `${Math.round(remaining_ms/1000/60)} m`,
        remaining_ms,
        duration: `${Math.floor(duration_ms/1000/60)}:${(Math.floor(duration_ms/1000%60)+'').padStart(2, '0')}`,
        duration_ms,
        uri,
    })
    const tracks_nofx = _tracks.reduce((acc, track) => {
        acc.push(selectTrack(track,remaining_ms));
        remaining_ms -= track.duration_ms;
        return acc;
    }, []);
    const tracks = (soundEffect) ? [...tracks_nofx, selectTrack(soundEffect)] : tracks_nofx;
    const imageSrcs = images && images.map(image => image.url);
    const duration = Math.floor(parseInt(_durationMs/1000,10)/60);
    const description = _description ? he.decode(_description) : "";
    const lastModified = createTime;
    return {
        description,
        duration,
        imageSrcs,
        lastModified,
        title,
        tracks,
        tracks_nofx,
        userName,
        userId,
    }
}

export const usePomDetails = (id) => {
  useFirebaseConnect([
    `pom/${id}/title`,
    `pom/${id}/userName`,
    `pom/${id}/userId`,
    `pom/${id}/description`,
    `pom/${id}/createTime`,
    `pom/${id}/images`,
    `pom/${id}/durationMs`,
  ])
  return useSelector((state) => state.firebase.data.pom && state.firebase.data.pom[id]);
}

export const useCurrentlyPlaying = () => useSelector(state => {
  if (!state ||
    !state.spotify ||
    !state.spotify.playState) return;
  return state.spotify.playState;
  //
  // if (!state
  //     || !state.firebase
  //     || !state.firebase.profile
  //     || !state.firebase.data
  //     || !state.firebase.data.currentlyPlaying) return;
  // return state.firebase.data.currentlyPlaying[state.firebase.profile.id];
});

export const useSpotifyAccessToken = () => useSelector(state => {
  if (!state
      || !state.firebase
      || !state.firebase.auth
      || !state.firebase.auth.uid
      || !state.firebase.data
      || !state.firebase.data.spotifyAccessToken) return;
  return state.firebase.data.spotifyAccessToken[state.firebase.auth.uid];
});


const defaultOptions = {
    cancelOnUnmount: true,
};

/**
 * An async-utility hook that accepts a callback function and a delay time (in milliseconds), then repeats the
 * execution of the given function by the defined milliseconds.
 */
export const useInterval = (fn, milliseconds, options = defaultOptions) => {
  const opts = { ...defaultOptions, ...(options || {}) };
  const timeout = useRef();
  const callback = useRef(fn);
  const [isCleared, setIsCleared] = useState(false);

  // the clear method
  const clear = useCallback(() => {
    if (timeout.current) {
      clearInterval(timeout.current);
      setIsCleared(true);
    }
  }, []);

  // if the provided function changes, change its reference
  useEffect(() => {
    if (typeof fn === 'function') {
      callback.current = fn;
    }
  }, [fn]);

  // when the milliseconds change, reset the timeout
  useEffect(() => {
    if (typeof milliseconds === 'number') {
      timeout.current = setInterval(() => {
        callback.current();
      }, milliseconds);
    }
  }, [milliseconds]);

  // when component unmount clear the timeout
  useEffect(() => () => {
    if (opts.cancelOnUnmount) {
      clear();
    }
  }, []);

  return [isCleared, clear];
};