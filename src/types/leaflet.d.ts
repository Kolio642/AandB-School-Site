// Simple TypeScript definitions for Leaflet.js
declare namespace L {
  function map(id: string, options?: MapOptions): Map;
  function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  function marker(latLng: LatLngExpression, options?: MarkerOptions): Marker;
  
  // Add control namespace
  const control: {
    zoom(options?: ZoomOptions): Control;
    attribution(options?: AttributionOptions): Control;
  };
  
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
    invalidateSize(options?: { animate?: boolean; pan?: boolean; debounceMoveend?: boolean; }): this;
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

  interface ZoomOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  }

  interface AttributionOptions {
    position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
    prefix?: string;
  }

  interface Control {
    addTo(map: Map): this;
  }
}

// Extend Window interface to include Leaflet
interface Window {
  L: typeof L;
} 