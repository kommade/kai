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
    type e = CartItems
    export type ProductInCart = ExpandRecursively<{
        product: Omit<
                    Omit<
                        ProductWithCollectionOptions, 'collection' | 'options'
                    > & {
                        collection: Pick<Collection, 'name'>,
                        options: Pick<ProductOptions, 'name' | 'selection'>[]
                    },
                    "desc" | "collection_id" | "images" | "option_ids"
                > & { image: string };
        selected_options: SelectedOptions;
        count: number;
        total: number;
        selection_id: string;
    }>

    const productWithCollection = Prisma.validator<Prisma.productsDefaultArgs>()({
        include: { collection: true }
    })

    export type ProductWithCollection = Prisma.productsGetPayload<typeof productWithCollection>

    const productWithCollectionOptions = Prisma.validator<Prisma.productsDefaultArgs>()({
        include: { collection: true, options: true }
    })

    export type ProductWithCollectionOptions = Prisma.productsGetPayload<typeof productWithCollectionOptions>
    
    export type SelectedOptions = number[]

    export type ProductOptions = productOptions

    export type Cart = carts & ({ session_id: string; user_id?: null } | { session_id?: null; user_id: string })
    export type CartWithProducts = Expand<Omit<Cart, "items"> & { items: ProductInCart[] }>

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

    export type Order = orders & { user?: users | null }
    export type OrderWithProducts = Expand<Omit<Order, "items"> & { items: (ProductInCart | null)[] }>

    export type Customer = {
        name: string;
        email: string;
    }
}

export default Kai;