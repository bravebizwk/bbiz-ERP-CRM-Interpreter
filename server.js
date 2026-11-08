import express from 'express';
import cors from 'cors';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const disabledRoutes = [
  ['/api/activities', ['get']],
  ['/api/category-master', ['get']],
  ['/api/categories', ['get', 'post']],
  ['/api/chat', ['get', 'post']],
  ['/api/customers', ['get']],
  ['/api/interpreter', ['get', 'post']],
  ['/api/interpreters-list', ['get']],
  ['/api/items', ['get', 'post']],
  ['/api/monthly-payments', ['get']],
  ['/api/orders', ['get', 'post']],
  ['/api/partners', ['get']],
  ['/api/payments', ['get']],
  ['/api/products', ['get']],
  ['/api/projects', ['get', 'post']],
  ['/api/sidebar', ['get']],
  ['/api/sidebar-menu', ['get']],
  ['/api/stats', ['get']],
  ['/api/users', ['get']],
];

for (const [route, methods] of disabledRoutes) {
  for (const method of methods) {
    app[method](route, (_req, res) => {
      res.status(503).json({
        message: `${route} Disabled`,
        error: 'このAPIはNeonへの移行が完了するまで利用できません。',
      });
    });
  }
}

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');
if (existsSync(indexPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(indexPath, (error) => {
      if (error) next(error);
    });
  });
}

app.listen(PORT, () => {
  console.log(`Web app and API server are running on http://localhost:${PORT}`);
});
