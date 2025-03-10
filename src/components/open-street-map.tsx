'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

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
 * A simple OpenStreetMap component using Leaflet.js
 * This is a free alternative to Google Maps that doesn't require an API key
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
  const mapId = 'open-street-map';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isMapLibLoaded, setIsMapLibLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're in the browser environment
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle script load
  const handleScriptLoad = () => {
    setIsMapLibLoaded(true);
    console.log('Leaflet library loaded');
  };

  // Initialize map when Leaflet is loaded and we're in the browser
  useEffect(() => {
    if (!isClient || !isMapLibLoaded || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      console.log('Initializing OpenStreetMap');
      
      // Create map instance
      const map = L.map(mapId).setView([latitude, longitude], zoom);
      
      // Add tile layer (the actual map imagery)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      
      // Add marker at specified location
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(markerTitle)
        .openPopup();
        
      // Store map instance for cleanup
      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error initializing OpenStreetMap:', error);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerTitle, isClient, isMapLibLoaded]);
  
  return (
    <div className={`${className} relative`} style={{ height, width }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      {/* Leaflet JavaScript */}
      {isClient && (
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
          strategy="lazyOnload"
          onLoad={handleScriptLoad}
        />
      )}
      
      {/* Map container */}
      <div 
        id={mapId} 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden z-10"
        aria-label={`Map showing ${markerTitle}`}
      />
      
      {/* Loading overlay - shown until Leaflet is loaded */}
      {isClient && !isMapLibLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted bg-opacity-50 z-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
} 