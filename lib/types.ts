import Stripe from "stripe";

namespace Kai {
    export type ProductData = {
        id: string // This is the id in the URL
        key: string; // This is the key in the database
        collection: string;
        type: string;
        name: string;
        images: string[];
        desc: string;
        price: string;
        options: string | ProductOptions;
        stripeId: string;
    };

    export type ProductOptions = {
        [option: string]: string[];
    };

    export type ProductInCart = {
        product: {
            key: string;
            collection: string;
            name: string;
            fullName: string;
            type: string;
            price: string;
            image: string;
            options: SelectedProductOptions;
            stripeId: string;
        }
        stringified: string;
        count: number;
        total: number;
    }

    export type SelectedProductOptions = {
        [option: string]: string;
    };

    export type Cart = {
        items: ProductInCart[]
        total: number
    };

    export type User = {
        email: string;
        hash: string;
        role: string;
        last: string;
    };

    export type CheckoutSession = {
        status: string;
        address: Stripe.Address;
        customer_name: string
    }
}

export default Kai;