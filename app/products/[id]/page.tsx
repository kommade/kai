import React, { Suspense } from 'react'
import { getProductKeyFromId, getProducts } from "@/functions/database"
import ProductSpecificPage from './page-client';
import LoadingComponent from "@/components/LoadingComponent";

const ProductSpecificPageWrapper = async ({ params }: { params: { id: string } }) => {
    const productKey = await getProductKeyFromId(params.id);
    const product = await getProducts([productKey]);

    if (!product.success) {
        return <MessageComponent message="Something went wrong"/>;
    }

    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ProductSpecificPage product={product.data![0]} />
        </Suspense>
    );
};

export default ProductSpecificPageWrapper;