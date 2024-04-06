import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Redirect } from './types/redirect';
import redirects from '../redirects.yml';

const app = new Hono();

app.get('/', (c) => {
	return c.text('Hello Hono!');
});

(redirects as unknown as Redirect[]).forEach((redirect: Redirect) => {
	app.get(redirect.from, (c) => {
		// Redirect destination not set
		if (redirect.to === undefined || redirect.to === '') {
			throw new HTTPException(500, { message: 'Redirect destination is not defined' });
		}

		const params: Record<string, any> = c.req.param() as Record<string, any>;
		const paramsRegex: RegExp = /:(\w+)/g;

		// Replace redirect.to with matching values from params
		redirect.to = redirect.to.replace(paramsRegex, (_match, paramName) => {
			// Missing required parameter
			if (params[paramName] === undefined) {
				throw new HTTPException(400, { message: `Missing required parameter: ${paramName}` });
			}
			return params[paramName] || '';
		});

		// Redirect Status code
		const status = redirect.status || 302;

		return c.redirect(redirect.to, status);
	});
});

export default app;
