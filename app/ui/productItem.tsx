import React from 'react';

const ProductItem = ({ imageUrl, productName, description, price }) => {
  return (
    <div className="container mx-auto mt-8 p-4 bg-white shadow-md rounded-lg max-w-md">
      <img src={imageUrl} alt="Product Image" className="w-full h-48 object-cover mb-4 rounded-md" />
      <h2 className="text-xl font-semibold mb-2">{productName}</h2>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold text-gray-800">${price.toFixed(2)}</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Buy Now</button>
      </div>
    </div>
  );
};

export default ProductItem;

