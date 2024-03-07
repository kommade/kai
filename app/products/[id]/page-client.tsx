import React from 'react';
import HeaderComponent from '@/components/HeaderComponent';
import FooterComponent from '@/components/FooterComponent';
import { ProductData } from '@/components/ProductList';
import Link from 'next/link';

const ProductSpecificPage = ({ product }: { product: ProductData }) => {
    const { name, description, price, images } = product;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent />
                <section className="mt-[80px] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <img src={images[0]} alt={name} className="w-full h-auto" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">{name}</h2>
                        <p className="text-gray-600 mb-4">{description}</p>
                        <p className="text-lg font-bold mb-2">{price}</p>
                        {/* Add additional product details as needed */}
                    </div>
                    <Link href="/products" className="bg-blue-500 text-white py-2 px-4 rounded-full mt-4 inline-block">
                        <h2>Back to Products</h2>
                    </Link>
                </section>
                <FooterComponent />
            </div>
        </main>
    );
};

export default ProductSpecificPage;
