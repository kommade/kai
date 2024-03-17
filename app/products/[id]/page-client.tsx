'use client';

import React, { useEffect } from 'react';
import HeaderComponent from '@/components/HeaderComponent';
import FooterComponent from '@/components/FooterComponent';;
import { useState } from 'react';
import Kai from "@/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { changeProductNumberInCart } from "@/functions/database";
import { getSessionIdAndCreateIfMissing } from "@/functions/sessions";

const ProductSpecificPage = ({ product }: { product: Kai.ProductData }) => {
    const { name, desc, images, collection, price, options } = product;
    const [mainImage, setMainImage] = useState(images[0]);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Kai.SelectedProductOptions>(Object.fromEntries(Object.entries(options).map(([option, values]) => [option, values[0]])));
    const [activeTab, setActiveTab] = useState('description');
    const [transition, setTransition] = useState(false);
    const [sessionId, setSessionId] = useState<string>("");

    useEffect(() => {
        const fetchSessionId = async () => {
            const sessionId = await getSessionIdAndCreateIfMissing();
            setSessionId(sessionId);
        };
        fetchSessionId();
    }, []);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleImageClick = (image: string) => {
        setTransition(true);
        setTimeout(() => {
            setMainImage(image);
            setTransition(false);
        }, 300);
    };

    const handleQuantityChange = (value: number) => {
        if (value >= 1) {
            setQuantity(value);
        }
    };

    const handleAddToCart = () => {
        const nestedProduct = {
            key: product.key,
            collection,
            name,
            fullName: `${collection} - ${name}`,
            type: product.type,
            price,
            image: images[0],
            options: selectedOptions
        };
        const productInCart: Kai.ProductInCart = {
            product: nestedProduct,
            stringified: JSON.stringify(nestedProduct),
            count: quantity,
            total: parseInt(price) * quantity
        };
        changeProductNumberInCart(sessionId, productInCart, quantity);
    };

    return (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent />
                <section className="mt-[80px] w-full h-fit flex flex-col justify-start items-center py-6">
                    <div className="flex flex-col max-w-4xl mx-auto md:flex-row items-top">
                        <div className="mb-6 md:mr-6">
                            <Image src={mainImage} alt={name} className={`object-cover mb-2 w-[400px] h-[400px] transition-opacity ${ transition ? "opacity-50": "opacity-100"}`} width={400} height={400} sizes="400px" priority/>
                            <div className="flex space-x-2">
                                {
                                    images.map((image, index) => (
                                        <Image
                                            key={index}
                                            src={image}
                                            alt={name}
                                            className="object-cover w-16 h-16 transition-all border cursor-pointer border-kai-grey hover:brightness-90"
                                            width={64}
                                            height={64}
                                            sizes="64px"
                                            onClick={() => handleImageClick(image)}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                        <div className="max-w-md">
                            <h3 className="mb-2 text-2xl">{collection} {name}</h3>
                            <h3 className="mb-2 text-lg">{price}</h3>
                            <div className="relative w-auto h-auto mb-5">
                                <div className="mb-2">
                                    <Button variant={"secondary"}
                                        className={`mr-2 bg-kai-white`}
                                        onClick={() => handleTabChange('description')}
                                    >
                                        <h3 className={`${activeTab === 'description' ? 'text-kai-blue' : 'text-gray-400'}`}>Description</h3>
                                    </Button>
                                    <Button variant={"secondary"}
                                        className="bg-kai-white"
                                        onClick={() => handleTabChange('productCare')}
                                    >
                                        <h3 className={`${activeTab === 'productCare' ? 'text-kai-blue' : 'text-gray-400'}`}>Product Care</h3>
                                    </Button>
                                </div>
                                {activeTab === 'description' && (
                                    <>
                                        <h3 className="mb-4 text-gray-600">{desc}</h3>
                                    </>
                                )}

                                {activeTab === 'productCare' && (
                                    <>
                                        <h3>Our items are crafted from polymer clay, hence it&apos;s important to handle them with care. Avoid dropping or crushing your jewelry :( Each piece is meticulously created by hand, ensuring its uniqueness. Cherish and proudly showcase them to flaunt their looks!</h3>
                                    </>
                                )}
                            </div>
                            {
                                Object.entries(options as Kai.ProductOptions).map(([option, values]) => (
                                    <React.Fragment key={option}>
                                        <h3 className="mb-2 text-bold">{option}</h3>
                                        <div className='flex gap-2 mb-2'>
                                            {
                                                values.map((value) => (
                                                    <Button
                                                        key={value}
                                                        variant={"outline"}
                                                        className={`${selectedOptions[option] === value ? '' : 'border-kai-grey'}`}
                                                        onClick={() => setSelectedOptions({ ...selectedOptions, [option]: value })}
                                                    >
                                                        <h3>{value}</h3>
                                                    </Button>
                                                ))
                                            }
                                        </div>
                                    </React.Fragment>
                                ))
                            }
                            <h3 className="mb-2 text-bold">Quantity</h3>
                            <div className="flex items-center gap-4 mb-2">
                                <Button variant={"outline"} className="w-8 h-8 text-lg rounded-full" disabled={quantity===1} onClick={() => handleQuantityChange(quantity - 1)}>-</Button>
                                <h3 className="text-lg">{quantity}</h3>
                                <Button variant={"outline"} className="w-8 h-8 text-lg rounded-full" onClick={() => handleQuantityChange(quantity + 1)}>+</Button>
                            </div>
                            <div className="flex items-center gap-4 mt-5">
                                <Button variant={"default"} className={`w-24 h-8 ${quantity <= 0 ? 'bg-kai-grey cursor-not-allowed' : 'bg-kai-blue'} rounded-md`}
                                    onClick={handleAddToCart}>
                                    <h3 className="text-white" >Add to cart</h3>
                                </Button>
                                <Button variant={"outline"} className={`w-24 h-8 ${quantity <= 0 ? 'bg-kai-grey cursor-not-allowed' : 'border-kai-blue'} rounded-md`}
                                    onClick={handleAddToCart}>
                                    <h3 className="text-kai-blue" >Buy now</h3>
                                </Button>
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