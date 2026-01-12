// Import document classes.
import { SpaoActor } from './actor/actor.js';
import { SpaoItem } from './item/item.js';

// Import sheet classes.
import { SpaoActorSheet } from './actor/actor-sheet.js';
import { SpaoItemSheet } from './item/item-sheet.js';

// Import helper/utility classes and constants.
import { SPAO } from './helpers/config.js';
import { rollItemMacro } from "./helpers/macros.js";
import { registerSettings } from "./helpers/settings.js";
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { SpaoChatHandlers } from "./helpers/chat.js";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.spao = {
    SpaoActor,
    SpaoItem,
    rollItemMacro,
    SpaoChatHandlers
  };

  CONFIG.SPAO = SPAO;

  // Define custom Entity classes
  CONFIG.Actor.documentClass = SpaoActor;
  CONFIG.Item.documentClass = SpaoItem;

  // Configure Combat
  //CONFIG.Combat.documentClass = CairnCombat;
  CONFIG.Combat.initiative = {
    formula: "1d20",
  };

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("spao", SpaoActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("spao", SpaoItemSheet, { makeDefault: true });


  // Preload Handlebars templates.
  registerSettings();
  configureHandleBars();
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {

    SpaoChatHandlers.initialize();

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

  // Event delegation para todas as mensagens de chat
  $(document).on('click', '.chat-message .expandable', function () {
    const targetId = $(this).data('target');
    const targetElement = $(this).closest('.chat-message').find('#' + targetId);

    if (targetElement.is(':visible')) {
      targetElement.slideUp();
      $(this).removeClass('expanded');
    } else {
      targetElement.slideDown();
      $(this).addClass('expanded');
    }
  });
});

/* -------------------------------------------- */
/*  Handlebars                                  */
/* -------------------------------------------- */

const configureHandleBars = () => {
  // Helper para criar loops
  Handlebars.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 1; i <= n; i++) {
      accum += block.fn(i);
    }
    return accum;
  });

  // Helper para verificar se há talentos
  Handlebars.registerHelper('hasItem', function (items) {
    if (!items) return false;
    return items.some(item => item.type === "item" || item.type === "armadura" || item.type === "arma");
  });

  Handlebars.registerHelper('hasTalent', function (items) {
    if (!items) return false;
    return items.some(item => item.type === "talento");
  });

  Handlebars.registerHelper('hasMagic', function (items) {
    if (!items) return false;
    return items.some(item => item.type === "magia");
  });

  // Helper para comparação maior que
  Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
  });
};
