import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Leaflet CSS imports
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(<App />);
