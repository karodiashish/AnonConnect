import express, { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: Express) {
  // In production, serve static files from the built client
  const staticPath = path.join(__dirname, '..', 'dist', 'public');
  app.use(express.static(staticPath));
  
  // Handle client-side routing - serve index.html for any non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/ws')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

export function log(message: string, source = "express") {
  console.log(`[${source}] ${message}`);
}