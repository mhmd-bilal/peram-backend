import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import supabase from './supabase';
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import productsRouter from './routes/products';
import authRouter from './routes/auth';
import pool from './db';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import WebSocket from 'ws';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/auth', authRouter);

app.get('/products/new', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/public', (req, res) => {
  res.sendStatus(200).send('akilan');
});

// Example route: Add a new product
app.post('/products/new', async (req, res) => {
  const { seller_id, name, description, starting_price, closing_at } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (seller_id, name, description, starting_price, current_price, closing_at) VALUES ($1, $2, $3, $4, $4, $5) RETURNING *',
      [seller_id, name, description, starting_price, closing_at]
    );
    res.json(result.rows[0]);
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API for second-hand product seller site',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 5000;

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');
});

// Upgrade HTTP server to WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: (err?: any) => any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
