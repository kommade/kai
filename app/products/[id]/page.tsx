import React, { Suspense } from 'react'
import { ProductData } from '@/components/ProductList';
import { getProductKeys, getProducts } from "@/functions/actions"
import ProductSpecificPage from './page-client';

const ProductSpecificPageWrapper = async ({ id }: { id: number }) => {
  const productKeys = await getProductKeys();
  const products = await getProducts(productKeys);

  if (!products.success) {
      return <div>Error fetching products</div>;
  }

  return (
      <Suspense fallback={<div>Loading...</div>}>
          <ProductSpecificPage product={products.data![id]} />
      </Suspense>
  );
};

export default ProductSpecificPageWrapper;