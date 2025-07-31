"use client";

import type { Project, ProjectType } from "@/lib/types";
import { PROJECT_TYPES } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Star, Award } from "lucide-react";

interface ProjectDetailsProps {
  project: Project;
  setProject: (project: Project) => void;
}

export default function ProjectDetails({
  project,
  setProject,
}: ProjectDetailsProps) {
  const handleProjectChange = (key: keyof Project, value: string) => {
    const isNumeric = ["artifactRating", "basicObjectives"].includes(key);
    const parsedValue = isNumeric ? parseInt(value, 10) : value;
    setProject({ ...project, [key]: parsedValue });
  };

  const isSuperiorOrLegendary =
    project.type.includes("superior") || project.type.includes("legendary");

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Project Details
            </CardTitle>
            <CardDescription className="font-body">
              Define the specifics of your crafting project.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid w-full items-center gap-2.5">
          <Label htmlFor="project-type" className="font-bold text-lg font-body">
            Project Type
          </Label>
          <Select
            value={project.type}
            onValueChange={(value) => handleProjectChange("type", value)}
          >
            <SelectTrigger id="project-type" className="bg-background">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isSuperiorOrLegendary && (
          <div className="grid w-full items-center gap-2.5">
            <Label htmlFor="artifact-rating" className="font-bold text-lg font-body flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Artifact Rating
            </Label>
            <Select
              value={project.artifactRating.toString()}
              onValueChange={(value) =>
                handleProjectChange("artifactRating", value)
              }
            >
              <SelectTrigger id="artifact-rating" className="bg-background">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((val) => (
                  <SelectItem key={val} value={val.toString()}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid w-full items-center gap-2.5">
          <Label htmlFor="basic-objectives" className="font-bold text-lg font-body flex items-center gap-2">
            <Award className="w-5 h-5 text-green-500" />
            Basic Objectives Met
          </Label>
          <Select
            value={project.basicObjectives.toString()}
            onValueChange={(value) =>
              handleProjectChange("basicObjectives", value)
            }
          >
            <SelectTrigger id="basic-objectives" className="bg-background">
              <SelectValue placeholder="Select objectives" />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3].map((val) => (
                <SelectItem key={val} value={val.toString()}>
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
