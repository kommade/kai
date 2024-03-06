import { useEffect, useState } from 'react';
import ProductItem from './productItem';
import getProducts from '../database'
// import { type ProductListItemFragment } from "@/gql/graphql";

export const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }

    fetchProducts();
  }, []);

  return (
    <ul role="list" data-testid="ProductList" className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductItem
          key={product.key}
          imageUrl={product.imageurl}
          description={product.description}
          price={product.price}
          priority={index < 2}
          loading={index < 3 ? "eager" : "lazy"}
        />
      ))}
    </ul>
  );
}