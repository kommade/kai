import React, { Suspense } from 'react'
import { ProductData } from '@/components/ProductList';
import { getProductKeyFromId, getProducts } from "@/functions/actions"
import ProductSpecificPage from './page-client';

const ProductSpecificPageWrapper = async ({ params }: { params: { id: string } }) => {
    const productKey = await getProductKeyFromId(params.id);
    const product = await getProducts([productKey]);

    if (!product.success) {
        return <div>Error fetching products</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductSpecificPage product={product.data![0]} />
        </Suspense>
    );
};

export default ProductSpecificPageWrapper;