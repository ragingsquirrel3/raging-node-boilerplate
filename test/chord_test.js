import assert from 'assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import ChordDiagram from '../src/index';
import { nodes, edges } from '../src/fixture_props';

function renderElementToString (element) {
  return ReactDOMServer.renderToString(element);
}

describe('chord diagram component', function () {
  it('should be able to be instantiated with blank props and render to string', function () {
    renderElementToString(<ChordDiagram />);
  });

  it('should be able to be instantiated with nodes and edges', function () {
    renderElementToString(<ChordDiagram nodes={nodes} edges={edges} />);
  });
});
