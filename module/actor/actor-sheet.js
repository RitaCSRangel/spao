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
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
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
    if (actorData.type == "character") {
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
      else if (i.type === "armor") {
        armors.push(i);
      }
      // CUSTOM: Append to Weapon
      else if (i.type === "weapon") {
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

    html.find(".item-create").on("click", (ev) => this._onItemCreate.bind(ev, this)); // Add Inventory Item
    html.find(".item-delete").on("click", (ev) => this._onItemDelete(ev)); // Delete Inventory Item
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

    // html.find(".resistance-values").on("click", (ev) => this.AbrirDialogResistencia(ev));
    // html.find(".item-equip").on("click", (ev) => this.EquiparItem(ev));
    // html.find(".debilitated").on("click", (ev) => this.MarcarFerimento(ev));
    // html.find(".ability-roll").on("click", (ev) => this.RolarAtributo(ev));
    // html.find(".defense-roll").on("click", (ev) => this.RolarDefesa(ev));
    // html.find(".spao-input").on("change", (ev) => this.LimparAtributoSelecionado(ev));
    html.find(".attack-roll").on("click", (ev) => this.rollAttack(ev));

    // html.find(".willpowercheckbox-expended").on("click", (ev) => this.GastarWillpower(ev, false));
    // html.find(".willpowercheckbox-available").on("click", (ev) => this.GastarWillpower(ev, true));
    // html.find(".nd-advantage").on("click", (ev) => AtualizarVantagemMonstro(true, this.actor));
    // html.find(".nd-disvantage").on("click", (ev) => AtualizarDesvantagemMonstro(true, this.actor));

  }

  async _onItemCreate(event) {
    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    this.LimparAtributoSelecionado();

    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  // Custom Predefined Function: Item Delete
  async _onItemDelete(ev) {
    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
    li.slideUp(200, () => this.render(false));

    if (item.type == "feature") {
      RemoveTalentCharacteristics(this.actor, item);
    }
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

  async RolarAtaque(ev) {
    const element = ev.currentTarget;
    const dataset = element.dataset;
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));

    // let data = {
    //   ranged: item.system.type.ranged,
    //   melee: item.system.type.melee
    // }

    //Example: let r = new Roll("2d20kh + @prof + @strMod", {prof: 2, strMod: 4});
    let formula = "1d20+ @for"
    let roll = new Roll(formula, { for: this.actor.system.abilities.for.value });
    await roll.evaluate();

    const label = "Ataque";
    const rolled = roll.terms[0].results[0].result;
    const result = roll.total === 0 ? game.i18n.localize("SPAO.Fail") : game.i18n.localize("SPAO.Success");
    const resultCls = roll.total === 0 ? "failure" : "success";

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
      content: `<div class="dice-roll"><div class="dice-result"><div class="dice-formula">${roll.formula}</div><div class="dice-tooltip" style="display: none;"><section class="tooltip-part"><div class="dice"><header class="part-header flexrow"><span class="part-formula">${roll.formula}</span></header><ol class="dice-rolls"><li class="roll die d20">${rolled}</li></ol></div></section></div><h4 class="dice-total ${resultCls}">${result} (${rolled})</h4</div></div>`,
    });
  }

  async rollAttack(ev) {
    // Rolagem de Ataque
    let attackFormula = "1d20 + @for";
    let attackRoll = new Roll(attackFormula, {
      for: this.actor.system.abilities.for.value
    });
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
    if (isSuccess && this.actor.system.damageDice) {
      damageRoll = new Roll(this.actor.system.damageDice, {});
      await damageRoll.evaluate();
    }

    // Determinar tipo de dano (do item ou padrão)
    const damageType = this.item?.system?.damage?.type || "Nenhum";

    // Criar conteúdo HTML do template
    const flavor = `${this.actor.name} <br/><small>Para: ${targetActor?.name || "Ninguém"}</small>`;

    let data = {
      name: this.item?.name,
      attackRoll: attackRoll,
      rolledValue: rolledValue,
      attackTotal: attackTotal,
      isSuccess: isSuccess,
      damageRoll: damageRoll,
      damageType: damageType,
      targetActor: targetActor
    }
    
    const attackContent = await renderTemplate(
      "systems/spao/templates/chat/attack.html",
      data
    );

    // Enviar mensagem para o chat
    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: flavor,
      content: attackContent,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      roll: attackRoll
    });

    // Também enviar rolagem de dano separadamente se necessário
    if (damageRoll) {
      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `Dano - ${this.actor.name}`,
        rollMode: game.settings.get("core", "rollMode")
      }, {
        rollMode: game.settings.get("core", "rollMode")
      });
    }
  }

  async EquiparItem() {
    // Ao fazer qualquer clique na ficha certifique-se de limpar o atributo selecionado primeiro.
    this.LimparAtributoSelecionado();

    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    await item.update({ [`system.equiped`]: !item.system.equiped });
  }

  async MarcarFerimento(ev) {
    // Ao fazer qualquer clique na ficha certifique-se de limpar o atributo selecionado primeiro.
    this.LimparAtributoSelecionado();

    // Tem que ser a checkbox da ficha em questão, por isso ev.target ao invés de document, 
    // para evitar problema quando + fichas estiverem abertas
    let checked = ev.target.checked;

    await this.actor.update({ [`system.debilitated`]: checked });
  }

  async RolarAtributo(ev) {
    const element = ev.currentTarget;
    const dataset = element.dataset;

    if (context.abilityRoll == null) {
      context.abilityRoll = [];
    }

    //Verificar se o objeto de seleção para esse ator já existe
    let selection = context.abilityRoll.find(x => x.id === this.actor.id);

    // Acabou de selecionar o primeiro
    if (selection == null || selection == undefined) {

      let selection = {
        id: this.actor.id,
        first: null,
        second: null,
        firstHtmlElement: null
      }

      // Deixar a label vermelha para mostrar que foi selecionado
      selection.firstHtmlElement = ev.target;
      ev.target.style.color = "red";

      // Guardar qual foi o atributo selecionado no contexto
      selection.first = dataset.label;

      context.abilityRoll.push(selection)

      //Volta para poder selecionar o segundo
      return;
    }

    //Acabou de selecionar o segundo
    if (selection.second == null) {

      // Guardar qual foi o atributo selecionado no contexto
      selection.second = dataset.label;

      // Remover o estilo adicionado no primeiro atributo
      let element = selection.firstHtmlElement;
      element.style.color = "";

    }

    // Quando os dois estiverem selecionados, seguir para a dialog de roll
    if (selection.first != null && selection.second != null) {
      const rolarAtributo = await renderTemplate(
        "systems/spao/templates/actor/dialog/modifiers.hbs"
      );

      new Dialog({
        title: "Dificuldade",
        content: rolarAtributo,
        buttons: {
          button1: {
            label: "Rolar teste",
            callback: async () => {

              // Pegando o valor de dificuldade inserido
              let difficulty = Number(document.getElementById("difficulty-value").value);
              let modifier = Number(document.getElementById("modifier-value").value);
              let adv = document.getElementById("modifierAdv") != null ? document.getElementById("modifierAdv").checked : false;
              let dsv = document.getElementById("modifierDsv") != null ? document.getElementById("modifierDsv").checked : false;
              let exp6 = document.getElementById("exp6-value").checked;

              RolarAtributo(this.actor, dataset, difficulty, adv, dsv, modifier, exp6);
            },
            icon: `<i class="fas fa-check"></i>`,
          },
          button2: {
            label: "Cancelar",
            callback: () => {
              // Cancela a ação
              this.LimparAtributoSelecionado();
            },
            icon: `<i class="fas fa-times"></i>`,
          },
        },
        close: () => this.LimparAtributoSelecionado()
      }).render(true);

    }
  }

  async RolarDefesa(ev) {
    // Ao fazer qualquer clique na ficha certifique-se de limpar o atributo selecionado primeiro.
    this.LimparAtributoSelecionado();

    const element = ev.currentTarget;
    const dataset = element.dataset;

    const rolarDefesa = await renderTemplate(
      "systems/spao/templates/actor/dialog/modifiers.hbs"
    );

    new Dialog({
      title: "Dificuldade",
      content: rolarDefesa,
      buttons: {
        button1: {
          label: "Rolar teste",
          callback: async () => {

            // Pegando o valor de dificuldade inserido
            let difficulty = Number(document.getElementById("difficulty-value").value);
            let modifier = Number(document.getElementById("modifier-value").value);
            let adv = document.getElementById("modifierAdv") != null ? document.getElementById("modifierAdv").checked : false;
            let dsv = document.getElementById("modifierDsv") != null ? document.getElementById("modifierDsv").checked : false;
            let exp6 = document.getElementById("exp6-value").checked;

            RolarDefesa(this.actor, difficulty, adv, dsv, modifier, exp6);
          },
          icon: `<i class="fas fa-check"></i>`,
        },
        button2: {
          label: "Cancelar",
          callback: () => {
            // Cancela a ação
          },
          icon: `<i class="fas fa-times"></i>`,
        },
      },
      close: () => this.LimparAtributoSelecionado()
    }).render(true);
  }

  async EquiparItem() {
    // Ao fazer qualquer clique na ficha certifique-se de limpar o atributo selecionado primeiro.
    this.LimparAtributoSelecionado();

    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    await item.update({ [`system.equiped`]: !item.system.equiped });
  }

  async MarcarFerimento(ev) {
    // Ao fazer qualquer clique na ficha certifique-se de limpar o atributo selecionado primeiro.
    this.LimparAtributoSelecionado();

    // Tem que ser a checkbox da ficha em questão, por isso ev.target ao invés de document, 
    // para evitar problema quando + fichas estiverem abertas
    let checked = ev.target.checked;

    await this.actor.update({ [`system.debilitated`]: checked });
  }

  async GastarWillpower(ev, gastar) {

    // Ao fazer outro clique na ficha certifique-se de limpar o atributo selecionado primeiro
    this.LimparAtributoSelecionado();

    var currentExpended = document.getElementsByClassName("willpowercheckbox-expended");
    let usedPoints = 0;

    for (let item of currentExpended) {
      usedPoints++;
    }

    if (gastar == true) {
      usedPoints++;
    } else {
      usedPoints--;
    }

    await this.actor.update({ [`system.abilities.willpower.used`]: usedPoints });

  }

}
