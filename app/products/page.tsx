import React, { Suspense } from 'react'
import ProductPage from "./page-client"
import { getCollections, getProductIds, getProductsById } from "@/functions/mongodb"
import LoadingComponent from "@/components/LoadingComponent";
import MessageComponent from "@/components/MessageComponent";

const ProductPageWrapper = async () => {
    const itemsPerPage = 12;
    // Only get the data for first page of products but send all products to the client
    const productIds = await getProductIds();
    const products = await getProductsById(productIds.slice(0, itemsPerPage));
    const totalPages = Math.ceil(productIds.length / itemsPerPage);

    const collections = await getCollections();

    if (products.length === 0 || collections.length === 0) {
        return (
            <MessageComponent message="Something went wrong"/>
        )
    };
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ProductPage products={products} totalPages={totalPages} ids={productIds} collections={collections} />
        </Suspense>
    )
}

export default ProductPageWrapper