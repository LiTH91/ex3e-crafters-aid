"use client";

import { useState, useMemo } from "react";
import { allCharms } from "@/lib/charms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CharmSelectionProps {
  knownCharms: string[];
  activeCharms: string[];
  setActiveCharms: (charms: string[]) => void;
}

export default function CharmSelection({
  knownCharms,
  activeCharms,
  setActiveCharms,
}: CharmSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("essence");

  const handleCharmToggle = (charmId: string) => {
    const newActiveCharms = activeCharms.includes(charmId)
      ? activeCharms.filter((id) => id !== charmId)
      : [...activeCharms, charmId];
    setActiveCharms(newActiveCharms);
  };

  const availableCharms = useMemo(() => {
    return allCharms
      .filter((charm) => knownCharms.includes(charm.id))
      .filter((charm) =>
        charm.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "essence") {
          if (a.minEssence !== b.minEssence) {
            return a.minEssence - b.minEssence;
          }
          if (a.minCraft !== b.minCraft) {
            return a.minCraft - b.minCraft;
          }
        }
        return a.name.localeCompare(b.name);
      });
  }, [knownCharms, searchTerm, sortBy]);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Crafting Charms
            </CardTitle>
            <CardDescription className="font-body">
              Select Charms to enhance your roll.
            </CardDescription>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search charms..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="essence">Essence</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {availableCharms.length > 0 ? (
            availableCharms.map((charm) => (
              <div
                key={charm.id}
                className="flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-secondary"
              >
                <Checkbox
                  id={charm.id}
                  checked={activeCharms.includes(charm.id)}
                  onCheckedChange={() => handleCharmToggle(charm.id)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={charm.id}
                    className="font-bold text-base cursor-pointer font-body flex items-center gap-2"
                  >
                    {charm.name}
                    {charm.cost && <Badge variant="secondary">{charm.cost}</Badge>}
                  </Label>
                  <p className="text-sm text-muted-foreground font-body">
                    {charm.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center font-body">
              No charms found.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
