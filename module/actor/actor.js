/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class SpaoActor extends Actor {

  /** @override */
  static async create(data, options = {}) {
    if (data.type === "character") {
      foundry.utils.mergeObject(
        data,
        {
          prototypeToken: {
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            actorLink: true,
            vision: true,
          },
        },
        { override: false }
      );
    }
    return super.create(data, options);
  }

  /** @override */
  prepareData() {
    super.prepareData();

    this.system.useItemIcons = game.settings.get("spao", "use-item-icons");
    // this.system.showFeatures = game.settings.get("spao", "show-features-section");
    // this.system.showBio = (this.system.biography !== undefined && this.system.biography !== null);
    // this.system.showDesc = (this.system.description !== undefined && this.system.description !== null);

    if (this.type === "character") this._prepareCharacterData();
    if (this.type === "npc") this._prepareNpcData();
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (this.type !== "character") return;

    // Make modifications to data here.

    this.system.hp.max = this.calculateMaxHealth();
    this.system.hp.value = this.calculateCurrentHealth();
    this.system.armor.value = this.calculateArmor();
    this.system.focus.max = this.calculateMaxFocus();
    this.system.focus.value = this.calculateCurrentFocus();
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (this.type !== "npc") return;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const data = { ...this.system };

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== "character") return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    // if (data.attributes.level) {
    //   data.lvl = data.attributes.level.value ?? 0;
    // }
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== "npc") return;

    // Process additional NPC data here.
  }

  calculateMaxHealth() {
    const health = 10 + this.system.abilities.for.value;
    return Math.round(health);
  }

  calculateCurrentHealth() {
    const health = this.system.hp.max - this.system.hp.damage;
    return Math.round(health);
  }

  calculateArmor() {
    const armorItems = this.items
      .filter((item) => ["armor", "item"].includes(item.type))
      .filter((item) => item.system.equipped ?? false)
      .map((item) => parseInt(item.system.armor ?? 0, 10))
      .reduce((a, b) => a + b, 0);

    const armor = 10 + this.system.abilities.des.value + armorItems;
    return Math.round(armor);
  }

  calculateMaxFocus() {
    const focus = 0;
    return Math.round(focus);
  }

  calculateCurrentFocus() {
    const focus = this.system.focus.max - this.system.focus.used;
    return Math.round(focus);
  }
}
