export const SPAO = {};

SPAO.characterGenerator = {
  ability: "3d6",
  hitProtection: "1d6",
  gold: "3d6",
  name: {
    text: "{name} {surname}",
    items: {
      name: "spao.character-creation-tables-srd;Names",
      surname: "spao.character-traits;Surnames"
    }
  },
  background: "spao.character-traits;Background",
  startingItems: [
    "spao.expeditionary-gear;Rations;1",
    "spao.expeditionary-gear;Torch;1"
  ],
  startingGear: [
    "spao.character-creation-tables-srd;Starting Gear - Armor",
    "spao.character-creation-tables-srd;Starting Gear - Helmet & Shields",
    "spao.character-creation-tables-srd;Starting Gear - Weapons",
    "spao.character-creation-tables-srd;Starting Gear - Expeditionary Gear",
    "spao.character-creation-tables-srd;Starting Gear - Tools",
    "spao.character-creation-tables-srd;Starting Gear - Trinkets",
    "spao.character-creation-tables-srd;Starting Gear - Bonus Item"
  ],
  biography: {
    text: "I have a <strong>{physique}</strong> physique, <strong>{skin}</strong> skin, <strong>{hair}</strong> hair, and a <strong>{face}</strong> face. I speak in a <strong>{speech}</strong> manner and wear <strong>{clothing}</strong> clothing. I am <strong>{vice}</strong> yet <strong>{virtue}</strong>, and I am generally regarded as <strong>{reputation}</strong>. I have had the misfortune of being <strong>{misfortune}</strong>. I am <strong>{age}</strong> years old.",
    age: "2d20 + 10",
    items: {
      physique: "spao.character-traits;Physique",
      skin: "spao.character-traits;Skin",
      hair: "spao.character-traits;Hair",
      face: "spao.character-traits;Face",
      speech: "spao.character-traits;Speech",
      clothing: "spao.character-traits;Clothing",
      vice: "spao.character-traits;Vice",
      virtue: "spao.character-traits;Virtue",
      misfortune: "spao.character-traits;Misfortunes",
      reputation: "spao.character-traits;Reputation"
    }
  }
};

