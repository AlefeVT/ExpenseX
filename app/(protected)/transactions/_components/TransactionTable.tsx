"use client"

import { getTransactionsHistoryResponseType } from "@/app/api/transactions-history/route";
import { DateToUTCDate } from "@/lib/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
import SkeletonWrapper from "@/components/SkeletonWrapper/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import { DataTableViewOptions } from "@/components/datatable/ColumnToggle";
import { Button } from "@/components/ui/button";

import { download, generateCsv, mkConfig } from "export-to-csv";
import { IoDownloadOutline } from "react-icons/io5";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LuMoreHorizontal } from "react-icons/lu";
import { IoTrashOutline } from "react-icons/io5";
import DeleteTransactionDialog from "./DeleteTransactionDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addTransactionsFromCSV } from "../_actions/ImportCSV";
import { TbTableImport } from "react-icons/tb";
interface Props {
    from: Date;
    to: Date;
}

const emptyData: any[] = [];

type TransactionHistoryRow = getTransactionsHistoryResponseType[0];

const columns: ColumnDef<TransactionHistoryRow>[] = [
    {
        accessorKey: "category",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Categoria" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => <div className="flex gap-2 capitalize">
            {row.original.categoryIcon}
            <div className="capitalize">
                {row.original.category}
            </div>
        </div>
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Descrição" />
        ),
        cell: ({ row }) => <div className="capitalize">
            {row.original.description}
        </div>
    },
    {
        accessorKey: "date",
        header: "Data",
        cell: ({ row }) => {
            const date = new Date(row.original.date);
            const formattedDate = date.toLocaleDateString("default", {
                timeZone: "UTC",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            })
            return <div className="text-muted-foreground">{formattedDate}</div>
        }
    },
    {
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tipo" />
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        cell: ({ row }) => <div className={cn("capitalize rounded-lg text-center p-2",
            row.original.type === "renda" && "bg-emerald-400/10 text-emerald-500",
            row.original.type === "despesa" && "bg-red-400/10 text-red-500")}>
            {row.original.type}
        </div>
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Valor" />
        ),
        cell: ({ row }) => (
            <p className="text-md rounded-lg bg-gray-400/5 p-2 text-center font-medium">
                {row.original.formattedAmount}
            </p>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
            <RowActions transaction={row.original} />
        ),
    }
];

const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
});

interface TransactionData {
    date: string;
    category: string;
    title: string;
    amount: string;
}

function TransactionTable({ from, to }: Props) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [file, setFile] = useState<File | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleImportCSV = (file: File | null) => {
        if (file) {
            toast.loading("Importação em andamento...");
            Papa.parse(file, {
                header: true,
                complete: async (results: Papa.ParseResult<TransactionData>) => {
                    try {
                        await addTransactionsFromCSV(results.data);
                        toast.dismiss();
                        toast.success("Importação concluída com sucesso!");
                        queryClient.invalidateQueries({ queryKey: ["transactions", "history"], exact: false });
                        setIsDialogOpen(false);
                    } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao importar os dados. Por favor, tente novamente.");
                        console.error("Erro ao importar os dados:", error);
                    }
                },
                error: (error) => {
                    toast.dismiss();
                    toast.error("Erro ao processar o arquivo CSV. Por favor, tente novamente.");
                    console.error("Erro ao processar o arquivo CSV:", error);
                }
            });
        } else {
            toast.error("Nenhum arquivo selecionado.");
            console.error("Nenhum arquivo selecionado.");
        }
    };

    const history = useQuery<getTransactionsHistoryResponseType>({
        queryKey: ["transactions", "history", from, to],
        queryFn: () => fetch(`/api/transactions-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
            .then(res => res.json())
    });

    const handleExportCSV = (data: any[]) => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    }

    const table = useReactTable({
        data: history.data || emptyData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            pagination: {
                pageSize: 10
            }
        },
        state: {
            sorting,
            columnFilters
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const categoriesOptions = useMemo(() => {
        const categoriesMap = new Map<string, { value: string; label: string }>();
        history.data?.forEach(transaction => {
            categoriesMap.set(transaction.category, {
                value: transaction.category,
                label: `${transaction.categoryIcon} ${transaction.category}`
            });
        });
        const uniqueCategories = new Set(categoriesMap.values());
        return Array.from(uniqueCategories);
    }, [history.data]);

    const handleImportCSVClick = () => {
        handleImportCSV(file);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-end justify-between gap-2 py-4">
                <div className="flex gap-2">
                    {table.getColumn("category") && (
                        <DataTableFacetedFilter
                            title="Categoria"
                            column={table.getColumn("category")}
                            options={categoriesOptions} />
                    )}

                    {table.getColumn("type") && (
                        <DataTableFacetedFilter
                            title="Tipo"
                            column={table.getColumn("type")}
                            options={[
                                { label: "Renda", value: "renda" },
                                { label: "Despesa", value: "despesa" }
                            ]} />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant={"outline"} size={"sm"} className="ml-auto h-8 lg:flex" onClick={() => {
                        const data = table.getFilteredRowModel().rows.map(row =>
                        ({
                            category: row.original.category,
                            categoryIcon: row.original.categoryIcon,
                            description: row.original.description,
                            type: row.original.type,
                            formattedAmount: row.original.formattedAmount,
                            date: row.original.date,
                        }));
                        handleExportCSV(data);
                    }}>
                        <IoDownloadOutline className="mr-2 h-4 w-4" />
                        Exportar CSV
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size={"sm"} className="ml-auto h-8 lg:flex"><TbTableImport className="mr-2 h-4 w-4" />Importar CSV</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Importar CSV</DialogTitle>
                                <DialogDescription>
                                    Selecione um arquivo CSV para importar os dados.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="csvFile" className="text-right">
                                        Arquivo
                                    </Label>
                                    <Input
                                        id="csvFile"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileChange}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleImportCSVClick}>Importar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <SkeletonWrapper isLoading={history.isFetching}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
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
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
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
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Próximo
                    </Button>
                </div>
            </SkeletonWrapper>
        </div>
    )
}

export default TransactionTable;

function RowActions({ transaction }: { transaction: TransactionHistoryRow }) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    return (
        <>
            <DeleteTransactionDialog
                open={showDeleteDialog}
                setOpen={setShowDeleteDialog}
                transactionId={transaction.id}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant={"ghost"} className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir Menu</span>
                        <LuMoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Ações
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2" onSelect={() => { setShowDeleteDialog(prev => !prev) }}>
                        <IoTrashOutline className="h-4 w-4 text-muted-foreground" /> Deletar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}