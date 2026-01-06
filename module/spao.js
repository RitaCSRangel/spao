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

  //configureHandleBar();
  registerSettings();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Handlebars                                  */
/* -------------------------------------------- */

const configureHandleBar = () => {
  // Pre-load templates
  const templatePaths = [
    "systems/spao/templates/parts/items-list.html",
    "systems/cairn/templates/parts/container-list.html",
    "systems/spao/templates/parts/feature-list.html",
  ];

  foundry.applications.handlebars.loadTemplates(templatePaths);

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper("concat", function () {
    let outStr = "";

    for (const arg in arguments) {
      if (typeof arguments[arg] !== "object") {
        outStr += arguments[arg];
      }
    }

    return outStr;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("boldIf", function (cond, options) {
    return cond
      ? "<strong>" + options.fn(this) + "</strong>"
      : options.fn(this);
  });

  Handlebars.registerHelper("ifPrint", (cond, v1) => (cond ? v1 : ""));
  Handlebars.registerHelper("ifPrintElse", (cond, v1, v2) => (cond ? v1 : v2));

  Handlebars.registerHelper("times", function (n, block) {
    var accum = "";
    for (var i = 0; i < n; ++i) {
      block.data.index = i;
      block.data.first = i === 0;
      block.data.last = i === n - 1;
      accum += block.fn(this);
    }
    return accum;
  });

  Handlebars.registerHelper("isNotNull", function (val) {
    return val !== null && val != undefined;
  });

  Handlebars.registerHelper("isFatigue", function (val) {
    return val == game.i18n.localize("CAIRN.Fatigue");
  });

  Handlebars.registerHelper("not", function (val) {
    return !val;
  });

  Handlebars.registerHelper("markItemUsed", function (item, options) {
    const usable =
      item.system.uses &&
      item.system.uses.max;
    return usable && item.system.uses.value <= 0
      ? '<span style="opacity: 0.65;">' +
      options.fn(this) +
      "</span>"
      : options.fn(this);
  });

  Handlebars.registerHelper("hidden", function (val) {
    if (val) return "display: none";
    return "";
  });
};
