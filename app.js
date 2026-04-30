const express = require('express');
const axios = require('axios');
const path = require('path');

const baseURL = process.env.BASE_URL;

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
      url = `http://hawk.k8s.net/api/document/${product}/getbytags/${tag}`;
    } else if (days) {
      url = `http://hawk.k8s.net/api/document/${product}/getbydays/${days}`;
    } else if (start && end) {
      url = `http://hawk.k8s.net/api/document/${product}/getbydaterange/${start}/${end}`;
    } else {
      url = `http://hawk.k8s.net/api/document/${product}/getbytags/all`;
    }

    const response = await axios.get(url);


    res.render('index', {
      docs: Array.isArray(response.data) ? response.data : [],
      product,
      currentProduct: products[product],
      query: req.query
    });

  } catch (error) {
    console.error(error);
    res.send("Error fetching data");
  }
});

app.listen(5000, () => {
  console.log('UI running on http://localhost:5000');
});
