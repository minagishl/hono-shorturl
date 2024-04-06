import esbuild from 'esbuild';
import { YAMLPlugin } from 'esbuild-yaml';
import { config } from './build.js';

const context = await esbuild.context({
	...config,
	plugins: [YAMLPlugin()],
});
await context.watch();
