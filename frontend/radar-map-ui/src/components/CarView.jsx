import {Marker, Popup} from "react-leaflet";
import {makeCarIcon} from "../utils/MakeCarIcon.js";
import {Gauge} from "lucide-react";
import {Theme} from "../utils/Theme.js";


const SpeedIcon = () => <Gauge size={14} color={Theme.accent}/>;

export default props => <Marker
    position={[props.car.lat, props.car.lng]}
    icon={makeCarIcon(props.car.speed)}
>
    <Popup>
        <div style={{minWidth: '150px', color: Theme.altText}}>
            <h3 style={{margin: '0 0 8px 0', fontSize: '1rem'}}>{props.car.id}</h3>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                margin: '4px 0',
                fontSize: '0.85rem'
            }}>
                <SpeedIcon/>
                <span>Speed: <strong>{props.car.speed} km/h</strong></span>
            </div>
            <div style={{fontSize: '0.75rem', marginTop: '8px'}}>
                Logged: {props.car.timestamp.toLocaleTimeString()}
            </div>
        </div>
    </Popup>
</Marker>