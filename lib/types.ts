import Stripe from "stripe";

export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
    : T;
  
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
        payment_status: string;
        address: Expand<Stripe.Address>;
        customer_name: string
        customer_email: string
        payment_id: string,
        amount_total: number
    }

    export type UserResult =
        | { loggedIn: false; user: string }
        | { loggedIn: true; user: Kai.User };
    
    export type Order = ExpandRecursively<CheckoutSession> & Omit<Cart, 'total'> & {
        order_status: "pending" | "shipped" | "delivered" | "cancelled";
        shipping_provider?: string;
        tracking_number?: string;
    };

    export type Orders = Record<string, Kai.Order>;
}

export default Kai;