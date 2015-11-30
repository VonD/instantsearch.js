/* eslint-env mocha */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';
import Selector from '../Selector';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('Selector', () => {
  let renderer;

  beforeEach(() => {
    let {createRenderer} = TestUtils;
    renderer = createRenderer();
  });


  it('should render <Selector/> with strings', () => {
    let out = render({
      currentValue: 'index-a',
      label: 'Sort by',
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item'
      },
      options: [{value: 'index-a', label: 'Index A'}, {value: 'index-b', label: 'Index B'}]
    });
    expect(out).toEqualJSX(
        <div>
          <label>Sort by</label>
          <select
              className="custom-root"
              defaultValue="index-a"
              onChange={() => {}}
          >
            <option className="custom-item" value="index-a">Index A</option>
            <option className="custom-item" value="index-b">Index B</option>
          </select>
        </div>
    );
  });

  it('should render <Selector/> with numbers', () => {
    let out = render({
      currentValue: 10,
      cssClasses: {
        root: 'custom-root',
        item: 'custom-item'
      },
      options: [{value: 10, label: '10 results per page'}, {value: 20, label: '20 results per page'}]
    });
    expect(out).toEqualJSX(
        <div>
          <select
              className="custom-root"
              defaultValue={10}
              onChange={() => {}}
          >
            <option className="custom-item" value={10}>10 results per page</option>
            <option className="custom-item" value={20}>20 results per page</option>
          </select>
        </div>
    );
  });

  function render(props = {}) {
    renderer.render(<Selector {...props} />);
    return renderer.getRenderOutput();
  }
});
