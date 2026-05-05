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

const baseURL = normalizeBaseURL(process.env.BASE_URL);
console.log(`Backend API base URL: ${baseURL}`);

const app = express();

// EJS setup 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const products = {
  akana: { id: 'akana', name: 'Akana', description: 'Full Lifecycle API Management' },
  blazemeter: { id: 'blazemeter', name: 'BlazeMeter', description: 'The Complete Continuous Testing Platform' },
  p4: { id: 'p4', name: 'P4', description: 'Version Control + Code Review' },
  perfecto: { id: 'perfecto', name: 'Perfecto', description: 'Web and Mobile App Testing' },
  puppet: { id: 'puppet', name: 'Puppet', description: 'Infrastructure Automation & Compliance' }
};

// HOME ROUTE
app.get('/', (req, res) => {
  res.render('index', {
    docs: [],
    product: null,
    currentProduct: null,
    query: {}
  });
});


// PRODUCT ROUTE
app.get('/:product', async (req, res) => {
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


    res.render('index', {
      docs: Array.isArray(response.data) ? response.data : [],
      product,
      currentProduct: products[product],
      query: req.query
    });

  } catch (error) {
    console.error(`Error fetching data from ${error.config?.url || 'backend API'}:`, error.message);
    res.send("Error fetching data");
  }
});

app.listen(5000, () => {
  console.log('UI running on http://localhost:5000');
});
