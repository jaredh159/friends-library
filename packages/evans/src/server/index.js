import express from 'express';
import * as React from 'react';
import App from '../components/App';
import routes from './routes';
import { wrap } from './helpers';

const { env: { PORT } } = process;

const app = express();

app.use(express.static('static'));

Object.keys(routes).map(route => {
  app.get(route, (req, res) => {
    const { props, children } = routes[route](req, res);
    res.send(wrap(<App {...props}>{children}</App>));
  });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));