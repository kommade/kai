"use client";

import Kai from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Minus, Plus, XIcon } from "lucide-react";
import React from 'react'
import { Button } from "./ui/button";
import Image from "next/image";
import { DataTable } from "./DataTable";


const CartComponent = ({ data }: { data: Kai.ProductInCart[] }) => {
    const columns: ColumnDef<Kai.ProductInCart>[] = [
        {
            accessorKey: "product",
            header: "Item",
            cell: ({ row }) => {
                const product = row.getValue("product") as Kai.ProductInCart["product"];
                return (
                    <div className="flex items-center gap-3">
                        <Image src={product.image} alt={product.name} className="w-[50px] h-[50px] object-cover rounded-md" width={50} height={50} sizes="50px"/>
                        <div>
                            <h3>{product.fullName}</h3>
                            <p>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "product",
            header: "Options",
            cell: ({ row }) => {
                const product = row.getValue("product") as Kai.ProductInCart["product"];
                const options = product.options as Kai.SelectedProductOptions;
                return Object.values(options).join(", ");
            }
        },
        {
            accessorKey: "product",
            header: "Price",
            cell: ({ row }) => {
                const product = row.getValue("product") as Kai.ProductInCart["product"];
                const price = parseFloat(product.price);
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "SGD",
                }).format(price);
                return formatted;
            }
        },
        {
            accessorKey: "total",
            header: "Subtotal",
            cell: ({ row }) => {
                const price = row.getValue("total") as number;
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "SGD",
                }).format(price);
                return formatted;
            },
            
        },
        {
            accessorKey: "count",
            header: "Quantity",
        }
    ];
    
    return (
        <>
            <DataTable columns={columns} data={data} emptyMessage="No items in data."/>
        </>
    );
}

export default CartComponent