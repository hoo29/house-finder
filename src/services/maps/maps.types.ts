export enum TRAVEL_MODES {
    driving = 'driving',
    walking = 'walking',
    transit = 'transit',
}

export enum OPTIMIZE_MODES {
    distance = 'distance',
    time = 'time',
    timeWithTraffic = 'timeWithTraffic',
}

export enum TIME_UNITS {
    minute = 'minute',
    second = 'second',
}

export enum DISTANCE_UNITS {
    mi = 'mi',
    km = 'km',
}

export interface LocationRequest {
    postcode: string;
}

export interface IsochroneUserRequest {
    waypoint: string;
    maxTime?: number;
    maxDistance?: number;
    dateTime?: string;
    travelMode: TRAVEL_MODES;
}

export interface IsochroneRequest extends IsochroneUserRequest {
    timeUnit?: TIME_UNITS;
    distanceUnit?: DISTANCE_UNITS;
    optimize?: OPTIMIZE_MODES;
}
