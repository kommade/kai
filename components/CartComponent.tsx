import { getCart, deleteProductFromCart, changeProductNumberInCart } from "@/functions/database";
import { getSessionIdAndCreateIfMissing, getSessionId, extendSessionId } from "@/functions/sessions";
import Kai from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Minus, Plus, XIcon } from "lucide-react";
import React, { useEffect } from 'react'
import { Button } from "./ui/button";
import Image from "next/image";
import { CartTable } from "./DataTable";
import { useRouter } from "next/navigation";

const CartComponent = ({ data }: { data: Kai.Cart | undefined }) => {
    const router = useRouter();
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
            header: () => <div className="ml-[14px]">Quantity</div>,
            cell: ({ row }) => {
                const count = row.getValue("count") as number;
                const product = row.original;
                console.log(count);
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
    
    const shipping = 1.50;
    const orderAmount = cart.reduce((acc, curr) => acc + curr.total, 0);
    const discount = 0;
    return (
        <>
            <CartTable columns={columns} data={cart} />
            <div className="flex flex-col items-end justify-end w-full gap-2 mt-4">
                <div className="flex flex-row gap-2">
                    <div className="flex flex-col text-right">
                        <h3 className="text-lg">Shipping: </h3>
                        <h3 className="text-lg">Order amount: </h3>
                        { discount > 0 && <h3 className="text-lg">Discount: </h3>}
                        <h3 className="text-lg">Total: </h3>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg">{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "SGD",
                        }).format(shipping)}</h3>
                        <h3 className="text-lg">{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "SGD",
                        }).format(orderAmount)}</h3>
                        { discount > 0 && <h3 className="text-lg">{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "SGD",
                        }).format(discount * (shipping + orderAmount))}</h3>}
                        <h3 className="text-lg">{new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "SGD",
                        }).format((orderAmount + shipping) * (1 - discount))}</h3>
                    </div>
                </div>
                
                <Button
                    className="w-[100px]"
                    variant={"default"}
                    onClick={
                        () => {
                            extendSessionId();
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