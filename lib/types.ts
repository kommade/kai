import Stripe from "stripe";
import { products, productOptions, orders, carts, users, collections, Prisma, CartItems } from "@prisma/client";

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
    export type Collection = collections

    export type ProductId = string

    export type Product = products

    export type ProductInCart = CartItems

    const productWithCollection = Prisma.validator<Prisma.productsDefaultArgs>()({
        include: { collection: true }
    })

    export type ProductWithCollection = Prisma.productsGetPayload<typeof productWithCollection>

    const productWithCollectionOptions = Prisma.validator<Prisma.productsDefaultArgs>()({
        include: { collection: true, options: true }
    })

    export type ProductWithCollectionOptions = Prisma.productsGetPayload<typeof productWithCollectionOptions>

    export type ProductWithShortCollectionOptions = ExpandRecursively<Omit<ProductWithCollectionOptions, 'collection' | 'options'> & { collection: Pick<Collection, 'name'>, options: Pick<ProductOptions, 'name' | 'selection'>[]}>

    export type SelectedOptions = number[]

    export type ProductOptions = productOptions

    export type Cart = carts & ({ session_id: string;  userId?: null } | { session_id?: null; userId: string })

    export type User = users

    const userWithCartOrders = Prisma.validator<Prisma.usersDefaultArgs>()({
        include: { cart: true, orders: true }
    })

    export type UserWithCartOrders = Prisma.usersGetPayload<typeof userWithCartOrders>;
    
    export type UserResult =
    | { loggedIn: false; user: string }
    | { loggedIn: true; user: Kai.User };

    export type CheckoutSession = {
        payment_status: string;
        address: Expand<Stripe.Address>;
        customer_name: string
        customer_email: string
        payment_id: string,
        amount_total: number,
        invoice_id: string,
    }
    
    export type Order = orders & ({ customer: Customer; userId?: null } | { customer?: null; userId: string });
    export type Orders = Record<string, Kai.Order>;

    export type Customer = {
        name: string;
        email: string;
    }
}

export default Kai;