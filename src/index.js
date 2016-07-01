import React from 'react';
import d3 from 'd3';

const WIDTH = 960;
const HEIGHT = 960;
const PADDING = 50;

const ChordDiagram = React.createClass({
  propTypes: {
    nodes: React.PropTypes.array,
    edges: React.PropTypes.array
  },

  render () {
    return (
      <div>
        <svg ref='svg' width={WIDTH} height={HEIGHT} />
      </div>
    );
  },

  componentDidMount() {
    this._renderSVG();
  },

  // d3-fu
  _renderSVG () {
    const outerRadius = Math.min(WIDTH, HEIGHT) * 0.5 - 40;
    const innerRadius = outerRadius - 30;

    const chord = d3.svg.chord();
    const arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
    const cluster = d3.layout.cluster()
      .size([360, 20]);

    // get data formatted
    let data = this._convertDataToFlare();
    // format nodes
    let nodes = cluster.nodes(data);
    let links = cluster.links(nodes);
  },

  // make data like this https://github.com/d3/d3-3.x-api-reference/blob/master/Cluster-Layout.md
  _convertDataToFlare () {
    let branches = this.props.edges.map( d => {
      let sourceChild = this._getNodeDataPointById(d.source);
      let targetChild = this._getNodeDataPointById(d.target);
      return {
        name: '',
        children: [sourceChild, targetChild]
      };
    });
    let data = {
      name: '',
      children: branches
    };
    return data;
  },

  _getNodeDataPointById (id) {
    const nodes = this.props.nodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].id === id) return nodes[i];
    }
    return null;
  }
});

export default ChordDiagram;
