import React, {useEffect, useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import MapView from "./MapView.jsx";
import CarView from "./CarView.jsx";
import Header from "./Header.jsx";

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
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

    const MOCK_FALLBACKS = [
        {
            stream_id: "car_7_mock",
            x: 46.77082547706394, y: 23.589756639739864,
            speed: 32, timestamp: Date.now()
        },
        {
            stream_id: "car_23_mock",
            x: 46.77116323869496, y: 23.59060383429633,
            speed: 12, timestamp: Date.now() - 12345
        },
        {
            stream_id: "car_89_mock",
            x: 46.76966494660008, y: 23.59303161571189,
            speed: 16, timestamp: Date.now() - 67890
        }
    ];

    const fetchTelemetryData = async () => {
        setLoading(true);

        const parsePayload = (rawData) => rawData.map(item => {
            const rawStreamId = item.stream_id?.Value || item.stream_id || 'unknown';
            const rawLat      = item.latitude?.Value  || item.x || 0;
            const rawLng      = item.longitude?.Value || item.y || 0;
            const rawSpeed    = item.speed?.Value     || item.speed || 0;
            const rawTime     = item.timestamp?.Value  || item.timestamp || Date.now();
            const cleanId = rawStreamId.includes("mock") ? rawStreamId : `${rawStreamId} (Live)`;

            return {
                id: cleanId,
                timestamp: new Date(Number(rawTime)),
                lat: Number(rawLat),
                lng: Number(rawLng),
                speed: Number(rawSpeed)
            };
        });

        try {
            const response = await fetch(API_ENDPOINT);
            const data = await response.json();
            if (!data || data.length === 0) {
                console.log("Database table empty. Injecting virtual fallback fleet...");
                setVehicles(parsePayload(MOCK_FALLBACKS));
            } else {
                setVehicles(parsePayload(data));
            }
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (error) {
            console.warn("API Offline or Network Timeout. Sourcing localized offline telemetry framework...", error);
            setVehicles(parsePayload(MOCK_FALLBACKS));
            setLastUpdated(`${new Date().toLocaleTimeString()} (Offline Mode)`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetryData().then(_ => console.log("Telemetry data fetched successfully!"));
        const interval = setInterval(fetchTelemetryData, 5000);
        return () => clearInterval(interval);
    }, []);

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