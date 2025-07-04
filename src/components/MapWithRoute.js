import { GoogleMap, Polyline, Marker } from "@react-google-maps/api"
import polyline from "@mapbox/polyline"

const containerStyle = { width: "100%", height: "500px" }
const defaultCenter = { lat: 46.7551903, lng: 23.5665899 }

export default function MapWithRoute({ encodedPolyline, stops = [], headquarters }) {
  if (!encodedPolyline) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🗺️</div>
          <p style={{ color: "#64748b", fontSize: "16px" }}>No route available</p>
        </div>
      </div>
    )
  }

  // Decode encoded polyline into path coordinates
  const path = polyline.decode(encodedPolyline).map(([lat, lng]) => ({ lat, lng }))

  // Determine center of map
  const center = headquarters || path[0] || defaultCenter

  // Simple HQ icon
  const createHQIcon = () => {
    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1f2937" stroke="#ffffff" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold">HQ</text>
          </svg>
        `),
      ...(typeof window !== "undefined" &&
        window.google?.maps?.Size && {
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        }),
    }
  }

  // Simple stop icon
  const createStopIcon = (stopNumber, isCompleted = false) => {
    const color = isCompleted ? "#10b981" : "#3b82f6"

    return {
      url:
        "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(`
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" fill="${color}" stroke="#ffffff" stroke-width="3"/>
            <text x="18" y="23" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${stopNumber}</text>
          </svg>
        `),
      ...(typeof window !== "undefined" &&
        window.google?.maps?.Size && {
          scaledSize: new window.google.maps.Size(36, 36),
          anchor: new window.google.maps.Point(18, 18),
        }),
    }
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#f8fafc" }],
          },
          {
            featureType: "water",
            elementType: "geometry.fill",
            stylers: [{ color: "#dbeafe" }],
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#e5e7eb" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#fef3c7" }],
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Simple route line */}
      <Polyline
        path={path}
        options={{
          strokeColor: "#3b82f6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
          geodesic: true,
        }}
      />

      {/* HQ marker */}
      {headquarters && <Marker position={headquarters} title="Headquarters" icon={createHQIcon()} />}

      {/* Stop markers */}
      {stops.map((pt, i) => (
        <Marker
          key={`${pt.lat}-${pt.lng}-${i}`}
          position={pt}
          title={`Stop ${i + 1}`}
          icon={createStopIcon(i + 1, pt.isCompleted)}
        />
      ))}
    </GoogleMap>
  )
}
