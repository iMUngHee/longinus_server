require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import mongoose from 'mongoose';

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

router.get('/', (ctx) => {
	ctx.body = 'hello World!';
});

app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;
app.listen(port, () => {
	console.log('Listening to port %d', port);
});
