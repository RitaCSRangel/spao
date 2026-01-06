/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // // Actor partials.
    // 'systems/spao/templates/actor/parts/actor-features.hbs',
    // 'systems/spao/templates/actor/parts/actor-items.hbs',
    // 'systems/spao/templates/actor/parts/actor-spells.hbs',
    // 'systems/spao/templates/actor/parts/actor-effects.hbs',
    // 'systems/spao/templates/actor/parts/actor-weapons.hbs',
    // 'systems/spao/templates/actor/parts/actor-aspects.hbs',
    // 'systems/spao/templates/actor/parts/actor-wounds.hbs',
    // 'systems/spao/templates/actor/parts/actor-willpower.hbs',
    // // Item partials
    // 'systems/spao/templates/item/parts/item-effects.hbs',
  ]);
};
