export const registerSettings = () => {
  game.settings.register("spao", "max-equip-slots", {
    name: game.i18n.localize("SPAO.Settings.MaxEquipSlots.label"),
    hint: game.i18n.localize("SPAO.Settings.MaxEquipSlots.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 10,
    requiresReload: true,
  });

  game.settings.register("spao", "use-gold-threshold", {
    name: game.i18n.localize("SPAO.Settings.UseGoldThreshold.label"),
    hint: game.i18n.localize("SPAO.Settings.UseGoldThreshold.hint"),
    scope: "world",
    config: true,
    type: Number,
    default: 0,
    requiresReload: true,
  });

  game.settings.register("spao", "use-panic", {
    name: game.i18n.localize("SPAO.Settings.UsePanic.label"),
    hint: game.i18n.localize("SPAO.Settings.UsePanic.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("spao", "use-item-icons", {
    name: game.i18n.localize("SPAO.Settings.UseItemIcons.label"),
    hint: game.i18n.localize("SPAO.Settings.UseItemIcons.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register("spao", "use-spao-dice-notation", {
    name: game.i18n.localize("SPAO.Settings.UseCairnDiceNotation.label"),
    hint: game.i18n.localize("SPAO.Settings.UseCairnDiceNotation.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    requiresReload: true,
  });

  game.settings.register("spao", "show-generate-header", {
    name: game.i18n.localize("SPAO.Settings.ShowGenerateHeader.label"),
    hint: game.i18n.localize("SPAO.Settings.ShowGenerateHeader.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("spao", "show-features-section", {
    name: game.i18n.localize("SPAO.Settings.ShowFeatures.label"),
    hint: game.i18n.localize("SPAO.Settings.ShowFeatures.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("spao", "show-container-actors", {
    name: game.i18n.localize("SPAO.Settings.ShowContainerActors.label"),
    hint: game.i18n.localize("SPAO.Settings.ShowContainerActors.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });

  game.settings.register("spao", "character-inventory-limit", {
    name: game.i18n.localize("SPAO.Settings.CharacterInventoryLimit.label"),
    hint: game.i18n.localize("SPAO.Settings.CharacterInventoryLimit.hint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true,
  });
};
