import * as React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

import './index.css';

import '../style/vscodeButton.css';
import "../style/vscodeDivider.css";
import "../style/vscodeInputNumber.css";
import "../style/vscodePopover.css";
import "../style/vscodeTooltip.css";

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App />);
