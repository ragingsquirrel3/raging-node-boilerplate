import React from 'react';

export default React.createClass({
  render () {
    return (
      <a-scene>
        <a-sphere position="-1 0 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-1 0.75 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#F2E422"></a-cylinder>
        <a-cylinder position="-1 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#77468C"></a-cylinder>
        <a-sphere position="-1 1 0" radius="0.10" color="#2DD3D6"></a-sphere>

        <a-sphere position="-2 0 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-2 0.75 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#F2E422"></a-cylinder>
        <a-cylinder position="-2 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#77468C"></a-cylinder>
        <a-sphere position="-2 1 0" radius="0.10" color="#2DD3D6"></a-sphere>

        <a-sphere position="-3 0 0" radius="0.10" color="#2DD3D6"></a-sphere>
        <a-cylinder position="-3 0.75 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#F2E422"></a-cylinder>
        <a-cylinder position="-3 0.25 0" rotation="0 0 0" radius="0.05" height="0.5" open-ended="false" color="#77468C"></a-cylinder>
        <a-sphere position="-3 1 0" radius="0.10" color="#2DD3D6"></a-sphere>
      </a-scene>
    );
  }
});
