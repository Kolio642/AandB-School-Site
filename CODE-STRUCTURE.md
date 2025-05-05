# Code Structure Standards for A&B School Website

## Project Structure

```
AandB-School-Site/
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin dashboard and management
│   │   ├── api/         # API routes
│   │   └── [locale]/    # Localized routes
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Admin-specific components
│   │   ├── sections/    # Page sections
│   │   └── ui/          # UI components
│   ├── context/         # React context providers
│   ├── data/            # Static data and content
│   ├── lib/             # Utility functions and API clients
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── database/            # Database schema and migrations
├── locales/             # Translation files
├── .env.local.example   # Example environment variables
└── configuration files  # Various config files in the root
```

## Code Style Guidelines

### File Naming

- Use kebab-case for file names (e.g., `header-component.tsx`)
- Use PascalCase for component files (e.g., `Button.tsx`)
- Use camelCase for utility files (e.g., `formatDate.ts`)
- Use lowercase for directories with hyphen separators (e.g., `admin-components/`)
- Use standard naming patterns for Next.js App Router files:
  - `page.tsx` for route pages
  - `layout.tsx` for layout containers
  - `loading.tsx` for loading UI
  - `error.tsx` for error handling
  - `not-found.tsx` for 404 pages

### Component Structure

- Each component should be in its own file
- Component file should export one main component as default
- Helper functions specific to the component should be in the same file
- Shared helper functions should be in the `lib` directory
- Complex components should be broken down into smaller sub-components
- Common patterns for component organization:
  ```tsx
  import { useState } from 'react';
  import { ComponentProps } from '@/types/component-types';
  
  // Local helper functions
  function formatData(data) {
    // Implementation
  }
  
  // Component definition
  export default function MyComponent({ prop1, prop2 }: ComponentProps) {
    const [state, setState] = useState();
    
    // Component logic
    
    return (
      <div>
        {/* JSX structure */}
      </div>
    );
  }
  ```

### TypeScript

- All files should use TypeScript
- Define interfaces and types in component files for component props
- Define shared types in `src/types` directory
- Use explicit typing rather than inferred types for function parameters and returns
- Follow this pattern for component props:
  ```tsx
  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }
  ```
- Use TypeScript utilities like `Pick`, `Omit`, and `Partial` where appropriate
- Always specify return types for non-trivial functions
- Use enums for values with a fixed set of options

### Imports

- Group imports in the following order:
  1. React and Next.js imports
  2. Third-party libraries
  3. Internal components
  4. Utility functions and types
  5. Styles
- Example:
  ```tsx
  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  
  import { z } from 'zod';
  import { useForm } from 'react-hook-form';
  
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  
  import { getTranslations } from '@/lib/i18n';
  import type { NewsItem } from '@/types/news';
  ```

### CSS/Styling

- Use Tailwind CSS for styling
- For complex components, consider using composition with smaller components
- Follow a mobile-first approach for responsive design
- Use utility classes (e.g., `space-y-4`, `grid grid-cols-2`) for layout and spacing
- Use the `cn()` utility function from `@/lib/utils` for conditional class names
- Define common styles as reusable Tailwind components in the `tailwind.config.ts` file:
  ```js
  // tailwind.config.ts
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
  ```

### State Management

- Use React context for global state
- Use React hooks for component-specific state
- Prefer server components when possible for data fetching
- Context providers should be structured as:
  ```tsx
  // src/context/theme-context.tsx
  import { createContext, useContext, useState } from 'react';
  
  interface ThemeContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
  }
  
  const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
  
  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }
  
  export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
      throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
  }
  ```

## API and Data Fetching

- Use Server Components for initial data loading when possible
- Use SWR or React Query for client-side data fetching with caching
- Handle loading and error states for all data fetching operations
- For Supabase queries, use the typed client:
  ```tsx
  // src/lib/supabase.ts
  import { createClient } from '@supabase/supabase-js';
  import { Database } from '@/types/supabase';
  
  export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```
- Follow this pattern for server component data fetching:
  ```tsx
  // src/app/[locale]/news/page.tsx
  import { supabase } from '@/lib/supabase';
  
  async function getNews() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data;
  }
  
  export default async function NewsPage() {
    const news = await getNews();
    
    return (
      <div>
        {/* Render news */}
      </div>
    );
  }
  ```

## Error Handling

- Implement proper error boundaries
- Log errors to a monitoring service in production
- Provide user-friendly error messages
- Create custom error components for different scenarios
- Use try/catch blocks for async operations
- Use Next.js error.tsx files for route error handling

## Testing

- Write unit tests for critical components and utilities
- Implement integration tests for key user flows
- Aim for coverage of business-critical functionality
- Example Jest test:
  ```tsx
  // src/components/ui/button.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { Button } from './button';
  
  describe('Button component', () => {
    it('renders correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  ```

## Performance Considerations

- Optimize images using Next.js Image component
- Minimize JavaScript bundle size with code splitting
- Implement lazy loading for below-the-fold content
- Use appropriate caching strategies
- Follow these best practices:
  - Use `React.memo` for expensive components
  - Implement virtualization for long lists
  - Use Next.js dynamic imports for code splitting
  - Optimize fonts with Next.js font optimization
  - Set appropriate cache headers for static assets

## Internationalization

- Store translations in JSON files in the locales directory
- Use the `getTranslations` utility for accessing translations
- Follow this pattern for i18n components:
  ```tsx
  // src/app/[locale]/about/page.tsx
  import { getTranslations } from '@/lib/i18n';
  
  export default async function AboutPage({
    params: { locale },
  }: {
    params: { locale: string };
  }) {
    const t = await getTranslations(locale, 'about');
    
    return (
      <div>
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
      </div>
    );
  }
  ```

## Deployment Strategy

- Use standard build process: `npm run build`
- Environment-specific configuration through environment variables
- Implement a CI/CD pipeline for automated testing and deployment 
- Consider using GitHub Actions for CI/CD:
  ```yaml
  # .github/workflows/deploy.yml
  name: Deploy
  
  on:
    push:
      branches: [main]
  
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - name: Setup Node.js
          uses: actions/setup-node@v2
          with:
            node-version: '18'
        - name: Install dependencies
          run: npm ci
        - name: Build
          run: npm run build
        - name: Deploy
          # Deployment steps
  ``` 