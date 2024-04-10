import React, { Suspense } from 'react'
import { getProductByUrl } from "@/functions/database"
import ProductSpecificPage from './page-client';
import LoadingComponent from "@/components/LoadingComponent";
import MessageComponent from "@/components/MessageComponent";
import { isLoggedIn } from "@/functions/auth";

const ProductSpecificPageWrapper = async ({ params }: { params: { url: string } }) => {
    const product = await getProductByUrl(params.url);
    const loggedIn = await isLoggedIn();

    if (!product) {
        return <MessageComponent message="Something went wrong"/>;
    }

    return (
        <Suspense fallback={<LoadingComponent/>}>
            <ProductSpecificPage product={product} loggedIn={loggedIn} />
        </Suspense>
    );
};

export default ProductSpecificPageWrapper;