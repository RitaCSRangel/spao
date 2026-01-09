/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class SpaoItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['spao', 'sheet', 'item'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "description",
        },
      ],
    })
  }

  /** @override */
    get template() {
    return `systems/spao/templates/item/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData();
    data.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.item.system.description, { async: true });
    data.enrichedCriticalDamage = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.item.system.criticalDamage, { async: true });
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options)
    const sheetBody = this.element.find('.sheet-body')
    const bodyHeight = position.height - 192
    sheetBody.css('height', bodyHeight)
    return position
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }
}
