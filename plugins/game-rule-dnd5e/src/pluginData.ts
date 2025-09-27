import * as z from "zod";
import * as RpgDiceRoller from '@dice-roller/rpg-dice-roller';
import type { CheckDefinition, Character } from "@/lib/state"; // Import CheckDefinition and Character
import { back } from "@/lib/engine";

export const PlotType = z.enum(["general", "combat", "puzzle", "chase", "roleplay", "shop"]);
export type PlotType = z.infer<typeof PlotType>;

export const CombatantSchema = z.object({
  characterIndex: z.number().int(), // Link to state.characters by index
  currentHp: z.number().int(),
  maxHp: z.number().int(),
  status: z.enum(["active", "unconscious", "dead", "fled", "surrendered"]), 
  isFriendly: z.boolean(), // Added "Friendly" flag for allies
  initiativeRoll: z.number().int(),
});
export type Combatant = z.infer<typeof CombatantSchema>;

export const BattleSchema = z.object({
  roundNumber: z.number().int(),
  combatants: z.array(CombatantSchema),
  combatLog: z.array(z.string()),
  activeTurnCombatantIndex: z.number().int().optional(), // Index of the Combatant whose turn it is in the combatants array.
});
export type Battle = z.infer<typeof BattleSchema>;

/**
 * Zod schema for validating D&D character stats settings.
 * Each stat is an integer between 1 and 20.
 */
export const DnDStatsSchema = z.object({
  strength: z.number().int().min(1).max(20),
  dexterity: z.number().int().min(1).max(20),
  constitution: z.number().int().min(1).max(20),
  intelligence: z.number().int().min(1).max(20),
  wisdom: z.number().int().min(1).max(20),
  charisma: z.number().int().min(1).max(20),
  hp: z.number().int().default(10), // HP for the character
  hpMax: z.number().int().default(10), // Max HP for the character
  dndExp: z.number().int().min(0).default(0), // Experience points, default to 0
  dndLevel: z.number().int().min(1).max(20).default(1), // Character level, default to 1
  dndClass: z.string(),
  dndSubclass: z.string(),
  plotType: PlotType.default("general"), // Default to general
  encounter: BattleSchema.optional(), // Holds battle data when plotType is "combat"
  backstory: z.string().optional(), // To store the initial character creation backstory
});

/**
 * TypeScript type inferred from the DnDStatsSchema.
 * Represents the structure of the D&D character stats.
 */
export type DnDStats = z.infer<typeof DnDStatsSchema>;

/**
 * Function to suggest a default class based on D&D 5e stats.
 * @param stats The DnDStats object.
 * @returns A suggested class name.
 */
export function suggestDefaultClass(stats: DnDStats): string {
  const { strength, dexterity, constitution, intelligence, wisdom, charisma } = stats;

  // Find the highest stat(s)
  const statArr = [
    { key: 'strength', value: strength },
    { key: 'dexterity', value: dexterity },
    { key: 'constitution', value: constitution },
    { key: 'intelligence', value: intelligence },
    { key: 'wisdom', value: wisdom },
    { key: 'charisma', value: charisma },
  ];
  statArr.sort((a, b) => b.value - a.value);
  const top = statArr[0];
  const second = statArr[1];

  // Case logic for class suggestion
  switch (top.key) {
    case 'strength':
      return 'Fighter';
    case 'dexterity':
      if (second.key === 'wisdom') return 'Ranger';
      return 'Rogue';
    case 'intelligence':
      return 'Wizard';
    case 'constitution':
      if (second.key === 'strength') return 'Barbarian';
      if (second.key === 'wisdom') return 'Druid';
      if (second.key === 'intelligence') return 'Wizard';
      if (second.key === 'charisma') return 'Sorcerer';      
      if (second.key === 'dexterity') return 'Rogue';            
      return 'Fighter';
    case 'wisdom':
      if (second.key === 'dexterity') return 'Monk';      
      return 'Cleric';
    case 'charisma':
      if (strength >= 13) return 'Paladin';
      if (second.key === 'constitution') return 'Warlock';  
      return 'Bard';
    default:
      return 'Fighter';
  }
}

/**
 * Function to generate default values for D&D character stats using dice rolls.
 * Used when no settings are provided or to fill in missing values.
 */
export const generateDefaultDnDStats = (rpgDiceRoller: typeof RpgDiceRoller): DnDStats => {
  const rollFormula = "4d6dl1"; // 4 six-sided dice, drop the lowest

  const rollAttribute = () => new rpgDiceRoller.DiceRoll(rollFormula).total;

  const generatedStats = {
    strength: rollAttribute(),
    dexterity: rollAttribute(),
    constitution: rollAttribute(),
    intelligence: rollAttribute(),
    wisdom: rollAttribute(),
    charisma: rollAttribute(),
    hp: 10, // Default starting HP
    hpMax: 10, // Default max HP
    dndLevel: 1,  // Default level
    dndExp: 0,    // Default experience points
    dndClass: "",
    dndSubclass: "",
    plotType: PlotType.enum.general,
    encounter: undefined,
    backstory: "",
  };

  const suggestedClass = suggestDefaultClass(generatedStats);
  //const suggestedSubclass = DnDClassData[suggestedClass]?.[0] || ""; // Pick first subclass if available

  return {
    ...generatedStats,
    dndClass: suggestedClass,
    //dndSubclass: suggestedSubclass,
  };
};

export type DndClassData = {
  [key: string]: string[];
};

export const DnDClassData: DndClassData = {
  "Barbarian": [
    "Path of the Berserker",
    "Path of the Totem Warrior",
    "Path of the Ancestral Guardian",
    "Path of the Storm Herald",
    "Path of the Zealot"
  ],
  "Bard": [
    "College of Lore",
    "College of Valor",
    "College of Glamour",
    "College of Whispers"
  ],
  "Cleric": [
    "Life Domain",
    "Light Domain",
    "Trickery Domain",
    "Knowledge Domain",
    "Nature Domain",
    "Tempest Domain",
    "War Domain",
    "Death Domain",
    "Forge Domain",
    "Grave Domain"
  ],
  "Druid": [
    "Circle of the Moon",
    "Circle of the Land",
    "Circle of Dreams",
    "Circle of the Shepherd"
  ],
  "Fighter": [
    "Champion",
    "Battle Master",
    "Eldritch Knight",
    "Arcane Archer",
    "Cavalier",
    "Samurai"
  ],
  "Monk": [
    "Way of the Open Hand",
    "Way of the Shadow",
    "Way of the Four Elements",
    "Way of the Drunken Master",
    "Way of the Kensei",
    "Way of the Sun Soul"
  ],
  "Paladin": [
    "Oath of Devotion",
    "Oath of the Ancients",
    "Oath of Vengeance",
    "Oathbreaker",
    "Oath of Conquest",
    "Oath of Redemption"
  ],
  "Ranger": [
    "Hunter",
    "Beast Master",
    "Gloom Stalker",
    "Horizon Walker",
    "Monster Slayer"
  ],
  "Rogue": [
    "Thief",
    "Assassin",
    "Arcane Trickster",
    "Inquisitive",
    "Mastermind",
    "Scout",
    "Swashbuckler"
  ],
  "Sorcerer": [
    "Draconic Bloodline",
    "Wild Magic",
    "Divine Soul",
    "Shadow Magic",
    "Storm Sorcery"
  ],
  "Warlock": [
    "The Archfey",
    "The Fiend",
    "The Great Old One",
    "The Celestial",
    "The Hexblade"
  ],
  "Wizard": [
    "School of Abjuration",
    "School of Conjuration",
    "School of Divination",
    "School of Enchantment",
    "School of Evocation",
    "School of Illusion",
    "School of Necromancy",
    "School of Transmutation",
    "War Magic"
  ]
};

/**
 * Helper function to calculate D&D 5e ability modifier.
 * @param score The ability score.
 * @returns The calculated modifier.
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Resolves a game rule check, utilizing rpg-dice-roller, and returns the result as a statement.
 * @param check The definition of the check to resolve.
 * @param characterStats The global Character object.
 * @param dndStats The D&D 5e specific stats for the character.
 * @param rpgDiceRoller The rpg-dice-roller instance.
 * @returns A statement describing the check's result and any consequences.
 */
export function resolveCheck(check: CheckDefinition, characterStats: Character, dndStats: DnDStats, rpgDiceRoller: typeof RpgDiceRoller): string {
  let abilityScore: number | undefined;
  let modifier: number = 0;

  // Determine the ability score based on the check type
  switch (check.type.toLowerCase()) {
    case "strength":
    case "athletics":
      abilityScore = dndStats.strength;
      break;
    case "dexterity":
    case "acrobatics":
    case "sleight of hand":
    case "stealth":
      abilityScore = dndStats.dexterity;
      break;
    case "constitution":
      abilityScore = dndStats.constitution;
      break;
    case "intelligence":
    case "arcana":
    case "history":
    case "investigation":
    case "nature":
    case "religion":
      abilityScore = dndStats.intelligence;
      break;
    case "wisdom":
    case "animal handling":
    case "insight":
    case "medicine":
    case "perception":
    case "survival":
      abilityScore = dndStats.wisdom;
      break;
    case "charisma":
    case "deception":
    case "intimidation":
    case "performance":
    case "persuasion":
      abilityScore = dndStats.charisma;
      break;
    case "initiative":
      abilityScore = dndStats.dexterity;
      break;
    default:
      // If it's a custom check type not directly mapped to an ability,
      // try to find a modifier from the check's modifiers array.
      if (check.modifiers && check.modifiers.length > 0) {
        const primaryModifier = check.modifiers[0].toLowerCase();
        switch (primaryModifier) {
          case "strength": abilityScore = dndStats.strength; break;
          case "dexterity": abilityScore = dndStats.dexterity; break;
          case "constitution": abilityScore = dndStats.constitution; break;
          case "intelligence": abilityScore = dndStats.intelligence; break;
          case "wisdom": abilityScore = dndStats.wisdom; break;
          case "charisma": abilityScore = dndStats.charisma; break;
        }
      }
      break;
  }

  if (abilityScore === undefined) {
    return `Check for ${check.type} could not be resolved: No relevant ability score found.`;
  }

  modifier = getAbilityModifier(abilityScore);

  // Roll a d20
  const roll = new rpgDiceRoller.DiceRoll('1d20').total;
  const total = roll + modifier;

  let resultStatement: string;
  if (total >= check.difficultyClass) {
    resultStatement = `${characterStats.name} successfully passed the ${check.type} check (DC ${check.difficultyClass}) with a roll of ${roll} and a total of ${total}.`;
  } else {
    resultStatement = `${characterStats.name} failed the ${check.type} check (DC ${check.difficultyClass}) with a roll of ${roll} and a total of ${total}.`;
  }

  return resultStatement;
}