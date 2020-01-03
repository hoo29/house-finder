import React, { useState, FormEventHandler, useEffect } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { newIsoQuery, createPolygons, newLayer, insertLayer, newLocQuery } from '../../services/maps/maps.service';
import { IsochroneUserRequest, TRAVEL_MODES } from '../../services/maps/maps.types';

import './Queries.css';

const spinnerWidth = 35;

const Queries: React.FC<{ colour: string; ind: string }> = props => {
    const [loaded, setLoaded] = useState(true);
    const [state, setState] = useState<IsochroneUserRequest>({
        waypoint: '',
        maxTime: 0,
        maxDistance: 0,
        dateTime: new Date().toISOString().slice(0, -8),
        travelMode: TRAVEL_MODES.transit,
    });

    const [layer, setLayer] = useState();

    useEffect(() => {
        setLayer(newLayer(props.ind));
    }, [props.ind]);

    const submitQuery: FormEventHandler = event => {
        event.preventDefault();
        setLoaded(false);
        layer.clear();
        newLocQuery({ postcode: state.waypoint })
            .then(res =>
                newIsoQuery({
                    waypoint: `${res.point[0]},${res.point[1]}`,
                    maxTime: state.travelMode === TRAVEL_MODES.transit ? state.maxTime : undefined,
                    maxDistance: state.travelMode !== TRAVEL_MODES.transit ? state.maxDistance : undefined,
                    dateTime: state.dateTime,
                    travelMode: state.travelMode,
                })
            )
            .then(res => {
                const polygons = createPolygons(res.polygonResults, props.colour);
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
        minWidth: spinnerWidth + 20,
        visibility: !loaded ? 'visible' : 'hidden',
    };

    const formItems = [
        <TextField
            disabled={!loaded}
            key="waypoint"
            required={true}
            id={`waypoint_${props.ind}`}
            label="waypoint"
            autoComplete="postal-code"
            onChange={handleChange('waypoint', false)}
        />,
        <FormControl disabled={!loaded} key="travelMode" required={true}>
            <InputLabel htmlFor={`modeSelect_${props.ind}`}>Mode</InputLabel>
            <NativeSelect
                inputProps={{
                    name: 'Mode',
                    id: `modeSelect_${props.ind}`,
                }}
                value={state.travelMode}
                onChange={handleChange('travelMode', false)}
                id={`modeSelect_${props.ind}`}
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
            id={`maxTime_${props.ind}`}
            label="max time (min)"
            autoComplete="off"
            onChange={handleChange('maxTime', false)}
        />,
        <TextField
            disabled={state.travelMode === TRAVEL_MODES.transit || !loaded}
            key="maxDistance"
            required={true}
            id={`maxDistance_${props.ind}`}
            label="max dist (mi)"
            autoComplete="off"
            onChange={handleChange('maxDistance', false)}
        />,
        <TextField
            disabled={!loaded}
            key="dateTime"
            required={true}
            id={`dateTime_${props.ind}`}
            label="time"
            type="datetime-local"
            defaultValue={state.dateTime}
            InputLabelProps={{
                shrink: true,
            }}
            onChange={handleChange('dateTime', false)}
        />,
        // <FormControlLabel
        //     key="cache"
        //     control={
        //         <Checkbox
        //             disabled={!loaded}
        //             checked={state.cache}
        //             onChange={handleChange('cache', true)}
        //             value="cache"
        //             color="primary"
        //         />
        //     }
        //     label="cache"
        // />,
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
                <CircularProgress color="secondary" size={spinnerWidth} />
            </div>
        </div>
    );
};

export default Queries;
