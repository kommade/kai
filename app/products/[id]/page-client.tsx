'use client';

import React from 'react';
import HeaderComponent from '@/components/HeaderComponent';
import FooterComponent from '@/components/FooterComponent';
import { ProductData } from '@/components/ProductList';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductKeyFromId, getProducts } from '@/functions/actions';

const ProductSpecificPage = ({ product }: { product: ProductData }) => {
    const { name, desc, images, collection } = product;
    const [mainImage, setMainImage] = useState(images[0]);
    const [quantity, setQuantity] = useState(1);
    const [selectedStud, setSelectedStud] = useState('SSS');
    const [price, setPrice] = useState(product.price);
    const [activeTab, setActiveTab] = useState('description');

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleImageClick = (image : string) => {
      setMainImage(image);
    };

    const handleQuantityChange = (value: number) => {
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleStudChange = (value : string) => {
        setSelectedStud(value)
        console.log(`${value} Studs Chosen`);
    };

    const handleAddToCart = () => {
        console.log(`Added ${quantity} items to the cart.`);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent />
                <section className="mt-[80px] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-top">
                        <div className="mb-6 md:mr-6">
                            <img src={mainImage} alt={name} className="object-cover mb-2" style={{ width: '400px', height: '400px' }}/>
                            <div className="flex space-x-2">
                                {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={name}
                                    className="w-16 h-16 cursor-pointer border border-kai-grey object-cover"
                                    onClick={() => handleImageClick(image)}
                                />
                                ))}
                            </div>
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-2xl mb-2">{collection} {name}</h3>
                            <h3 className="text-lg mb-2">{price}</h3>
                            <div className="w-auto h-auto mb-5 relative">
                                <div className="mb-2">
                                    <button
                                        className={`mr-2`}
                                        onClick={() => handleTabChange('description')}
                                    >
                                        <h3 className={`${activeTab === 'description' ? 'text-kai-blue' : 'text-gray-400'}`}>Description</h3>
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('productCare')}
                                    >
                                        <h3 className={`${activeTab === 'productCare' ? 'text-kai-blue' : 'text-gray-400'}`}>Product Care</h3>
                                    </button>
                                </div>
                                {activeTab === 'description' && (
                                    <>
                                        <h3 className="text-gray-600 mb-4">{desc}</h3>
                                    </>
                                )}

                                {activeTab === 'productCare' && (
                                    <>
                                        <h3>Our items are crafted from polymer clay, hence it&apos;s important to handle them with care. Avoid dropping or crushing your jewelry :( Each piece is meticulously created by hand, ensuring its uniqueness. Cherish and proudly showcase them to flaunt their looks!</h3>
                                    </>
                                )}
                            </div>
                            <h3 className="text-bold mb-2">Studs</h3>
                            <div className='flex gap-2 mb-2'>
                                <button className={`border rounded-md p-1 hover:bg-kai-white transition-colors ${selectedStud === 'SSS' ? 'border-kai-blue' : 'border-kai-grey'}`}
                                    onClick={() => handleStudChange('SSS')}
                                >
                                    <h3>Stainless Steel Silver</h3>
                                </button>
                                <button className={`border rounded-md p-1 hover:bg-kai-white transition-colors ${selectedStud === 'SSG' ? 'border-kai-blue' : 'border-kai-grey'}`}
                                    onClick={() => handleStudChange('SSG')}
                                >
                                    <h3>Stainless Steel Gold</h3>
                                </button>
                                <button className={`border rounded-md p-1 hover:bg-kai-white transition-colors ${selectedStud === '925S' ? 'border-kai-blue' : 'border-kai-grey'}`}
                                    onClick={() => handleStudChange('925S')}
                                >
                                    <h3>925 Sliver</h3>
                                </button>
                            </div>
                            <h3 className="text-bold mb-2">Quantity</h3>
                            <div className="flex items-center mb-2">
                                <button className="w-8 h-8 border border-kai-blue rounded-md hover:bg-kai-white transition-colors" disabled={quantity===1} onClick={() => handleQuantityChange(quantity - 1)}>-</button>
                                <h3 className="mx-2">{quantity}</h3>
                                <button className="w-8 h-8 border border-kai-blue rounded-md hover:bg-kai-white transition-colors " onClick={() => handleQuantityChange(quantity + 1)}>+</button>
                                <button className={`w-24 h-8 ${quantity <= 0 ? 'bg-kai-grey cursor-not-allowed' : 'bg-kai-blue'} rounded-md ml-2`}
                                    onClick={handleAddToCart} disabled={quantity <= 0}>
                                    <h3 className="text-white" >Add to cart</h3>
                                </button>
                                <button className={`border w-24 h-8 ${quantity <= 0 ? 'bg-kai-grey cursor-not-allowed' : 'border-kai-blue'} rounded-md ml-2`}
                                    onClick={handleAddToCart} disabled={quantity <= 0}>
                                    <h3 className="text-kai-blue" >Buy now</h3>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    );
};

export default ProductSpecificPage;