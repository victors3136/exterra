import L from "leaflet";

import carIconAsset from '../assets/icon.svg';
import {Theme} from "./Theme.js";

export const makeCarIcon = (speed) => {

    const trafficThreshold = 25; // km/hour
    const freeFlowColor = Theme["accent-pos"];
    const trafficColor = Theme["accent-neg"];

    return L.divIcon({
        html: `<div style="
          background-color: ${speed > trafficThreshold ? freeFlowColor : trafficColor};
          color: white;
          padding: 6px; 
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;">
            <img src="${carIconAsset}" alt="car" style="width: 20px; height: 20px; display: block;" />
        </div>`,
        className: 'car-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};