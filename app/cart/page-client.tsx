"use client";

import { CartTable } from "@/components/CartTable";
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import { Button } from "@/components/ui/button";
import { changeProductNumberInCart, deleteProductFromCart, getCart } from "@/functions/database";
import { getSessionId, getSessionIdAndCreateIfMissing } from "@/functions/sessions";
import Kai from "@/lib/types"
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import React, { useEffect } from 'react'

const CartPage = ({ data }: { data?: Kai.Cart}) => {
    const [cart, setCart] = React.useState<Kai.Cart>(data || []);
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

    const updateProductCount = async (product: Kai.ProductInCart, count?: number) => {
        const session = await getSessionId();
        if (count === undefined) {
            await deleteProductFromCart(session!, product);
            setCart((prev) => prev.filter((inCart) => inCart.stringified !== product.stringified));
            return;
        }
        const res = await changeProductNumberInCart(session!, product, count);
        if (res && !res.success) {
            return;
        }
        setCart((prev) => {
            const newCart = prev.map((inCart) => {
                if (inCart.stringified === product.stringified) {
                    return {
                        ...inCart,
                        count: inCart.count + count,
                        total: parseFloat(inCart.product.price) * (inCart.count + count)
                    }
                }
                return inCart;
            })
            return newCart;
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
            accessorKey: "count",
            header: "Quantity",
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
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const count = parseInt(row.getValue("count"));
                const product = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Button variant={"outline"} disabled={count===1} onClick={() => updateProductCount(product, -1)}>-</Button>
                        {count}
                        <Button variant={"outline"} onClick={() => updateProductCount(product, 1)}>+</Button>
                    </div>
                )
            }
        },
        {
            id: 'remove',
            cell: ({ row }) => {
                const product = row.original;
                return (
                    <Button variant={"outline"} onClick={() => updateProductCount(product)}>Remove</Button>
                )
            }
        }
    ];    

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
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