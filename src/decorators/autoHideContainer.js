// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';

function autoHideContainer(ComposedComponent) {
  class AutoHide extends React.Component {
    constructor(props) {
      super(props);
      this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    }

    componentDidMount() {
      this._hideOrShowContainer(this.props);
    }

    componentWillReceiveProps(nextProps) {
      this._hideOrShowContainer(nextProps);
    }

    _hideOrShowContainer(props) {
      let container = ReactDOM.findDOMNode(this).parentNode;
      container.style.display = (props.shouldAutoHideContainer === true) ? 'none' : '';
    }

    render() {
      if (this.props.shouldAutoHideContainer === true) {
        return <div />;
      }

      return <ComposedComponent {...this.props} />;
    }
  }

  AutoHide.propTypes = {
    shouldAutoHideContainer: React.PropTypes.bool.isRequired
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  AutoHide.displayName = ComposedComponent.name + '-AutoHide';

  return AutoHide;
}

export default autoHideContainer;
