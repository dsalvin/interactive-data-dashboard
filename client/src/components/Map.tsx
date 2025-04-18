import React, { useEffect, useRef } from 'react';
// @ts-ignore
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  popup?: string;
}

interface MapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

const Map: React.FC<MapProps> = ({
  markers = [],
  center = [0, 0],
  zoom = 2,
  height = '400px',
  width = '100%',
  onMarkerClick
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      // Fix icon issues by setting the images path
      L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.7.1/dist/images/';
      
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center and zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update markers when props change
  useEffect(() => {
    if (mapRef.current) {
      // Clear existing markers
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });

      // Add new markers
      markers.forEach((marker) => {
        const leafletMarker = L.marker([marker.lat, marker.lng])
          .addTo(mapRef.current);
        
        if (marker.popup) {
          leafletMarker.bindPopup(marker.popup);
        }
        
        if (onMarkerClick) {
          leafletMarker.on('click', () => onMarkerClick(marker));
        }
      });
    }
  }, [markers, onMarkerClick]);

  return (
    <div style={{ height, width }} ref={mapContainerRef} className="leaflet-container" />
  );
};

export default Map;