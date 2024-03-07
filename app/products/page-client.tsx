"use client"

import Image from "next/image"
import React, { useEffect, useState } from 'react'
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import {
    Command,
    CommandInput
} from "@/components/ui/command"
import { ProductData, ProductGrid} from "@/components/ProductList"
import { getProducts, searchProducts } from "@/functions/actions"
  

const ProductPage = ({ products, totalPages, keys }: { products: ProductData[], totalPages: number, keys: string[] }) => {
    const itemsPerPage = 12;
    const [productKeys, setProductKeys] = useState<string[]>(keys)
    const [searchValue, setSearchValue] = useState("")
    const [productList, setProductList] = useState<ProductData[]>(products.concat(Array(productKeys.length - itemsPerPage > 0 ? productKeys.length - itemsPerPage : 0).fill(undefined)))
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        handleDataChange();
    }, [productList, productKeys]);

    // searchbar
    const handleValueChange = (value: string) => {
        setSearchValue(value)
    }
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (searchValue === "") {
                return;
            }
            const result = await searchProducts(searchValue);
            setProductKeys(result);
            setProductList(Array(result.length).fill(undefined));
        } else if (e.key === "Backspace") {
            setProductKeys(keys);
            setProductList(products.concat(Array(keys.length - itemsPerPage > 0 ? keys.length - itemsPerPage : 0).fill(undefined)));
        }
    }

    // responding to stateful updates
    const handleDataChange = async (page: number = 1) => {
        // if any of the products on the page chosen are undefined in the list, fetch them
        if (productList.slice((page - 1) * itemsPerPage, page * itemsPerPage).some((product) => product === undefined)){
            const products = await getProducts(productKeys.slice((page - 1) * itemsPerPage, page * itemsPerPage));
            if (!products.success) {
                console.error('Error fetching products:', products.message);
                return;
                // show a pop up and error screen
            }
            // if the data fetched is less than the itemsPerPage, we are on the last page and we need to fill the rest of the data with null
            // so that we know there is no more data to fetch
            if (products.data!.length < itemsPerPage) {
                setProductList(
                    productList
                        .slice(0, (page - 1) * itemsPerPage)
                        .concat(products.data!)
                        .concat(Array(itemsPerPage - products.data!.length).fill(null))
                        );
            } else {
                // otherwise we just fill in the missing data into the list
                setProductList(
                    productList
                    .slice(0, (page - 1) * itemsPerPage)
                    .concat(products.data!)
                        .concat(productList.slice(page * itemsPerPage, productList.length))
                );
            }
        }
        setCurrentPage(page);
    }
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex">
                        <h2 className="text-center w-fit text-[24px]">PRODUCTS</h2>
                        <div>
                            <Command className="rounded-lg border">
                                <CommandInput placeholder="Search..." onValueChange={handleValueChange} onKeyDown={handleKeyDown}/>
                            </Command>
                        </div>
                    </div>
                    <ProductGrid products={productList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}/>
                    <div className="w-[90%] flex justify-center items-center"> 
                        <div className="w-fit">
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                    key={pageNumber}
                                    onClick={() => handleDataChange(pageNumber)}
                                    className={`mx-2 hover:text-kai-blue ${currentPage === pageNumber ? 'text-kai-blue' : 'text-kai-grey'}`}
                                    >
                                    {pageNumber}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
                <FooterComponent/>
            </div>
        </main>
    )
}

export default ProductPage