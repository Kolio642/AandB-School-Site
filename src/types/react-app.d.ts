import 'react';

// Extend the JSX namespace to fix the "JSX element implicitly has type 'any'" errors
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Declare modules that don't have type definitions
declare module 'next/link';
declare module 'next/image';
declare module 'lucide-react';
declare module 'next-intl';

export {}; 