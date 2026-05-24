import React, {useEffect, useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import CarView from "./CarView.jsx";
import Header from "./Header.jsx";
import MapView from "./MapView.jsx";

import {parsePayload} from "../utils/ParsePayload.js";
import {Theme} from "../utils/Theme.js";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_ENDPOINT = import.meta.env.VITE_ENDPOINT_URL;

export default function App() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchTelemetryData = async () => {
        setLoading(true);

        try {
            const response = await fetch(API_ENDPOINT);
            const data = await response.json();
            if (!data || data.length === 0) {
                setVehicles([]);
            } else {
                setVehicles(parsePayload(data));
            }
            setLastUpdated(new Date().toLocaleTimeString());
            setAutoRefresh(true);
        } catch (error) {
            console.warn("API Offline or Network Timeout. Sourcing localized offline telemetry framework...", error);
            setAutoRefresh(false);
            window.alert("Offline :(\n You might want to try to refresh once the connection resumes")
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!autoRefresh) return;
        fetchTelemetryData().then(_ => console.log("Telemetry data fetched successfully!"));
        const interval = setInterval(fetchTelemetryData, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: 'sans-serif',
            backgroundColor: Theme.main
        }}>

            <Header lastUpdated={lastUpdated} onClick={fetchTelemetryData} disabled={loading}/>

            <div style={{flex: 1, position: 'relative'}}>
                <MapView vehicles={vehicles}
                         callbackfn={(car, index) => <CarView key={`${car.id}-${index}`} car={car}/>}/>
            </div>
        </div>
    );
}