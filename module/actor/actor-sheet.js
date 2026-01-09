/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SpaoActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["spao", "sheet", "actor"],
      width: 800,
      height: 600,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".content",
          initial: "sills",
        },
      ],
      dragDrop: [{ dragSelector: ".spao-items-list-row", dropSelector: null }],
    });
  }

  /** @override */
  get template() {
    return `systems/spao/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.SPAO
    context.config = CONFIG.SPAO;

    // Prepare character data and items.
    if (actorData.type == "personagem") {
      this._prepareItems(context);
    }

    // Prepare character data and items.
    if (actorData.type == "monster") {
      this._prepareItems(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    return context;
  }

  // Organize and classify Items for Actor sheets.
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    /* ---------- Custom Item Collections  ----------
    ------------------------------------------------- */
    const armors = [];
    const shields = [];
    const weapons = [];
    const consumables = [];
    const aspects = [];
    const wounds = [];
    /* -------------------------------------------------
    ------------------------------------------------- */

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === "spell") {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      // CUSTOM: Append to Shields
      else if (i.type === "shield") {
        shields.push(i);
      }
      // CUSTOM: Append to Armor
      else if (i.type === "armadura") {
        armors.push(i);
      }
      // CUSTOM: Append to Weapon
      else if (i.type === "arma") {
        weapons.push(i);
      }
      // CUSTOM: Append to Consumable
      else if (i.type === "consumable") {
        consumables.push(i);
      }
      // CUSTOM: Append to Aspect
      else if (i.type === "aspect") {
        aspects.push(i);
      }
      // CUSTOM: Append to Wound
      else if (i.type === "wound") {
        wounds.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;

    context.shields = shields;
    context.armors = armors;
    context.weapons = weapons;
    context.consumables = consumables;
    context.aspects = aspects;
    context.wounds = wounds;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").on("click", (ev) => this._onItemEdit(ev)); // Add Inventory Item

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    html.find(".item-create").click(this._onItemCreate.bind(this)); // Add Inventory Item
    html.find(".item-delete").on("click", (ev) => this._onItemDelete(ev)); // Delete Inventory Item
    html.find(".item-edit").on("click", (ev) => this._onItemEdit(ev)); // Delete Inventory Item
    html.find(".effect-control").on("click", (ev) => this._onEffectControl(ev)); // Active Effect management
    html.find(".rollable").on("click", this._onRoll.bind(this)); // Handle clickable rolls

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    /* --------------- CUSTOM EVENTS  ---------------
    ------------------------------------------------- */

    html.find(".attack-roll").on("click", (ev) => this.RolarAtaque(ev));
    html.find('.attribute-roll').click(this.RolarSave.bind(this));
    html.find('.skill-roll').click(this.RolarSkill.bind(this));
    html.find(".item-toggle-equipped").on("click", (ev) => this.EquiparItem(ev));
    html.find(".send-item").on("click", (ev) => this.MostrarNoChat(ev));
    html.find(".item-cast").on("click", (ev) => this.CastarMagia(ev));

  }

  async _onItemCreate(event) {
    event.preventDefault();

    // Tenta usar template do sistema, se existir
    const template = game.system.template?.Item;

    const itemData = {
      name: "Novo Item",
      type: "item",
      img: "icons/svg/item-bag.svg",
      system: foundry.utils.mergeObject(
        template?.system || {},
        {
          description: "",
          quantity: 1
        }
      )
    };

    await this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  // Custom Predefined Function: Item Delete
  async _onItemDelete(ev) {
    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
  }

  // Custom Predefined Function: Activate Effect
  async _onEffectControl(ev) {
    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    const row = ev.currentTarget.closest("li");
    const document =
      row.dataset.parentId === this.actor.id
        ? this.actor
        : this.actor.items.get(row.dataset.parentId);
    onManageActiveEffect(ev, document);
  }

  // Custom Predefined Function: Edit Item
  async _onItemEdit(ev) {
    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  }

  // Custom Predefined Function: Standard Roll
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  //----------------------------------------------------------------------------------

  async RolarSkill(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const skillKey = element.dataset.skill;

    // Obter dados atuais do sistema
    const actorData = this.actor.system;
    const skill = actorData.skills[skillKey];

    if (!skill) return;

    // Obter valor da skill
    const skillValue = skill.value;

    // Obter valor do atributo
    const attributeValue = actorData.abilities[skill.atrib]?.value || 0;

    // Calcular bônus de proficiência
    let proficiencyBonus = 0;
    switch (skill.prof) {
      case 'untrained':
        proficiencyBonus = -2;
        break;
      case 'trained':
        proficiencyBonus = 2;
        break;
      case 'expert':
        proficiencyBonus = 4;
        break;
      case 'master':
        proficiencyBonus = 6;
        break;
      default:
        proficiencyBonus = 0;
    }

    // Calcular total
    const totalBonus = skillValue + attributeValue + proficiencyBonus;
    const formula = `1d20 + ${totalBonus}`;

    // Criar e rolar
    const skillRoll = new Roll(formula);
    await skillRoll.roll({ async: true });

    // Verificar o resultado
    const skillTotal = skillRoll.total;
    const rolledValue = skillRoll.terms[0].results[0].result;

    // Mensagem formatada
    const skillName = game.i18n.localize(`SPAO.${skillKey}`);
    let data = {
      skillRoll: skillRoll,
      skillName: skillName,
      totalBonus: totalBonus,
      skillValue: skillValue,
      attributeValue: attributeValue,
      proficiencyBonus: proficiencyBonus,
      skillTotal: skillTotal
    }

    const content = await renderTemplate(
      "systems/spao/templates/chat/pericia.html",
      data
    );

    // Enviar para o chat
    skillRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content
    });
  }

  async RolarSave(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const attributeKey = element.dataset.abilities;

    // Obter dados atuais do sistema
    const actorData = this.actor.system;
    const attribute = actorData.abilities[attributeKey];

    if (!attribute) return;

    // Obter valor do atributo
    const attributeValue = attribute.value;

    // Calcular total
    const totalBonus = attributeValue;
    const formula = `1d20 + ${totalBonus}`;

    // Criar e rolar
    const roll = new Roll(formula);
    await roll.roll({ async: true });

    // Mensagem formatada
    const name = "Save de " + game.i18n.localize(`SPAO.${attributeKey}`);
    let data = {
      name: name,
      attributeValue: attributeValue
    }

    const flavor = await renderTemplate(
      "systems/spao/templates/chat/save.html",
      data
    );

    // Enviar para o chat
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor
    });
  }

  async RolarAtaque(ev) {
    // Obter o item de arma associado ao botão clicado
    const li = $(ev.currentTarget).parents(".item");
    const itemId = li.data("itemId");
    const item = this.actor.items.get(itemId);

    if (item) {
      // Obter os valores da arma
      const itemAttribute = item.system.atrib;
      const attributeValue = this.actor.system.abilities[itemAttribute]?.value || 0;
      const itemDamageDiceType = item.system.dice.type;
      const itemDamageDiceQuantity = item.system.dice.quantity;

      // Calcular bônus de proficiência
      let itemProficiency = 0;
      switch (item.system.prof) {
        case 'untrained':
          itemProficiency = -2;
          break;
        case 'trained':
          itemProficiency = 2;
          break;
        case 'expert':
          itemProficiency = 4;
          break;
        case 'master':
          itemProficiency = 6;
          break;
        default:
          itemProficiency = 0;
      }

      // Rolagem de Ataque
      let attackFormula = "1d20 + @mod";
      let attackRoll = new Roll(attackFormula,
        {
          mod: attributeValue + itemProficiency
        }
      );
      await attackRoll.evaluate();

      // Determinar o token alvo
      let targetActor = null;
      let targetArmor = 0;

      if (canvas.tokens.controlled.length > 0) {
        // Usa o primeiro token selecionado
        targetActor = canvas.tokens.controlled[0].actor;
        targetArmor = targetActor.system.armor?.value || 0;
      } else {
        // Sem token selecionado, usa armadura 0
        targetActor = null;
        targetArmor = 0;
      }

      // Verificar se o ataque acertou
      const attackTotal = attackRoll.total;
      const rolledValue = attackRoll.terms[0].results[0].result;
      const isSuccess = attackTotal >= targetArmor;
      const resultClass = isSuccess ? "success" : "failure";

      // Rolagem de Dano (se acertou)
      let damageRoll = null;
      let damageRollFormula = itemDamageDiceQuantity + itemDamageDiceType;

      if (isSuccess) {
        damageRoll = new Roll(damageRollFormula, {});
        await damageRoll.evaluate();
      }

      // Determinar tipo de dano (do item ou padrão)
      const damageType = item?.system?.damage?.type || "Tipo de Dano";

      // Criar conteúdo HTML do template
      const flavor = `${this.actor.name} <br/><small>Para: ${targetActor?.name || "Ninguém"}</small>`;

      // Preparar dados para o template
      let data = {
        name: item.name || "Ataque de Arma",
        attackRoll: attackRoll,
        rolledValue: rolledValue,
        attackTotal: attackTotal,
        isSuccess: isSuccess,
        damageRoll: damageRoll,
        damageType: damageType,
        targetActor: targetActor,
        targetArmor: targetArmor,
        itemAttribute: itemAttribute,
        attributeValue: attributeValue,
        itemProficiency: itemProficiency,
        resultClass: resultClass
      };

      const attackContent = await renderTemplate(
        "systems/spao/templates/chat/ataque.html",
        data
      );

      // Enviar mensagem para o chat
      const message = await ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: flavor,
        content: attackContent,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        roll: attackRoll
      });

      // Adicionar event listener para a mensagem criada
      Hooks.once('renderChatMessage', (messageDoc, html, messageData) => {
        if (messageDoc.id === message.id) {
          // Adicionar evento de clique para expandir/recolher
          html.find('.expandable').click(function () {
            const targetId = $(this).data('target');
            const targetElement = html.find('#' + targetId);

            if (targetElement.is(':visible')) {
              targetElement.slideUp();
              $(this).removeClass('expanded');
            } else {
              targetElement.slideDown();
              $(this).addClass('expanded');
            }
          });
        }
      });
    }
  }

  async EquiparItem(ev) {
    // Obter o item associado ao botão clicado
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));

    if (item) {
      const isEquipped = item.system.equipped;
      await item.update({ 'system.equipped': !isEquipped });
    }
  }

  async MostrarNoChat(ev) {
    // Obter o item associado ao botão clicado
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));

    if (!item) return;

    const cleanDescription = this.extractTextFromHTML(item.system.description);

    // Mensagem formatada
    let data = {
      name: item.name,
      itemImage: item.img,
      itemDescription: cleanDescription
    }

    const content = await renderTemplate(
      "systems/spao/templates/chat/item-detalhes.html",
      data
    );

    ChatMessage.create({
      user: game.user.id, // Usuário que envia
      speaker: ChatMessage.getSpeaker({ actor: this.actor }), // Configura o speaker
      content: content,
    });
  }

  async CastarMagia(ev) {
    // Obter o item associado ao botão clicado
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));

    if (!item && item.type !== "magia") return;

    const cleanDescription = this.extractTextFromHTML(item.system.description);

    // Mensagem formatada
    let data = {
      name: item.name,
      itemImage: item.img,
      itemDescription: cleanDescription,
      itemTradition: item.system.tradition,
      itemCastTime: item.system.castTime,
      itemRange: item.system.range,
      itemTargets: item.system.targets,
      itemDefense: item.system.defense,
      itemDuration: item.system.duration
    }

    const content = await renderTemplate(
      "systems/spao/templates/chat/magia.html",
      data
    );

    ChatMessage.create({
      user: game.user.id, // Usuário que envia
      speaker: ChatMessage.getSpeaker({ actor: this.actor }), // Configura o speaker
      content: content,
    });
  }

  /* --------------- HELPERS ----------------------
  ------------------------------------------------- */

  extractTextFromHTML(htmlString) {
    if (!htmlString) return "";

    // Cria um elemento temporário
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Retorna apenas o texto
    return tempDiv.textContent || tempDiv.innerText || "";
  }

}
