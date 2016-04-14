import _ from 'underscore';
import React from 'react';
import { connect } from 'react-redux';
import d3 from 'd3';

const DNA = React.createClass({
  getDefaultProps () {
    return {
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTA'
      // sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTATATGTATACGAATGGAAAAATTTATCCGAATCTCGGCCCGACTGCCAGCTTGCCGGGAGAACAAACAACCGCCAATATATGTATATGTATATTTATATAGATGTCCAGATGCATTATTGTGAATGTGAGTTATGCGAAGATACTTGTTTGTATAGCTCGTTCAACTCATTGATGGAGAATGGAATGTCAATATCGTTTAGTGCTGTGTTCGTAGTTGTATATGCGCTTCCTGTTTCATTGATACTAACAGGTTCCATAGATATACTAGGGCTTTGCTCAAGCGGATCGAGGGAAGCCAAATCAAGATTGTCAATGCTGTCGGCCTTAATTTCTCCGTTTTGCAGAGGTGGCTTCAAACTCGGCAATGTGGTTGTCATGTCTACATCCGACGAGCGACCATTTAGGCCCAAAAGAACGTCCAGATCTGCAATACCGAGACCATTGACATGCGCTGCTTCATCATTTGCCCTTCTGTGGCATGACCCTCCCTTTGATTTCCGGCTGCTTTTCCTCTTGGTATGA'
    }
  },

  getInitialState() {
    return {
      particles: []
    };
  },

  render () {
    const seqFns = {
      a: this._renderA,
      t: this._renderT,
      c: this._renderC,
      g: this._renderG
    };
    let x = -10;
    let y = 2;
    let r = 0
    const bpNodes = this.props.sequence.split('').map( (d, i) => {
      let bp = d.toLowerCase();
      let bpSequenceFn = seqFns[bp];
      let bpNode = bpSequenceFn();
      x += STEP_FACTOR_X;
      r += STEP_FACTOR_R;
      if (r > 360) {
        r = 0;
      }
      return <a-entity key={`bp${i}`} rotation={`${r} 0 0`} position={`${x} ${y} 0`}>{bpNode}</a-entity>;
    });

    let rNodes = this._renderRNodes();
    return (
      <div>
        <h1>{this.props.mRNAPos}</h1>
        <a-scene>
          {rNodes}
          {bpNodes}
        </a-scene>
      </div>
    );
  },

  _renderRNodes () {
    let nodes = this.state.particles.map( (d, i) => {
      // adjust x and y 
      return <a-sphere key={`r${i}`} position={`${d.x} ${d.y} -200`} radius="5" color='yellow'></a-sphere>;
    });
    return (
      <a-entity>
        {nodes}
      </a-entity>
    );
  },

  // (0.5 + Math.abs(0 - tSiteDistance)

  _getPlusOuterPos (tSiteDistance) {
    let p = (tSiteDistance > 5) ? (0.5 + Math.abs(0 - tSiteDistance)) : 0.5
    return `0 -${p} 0`;
  },

  _getMinusOuterPos (tSiteDistance) {
    let p = (tSiteDistance > 5) ? (0.5 + Math.abs(5 - tSiteDistance)) : 0.5
    return `0 ${p} 0`;
  },

  _getPlusInnerPos (tSiteDistance) {
    let p = (tSiteDistance > 5) ? 1 : 0.25
    return `0 -${p} 0`;
  },

  _getMinusInnerPos (tSiteDistance) {
    let p = (tSiteDistance > 5) ? 1 : 0.25
    return `0 ${p} 0`;
  },

  _renderA () {
    let distance = 0;
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderT () {
    let distance = 0;
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderC () {
    let distance = 0;
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderG () {
    let distance = 0;
    return (
      <a-entity>
        <a-sphere position={this._getPlusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position={this._getPlusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-cylinder position={this._getMinusInnerPos(distance)} rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-sphere position={this._getMinusOuterPos(distance)} radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  componentDidMount () {
    const MAX = 0.5;
    const N_PARTICLES = 100;
    const DELAY = 2000;
    let nodeInterval = 0;
    // d3 force fn a la https://github.com/mbostock/d3/wiki/Force-Layout
    // TEMP no links
    const force = d3.layout.force()
      .nodes([{}]) // single node
      // .links(links)
      .linkDistance(MAX / 20)
      .gravity(0.1)
      .charge(-60)
      .size([MAX, MAX]);
    // create nodes
    
    let nodes = force.nodes();
    // let links = [];

    // add nodes
    function addNode () {
      if (nodes.length > N_PARTICLES) return;
      nodeInterval ++;
      nodes.push({});
    };
    for (let i = N_PARTICLES; i >= 0; i--) {
      addNode();
    }

    // update state on tick
    force.on('tick', e => {
      this.setState({ particles: nodes });
    });
    force.start();
  }
});

const mapStateToProps = (_state) => {
  let state = _state.dnaSceneReducer;
  return {
    promoterPos: state.promoterPos,
    mRNAPos: state.mRNAPos
  };
};

const AnimatedDNA = connect(
  mapStateToProps
)(DNA);

export default AnimatedDNA;

// bp colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';

const STEP_FACTOR_X = 0.35;
const STEP_FACTOR_R = 22;
