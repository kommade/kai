import React, { Suspense } from 'react'
import ProductPage from "./page-client"
import { getCollections, getProductKeys, getProducts } from "@/functions/database"

const ProductPageWrapper = async () => {
    const itemsPerPage = 12;
    // Only get the data for first page of products but send all products to the client
    const productKeys = await getProductKeys();
    const products = await getProducts(productKeys.slice(0, itemsPerPage));
    const totalPages = Math.ceil(productKeys.length / itemsPerPage);

    const collections = await getCollections();

    if (!products.success) {
        return (
            <div>Error fetching products</div>
        )
    };
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductPage products={products.data!} totalPages={totalPages} keys={productKeys} collections={collections} />
        </Suspense>
    )
}

export default ProductPageWrapper