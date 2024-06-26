"use client";

import { deleteProductFromCart, changeProductNumberInCart, getCartWithProducts } from "@/functions/database";
import Kai from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Minus, Plus, XIcon } from "lucide-react";
import React, { useEffect } from 'react'
import { Button } from "./ui/button";
import Image from "next/image";
import { DataTable } from "./DataTable";
import { useRouter } from "next/navigation";

const CartComponent = ({ data, loggedIn }: { data?: Kai.CartWithProducts | null, loggedIn: boolean }) => {
    const router = useRouter();
    const [cart, setCart] = React.useState<Kai.CartWithProducts>(data ?? { items: [] as Kai.CartWithProducts['items'] } as Kai.CartWithProducts);
    
    useEffect(() => {
        if (data) {
            return;
        }
        const fetchCart = async () => {
            setCart(await getCartWithProducts())
        }
        fetchCart();
    }, [data])

    const updateProductCount = async (product: Kai.ProductInCart, count?: number) => {
        if (count === undefined) {
            await deleteProductFromCart(product.selection_id, loggedIn);
            setCart((prev) => ({
                ...prev,
                items: prev.items.filter(inCart => inCart !== null && inCart.selection_id !== product.selection_id),
                total: prev.total - (product.total * product.count)

            } as Kai.CartWithProducts));
            return;
        }
        await changeProductNumberInCart(product.selection_id, count, product.product.price, loggedIn);
        setCart((prev) => {
            const newItems = prev.items.map((inCart) => {
                if (inCart !== null && inCart.selection_id === product.selection_id) {
                    return {
                        ...inCart,
                        count: inCart.count + count,
                        total: inCart.total + (count * product.product.price)
                    }
                }
                return inCart;
            }).filter((inCart) => inCart !== null);
            return {
                ...prev,
                total: newItems.reduce((acc, curr) => acc + curr!.total, 0),
                items: newItems,
            }

        })
    }

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
                            <h3>{product.name}</h3>
                            <p>{product.type.charAt(0).toUpperCase() + product.type.slice(1)}</p>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "selected_options",
            header: "Options",
            cell: ({ row }) => {
                const product = row.getValue("product") as Kai.ProductInCart["product"];
                const selected_options = row.getValue("selected_options") as Kai.ProductInCart["selected_options"];
                const optionsList = product.options.map((option, index) => option.selection[selected_options[index]]);
                return optionsList.join(", ");
            }
        },
        {
            accessorKey: "product",
            header: "Price",
            cell: ({ row }) => {
                const product = row.getValue("product") as Kai.ProductInCart["product"];
                const price =product.price;
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
            header: () => <div className="ml-[14px]">Quantity</div>,
            cell: ({ row }) => {
                const count = row.getValue("count") as number;
                const product = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Button className="w-[40px] p-0 text-lg rounded-full" variant={"ghost"} disabled={count === 1} onClick={() => updateProductCount(product, -1)}><Minus width={16} height={16}/></Button>
                        {count}
                        <Button className="w-[40px] p-0 text-lg" variant={"ghost"} onClick={() => updateProductCount(product, 1)}><Plus width={16} height={16}/></Button>
                    </div>
                )
            },
            
        },
        {
            id: 'remove',
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <Button className="rounded-full w-[48px] h-[48px] p-0 hover:bg-kai-red/20" variant={"ghost"} onClick={() => updateProductCount(product)}>
                        <XIcon className="stroke-kai-red w-[24px] h-[24px]" />
                    </Button>
                )
            },
        }
    ];
    
    return (
        <>
            <DataTable columns={columns} data={cart.items} emptyMessage="No items in cart." paginationEnabled={false} />
            <div className="flex flex-col items-end justify-between w-full gap-2 my-8">
                <Button
                    disabled={cart.items.length === 0}
                    className="w-[100px] self-center"
                    variant={"default"}
                    onClick={
                        () => {
                            router.push('/checkout')
                        }
                    }>
                    Checkout
                </Button>
            </div>
        </>
    );
}

export default CartComponent