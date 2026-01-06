/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class SpaoItem extends Item {
  /**
   * Augment the basic item data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    this.system.isEquipable = ["weapon", "armor", "spellbook"].includes(this.type);
    this.system.hasPlusMinus = (this.system.uses?.max ?? 0) > 0;

    if (this.system.uses) {
      if (this.system.uses.value > this.system.uses.max)
        this.system.uses.value = this.system.uses.max;
    }

    this.system.useItemIcons = game.settings.get("spao", "use-item-icons");
    if (this.system.useItemIcons) {
      this.system.icon = "";
      switch (this.type) {
        case "spellbook":
          this.system.icon = "book";
          break;
        case "weapon":
          this.system.icon = "sword";
          break;
        case "armor":
          this.system.icon = "shield";
          break;
        case "item":
          if (this.name == game.i18n.localize("SPAO.Fatigue")) {
            this.system.icon = "weight-hanging";
          }
          break;
      }
    }
    // Quantity fallback
    if (this.system.quantity == undefined) {
      this.system.quantity = 1;
    }
  }
}
