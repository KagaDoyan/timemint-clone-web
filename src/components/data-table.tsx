"use client"

import React, { useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize: number
  currentPage: number
  totalPages: number
  onPageSizeChange: (newSize: number) => void
  onPageChange: (newPage: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize,
  currentPage,
  totalPages,
  onPageSizeChange,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageSize, pageIndex: 0 })
        : updater;
      onPageChange(newPagination.pageIndex);
      onPageSizeChange(newPagination.pageSize);
    },
    state: {
      pagination: {
        pageSize,
        pageIndex: 0
      }
    },
  })

  var rows = table.getRowModel().rows;
  var headers = table.getHeaderGroups();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };


  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Limit:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded p-1 text-sm"
          >
            {[5, 10, 20, 50]?.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border rounded p-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || !table.getCanNextPage()}
            className="border rounded p-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <div className="rounded-md border hidden sm:block">
        <Table >
          <TableHeader>
            {headers.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers?.map((header) => {
                  if (header.column.columnDef.header === "card-header") return null;
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows?.length ? (
              rows?.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row?.getVisibleCells()?.map((cell) => {
                    if (cell.column.columnDef.header === "card-header") {
                      return null
                    }
                    return (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="block sm:hidden">
        {rows?.length ? (
          rows?.map((row) => {
            const isExpanded = expandedRows[row.id] ?? false;

            return (
              <Card key={row.id} className="mb-4 shadow-md rounded-lg">
                <CardHeader
                  onClick={() => toggleRow(row.id)}
                  className="cursor-pointer flex justify-between items-center"
                >
                  <CardTitle className="text-sm font-medium">
                    {
                      (() => {
                        const headerCell = row
                          .getVisibleCells()
                          .find(cell => cell.column.columnDef.header === "card-header");

                        if (headerCell) {
                          return flexRender(
                            headerCell.column.columnDef.cell,
                            headerCell.getContext()
                          );
                        } else {
                          // Use index 1 if 'card-header' is not found
                          const fallbackCell = row.getVisibleCells()[1];
                          return fallbackCell
                            ? flexRender(fallbackCell.column.columnDef.cell, fallbackCell.getContext())
                            : "Item";
                        }
                      })()
                    }
                  </CardTitle>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <ul className="space-y-2">
                      {row.getVisibleCells()?.map((cell) => {
                        const header = cell.column.columnDef.header?.toString()
                        if (header == "card-header") {
                          return (
                            <></>
                          )
                        }
                        return (
                          <li key={cell.id} className="text-sm">
                            <span className="font-medium">
                              {header != "Actions" ? header + ":" : ""}
                            </span>{" "}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })
        ) : (
          <div className="text-center py-6 text-gray-500">No results.</div>
        )}
      </div>

    </div>
  )
}
