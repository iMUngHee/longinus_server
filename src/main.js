require('dotenv').config();
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwtMiddleware from './lib/jwtMiddleware';
import Router from 'koa-router';
import mongoose from 'mongoose';

import api from './api';

const { PORT, MONGO_URI } = process.env;

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true })
	.then(() => {
		console.log('Connected to MongoDB');
	})
	.catch((e) => {
		console.error(e);
	});

const app = new Koa();
const router = new Router();

// 라우터 설정
router.use('/api', api.routes()); // api 라우트 적용

// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());
app.use(jwtMiddleware);

// app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
	console.log('Listening to port %d', port);
});
