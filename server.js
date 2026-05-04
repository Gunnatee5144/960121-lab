const express = require('express');
const path = require('path');

const productRoutes = require('./routes/products');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');

const app = express();
const port = process.env.PORT || 3000;
const rootDir = __dirname;
const htmlPages = [
  'index',
  'about',
  'blog',
  'cart',
  'checkout',
  'contact',
  'explanation',
  'register',
  'services',
  'shop',
  'thankyou'
];

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use('/data', express.static(path.join(rootDir, 'data')));

app.use('/api/products', productRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);

app.get('/', function(_request, response) {
  response.sendFile(path.join(rootDir, 'index.html'));
});

htmlPages.forEach(function(pageName) {
  app.get('/' + pageName + '.html', function(_request, response) {
    response.sendFile(path.join(rootDir, pageName + '.html'));
  });
});

app.use(function(_request, response) {
  response.status(404).json({ message: 'Route not found' });
});

app.listen(port, function() {
  console.log('Express server running on http://localhost:' + port);
});