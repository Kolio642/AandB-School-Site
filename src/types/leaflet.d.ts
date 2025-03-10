// Simple TypeScript definitions for Leaflet.js
declare namespace L {
  function map(id: string, options?: MapOptions): Map;
  function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  function marker(latLng: LatLngExpression, options?: MarkerOptions): Marker;
  
  interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    zoomControl?: boolean;
    attributionControl?: boolean;
  }
  
  interface Map {
    setView(center: LatLngExpression, zoom?: number): this;
    remove(): void;
  }
  
  interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
    minZoom?: number;
  }
  
  interface TileLayer {
    addTo(map: Map): this;
  }
  
  type LatLngExpression = [number, number] | { lat: number; lng: number };
  
  interface MarkerOptions {
    icon?: Icon;
    title?: string;
    alt?: string;
    opacity?: number;
  }
  
  interface Marker {
    addTo(map: Map): this;
    bindPopup(content: string): this;
    openPopup(): this;
  }
  
  interface Icon {
    options: any;
  }
}

// Extend Window interface to include Leaflet
interface Window {
  L: typeof L;
} 