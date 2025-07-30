"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Library } from "lucide-react";

const xpReferenceData = [
    { category: "Basic Project", objectives: "1-3", standard: "2 SXP per objective", exceptional: "3 SXP per objective" },
    { category: "Basic Repair", objectives: "1-3", standard: "1 SXP per objective", exceptional: "N/A" },
    { category: "Major Project", objectives: "1-3", standard: "2 GXP & 1 SXP per objective", exceptional: "3 GXP & 1 SXP per objective" },
    { category: "Major Repair", objectives: "1-3", standard: "1 GXP per objective", exceptional: "N/A" },
    { category: "Superior Project", objectives: "1 (Finishing)", standard: "WXP based on Artifact Rating*", exceptional: "N/A" },
    { category: "Superior Repair", objectives: "1 (Finishing)", standard: "WXP = (Rating - 1)", exceptional: "N/A" },
    { category: "Legendary Project", objectives: "1 (Finishing)", standard: "10 WXP", exceptional: "N/A" },
    { category: "Legendary Repair", objectives: "N/A", standard: "No XP", exceptional: "N/A" },
];

const superiorWxpMap = "2-Dot: 3 WXP, 3-Dot: 5 WXP, 4-Dot: 7 WXP, 5-Dot: 9 WXP";

export default function CraftingReference() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8 text-primary" />
          <div className="flex-grow">
            <CardTitle className="font-headline text-2xl text-primary">
              Crafting Reference
            </CardTitle>
            <CardDescription className="font-body">
              A quick reference for Experience Point (XP) rewards from crafting projects.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold font-headline">Project Category</TableHead>
              <TableHead className="font-bold font-headline">Objectives</TableHead>
              <TableHead className="font-bold font-headline">Standard Reward</TableHead>
              <TableHead className="font-bold font-headline">Exceptional Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {xpReferenceData.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium font-body">{row.category}</TableCell>
                <TableCell className="font-body">{row.objectives}</TableCell>
                <TableCell className="font-body">{row.standard}</TableCell>
                <TableCell className="font-body">{row.exceptional}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm font-body text-muted-foreground"><span className="font-bold text-foreground">*Superior Project WXP Rewards:</span> {superiorWxpMap}</p>
        </div>
      </CardContent>
    </Card>
  );
}
