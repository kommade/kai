"use client";

import { CartTable } from "@/components/CartTable";
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { Button } from "@/components/ui/button";
import { changeProductNumberInCart, deleteProductFromCart, getCart } from "@/functions/database";
import { getSessionId, getSessionIdAndCreateIfMissing } from "@/functions/sessions";
import { Cart } from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table";
import React, { useEffect } from 'react'

const CartPage = ({ data }: { data?: Cart}) => {
    const [cart, setCart] = React.useState<Cart>(data || []);
    useEffect(() => {
        if (data) {
            return;
        }
        const fetchCart = async () => {
            const session = await getSessionIdAndCreateIfMissing();
            setCart(await getCart(session))
        }
        fetchCart();
    }, [data])

    const updateProductCount = async (key: string, count?: number) => {
        const session = await getSessionId();
        if (count === undefined) {
            await deleteProductFromCart(session!, key);
            setCart((prev) => prev.filter((product) => product.id !== key));
            return;
        }
        const res = await changeProductNumberInCart(session!, key, count);
        if (res && !res.success) {
            return;
        }
        setCart((prev) => {
            const newCart = prev.map((product) => {
                if (product.id === key) {
                    return {
                        ...product,
                        count: product.count + count,
                        total: parseFloat(product.price) * (product.count + count)
                    }
                }
                return product;
            })
            return newCart;
        })
    }

    const columns: ColumnDef<Cart[number]>[] = [
        {
            accessorKey: "fullName",
            header: "Item",
        },
        {
            accessorKey: "count",
            header: "Quantity",
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const price = row.getValue("price") as number;
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
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const count = parseInt(row.getValue("count"));
                const key = row.original.key;
                return (
                    <div className="flex items-center gap-3">
                        <Button variant={"outline"} disabled={count===1} onClick={() => updateProductCount(key, -1)}>-</Button>
                        {count}
                        <Button variant={"outline"} onClick={() => updateProductCount(key, 1)}>+</Button>
                    </div>
                )
            }
        },
        {
            id: 'remove',
            cell: ({ row }) => {
                const key = row.original.key;
                return (
                    <Button variant={"outline"} onClick={() => updateProductCount(key)}>Remove</Button>
                )
            }
        }
    ];    

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] min-h-[calc(100vh_-_140px)] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex flex-col">
                        <h2 className="text-center w-fit text-[24px]">CART</h2>
                        <CartTable columns={columns} data={cart}/>
                    </div>
                </section>
                <FooterComponent/>
            </div>
        </main>
    )
}

export default CartPage