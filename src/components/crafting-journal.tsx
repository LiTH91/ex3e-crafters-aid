"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Star, Sun, Moon } from "lucide-react";

interface CraftingJournalProps {
  experience: {
    sxp: number;
    gxp: number;
    wxp: number;
  };
  projects: any[];
  maxProjects: number;
}

export default function CraftingJournal({
  experience,
  projects,
  maxProjects,
}: CraftingJournalProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Crafting Journal
            </CardTitle>
            <CardDescription className="font-body">
              Track your experience and ongoing projects.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-xl text-primary mb-2">
            Crafting Experience
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background rounded-lg shadow">
              <div className="flex items-center justify-center gap-2">
                <Moon className="w-6 h-6 text-gray-400" />
                <p className="font-bold text-2xl font-headline text-foreground">
                  {experience.sxp}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Silver (SXP)
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow">
              <div className="flex items-center justify-center gap-2">
                <Sun className="w-6 h-6 text-yellow-500" />
                <p className="font-bold text-2xl font-headline text-foreground">
                  {experience.gxp}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                Gold (GXP)
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg shadow">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-white" />
                <p className="font-bold text-2xl font-headline text-foreground">
                  {experience.wxp}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-body">
                White (WXP)
              </p>
            </div>
          </div>
        </div>
        <div>
           <div className="flex justify-between items-baseline">
            <h3 className="font-headline text-xl text-primary mb-2">
              Active Projects
            </h3>
            {maxProjects > 0 && (
                <span className="text-sm text-muted-foreground font-body">
                    {projects.length} / {maxProjects} slots used
                </span>
            )}
           </div>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((p, i) => (
                <div key={i} className="p-4 bg-secondary rounded-lg">
                  <p className="font-bold font-body">{p.name}</p>
                  <p className="text-sm text-muted-foreground font-body">
                    {p.type}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground font-body p-4 border-2 border-dashed border-border rounded-lg">
              <p>No active projects.</p>
              {maxProjects > 0 ? (
                 <p className="text-sm">
                    You have {maxProjects} available major project slots.
                 </p>
              ) : (
                <p className="text-sm">
                    Activate Tireless Workhorse Method to gain project slots.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
