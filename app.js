const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

loadEnvFile(path.join(__dirname, 'env', '.env'));

const normalizeBaseURL = (value) => {
  const fallback = 'http://localhost:3000';
  const raw = (value || fallback).trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
};

const normalizeBasePath = (value) => {
  const raw = (value || '').trim();
  if (!raw || raw === '/') return '';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, '');
};

const baseURL = normalizeBaseURL(process.env.BASE_URL);
const basePath = normalizeBasePath(process.env.BASE_PATH);
console.log(`Backend API base URL: ${baseURL}`);
console.log(`UI base path: ${basePath || '/'}`);

const app = express();

const withBasePath = (routePath = '/') => {
  const suffix = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return `${basePath}${suffix}` || '/';
};

const knownProducts = Object.keys({
  akana: true,
  blazemeter: true,
  p4: true,
  perfecto: true,
  puppet: true
});

// EJS setup 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.basePath = basePath;
app.locals.withBasePath = withBasePath;
app.use(withBasePath('/'), express.static(path.join(__dirname, 'public')));

const router = express.Router();

const products = {
  akana: { id: 'akana', name: 'Akana', description: 'Full Lifecycle API Management' },
  blazemeter: { id: 'blazemeter', name: 'BlazeMeter', description: 'The Complete Continuous Testing Platform' },
  p4: { id: 'p4', name: 'P4', description: 'Version Control + Code Review' },
  perfecto: { id: 'perfecto', name: 'Perfecto', description: 'Web and Mobile App Testing' },
  puppet: { id: 'puppet', name: 'Puppet', description: 'Infrastructure Automation & Compliance' }
};

const getDocTimestamp = (doc) => {
  const rawDate = doc.createdAt || doc.created_at || doc.updatedAt || doc.updated_at || doc.date || doc.timestamp || '';
  const timestamp = new Date(rawDate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortDocsByNewest = (docs) => {
  return [...docs].sort((a, b) => getDocTimestamp(b) - getDocTimestamp(a));
};

// HOME ROUTE
router.get('/', (req, res) => {
  res.render('index', {
    docs: [],
    product: null,
    currentProduct: null,
    query: {},
    basePath,
    withBasePath
  });
});


// PRODUCT ROUTE
router.get('/:product', async (req, res) => {
  try {
    const product = req.params.product;
    if (!products[product]) {
      return res.status(404).send('Product not found');
    }

    const tag = req.query.tag;
    const days = req.query.days;
    const start = req.query.start;
    const end = req.query.end;

    let url = '';

    if (tag) {
      url = `${baseURL}/api/document/${product}/getbytags/${tag}`;
    } else if (days) {
      url = `${baseURL}/api/document/${product}/getbydays/${days}`;
    } else if (start && end) {
      url = `${baseURL}/api/document/${product}/getbydaterange/${start}/${end}`;
    } else {
      url = `${baseURL}/api/document/${product}/getbytags/all`;
    }

    console.log(`Fetching docs from: ${url}`);
    const response = await axios.get(url);
    const docs = Array.isArray(response.data) ? sortDocsByNewest(response.data) : [];


    res.render('index', {
      docs,
      product,
      currentProduct: products[product],
      query: req.query,
      basePath,
      withBasePath
    });

  } catch (error) {
    console.error(`Error fetching data from ${error.config?.url || 'backend API'}:`, error.message);
    res.send("Error fetching data");
  }
});

app.use(withBasePath('/'), router);

if (basePath) {
  app.get('/', (req, res) => {
    res.redirect(basePath);
  });
}

app.get('/:product', (req, res, next) => {
  if (knownProducts.includes(req.params.product)) {
    return res.redirect(withBasePath(`/${req.params.product}`));
  }
  return next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const uiPath = basePath || '';
  console.log(`UI running on http://localhost:${PORT}${uiPath}`);
});
