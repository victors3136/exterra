import {MapContainer, TileLayer} from "react-leaflet";

const ClujNapocaPosition = {
    latitude: "46.77320",
    longitude: "23.62222"
}
export default function MapView(props) {
    return <MapContainer
        center={[
            ClujNapocaPosition.latitude,
            ClujNapocaPosition.longitude
        ]}
        zoom={12}
        style={{height: '100%', width: '100%'}}
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {props.vehicles.map(props.callbackfn)}
    </MapContainer>
}