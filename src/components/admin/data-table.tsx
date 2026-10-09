"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addLabel?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  onAdd,
  addLabel = "Add New",
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");

  const filteredData = data.filter((item) => {
    if (!searchKey || !query) return true;
    const val = item[searchKey];
    if (typeof val === "string") {
      return val.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar with Logical Alignment */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchKey && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
            <Input
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ps-9 h-9"
            />
          </div>
        )}

        {onAdd && (
          <Button onClick={onAdd} size="sm" className="gap-1.5 ms-auto">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="w-16 text-end">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="h-28 text-center text-muted-foreground"
                >
                  No records found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  {columns.map((col, idx) => (
                    <TableCell key={idx} className={col.className}>
                      {typeof col.accessorKey === "function"
                        ? col.accessorKey(item)
                        : (item[col.accessorKey] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(item)}
                              className="cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
