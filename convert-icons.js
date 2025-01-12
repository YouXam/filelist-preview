import babel from '@babel/core';
import fs from 'fs';
import path from 'path';

const ICON_BASE = path.join(__dirname, 'node_modules/material-icon-theme/icons/');
const ICON_DEST = path.join(__dirname, 'public/icons/');

if (!fs.existsSync(ICON_DEST)) {
  fs.mkdirSync(ICON_DEST, { recursive: true });
}

const h = (type, props, ...children) => {
  if (props) delete props.xmlns;
  return {
    type,
    props: children && children.length ? {
      ...props,
      children
    } : props
  };
}

function convert(filename) {
  const svgCode = fs.readFileSync(path.join(ICON_BASE, filename), 'utf8')
    .replaceAll("xmlns:xlink", "xmlnsXlink")
    .replaceAll("xml:space", "xmlSpace")

  const jsxResult = babel.transformSync(svgCode, {
    presets: ['@babel/preset-react'],
    plugins: [
      [
        '@babel/plugin-transform-react-jsx',
        {
          pragma: 'h',
          throwIfNamespace: false,
        },
      ],
    ],
  });
  const jsx = eval(jsxResult.code);
  fs.writeFileSync(path.join(ICON_DEST, filename.replace('.svg', '.json')), JSON.stringify(jsx));
}

fs.readdirSync(ICON_BASE).forEach(filename => {
  try {
    convert(filename)
  } catch (e) {
    console.error(`Failed to convert ${filename}`);
  }
});
