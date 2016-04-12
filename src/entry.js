import React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

import Chart from './components/chart';

d3.json('protein.json', function (err, _data) {
  _data = _data.map( (d,i) => {
    d.id = i;
    return d;
  });
	ReactDOM.render(<Chart data={_data}/>, document.getElementById('target'));
});

