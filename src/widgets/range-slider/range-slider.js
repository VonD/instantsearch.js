import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';
import find from 'lodash/collection/find';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import cx from 'classnames';
let bem = require('../../lib/utils.js').bemHelper('ais-range-slider');

let defaultTemplates = {
  header: '',
  footer: ''
};

/**
 * Instantiate a slider based on a numeric attribute
 * @function rangeSlider
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * `tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}`
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @return {Object}
 */
const usage = `Usage:
rangeSlider({
  container,
  attributeName,
  [ tooltips=true ],
  [ templates.{header, footer} ],
  [ cssClasses.{root, header, body, footer} ],
  [ step=1 ],
  [ pips=true ],
  [ autoHideContainer=true ]
});
`;
function rangeSlider({
    container,
    attributeName,
    tooltips = true,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    step = 1,
    pips = true,
    autoHideContainer = true
  } = {}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let Slider = headerFooterHOC(require('../../components/Slider/Slider.js'));
  if (autoHideContainer === true) {
    Slider = autoHideContainerHOC(Slider);
  }

  return {
    getConfiguration: () => ({
      disjunctiveFacets: [attributeName]
    }),
    _getCurrentRefinement(helper) {
      let min = helper.state.getNumericRefinement(attributeName, '>=');
      let max = helper.state.getNumericRefinement(attributeName, '<=');

      if (min && min.length) {
        min = min[0];
      } else {
        min = -Infinity;
      }

      if (max && max.length) {
        max = max[0];
      } else {
        max = Infinity;
      }

      return {
        min,
        max
      };
    },
    _refine(helper, newValues) {
      helper.clearRefinements(attributeName);
      if (newValues[0] > this._previousStats.min) {
        helper.addNumericRefinement(attributeName, '>=', Math.round(newValues[0]));
      }
      if (newValues[1] < this._previousStats.max) {
        helper.addNumericRefinement(attributeName, '<=', Math.round(newValues[1]));
      }
      helper.search();
    },
    init({helper, templatesConfig}) {
      this._refine = this._refine.bind(this, helper);
      this._templateProps = utils.prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });
    },
    render({results, helper}) {
      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        footer: cx(bem('footer'), userCssClasses.footer)
      };

      let facet = find(results.disjunctiveFacets, {name: attributeName});
      let stats = facet !== undefined ? facet.stats : undefined;
      let currentRefinement = this._getCurrentRefinement(helper);

      if (stats === undefined) {
        stats = {
          min: null,
          max: null
        };
      }

      this._previousStats = stats;

      ReactDOM.render(
        <Slider
          cssClasses={cssClasses}
          onChange={this._refine}
          pips={pips}
          range={{min: Math.floor(stats.min), max: Math.ceil(stats.max)}}
          shouldAutoHideContainer={stats.min === stats.max}
          start={[currentRefinement.min, currentRefinement.max]}
          step={step}
          templateProps={this._templateProps}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

export default rangeSlider;
