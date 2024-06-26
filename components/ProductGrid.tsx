"use client";

import Kai from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductItem = ({product}: {product: Kai.Product}) => {
    const [hover, setHover] = React.useState(false);
    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'SGD',
    });
    return (
        <div className="relative bg-kai-white">
            <div
                className="absolute w-full h-[87%] bg-kai-white overflow-hidden"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <Link href={`/products/${product.url}`}>
                    <Image className={`absolute w-full h-full object-cover transition-all duration-300 ${hover ? "brightness-75" : ""}`} src={product.images[0]} width={0} height={0} alt={product.url} sizes="30vw" draggable={false}/>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-kai-white w-[60%] h-[30%] rounded-sm flex flex-col justify-center items-center transition-opacity duration-300 ${hover ? "opacity-80" : "opacity-0"}`}>
                        <h3 className="text-center w-fit h-fit mx-4">{product.name}</h3>
                    </div>
                </Link>
            </div>
            <div className="absolute left-0 w-full text-center bottom-0">
                <h3 className="text-black">{moneyFormatter.format(product.price)}</h3>
            </div>
        </div>
    );
};

export const ProductGrid = ({ products }: { products: Kai.Product[] }) => {
    if (products.every((product) => !product)){
        return (
            <div className="w-[90%] h-[40vw] grid grid-cols-5 grid-rows-2 gap-5 my-4">
                    <h3>No products found</h3>
            </div>
        );
    }
    return (
        <div className="w-[90%] h-[40vw] grid grid-cols-5 grid-rows-2 gap-5 my-4">
            {
                products.map((product, index) => {
                    if (!product) {
                        return <React.Fragment key={index}></React.Fragment>;
                    }
                    return <ProductItem key={index} product={product} />;
                })
            }
        </div>

    );
}