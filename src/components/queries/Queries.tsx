import React, { useState, FormEventHandler, useEffect } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { newQuery, createPolygons, newLayer, insertLayer } from '../../services/maps/maps.service';
import { IsochroneUserRequest, TRAVEL_MODES } from '../../services/maps/maps.types';

import './Queries.css';

const Queries: React.FC<{ colour: string; ind: string }> = props => {
    const [loaded, setLoaded] = useState(true);
    const [state, setState] = useState<IsochroneUserRequest>({
        waypoint: '',
        maxTime: 0,
        maxDistance: 0,
        dateTime: new Date().toISOString().slice(0, -8),
        travelMode: TRAVEL_MODES.transit,
        cache: false,
    });

    const [layer, setLayer] = useState();

    useEffect(() => {
        setLayer(newLayer(props.ind));
    }, [props.ind]);

    const submitQuery: FormEventHandler = event => {
        event.preventDefault();
        setLoaded(false);
        const refinedState: IsochroneUserRequest = {
            waypoint: state.waypoint,
            maxTime: state.travelMode === TRAVEL_MODES.transit ? state.maxTime : undefined,
            maxDistance: state.travelMode !== TRAVEL_MODES.transit ? state.maxDistance : undefined,
            dateTime: state.dateTime,
            travelMode: state.travelMode,
            cache: state.cache,
        };
        newQuery(refinedState)
            .then(res => {
                const polygons = createPolygons(res, props.colour);
                layer.add(polygons);
                insertLayer(layer);
                setLoaded(true);
            })
            .catch(console.error);
    };

    const clearLayer = () => {
        layer.clear();
    };

    const handleChange = (name: keyof typeof state, button: boolean) => (event: React.ChangeEvent<any>) => {
        if (button) {
            setState({
                ...state,
                [name]: event.target.checked,
            });
        } else {
            setState({
                ...state,
                [name]: event.target.value,
            });
        }
    };

    const spinnerVis: React.CSSProperties = {
        visibility: !loaded ? 'visible' : 'hidden',
    };

    const formItems = [
        <TextField
            disabled={!loaded}
            key="waypoint"
            required={true}
            id="waypoint"
            label="waypoint"
            autoComplete="postal-code"
            onChange={handleChange('waypoint', false)}
        />,
        <FormControl disabled={!loaded} key="travelMode" required={true}>
            <InputLabel htmlFor="mode-select">Mode</InputLabel>
            <NativeSelect
                inputProps={{
                    name: 'Mode',
                    id: 'mode-select',
                }}
                value={state.travelMode}
                onChange={handleChange('travelMode', false)}
                id="mode-select"
            >
                {Object.values(TRAVEL_MODES).map((val, ind) => (
                    <option value={val} key={ind}>
                        {val}
                    </option>
                ))}
            </NativeSelect>
        </FormControl>,
        <TextField
            disabled={state.travelMode !== TRAVEL_MODES.transit || !loaded}
            key="maxTime"
            required={true}
            id="maxTime"
            label="max time (min)"
            autoComplete="off"
            onChange={handleChange('maxTime', false)}
        />,
        <TextField
            disabled={state.travelMode === TRAVEL_MODES.transit || !loaded}
            key="maxDistance"
            required={true}
            id="maxDistance"
            label="max dist (mi)"
            autoComplete="off"
            onChange={handleChange('maxDistance', false)}
        />,
        <TextField
            disabled={!loaded}
            key="dateTime"
            required={true}
            id="dateTime"
            label="time"
            type="datetime-local"
            defaultValue={state.dateTime}
            InputLabelProps={{
                shrink: true,
            }}
            onChange={handleChange('dateTime', false)}
        />,
        <FormControlLabel
            key="cache"
            control={
                <Checkbox
                    disabled={!loaded}
                    checked={state.cache}
                    onChange={handleChange('cache', true)}
                    value="cache"
                    color="primary"
                />
            }
            label="cache"
        />,
        <Button disabled={!loaded} type="submit" key="submit" variant="contained" color="primary">
            Go
        </Button>,
    ];

    return (
        <div className="Query-options">
            <form className="Query-options" action="" onSubmit={submitQuery}>
                {formItems.map((item, ind) => (
                    <div key={ind} className="Query-item">
                        {item}
                    </div>
                ))}
            </form>
            <div className="Query-item">
                <Button disabled={!loaded} key="clear" variant="contained" color="primary" onClick={clearLayer}>
                    clear
                </Button>
            </div>
            <div className="Query-item" style={spinnerVis} key="spinner">
                <CircularProgress color="secondary" size={35} />
            </div>
        </div>
    );
};

export default Queries;
