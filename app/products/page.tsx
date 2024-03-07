import React, { Suspense } from 'react'
import ProductPage from "./page-client"
import { getProductKeys, getProducts } from "@/functions/actions"

export const itemsPerPage = 12;

const ProductPageWrapper = async () => {
    // Only get the data for first page of products but send all products to the client
    const productKeys = await getProductKeys();
    const products = await getProducts(productKeys.slice(0, itemsPerPage));
    const totalPages = Math.ceil(productKeys.length / itemsPerPage);

    if (!products.success) {
        return (
            <div>Error fetching products</div>
        )
    };
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductPage products={products.data!} totalPages={totalPages} keys={productKeys}/>
        </Suspense>
    )
}

export default ProductPageWrapper