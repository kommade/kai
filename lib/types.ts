export type ProductData = {
    id: string // This is the id in the URL
    key: string; // This is the key in the database
    collection: string;
    type: string;
    name: string;
    images: string[];
    desc: string;
    price: string;
};

export type User = {
    id: string;
    role: string;
    hash: string;
    last: string;
};

export type Cart = (ProductData & { count: number, total: number, fullName: string })[];
