import { ProposedFeatures } from 'vscode-languageserver';
import { createConnection } from 'vscode-languageserver/node';

import { server } from './server.common';

// For node environment (normal VSCode)
const connection = createConnection(ProposedFeatures.all);

// Run server logics
server(connection);
