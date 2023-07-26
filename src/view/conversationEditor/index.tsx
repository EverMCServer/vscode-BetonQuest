import * as React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';

import App from './app';

// import { WebviewApi } from "vscode-webview";
// // const [vscodeFun, setVscode] = React.useState({} as WebviewApi<unknown>);
// const [vscode, setVscode] = React.useState({} as WebviewApi<unknown>);
// React.useEffect(() => {
//     setVscode(acquireVsCodeApi());
// });

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App vscode={acquireVsCodeApi()}/>);
