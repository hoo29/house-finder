import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';

import Maps from './components/maps/Maps';
import Queries from './components/queries/Queries';

import './App.css';

const App: React.FC = () => {
    const [mapsLoaded, setMapsLoaded] = useState(false);

    return (
        <div className="App">
            <header className="App-header">
                <Typography variant="h3">Something Something</Typography>
            </header>
            <div className="App-content">
                {mapsLoaded && (
                    <div className="App-item">
                        <Queries colour="rgba(0, 255, 0, 0.2)" ind={'a'} />
                    </div>
                )}
                {mapsLoaded && (
                    <div className="App-item">
                        <Queries colour="rgba(255, 0, 0, 0.2)" ind={'b'} />
                    </div>
                )}
                <div className="App-item">
                    <Maps setMapsLoaded={setMapsLoaded} />
                </div>
            </div>
            <img
                src="https://www.zoopla.co.uk/static/images/mashery/powered-by-zoopla-150x73.png"
                width="150"
                height="73"
                title="Property information powered by Zoopla"
                alt="Property information powered by Zoopla"
            />
        </div>
    );
};

export default App;
