export const parsePayload = (rawData) => rawData.map(item => {
    const rawStreamId = item.stream_id?.Value || item.stream_id || 'unknown';
    const rawLat = item.latitude?.Value || item.x || 0;
    const rawLng = item.longitude?.Value || item.y || 0;
    const rawSpeed = item.speed?.Value || item.speed || 0;
    const rawTime = item.timestamp?.Value || item.timestamp || Date.now();
    const cleanId = rawStreamId.includes("mock") ? rawStreamId : `${rawStreamId} (Live)`;

    return {
        id: cleanId,
        timestamp: new Date(Number(rawTime)),
        lat: Number(rawLat),
        lng: Number(rawLng),
        speed: Number(rawSpeed)
    };
});