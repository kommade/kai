export type ProductData = {
    collection: string;
    type: string;
    name: string;
    images: string[];
    description: string;
    price: string;
};

export type User = {
    id: string;
    role: string;
    hash: string;
    last: string;
};
