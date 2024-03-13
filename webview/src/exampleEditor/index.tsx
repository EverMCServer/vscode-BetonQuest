import { createRoot } from 'react-dom/client';

import App from './app';

import './index.css';

import 'betonquest-utils/ui/style/ant';

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App />);
