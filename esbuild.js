// esbuild 打包脚本：把 src/extension.ts 及依赖打包成单文件 dist/extension.js
// 用法：node esbuild.js         一次性构建
//       node esbuild.js --watch 监听变更
const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'], // vscode 模块由扩展宿主提供，不打进包
  format: 'cjs',
  platform: 'node',
  target: 'node16',
  sourcemap: true,
  minify: false,
};

(async () => {
  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('[esbuild] watching...');
  } else {
    await esbuild.build(options);
    console.log('[esbuild] build done -> dist/extension.js');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
