"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  center = [20.5937, 78.9629], // Default India center
  zoom = 5,
  className = "w-full h-96",
}) => {
  // Component for handling map clicks
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "gold";
      case "low":
        return "green";
      default:
        return "gray";
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
                width:16px;
                height:16px;
                border-radius:50%;
                border:2px solid white;
                box-shadow:0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
            })}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-600">{report.incident_type}</p>
                <p className="text-xs text-gray-500">Severity: {report.severity}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
