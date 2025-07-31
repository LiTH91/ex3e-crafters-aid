"use client";

import { useState, useEffect } from 'react';
import { allCharms, Charm } from '@/lib/charms';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const CharmSelection = () => {
  // 1. Initialer State ist immer ein leeres Array
  const [selectedCharms, setSelectedCharms] = useState<Charm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Lade sicher aus dem localStorage, nachdem die Komponente im Browser gemountet wurde
  useEffect(() => {
    const saved = localStorage.getItem("selectedCharms");
    if (saved) {
      setSelectedCharms(JSON.parse(saved));
    }
  }, []); // Der leere Array [] sorgt dafür, dass dieser Effekt nur einmal ausgeführt wird.

  // 3. Speichere Änderungen im localStorage, wenn sich selectedCharms ändert
  useEffect(() => {
    localStorage.setItem("selectedCharms", JSON.stringify(selectedCharms));
  }, [selectedCharms]);


  const handleCharmToggle = (charm: Charm) => {
    setSelectedCharms(prev =>
      prev.find(c => c.name === charm.name)
        ? prev.filter(c => c.name !== charm.name)
        : [...prev, charm]
    );
  };

  const charmsByAbility = allCharms.reduce((acc, charm) => {
    const ability = charm.ability;
    if (!acc[ability]) {
      acc[ability] = [];
    }
    acc[ability].push(charm);
    return acc;
  }, {} as Record<string, Charm[]>);

  const filteredCharmsByAbility: Record<string, Charm[]> = {};
  for (const ability in charmsByAbility) {
    const filtered = charmsByAbility[ability].filter(charm =>
      charm.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredCharmsByAbility[ability] = filtered;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Charms</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Search for a charm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-72 w-full rounded-md border p-4">
          <Accordion type="multiple" className="w-full">
            {Object.entries(filteredCharmsByAbility).map(([ability, charms]) => (
              <AccordionItem value={ability} key={ability}>
                <AccordionTrigger>{ability}</AccordionTrigger>
                <AccordionContent>
                  {charms.map((charm) => (
                    <div key={charm.name} className="flex items-center space-x-2 my-2">
                      <Checkbox
                        id={charm.name}
                        checked={selectedCharms.some(c => c.name === charm.name)}
                        onCheckedChange={() => handleCharmToggle(charm)}
                      />
                      <Label htmlFor={charm.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {charm.name}
                      </Label>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CharmSelection;
