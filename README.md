# A&B School Website

A modern, responsive website for A&B School of Mathematics and Informatics in Shumen, Bulgaria.

## About

This website is built for A&B School, providing information about the school's educational programs, achievements, and contact information. The site is fully internationalized with support for both Bulgarian and English languages.

## Features

- **Bilingual Support**: Complete internationalization with Bulgarian and English language options
- **Modern UI**: Sleek, responsive design using TailwindCSS and ShadCN UI components
- **Server Components**: Leverages Next.js App Router and React Server Components
- **OpenStreetMap Integration**: Shows the school location using free, open-source mapping
- **Contact Form**: Easy to use contact form for inquiries
- **Mobile-First Design**: Fully responsive across all device sizes

## Technologies

- **[Next.js](https://nextjs.org/)**: React framework with App Router
- **[React](https://reactjs.org/)**: JavaScript library for building user interfaces
- **[TypeScript](https://www.typescriptlang.org/)**: Typed JavaScript
- **[TailwindCSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Leaflet.js](https://leafletjs.com/)**: Open-source JavaScript library for mobile-friendly interactive maps
- **[Lucide Icons](https://lucide.dev/)**: Beautiful open-source icons

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kolio642/AandB-School-Site.git
   cd AandB-School-Site
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
AandB-School-Site/
├── .cloudflare/         # Cloudflare configuration
├── locales/             # Translation files
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # Reusable UI components
│   ├── data/            # Static data and content
│   ├── lib/             # Utility functions
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── .gitignore
├── next.config.js       # Next.js configuration
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Deployment to Cloudflare Pages

### Automatic Deployment (via GitHub)

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Environment variables: Set `NODE_VERSION` to `18`

### Manual Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Build and deploy:
   ```bash
   npm run deploy
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- OpenStreetMap for providing free map data
- All the open-source libraries and tools that made this project possible 