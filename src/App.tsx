import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import rp from 'request-promise-native';

import './App.css';

declare var Microsoft: any;
const BING_MAPS_KEY = process.env.REACT_APP_BING_MAPS_KEY;
const BING_MAPS_CALLBACK = 'MapsLoaded';

const setTimeoutProm = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

const App: React.FC = () => {
    let map: any;
    (window as any)[BING_MAPS_CALLBACK] = () => {
        console.log('hello2');
        const newMap = new Microsoft.Maps.Map('#myMap', {
            center: new Microsoft.Maps.Location(51.50733, -0.100136),
            zoom: 10,
        });
        map = newMap;
    };

    useEffect(() => {
        const script = document.createElement('script');

        script.async = true;
        script.defer = true;
        script.src = `https://www.bing.com/api/maps/mapcontrol?callback=${BING_MAPS_CALLBACK}&key=${BING_MAPS_KEY}`;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const checkForErrors = (res: any) => {
        if (typeof res.errorDetails !== 'undefined') {
            throw new Error(`there was an error ${res.errorDetails}`);
        }

        if (!res.resourceSets[0].resources[0].isAccepted) {
            throw new Error('request not accepted by bing maps');
        }
    };

    const pollAsync: (res: any) => Promise<string> = async (res: any) => {
        checkForErrors(res);
        let done = false;
        while (!done) {
            const callBackUrl = res.resourceSets[0].resources[0].callbackUrl;
            const timeOut = res.resourceSets[0].resources[0].callbackInSeconds * 1000;
            console.log('waiting', timeOut);
            await setTimeoutProm(timeOut);
            console.log('getting next async result');
            res = await rp.get(callBackUrl, { json: true });
            checkForErrors(res);
            done = res.resourceSets[0].resources[0].isCompleted;
        }
        return res.resourceSets[0].resources[0].resultUrl;
    };

    const initMapsRequest = async () => {
        map.entities.clear();
        const isoAsyncRes = await rp.get('https://dev.virtualearth.net/REST/v1/Routes/IsochronesAsync', {
            qs: {
                waypoint: 'Vauxhall Station, London, England, United Kingdom',
                maxTime: '60',
                timeUnit: 'minute',
                travelMode: 'transit',
                // optimize: 'time',
                // dateTime: `${new Date().toLocaleString('en-us')}`,
                dateTime: '11/04/2019 06:00:00 PM',
                key: BING_MAPS_KEY,
            },
            json: true,
        });

        console.log('waiting for results to be ready');
        const resUrl = await pollAsync(isoAsyncRes);
        console.log('getting results');
        const results = await rp.get(resUrl, { json: true });

        const polyData = results.resourceSets[0].resources[0].polygons as any[] | undefined;
        if (typeof polyData === 'undefined') {
            throw new Error(`error in results: ${results.resourceSets[0].resources[0].errorMessage}`);
        }
        console.log(polyData);
        const polygons: any = [];
        polyData.forEach((areas: any) => {
            const rings: any = [];
            const ring: any = [];
            areas.coordinates.forEach((area: any) => {
                area.forEach((coords: any) => {
                    ring.push(new Microsoft.Maps.Location(coords[0], coords[1]));
                });
                if (ring.length >= 3) {
                    rings.push(ring);
                }
            });
            if (rings.length > 0) {
                polygons.push(new Microsoft.Maps.Polygon(rings));
            }
        });

        console.log('loading polygons');

        map.entities.push(polygons);
    };

    return (
        <div className="App">
            <header className="App-header">
                <Button variant="contained" color="primary" onClick={initMapsRequest}>
                    Load Data
                </Button>
                <div id="myMap" className="Maps" />
            </header>
        </div>
    );
};

export default App;
