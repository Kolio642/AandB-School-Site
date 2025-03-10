// This file is used to declare types that are needed throughout the application

import { ReactNode } from 'react';

// Declare JSX namespace
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Augment React namespace
declare namespace React {
  interface ReactNode {
    children?: ReactNode;
  }
}

// Declare module types
declare module 'next/link';
declare module 'next/image';
declare module 'lucide-react'; 