import { build } from 'esbuild';
import { YAMLPlugin } from 'esbuild-yaml';

export const config = {
	bundle: true,
	entryPoints: ['src/index.ts'],
	format: 'esm', // Set the output format to esm
	outfile: 'dist/_worker.js',
};

build({
	...config,
	plugins: [YAMLPlugin()],
});
