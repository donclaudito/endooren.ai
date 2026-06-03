const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = 3000;

// Helper to parse JSON request bodies
const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch {
      resolve({});
    }
  });
});

const server = http.createServer(async (req, res) => {
  // CORS configuration to enable local testing
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  let filePath = '';
  if (pathname.startsWith('/api/')) {
    const relativePath = pathname.substring(5); // Remove '/api/'
    filePath = path.join(__dirname, 'api', relativePath + '.js');
  }

  if (filePath && fs.existsSync(filePath)) {
    try {
      // Clear Node cache to allow hot reloading during development
      delete require.cache[require.resolve(filePath)];
      const routeHandler = require(filePath);

      // Extend req and res to match Vercel Serverless environment signatures
      req.query = parsedUrl.query;
      req.body = await parseBody(req);
      
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
      
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };

      res.send = (data) => {
        res.end(data);
        return res;
      };

      await routeHandler(req, res);
    } catch (err) {
      console.error('Error handling route:', pathname, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno no servidor de API local.' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Rota não encontrada: ${pathname}` }));
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Custom API dev server running on http://localhost:${PORT}`);
  console.log(`📁 Using local SQLite fallback database.`);
  console.log(`==================================================\n`);
});
