import { createRoot } from 'react-dom/client';

import App from '../legacyListEditor/app';
import Event from 'betonquest-utils/betonquest/Event';
import EventsEditor from './EventsList/EventsEditor';

import './index.css';

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App<Event> type='events' editor={EventsEditor} />);
