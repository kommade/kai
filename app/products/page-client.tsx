"use client";

import Image from "next/image"
import React, { use, useEffect, useState } from 'react'
import FooterComponent from "@/components/FooterComponent"
import HeaderComponent from "@/components/HeaderComponent"
import {
    Command,
    CommandInput
} from "@/components/ui/command"
import { ProductGrid} from "@/components/ProductGrid"
import Kai from "@/lib/types"
import { getProductsById, searchForProducts } from "@/functions/mongodb"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
  
type Checked = DropdownMenuCheckboxItemProps["checked"]

const ProductPage = ({ products, totalPages, ids, collections }: { products: Kai.ProductWithCollection[], totalPages: number, ids: string[], collections: Kai.Collection[] }) => {
    const itemsPerPage = 12;
    const [productIds, setProductIds] = useState<string[]>(ids)
    const [searchValue, setSearchValue] = useState("")
    const [productList, setProductList] = useState<Kai.ProductWithCollection[]>(products.concat(Array(productIds.length - itemsPerPage > 0 ? productIds.length - itemsPerPage : 0).fill(undefined)))
    const [originalProductList, setOriginalProductList] = useState<Kai.ProductWithCollection[]>(products)
    const [currentPage, setCurrentPage] = useState(1);
    const searchParams = useSearchParams();
    const [earringSelected, setEarringSelected] = React.useState<Checked>(searchParams.get("type")?.split(" ").includes("earrings") || false)
    const [necklaceSelected, setNecklaceSelected] = React.useState<Checked>(searchParams.get("type")?.split(" ").includes("necklace") || false)
    const [setsSelected, setSetsSelected] = React.useState<Checked>(searchParams.get("type")?.split(" ").includes("sets") || false)
    const [selectedCollection, setSelectedCollection] = React.useState<string>(searchParams.get("collection") === "recent" ? collections.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())[0].name : searchParams.get("collection") || "") 
    const router = useRouter();

    useEffect(() => {
        // responding to stateful updates
        const handleDataChange = async (page: number = 1) => {
            // if any of the products on the page chosen are undefined in the list, fetch them
            if (productList.slice((page - 1) * itemsPerPage, page * itemsPerPage).some((product) => product === undefined)){
                const products = await getProductsById(productIds.slice((page - 1) * itemsPerPage, page * itemsPerPage));
                if (products.length === 0) {
                    console.error('Error fetching products');
                    return;
                    // show a pop up and error screen
                }
                // if the data fetched is less than the itemsPerPage, we are on the last page and we need to fill the rest of the data with null
                // so that we know there is no more data to fetch
                if (products.length < itemsPerPage) {
                    setProductList(
                        productList
                            .slice(0, (page - 1) * itemsPerPage)
                            .concat(products)
                            .concat(Array(itemsPerPage - products.length).fill(null))
                            );
                } else {
                    // otherwise we just fill in the missing data into the list
                    setProductList(
                        productList
                        .slice(0, (page - 1) * itemsPerPage)
                        .concat(products)
                            .concat(productList.slice(page * itemsPerPage, productList.length))
                    );
                }
            }
            setCurrentPage(page);
        }
        handleDataChange();
    }, [productList, productIds]);

    useEffect(() => {
        const handleFilterChange = () => {
            const params = new URLSearchParams();
            searchParams.forEach((value, key) => {
                if (key !== "type") {
                    params.append(key, value);
                }
            });
            if (selectedCollection !== "") {
                params.set("collection", selectedCollection);
            } else {
                params.delete("collection");
            }
            const types = [];
            if (earringSelected) {
                types.push("earrings");
            }
            if (necklaceSelected) {
                types.push("necklace");
            }
            if (setsSelected) {
                types.push("sets");
            }
            if (types.length > 0) {
                router.push(`/products?${Array.from(params.entries()).length > 0 ? params.toString() + "&" : ""}type=${types.join("+")}`);
            } else {
                router.push(`/products?${params.toString()}`);
            }
        }
        handleFilterChange();
    }, [earringSelected, necklaceSelected, setsSelected, selectedCollection, router, searchParams]);

    useEffect(() => {
        const handleSearchParams = () => {
            const collection_name = searchParams.get("collection");
            const type = searchParams.get("type")?.split(" ");
            let productList = originalProductList;
            if (collection_name) {
                productList = productList.filter((product) => product.collection.name === collection_name);
            }
            if (type) {
                productList = productList.filter((product) => type.includes(product.type))
            }
            setProductList(productList);
        }
        handleSearchParams();
    }, [searchParams, productIds, originalProductList]);

    // searchbar
    const handleValueChange = (value: string) => {
        setSearchValue(value)
    }
    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (searchValue === "") {
                setProductIds(ids);
                setProductList(originalProductList);
            }
            const result = await searchForProducts(searchValue);
            setProductIds(result);
            setProductList(Array(result.length).fill(undefined));
        }
    }

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent/>
                <section className="mt-[80px] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="w-[90%] justify-between flex">
                        <h2 className="text-center w-fit text-[24px]">PRODUCTS</h2>
                        <div className="flex w-[250px]">
                            <div className="w-[200px] mr-4">
                                <Command className="border rounded-lg">
                                    <CommandInput placeholder="Search..." onValueChange={handleValueChange} onKeyDown={handleKeyDown} />
                                </Command>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="h-[46px]" variant="outline">Filters</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[300px] z-[1000] border border-kai-grey bg-kai-white -translate-x-[80px] translate-y-[10px] rounded-sm shadow">
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="p-2">By Type</DropdownMenuLabel>
                                        <DropdownMenuSeparator className="h-[1px] bg-kai-grey"/>
                                        <DropdownMenuItem
                                            className="flex items-center justify-start gap-2 p-2 hover:ring-0 hover:bg-kai-grey"
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                setEarringSelected(!earringSelected);
                                            }}
                                        >
                                            <Checkbox checked={earringSelected}/>
                                            Earring
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="flex items-center justify-start gap-2 p-2 hover:ring-0 hover:bg-kai-grey"
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                setNecklaceSelected(!necklaceSelected);
                                            }}
                                        >
                                            <Checkbox checked={necklaceSelected}/>
                                            Necklace
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="flex items-center justify-start gap-2 p-2 hover:ring-0 hover:bg-kai-grey"
                                            onClick={(e) => { 
                                                e.preventDefault();
                                                setSetsSelected(!setsSelected);
                                            }}
                                        >
                                            
                                            <Checkbox checked={setsSelected}/>
                                            Sets
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator className="h-[2px] bg-kai-grey"/>
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel className="p-2">By Collection</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="flex items-center justify-start gap-2 p-2 hover:ring-0 hover:bg-kai-grey"
                                                onClick={() => {
                                                    setSelectedCollection("");
                                                }}
                                            >
                                                All
                                            </DropdownMenuItem>
                                        {
                                            collections.map((collection) => (
                                                <DropdownMenuItem
                                                    key={collection.id}
                                                    className="flex items-center justify-start gap-2 p-2 hover:ring-0 hover:bg-kai-grey"
                                                    onClick={() => {
                                                        setSelectedCollection(collection.name);
                                                    }}
                                                >
                                                    {collection.name}
                                                </DropdownMenuItem>
                                            ))
                                        }
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <ProductGrid products={productList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}/>
                    <div className="w-[90%] flex justify-center items-center"> 
                        <div className="w-fit">
                            <Pagination>
                                <PaginationContent>
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink className="active:bg-kai-grey" onClick={() => setCurrentPage(pageNumber)} isActive={currentPage === pageNumber}>
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    
                                    })}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                </section>
                <FooterComponent/>
            </div>
        </main>
    )
}

export default ProductPage