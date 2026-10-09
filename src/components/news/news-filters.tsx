"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewsFiltersProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { value: "ALL", label: "All Sports" },
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "TENNIS", label: "Tennis" },
  { value: "CRICKET", label: "Cricket" },
  { value: "GENERAL", label: "General" },
];

export function NewsFilters({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: NewsFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <Button
            key={cat.value}
            variant={currentCategory === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(cat.value)}
            className="rounded-full text-xs shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
    </div>
  );
}
