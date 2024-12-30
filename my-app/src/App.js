import './App.css';
import Header from './components/Header.js';
import Map from './components/map.js';
import Sidebar from './components/Sidebar.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';

const App = () => {
  const [geojson, setGeoJSON] = useState(null);
  

  return (
    <div className="layout">
      <Header />
      <div className="content">
        <Sidebar onGeoJSON={setGeoJSON} />
        <Map geojson={geojson} />
      </div>
    </div>
  );
};

export default App;
