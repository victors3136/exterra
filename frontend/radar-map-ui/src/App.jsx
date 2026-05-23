import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Car, RefreshCw, Radio, Gauge } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not rendering properly in React bundlers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const createCarIcon = (speed) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${speed > 70 ? '#ef4444' : '#10b981'};
      color: white; 
      padding: 6px; 
      border-radius: 50%; 
      border: 2px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
    </div>`,
    className: 'custom-car-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const API_ENDPOINT = process.env.ENDPOINT_URL;

export default function App() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTelemetryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();

      const parsedVehicles = data.map(item => ({
        id: item.stream_id,
        timestamp: new Date(Number(item.timestamp)),
        lat: Number(item.x),
        lng: Number(item.y),
        speed: Number(item.speed)
      }));

      setVehicles(parsedVehicles);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error pulling live tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>

        <header style={{ background: '#1e293b', color: 'white', padding: '15px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio style={{ color: '#10b981', animation: 'pulse 2s infinite' }} />
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Live Cloud Radar Telemetry System</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.875rem' }}>
            {lastUpdated && <span style={{ color: '#94a3b8' }}>Sync: {lastUpdated}</span>}
            <button
                onClick={fetchTelemetryData}
                disabled={loading}
                style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Force Refresh
            </button>
          </div>
        </header>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
              center={[process.env.LATITUDE, process.env.LONGITUDE]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {vehicles.map((car, index) => (
                <Marker
                    key={`${car.id}-${index}`}
                    position={[car.lat, car.lng]}
                    icon={createCarIcon(car.speed)}
                >
                  <Popup>
                    <div style={{ minWidth: '150px' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#1e293b' }}>{car.id}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '4px 0', fontSize: '0.85rem' }}>
                        <Gauge size={14} color="#64748b" />
                        <span>Speed: <strong>{car.speed} km/h</strong></span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>
                        Logged: {car.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
  );
}