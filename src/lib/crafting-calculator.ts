import type { ProjectType, CraftingOutcome } from "./types";

interface CraftingInput {
  project: {
    type: ProjectType;
    artifactRating: number;
    objectivesMet: number;
  };
  successes: number;
  targetNumber: number;
  isExceptional: boolean;
  intervalsRemaining?: number;
  legendaryBonusRoll?: number[];
}

const outcomes = {
  failure: {
    title: "An Unfortunate Setback",
    description:
      "Despite your best efforts, the materials refuse to cooperate. The project is marred by a critical flaw, requiring you to either start over or spend significant time correcting the mistake. A lesson in humility.",
  },
  success: {
    title: "A Masterful Creation",
    description:
      "Your skilled hands have worked their magic. The object is well-made, functional, and bears the hallmark of a true artisan. It will serve its purpose admirably.",
  },
  exceptionalSuccess: {
    title: "A Work of True Genius",
    description:
      "You have surpassed mere craftsmanship and touched upon the sublime. The final product is a thing of beauty and remarkable quality, exceeding all expectations. It may even possess minor, unintended beneficial properties.",
  },
  superiorSuccess: {
      title: "Echoes of the First Age",
      description: "The Essence of the Unconquered Sun flows through your work. The artifact hums with power, its form perfected, its function absolute. You have forged a legend."
  },
  legendarySuccess: {
      title: "A New Star in Heaven",
      description: "This is no mere object, but a myth made manifest. Its creation sends ripples through the fabric of Creation, a testament to a will that can forge reality itself. Its destiny is now intertwined with your own."
  }
};

export function calculateCraftingOutcome(
  input: CraftingInput,
): CraftingOutcome {
  const { project, successes, targetNumber, isExceptional } = input;
  const isSuccess = successes >= targetNumber;

  let sxp = 0;
  let gxp = 0;
  let wxp = 0;
  let outcomeTitle = "";
  let outcomeDescription = "";

  if (!isSuccess) {
    outcomeTitle = outcomes.failure.title;
    outcomeDescription = outcomes.failure.description;
  } else {
    // Determine title and description based on success level
    if (project.type.startsWith("legendary")) {
        outcomeTitle = outcomes.legendarySuccess.title;
        outcomeDescription = outcomes.legendarySuccess.description;
    } else if (project.type.startsWith("superior")) {
        outcomeTitle = outcomes.superiorSuccess.title;
        outcomeDescription = outcomes.superiorSuccess.description;
    } else if (isExceptional) {
        outcomeTitle = outcomes.exceptionalSuccess.title;
        outcomeDescription = outcomes.exceptionalSuccess.description;
    } else {
        outcomeTitle = outcomes.success.title;
        outcomeDescription = outcomes.success.description;
    }

    // Calculate XP based on project type
    switch (project.type) {
      case "basic-project":
        sxp = (isExceptional ? 3 : 2) * project.objectivesMet;
        break;
      case "basic-repair":
        sxp = 1 * project.objectivesMet;
        break;
      case "major-project":
        gxp = (isExceptional ? 3 : 2) * project.objectivesMet;
        sxp = 1 * project.objectivesMet;
        break;
      case "major-repair":
        gxp = 1 * project.objectivesMet;
        break;
      case "superior-project":
        if (project.objectivesMet >= 1) {
            const wxpMap: { [key: number]: number } = { 2: 3, 3: 5, 4: 7, 5: 9 };
            wxp = wxpMap[project.artifactRating] || 0;
        }
        // Assuming intervalsRemaining is passed for gxp calculation
        gxp = (project.artifactRating * 2) * (input.intervalsRemaining || 0);
        break;
      case "superior-repair":
         wxp = (project.artifactRating - 1);
        break;
      case "legendary-project":
        if (project.objectivesMet >= 1) {
            wxp = 10;
        }
        // Handle legendary bonus roll
        if (input.legendaryBonusRoll) {
            input.legendaryBonusRoll.forEach(die => {
                if (die >= 7) gxp++;
                else sxp++;
            });
        }
        break;
      case "legendary-repair":
        // No XP for legendary repair
        break;
    }
  }

  return {
    isSuccess,
    outcomeTitle,
    outcomeDescription,
    experienceGained: {
      sxp: Math.max(0, sxp),
      gxp: Math.max(0, gxp),
      wxp: Math.max(0, wxp),
    },
  };
}
