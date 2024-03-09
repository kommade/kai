export type ProductData = {
    id: string
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

export type Cart = (ProductData & { count: number, total: number, fullName: string })[];
