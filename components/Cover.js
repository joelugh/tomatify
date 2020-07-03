import React from 'react';
import { useSelector } from 'react-redux';
import Mosaic from './Mosaic';
import { selectPomData } from '../utils';

export default function Cover({id, size=60}) {
    const rawPom = useSelector(state => state.firebase.data && state.firebase.data.pom && state.firebase.data.pom[id]);
    const pom = selectPomData(rawPom || {});
    if (pom.imageSrcs) {
        return <Mosaic srcs={pom.imageSrcs} size={size} />
    }
    return null;
}
