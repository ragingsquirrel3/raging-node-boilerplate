import React from 'react';
import ReactDOM from 'react-dom';

import ChordDiagram from './index';
import { nodes, edges } from './fixture_props';

const WrapperClass = React.createClass({
  getInitialState() {
    return {
      nodes: nodes,
      edges: edges
    };
  },

  // change the data after a second to see what happens
  componentDidMount() {
    setTimeout( () => {
      var newNodes = this.state.nodes;
      var newEdges = this.state.edges;
      newNodes.push({
        name: 'Travis',
        id: 6,
        size: 5,
        length: 2
      });
      newEdges.push({
        source: 6,
        target: 2
      });
    
      this.setState({ nodes: newNodes, edges: newEdges });
    }, 1000);
  },

  render () {
    return <ChordDiagram nodes={this.state.nodes} edges={this.state.edges} />;
  }
});

ReactDOM.render(<WrapperClass />, document.getElementById('target'));
