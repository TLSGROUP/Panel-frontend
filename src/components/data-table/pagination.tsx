"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getButtonSizeClass = (size: 'sm' | 'default' | 'lg') => {
  switch (size) {
    case 'sm': return 'h-7 w-7 p-0';
    case 'lg': return 'h-11 w-11 p-0';
    default: return 'h-8 w-8 p-0';
  }
};

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalItems?: number; // Total number of items from API
  totalSelectedItems?: number; // Total selected items across all pages
  pageSizeOptions?: number[]; // Custom page size options
  size?: 'sm' | 'default' | 'lg'; // Size prop for components
}

export function DataTablePagination<TData>({
  table,
  totalItems = 0,
  totalSelectedItems = 0,
  pageSizeOptions = [10, 20, 30, 40, 50], // Default options if none provided
  size = 'default'
}: DataTablePaginationProps<TData>) {
  // Convert 'lg' size to 'default' for SelectTrigger since it only accepts 'sm' | 'default'
  const selectSize = size === 'lg' ? 'default' : size;
  const selectSizeClass = selectSize === 'sm' ? 'h-8' : 'h-9';

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 overflow-auto px-2 py-1 sm:flex-row sm:gap-8">
      <div className="flex-1 text-sm text-muted-foreground">
        {totalSelectedItems} of {totalItems} row(s) selected.
      </div>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap text-sm font-medium">
            Rows per page
          </p>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`gap-2 ${selectSizeClass} px-3`}
              >
                <span>{table.getState().pagination.pageSize}</span>
                <ChevronDown className="size-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              sideOffset={4}
              avoidCollisions={true}
              className="w-(--radix-dropdown-menu-trigger-width) min-w-[8rem] rounded-lg overflow-visible border border-white/10 bg-black/40 backdrop-blur-md"
            >
              <DropdownMenuRadioGroup
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  const numericValue = parseInt(value, 10);
                  if (isNaN(numericValue) || numericValue <= 0) {
                    console.error(`Invalid page size value: ${value}`);
                    return;
                  }

                  try {
                    const url = new URL(window.location.href);
                    url.searchParams.set('pageSize', value);
                    url.searchParams.set('page', '1');
                    window.history.replaceState({}, '', url.toString());

                    table.setPagination({
                      pageIndex: 0,
                      pageSize: numericValue
                    });
                  } catch (error) {
                    console.error('Error updating pagination:', error);
                  }
                }}
              >
                {pageSizeOptions.map((pageSize) => (
                  <DropdownMenuRadioItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Go to first page"
            variant="outline"
            className={`${getButtonSizeClass(size)} hidden lg:flex cursor-pointer`}
            onClick={() => table.setPagination({ pageIndex: 0, pageSize: table.getState().pagination.pageSize })}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to previous page"
            variant="outline"
            className={`${getButtonSizeClass(size)} cursor-pointer`}
            onClick={() => table.setPagination({
              pageIndex: table.getState().pagination.pageIndex - 1,
              pageSize: table.getState().pagination.pageSize
            })}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to next page"
            variant="outline"
            className={`${getButtonSizeClass(size)} cursor-pointer`}
            onClick={() => table.setPagination({
              pageIndex: table.getState().pagination.pageIndex + 1,
              pageSize: table.getState().pagination.pageSize
            })}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Go to last page"
            variant="outline"
            className={`${getButtonSizeClass(size)} hidden lg:flex cursor-pointer`}
            onClick={() => table.setPagination({
              pageIndex: table.getPageCount() - 1,
              pageSize: table.getState().pagination.pageSize
            })}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
