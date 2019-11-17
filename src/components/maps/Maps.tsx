import React, { useEffect } from 'react';

import { setMap, setMicrosoft, Microsoft } from '../../services/maps/maps.service';

import './Maps.css';

const BING_MAPS_CALLBACK = 'MapsLoaded';
const Maps: React.FC<{
    setMapsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}> = props => {
    window[BING_MAPS_CALLBACK] = () => {
        console.debug('loaded bing maps');
        setMicrosoft((window as any).Microsoft);
        const newMap = new Microsoft.Maps.Map('#myMap', {
            center: new Microsoft.Maps.Location(51.50632, -0.12714),
            zoom: 10,
        });

        setMap(newMap);
        props.setMapsLoaded(true);
    };

    useEffect(() => {
        console.debug('loading bing maps');
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.src = `https://www.bing.com/api/maps/mapcontrol?callback=${BING_MAPS_CALLBACK}&key=${process.env.REACT_APP_BING_MAPS_KEY}`;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            <div id="myMap" className="Maps-container" />
        </div>
    );
};

export default Maps;
