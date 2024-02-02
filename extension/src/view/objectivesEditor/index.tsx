import * as React from 'react';
import { createRoot } from 'react-dom/client';

import App from '../legacyListEditor/app';
import Objective from '../../betonquest/Objective';
import ObjectivesEditor from './ObjectivesList/ObjectivesEditor';

import './index.css';

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App<Objective> type='objectives' editor={ObjectivesEditor} />);
