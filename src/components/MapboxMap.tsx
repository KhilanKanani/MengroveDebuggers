"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue (Leaflet + Webpack/Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LeafletMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  reports?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    incident_type: string;
    severity: string;
  }>;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  onLocationSelect,
  reports = [],
  center = [20.5937, 78.9629], // India default
  zoom = 5,
  className = "w-full h-[500px] rounded-lg shadow-md overflow-hidden",
}) => {
  // Handle map click for selecting location
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  // Color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626"; // red-600
      case "high":
        return "#f97316"; // orange-500
      case "medium":
        return "#eab308"; // yellow-500
      case "low":
        return "#16a34a"; // green-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker />

        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={L.divIcon({
              className: "custom-marker",
              html: `<div style="
                background-color:${getSeverityColor(report.severity)};
                width:18px;
                height:18px;
                border-radius:50%;
                border:2px solid white;
                box-shadow:0 2px 6px rgba(0,0,0,0.4);
              "></div>`,
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-600">{report.incident_type}</p>
                <span
                  className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full text-white"
                  style={{ backgroundColor: getSeverityColor(report.severity) }}
                >
                  {report.severity.toUpperCase()}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
