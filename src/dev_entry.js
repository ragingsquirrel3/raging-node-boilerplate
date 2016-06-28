import React from 'react';
import ReactDOM from 'react-dom';

import ChordDiagram from './index';
import { nodes, edges } from './fixture_props';

ReactDOM.render(<ChordDiagram nodes={nodes} edges={edges} />, document.getElementById('target'));
