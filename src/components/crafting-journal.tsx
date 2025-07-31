
"use client";

import React, { useState } from "react";
import type { ActiveProject, ProjectType } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Star, Sun, Moon, PlusCircle, Trash2 } from "lucide-react";


interface CraftingJournalProps {
  experience: {
    sxp: number;
    gxp: number;
    wxp: number;
  };
  projects: ActiveProject[];
  maxProjects: number;
  onAddProject: (project: Omit<ActiveProject, "id" | "isComplete">) => void;
  onRemoveProject: (projectId: string) => void;
}

const CraftingJournal = React.memo(({
  experience,
  projects,
  maxProjects,
  onAddProject,
  onRemoveProject,
}: CraftingJournalProps) => {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectType, setNewProjectType] =
    useState<ProjectType>("major-project");
  const [newProjectGoal, setNewProjectGoal] = useState(25);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || newProjectGoal <= 0) return;
    onAddProject({
      name: newProjectName,
      type: newProjectType,
      goal: newProjectGoal,
      progress: 0,
    });
    setNewProjectName("");
    setNewProjectType("major-project");
    setNewProjectGoal(25);
  };
  
  const canAddProject = projects.filter(p => p.type.startsWith("major")).length < maxProjects;

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
        {/* Experience Section */}
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

        <Separator />

        {/* Projects Section */}
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="font-headline text-xl text-primary">
              Active Projects
            </h3>
            {maxProjects > 0 && (
              <span className="text-sm text-muted-foreground font-body">
                {projects.filter(p => p.type.startsWith("major")).length} / {maxProjects} major project slots used
              </span>
            )}
          </div>
          {/* Add Project Form */}
          <form
            onSubmit={handleAddProject}
            className="p-4 bg-secondary/50 rounded-lg mb-4 space-y-4"
          >
            <h4 className="font-headline text-lg">Start New Project</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                        id="project-name"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g., Orichalcum Daiklave"
                        required
                    />
                </div>
                 <div>
                    <Label htmlFor="project-goal">Crafting Goal</Label>
                    <Input
                        id="project-goal"
                        type="number"
                        value={newProjectGoal}
                        onChange={(e) => setNewProjectGoal(parseInt(e.target.value, 10))}
                        min={1}
                        required
                    />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                    <Label htmlFor="project-type">Project Type</Label>
                     <Select
                        value={newProjectType}
                        onValueChange={(v) => setNewProjectType(v as ProjectType)}
                    >
                        <SelectTrigger id="project-type">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {PROJECT_TYPES.filter(t => t.endsWith("project")).map((type) => (
                            <SelectItem key={type} value={type}>
                                {type.replace("-", " ").replace(/\\b\\w/g, l => l.toUpperCase())}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" disabled={!canAddProject || !newProjectName} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </div>
             {!canAddProject && newProjectType.startsWith("major") && (
                <p className="text-sm text-destructive font-body text-center">
                    No major project slots available. Activate Tireless Workhorse Method or free up a slot.
                </p>
            )}

          </form>

          {/* Project List */}
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((p) => (
                <Card key={p.id} className={`p-4 ${p.isComplete ? 'bg-green-900/20' : 'bg-secondary'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold font-body">{p.name}</p>
                      <p className="text-sm text-muted-foreground font-body">
                        {p.type.replace("-", " ").replace(/\\b\\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveProject(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm font-body mb-1">
                        <span>Progress</span>
                        <span>{p.progress} / {p.goal}</span>
                    </div>
                    <Progress value={(p.progress / p.goal) * 100} />
                  </div>
                  {p.isComplete && (
                      <p className="text-center font-bold text-green-400 mt-2 font-headline">COMPLETE</p>
                  )}
                </Card>
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
});

CraftingJournal.displayName = "CraftingJournal";
export default CraftingJournal;
