'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  width?: string;
  markerTitle?: string;
  className?: string;
}

/**
 * A component that renders an OpenStreetMap using Leaflet
 */
export function OpenStreetMap({
  latitude,
  longitude,
  zoom = 16,
  height = '400px',
  width = '100%',
  markerTitle = 'A&B School',
  className = ''
}: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If window is not available (SSR) or map already initialized, exit
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let isMounted = true;
    
    // Defer map initialization to next tick for better performance
    const timer = setTimeout(() => {
      if (!isMounted || !mapRef.current) return;
      
      // Fix Leaflet's icon path issues
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      // Initialize map with faster rendering options
      const map = L.map(mapRef.current, {
        attributionControl: false, // We'll add this later to speed up initial render
        zoomControl: false, // Add this later too
        fadeAnimation: false, // Disable animations for faster loading
        zoomAnimation: false, // Disable animations for faster loading
        markerZoomAnimation: false, // Disable animations for faster loading
      }).setView([latitude, longitude], zoom);
      
      mapInstanceRef.current = map;

      // Add the OpenStreetMap tile layer with caching options
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: true,
        updateWhenIdle: true, // Only load/render tiles when user is not interacting
        updateWhenZooming: false, // Don't load new tiles during zoom
      }).addTo(map);

      // Add a marker at the specified location
      const marker = L.marker([latitude, longitude]).addTo(map);
      
      // Add a popup to the marker
      if (markerTitle) {
        marker.bindPopup(markerTitle);
      }

      // Add controls after initial render
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          L.control.attribution({position: 'bottomright'}).addTo(mapInstanceRef.current);
          L.control.zoom({position: 'topleft'}).addTo(mapInstanceRef.current);
          setIsLoading(false);
        }
      }, 100);
      
      // Invalidate map size after it's visible to fix rendering issues
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
      
    }, 0);

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerTitle]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-2xl z-10">
          <div className="text-center">
            <div className="rounded-full h-10 w-10 bg-primary/30 animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        className="leaflet-container w-full h-full"
        ref={mapRef}
      />
    </div>
  );
}

// Add a default export
export default OpenStreetMap;