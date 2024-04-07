"use client";

import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useState } from "react";
import { Button } from "./ui/button";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[],
    data: TData[],
    emptyMessage?: string,
    next?: (cursor: number) => Promise<TData[]>,
    canNextPage?: (cursor: number) => boolean
}

export function DataTable<TData, TValue>({
    columns,
    data,
    emptyMessage,
    next,
    canNextPage,
}: DataTableProps<TData, TValue> & { }) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 })
    const [tableData, setData] = useState(data);
    const table = useReactTable({
        data: (next && canNextPage) ? tableData : data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            pagination
        }
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={`${headerGroup.id}-${Math.random().toString(36).substring(7)}`}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={`${header.id}-${Math.random().toString(36).substring(7)}`}>
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
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={`${row.id}-${Math.random().toString(36).substring(7)}`}
                        data-state={row.getIsSelected() && "selected"}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={`${cell.id}-${Math.random().toString(36).substring(7)}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        {emptyMessage || "No data"}
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                        if (next) {
                            await next(table.getState().pagination.pageIndex).then((data) => setData((prev) => prev.concat(data)))
                        }
                        table.nextPage()
                    }}
                    disabled={
                        !table.getCanNextPage() || (canNextPage && !canNextPage(table.getState().pagination.pageIndex * 5))
                    }
                >
                    Next
                </Button>
            </div>
        </div>
    )
}