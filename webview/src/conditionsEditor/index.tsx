import { createRoot } from 'react-dom/client';

import App from '../legacyListEditor/app';
import Condition from 'betonquest-utils/betonquest/Condition';
import ConditionsEditor from './ConditionsList/ConditionsEditor';

import './index.css';

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App<Condition> type='conditions' editor={ConditionsEditor} />);
