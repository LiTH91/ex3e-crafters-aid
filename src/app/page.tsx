"use client";

import { useState, useEffect, useCallback } from "react";
import type { Character, Attribute } from "@/lib/types";
import CharacterSheet from "@/components/character-sheet";
import DiceRoller from "@/components/dice-roller";
import { Hammer } from "lucide-react";


const initialCharacter: Character = {
  intelligence: 3,
  wits: 1,
  perception: 1,
  strength: 1,
  dexterity: 1,
  stamina: 1,
  charisma: 1,
  manipulation: 1,
  appearance: 1,
  craft: 5,
  willpower: 5,
  essence: 1,
  selectedAttribute: "intelligence", // This was missing and caused the crash
};

const HomePage = () => {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCharacter = localStorage.getItem("character");
      if (savedCharacter) {
        const parsed = JSON.parse(savedCharacter);
        // Ensure the loaded character has a selectedAttribute
        if (!parsed.selectedAttribute) {
          parsed.selectedAttribute = 'intelligence';
        }
        setCharacter(parsed);
      }
    } catch (error) {
      console.error("Failed to load character from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const handleCharacterChange = (field: keyof Character, value: number) => {
    setCharacter(prev => {
        const newChar = { ...prev, [field]: value };
        localStorage.setItem("character", JSON.stringify(newChar));
        return newChar;
    });
  };
  
  const handleAttributeChange = (attribute: Attribute) => {
      setCharacter(prev => {
          const newChar = { ...prev, selectedAttribute: attribute };
          localStorage.setItem("character", JSON.stringify(newChar));
          return newChar;
      });
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Hammer className="w-12 h-12 animate-spin text-primary"/>
        </div>
    )
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex justify-between items-center mb-6 border-b-2 border-primary/20 pb-4">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary flex items-center gap-3">
          <Hammer className="w-10 h-10" />
          <span>Exalted 3e Crafter's Aid</span>
        </h1>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
             <CharacterSheet 
                character={character}
                onCharacterChange={handleCharacterChange}
                onAttributeChange={handleAttributeChange}
            />
        </section>
        <section>
            <DiceRoller
              character={character}
              activeProjects={[]} // Placeholder for now
            />
        </section>
      </div>
    </main>
  );
};

export default HomePage;
