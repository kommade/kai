import React, { Suspense } from 'react'
import { getProductByUrl } from "@/functions/mongodb"
import ProductSpecificPage from './page-client';
import LoadingComponent from "@/components/LoadingComponent";
import MessageComponent from "@/components/MessageComponent";

const ProductSpecificPageWrapper = async ({ params }: { params: { url: string } }) => {
    const product = await getProductByUrl(params.url);

    if (product.length === 0) {
        return <MessageComponent message="Something went wrong"/>;
    }

    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ProductSpecificPage product={product[0]} />
        </Suspense>
    );
};

export default ProductSpecificPageWrapper;