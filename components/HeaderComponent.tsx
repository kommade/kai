"use client";
import Link from "next/link"
import React, { useEffect } from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import { CircleUserRound, ShoppingCart } from "lucide-react"
import { ifLoggedInGetUser, logout } from "@/functions/auth";
import Kai from "@/lib/types";
import { useRouter } from "next/navigation";

const HeaderComponent = () => {
    const [user, setUser] = React.useState<Kai.User | null>(null);
    const router = useRouter();
    useEffect(() => {
        const fetchLoggedIn = async () => {
            const auth = await ifLoggedInGetUser();
            if (auth.loggedIn) {
                setUser(auth.user)
            }
        }
        fetchLoggedIn();
    }, [])

    const profileMenuContent = (user: Kai.User | null) => {
        if (user?.role === "admin") {
            return (
                <ul className="min-w-[148px] bg-kai-white text-kai-blue shadow p-2 rounded-md">
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                        <Link href={"/dashboard"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2">
                                <h3>Admin Dashboard</h3>
                            </NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                        <Link href={`https://dashboard.stripe.com${process.env.NODE_ENV === "production" ? "" : "/test"}`} legacyBehavior passHref>
                            <NavigationMenuLink target="_blank" rel="noopener noreferrer" className="pl-2"><h3>Stripe Dashboard</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <Link href={"/dashboard/orders"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>View Orders</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <Link href={"/"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>View Users</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <NavigationMenuLink onClick={() => { logout(); router.push("/")}} className="pl-2"><h3>Logout</h3></NavigationMenuLink>
                    </li>
                </ul>
            )
        } else if (user?.role === "user") {
            return (
                <ul className="min-w-[148px] bg-kai-white text-kai-blue shadow p-2 rounded-md">
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <Link href={"/account"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>View Account</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <Link href={"/account/orders"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>View My Orders</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                        <Link href={"/cart"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>My Cart</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <NavigationMenuLink onClick={() => { logout(); router.push("/") }} className="pl-2"><h3>Logout</h3></NavigationMenuLink>
                    </li>
                </ul>
            )
        } else {
            return (
                <ul className="min-w-[148px] bg-kai-white text-kai-blue shadow p-2 rounded-md">
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                        <Link href={"/login"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2">
                                <h3>Login</h3>
                            </NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                        <Link href={"/dashboard/orders"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>Create Account</h3></NavigationMenuLink>
                        </Link>
                    </li>
                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                        <Link href={"/cart"} legacyBehavior passHref>
                            <NavigationMenuLink className="pl-2"><h3>My Cart</h3></NavigationMenuLink>
                        </Link>
                    </li>
                </ul>
            )
        }
    
    }

    return (
        <header className="fixed top-0 left-0 w-full h-[80px] bg-kai-white text-kai-blue shadow z-[10]">
            <div className="w-full h-full px-[20px] flex justify-between items-center">
                <Link href={"/"}>
                    <h1 className="w-fit ml-[30px] text-kai-blue">KAI<br />studios</h1>
                </Link>
                <div className="flex gap-4">
                    <NavigationMenu className="font-['Breathing'] bg-kai-white">
                        <NavigationMenuList className="flex gap-2">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-kai-white active:bg-kai-grey hover:bg-kai-grey data-[state=open]:bg-accent/0 focus:bg-accent-0">
                                    <Link href={"/products"} legacyBehavior passHref>
                                        <NavigationMenuLink className="pl-2"><h3>Our Products</h3></NavigationMenuLink>
                                    </Link>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-kai-white">
                                    <ul className="w-[136px] bg-kai-white text-kai-blue shadow p-2 rounded-md">
                                        <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                                            <Link href={"/products?type=earrings"} legacyBehavior passHref>
                                                <NavigationMenuLink className="pl-2"><h3>Earrings</h3></NavigationMenuLink>
                                            </Link>
                                        </li>
                                        <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                                            <Link href={"/products?type=necklaces"} legacyBehavior passHref>
                                                <NavigationMenuLink className="pl-2"><h3>Necklaces</h3></NavigationMenuLink>
                                            </Link>
                                        </li>
                                        <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                                            <Link href={"/products?type=sets"} legacyBehavior passHref>
                                                <NavigationMenuLink className="pl-2"><h3>Sets</h3></NavigationMenuLink>
                                            </Link>
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href={"/about"} legacyBehavior passHref>
                                    <NavigationMenuLink className="flex justify-center items-center"><h3 className="h-[20px]">About us</h3></NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    <NavigationMenu className="font-['Breathing'] bg-kai-white">
                        <NavigationMenuList className="flex">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-kai-white active:bg-kai-grey hover:bg-kai-grey data-[state=open]:bg-accent/0 focus:bg-accent-0">
                                    <div className="min-w-[100px] flex items-center justify-evenly">
                                        <CircleUserRound className="stroke-kai-blue" />
                                        <h3 className="mx-2">{user?.name ?? "Account"}</h3>
                                    </div>
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="bg-kai-white">
                                    {profileMenuContent(user)}
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
        </header>
    )
}



export default HeaderComponent