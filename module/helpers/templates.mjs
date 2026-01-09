/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/spao/templates/actor/parts/actor-pericias.html',
    'systems/spao/templates/actor/parts/actor-inventario.html',
    'systems/spao/templates/actor/parts/actor-talentos.html',
    'systems/spao/templates/actor/parts/actor-magia.html'
    // // Item partials
    // 'systems/spao/templates/item/parts/item-effects.hbs',
  ]);
};
