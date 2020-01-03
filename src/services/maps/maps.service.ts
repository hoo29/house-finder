import {
    IsochroneUserRequest,
    TIME_UNITS,
    DISTANCE_UNITS,
    IsochroneRequest,
    TRAVEL_MODES,
    OPTIMIZE_MODES,
    LocationRequest,
} from './maps.types';
import { api } from '../api/api.service';

export let Microsoft;
export const REACT_APP_BACKEND_API = process.env.REACT_APP_BACKEND_API!;

let map;

// I LOVE IT
export const setMicrosoft = (ms: any) => {
    Microsoft = ms;
};

export const setMap = (newMap: any) => {
    map = newMap;
};

export const newLayer = (id: string) => {
    if (typeof map === 'undefined') {
        throw new Error('tried to clear map before it had loaded');
    }

    return new Microsoft.Maps.Layer(id);
};

export const clearMap = () => {
    if (typeof map === 'undefined') {
        throw new Error('tried to clear map before it had loaded');
    }

    map.entities.clear();
};

export const insertLayer = (layer: any) => {
    if (typeof map === 'undefined') {
        throw new Error('tried to insert layer before map had loaded');
    }

    map.layers.insert(layer);
};

export const removeLayer = (layer: any) => {
    if (typeof map === 'undefined') {
        throw new Error('tried to remove layer before map had loaded');
    }

    map.layers.remove(layer);
};

export const newLocQuery = async (body: LocationRequest) => {
    return api('post', `${REACT_APP_BACKEND_API}/loc`, { json: true, body });
};

export const newIsoQuery = async (body: IsochroneUserRequest) => {
    const extraState: IsochroneRequest = Object.assign(
        {},
        {
            optimize: body.travelMode === TRAVEL_MODES.transit ? OPTIMIZE_MODES.time : OPTIMIZE_MODES.distance,
            timeUnit: TIME_UNITS.minute,
            distanceUnit: DISTANCE_UNITS.mi,
        },
        body
    );
    return api('post', `${REACT_APP_BACKEND_API}/isochrone`, { json: true, body: extraState });
};

export const createPolygons = (polyData: Array<{ coordinates: number[][][] }>, colour: string) => {
    const polygons: any = [];
    polyData.forEach(areas => {
        const rings: any = [];
        const ring: any = [];
        areas.coordinates.forEach(area => {
            area.forEach(coords => {
                ring.push(new Microsoft.Maps.Location(coords[0], coords[1]));
            });
            if (ring.length >= 3) {
                rings.push(ring);
            }
        });
        if (rings.length > 0) {
            polygons.push(new Microsoft.Maps.Polygon(rings, { fillColor: colour }));
        }
    });

    return polygons;
};
