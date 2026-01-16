export class SpaoChatHandlers {

    static initialize() {

        // Listen for clicks on chat cards
        Hooks.on('renderChatMessage', (message, html, data) => {
            // Handle magic attack button clicks
            html.find('.magic-attack').click((ev) => {
                ev.preventDefault();
                const itemId = ev.currentTarget.dataset.itemId;
                const actorId = ev.currentTarget.dataset.actorId;
                SpaoChatHandlers.ExecutarAcaoDeMagia(itemId, actorId, "ataque");
            });

            // Handle magic save button clicks
            html.find('.magic-save').click((ev) => {
                ev.preventDefault();
                const itemId = ev.currentTarget.dataset.itemId;
                const actorId = ev.currentTarget.dataset.actorId;
                SpaoChatHandlers.ExecutarAcaoDeMagia(itemId, actorId, "save");
            });
        });

    }


    static async ExecutarAcaoDeMagia(itemId, actorId, actionType) {
        // Get the actor and item
        const actor = game.actors.get(actorId);
        const item = actor?.items.get(itemId);

        // Show dialog for modifier input
        const content = await renderTemplate(
            "systems/spao/templates/dialog/roll.html"
        );

        new Dialog({
            title: `Ataque com ${item.name}`,
            content: content,
            buttons: {
                confirm: {
                    label: "Confirmar",
                    callback: async (html) => {
                        const modificador = parseInt(html.find('#modificador').val()) || 0;
                        if (actionType === "ataque") {
                            await SpaoChatHandlers.ExecutarAtaqueDeMagia(actor, item, modificador);
                        }
                        else if (actionType === "save") {
                            await SpaoChatHandlers.ExecutarSaveDeMagia(actor, item, modificador);
                        }
                    }
                },
                cancel: {
                    label: "Cancelar"
                }
            },
            default: "confirm"
        }).render(true);
    }


    static async ExecutarAtaqueDeMagia(actor, item, modificador = 0) {

        const attackAttribute = actor.magicAttack.atrib;
        const attackProficiency = actor.magicAttack.prof;
        const attributeValue = actor.system.abilities[attackAttribute]?.value || 0;

        let proficiencyBonus = 0;
        switch (attackProficiency) {
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

        const attackFormula = "1d20 + @mod";
        const attackRoll = new Roll(attackFormula, {
            mod: attributeValue + proficiencyBonus + modificador
        });
        await attackRoll.evaluate();

        // Determine target
        let targetActor = null;
        let targetArmor = 0;

        if (canvas.tokens.controlled.length > 0) {
            targetActor = canvas.tokens.controlled[0].actor;
            targetArmor = targetActor.system.armor?.value || 0;
        }

        const attackTotal = attackRoll.total;
        const rolledValue = attackRoll.terms[0].results[0].result;
        const isSuccess = attackTotal >= targetArmor;
        const resultClass = isSuccess ? "success" : "failure";


        // Rolagem de Dano (se acertou)
        const itemDamageFormula = item.system.formula;
        let damageRoll = null;

        if (isSuccess) {
            damageRoll = new Roll(itemDamageFormula, {});
            await damageRoll.evaluate();
        }

        // Get damage type from spell
        const damageType = item.system.damage?.damageType || "Nenhum";

        // Preparar dados para o template
        let data = {
            name: item.name || "Ataque de Magia",
            attackRoll: attackRoll,
            rolledValue: rolledValue,
            attackTotal: attackTotal,
            isSuccess: isSuccess,
            damageRoll: damageRoll,
            damageType: damageType,
            targetActor: targetActor,
            targetArmor: targetArmor,
            itemAttribute: attackAttribute,
            attributeValue: attributeValue,
            itemProficiency: proficiencyBonus,
            resultClass: resultClass,
            attackRange: item.system.range || "Melee (5 ft)",
            itemAttack: true
        };

        // Render attack template
        const attackContent = await renderTemplate(
            "systems/spao/templates/chat/ataque.html",
            data
        );

        // Send to chat
        const message = await ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            content: attackContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: attackRoll
        });
    }

    static async ExecutarSaveDeMagia(actor, item, modificador = 0) {
        // Get save attribute from spell
        const saveAttribute = item.system.save.atrib;

        // Get save DC from spell
        const saveDC = item.system.save.dc || 10;

        // Calculate total bonus
        const totalBonus = attributeValue + modificador;
        const formula = `1d20 + ${totalBonus}`;

        // Create and roll
        const saveRoll = new Roll(formula);
        await saveRoll.evaluate();

        // Check result
        const saveTotal = saveRoll.total;
        const rolledValue = saveRoll.terms[0].results[0].result;
        const isSuccess = saveTotal >= saveDC;
        const resultClass = isSuccess ? "success" : "failure";

        // Mensagem formatada
        const saveName = game.i18n.localize(`SPAO.${saveAttribute}`) || saveAttribute;
        let data = {
            saveRoll: saveRoll,
            saveName: saveName,
            totalBonus: totalBonus,
            saveValue: totalBonus,
            attributeValue: attributeValue,
            saveTotal: saveTotal
        }

        const content = await renderTemplate(
            "systems/spao/templates/chat/save.html",
            data
        );

        // Enviar para o chat
        saveRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: content
        });
    }
}