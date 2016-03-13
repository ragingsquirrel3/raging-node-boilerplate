import React from 'react';

export default React.createClass({
  getDefaultProps () {
    return {
      sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTA'
      // sequence: 'ATGGTTACGTATCCTGTGCAGCCTTGGACAAATTTTATAATTGTATATATCTATGTATATGTATACGAATGGAAAAATTTATCCGAATCTCGGCCCGACTGCCAGCTTGCCGGGAGAACAAACAACCGCCAATATATGTATATGTATATTTATATAGATGTCCAGATGCATTATTGTGAATGTGAGTTATGCGAAGATACTTGTTTGTATAGCTCGTTCAACTCATTGATGGAGAATGGAATGTCAATATCGTTTAGTGCTGTGTTCGTAGTTGTATATGCGCTTCCTGTTTCATTGATACTAACAGGTTCCATAGATATACTAGGGCTTTGCTCAAGCGGATCGAGGGAAGCCAAATCAAGATTGTCAATGCTGTCGGCCTTAATTTCTCCGTTTTGCAGAGGTGGCTTCAAACTCGGCAATGTGGTTGTCATGTCTACATCCGACGAGCGACCATTTAGGCCCAAAAGAACGTCCAGATCTGCAATACCGAGACCATTGACATGCGCTGCTTCATCATTTGCCCTTCTGTGGCATGACCCTCCCTTTGATTTCCGGCTGCTTTTCCTCTTGGTATGA'
    }
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
    return (
      <a-scene>
        {bpNodes}
      </a-scene>
    );
  },

  _renderA () {
    return (
      <a-entity>
        <a-sphere position="-1 -0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-1 -0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-cylinder position="-1 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-sphere position="-1 0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderT () {
    return (
      <a-entity>
        <a-sphere position="-1 -0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-1 -0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={T_COLOR}></a-cylinder>
        <a-cylinder position="-1 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={A_COLOR}></a-cylinder>
        <a-sphere position="-1 0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderC () {
    return (
      <a-entity>
        <a-sphere position="-1 -0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-1 -0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-cylinder position="-1 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-sphere position="-1 0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  },

  _renderG () {
    return (
      <a-entity>
        <a-sphere position="-1 -0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-1 -0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={G_COLOR}></a-cylinder>
        <a-cylinder position="-1 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color={C_COLOR}></a-cylinder>
        <a-sphere position="-1 0.5 0" radius="0.10" color="#2DD3D6"></a-sphere>
      </a-entity>
    );
  }
});

// bp colors
const A_COLOR = '#00A51D';
const T_COLOR = '#F25270';
const C_COLOR = '#F2E422';
const G_COLOR = '#77468C';

const STEP_FACTOR_X = 0.35;
const STEP_FACTOR_R = 22;
