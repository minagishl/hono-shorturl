import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Redirect, RedirectStatusCode } from './types/redirect';
import redirects from '../redirects.yml';

type Bindings = {
	TINYBIRD_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
	return c.text('Hello Hono!');
});

async function sendEvents(
	from: string,
	to: string,
	status: RedirectStatusCode,
	TINYBIRD_TOKEN?: string
) {
	if (!TINYBIRD_TOKEN) return;
	const date = new Date();
	const headers = {
		Authorization: `Bearer ${TINYBIRD_TOKEN}`,
	};
	const url = 'https://api.tinybird.co/'; // you may be on a different host
	const rawResponse = await fetch(`${url}v0/events?name=redirect`, {
		method: 'POST',
		body: JSON.stringify({
			from: from,
			to: to,
			status: status,
			date: date,
		}),
		headers: headers,
	});
	const content = await rawResponse.json();
	console.log(content);
}

(redirects as unknown as Redirect[]).forEach((redirect: Redirect) => {
	app.get(redirect.from, async (c) => {
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

		await sendEvents(redirect.from, redirect.to, status, c.env.TINYBIRD_TOKEN);

		return c.redirect(redirect.to, status);
	});
});

export default app;
