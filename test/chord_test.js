import assert from 'assert';

describe('chord diagram component', function () {
  it('should be able to be instantiated with blank props and render to string', function () {
  });
});

const exampleNodes = [
  {
    label: 'Jack',
    id: 1,
    data: {
      size: 5,
      length: 2
    },
    label: 'Jill',
    id: 2,
    data: {
      size: 2,
      length: 3
    },
    label: 'Bob',
    id: 3,
    data: {
      size: 1,
      length: 2
    },
    label: 'Tina',
    id: 4,
    data: {
      size: 15,
      length: 8
    },
    label: 'Jose',
    id: 5,
    data: {
      size: 5,
      length: 2
    }
  }
];
const exampleEdges = [
  {
    source: 1,
    target: 2
  },
  {
    source: 2,
    target: 5
  },
  {
    source: 3,
    target: 5
  },
  {
    source: 1,
    target: 4
  },
  {
    source: 2,
    target: 3
  },
  {
    source: 4,
    target: 1
  }
];
