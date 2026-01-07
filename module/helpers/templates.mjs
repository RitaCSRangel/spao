/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/spao/templates/actor/parts/actor-skills.html',
    'systems/spao/templates/actor/parts/actor-inventory.html',
    'systems/spao/templates/actor/parts/actor-talents.html',
    'systems/spao/templates/actor/parts/actor-magic.html'
    // // Item partials
    // 'systems/spao/templates/item/parts/item-effects.hbs',
  ]);
};
