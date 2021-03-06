import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';
let bem = utils.bemHelper('ais-menu');
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import getShowMoreConfig from '../../lib/show-more/getShowMoreConfig.js';

import defaultTemplates from './defaultTemplates.js';

/**
 * Create a menu out of a facet
 * @function menu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {string[]|Function} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {string} [options.limit=10] How many facets values to retrieve
 * @param  {object|boolean} [options.showMore=false] Limit the number of results and display a showMore button
 * @param  {object} [options.showMore.templates] Templates to use for showMore
 * @param  {object} [options.showMore.templates.active] Template used when showMore was clicked
 * @param  {object} [options.showMore.templates.inactive] Template used when showMore not clicked
 * @param  {object} [options.showMore.limit] Max number of facets values to display when showMore is clicked
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @return {Object}
 */
const usage = `Usage:
menu({
  container,
  attributeName,
  [sortBy],
  [limit=10],
  [cssClasses.{root,list,item}],
  [templates.{header,item,footer}],
  [transformData],
  [autoHideContainer]
  [showMore.{templates: {active, inactive}, limit}]
})`;
function menu({
    container,
    attributeName,
    sortBy = ['count:desc'],
    limit = 10,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    transformData,
    autoHideContainer = true,
    showMore = false
  } = {}) {
  let showMoreConfig = getShowMoreConfig(showMore);
  if (showMoreConfig && showMoreConfig.limit < limit) {
    throw new Error('showMore.limit configuration should be > than the limit in the main configuration'); // eslint-disable-line
  }
  let widgetMaxValuesPerFacet = (showMoreConfig && showMoreConfig.limit) || limit;

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let RefinementList = headerFooterHOC(require('../../components/RefinementList/RefinementList.js'));
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  // we use a hierarchicalFacet for the menu because that's one of the use cases
  // of hierarchicalFacet: a flat menu
  let hierarchicalFacetName = attributeName;

  const showMoreTemplates = showMoreConfig && utils.prefixKeys('show-more-', showMoreConfig.templates);
  const allTemplates =
    showMoreTemplates ?
      {...templates, ...showMoreTemplates} :
      templates;

  return {
    getConfiguration: configuration => {
      let widgetConfiguration = {
        hierarchicalFacets: [{
          name: hierarchicalFacetName,
          attributes: [attributeName]
        }]
      };

      let currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
      widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, widgetMaxValuesPerFacet);

      return widgetConfiguration;
    },
    render: function({results, helper, templatesConfig, state, createURL}) {
      let facetValues = getFacetValues(results, hierarchicalFacetName, sortBy);
      let hasNoFacetValues = facetValues.length === 0;

      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates: allTemplates
      });

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        footer: cx(bem('footer'), userCssClasses.footer),
        list: cx(bem('list'), userCssClasses.list),
        item: cx(bem('item'), userCssClasses.item),
        active: cx(bem('item', 'active'), userCssClasses.active),
        link: cx(bem('link'), userCssClasses.link),
        count: cx(bem('count'), userCssClasses.count)
      };

      ReactDOM.render(
        <RefinementList
          createURL={(facetValue) => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue))}
          cssClasses={cssClasses}
          facetValues={facetValues}
          limitMax={widgetMaxValuesPerFacet}
          limitMin={limit}
          shouldAutoHideContainer={hasNoFacetValues}
          showMore={showMoreConfig !== null}
          templateProps={templateProps}
          toggleRefinement={toggleRefinement.bind(null, helper, hierarchicalFacetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, attributeName, facetValue) {
  helper
    .toggleRefinement(attributeName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy) {
  let values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy});

  return values.data || [];
}

export default menu;
