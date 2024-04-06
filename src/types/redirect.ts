export type Redirect = {
	from: string;
	to: string;
	status?: RedirectStatusCode;
};

export type RedirectStatusCode = 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;
