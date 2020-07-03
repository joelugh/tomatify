import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import Mosaic from './Mosaic';
import { selectPomData } from '../utils';

const useStyles = makeStyles({
    cover: {
        objectFit: 'cover',
        width: props => props.size || 60,
        minWidth: props => props.size || 60,
        height: props => props.size || 60,
        minHeight: props => props.size || 60,
    },
})

export default function Cover({id, size=60}) {
    const classes = useStyles({size});
    const rawPom = useSelector(state => state.firebase.data && state.firebase.data.pom && state.firebase.data.pom[id]);
    const pom = selectPomData(rawPom || {});
    if (pom.imageSrc) return <img src={pom.imageSrc} className={classes.cover} />
    if (pom.tracks_nofx) {
        const srcs = pom.tracks_nofx.map(track => track.albumArt).filter((v, i, a) => a.indexOf(v) === i);
        return <Mosaic srcs={srcs} size={size} />
    }
    return null;
}
