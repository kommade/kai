import Link from "next/link"
import React from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import { ShoppingCart } from "lucide-react"

const HeaderComponent = () => {
    return (
        <header className="fixed top-0 left-0 w-full h-[80px] bg-kai-white text-kai-blue shadow z-[10]">
            <div className="w-full h-full px-[20px] flex justify-between items-center">
                <Link href={"/"}>
                    <h1 className="w-fit ml-[30px] text-kai-blue">KAI<br />studios</h1>
                </Link>
                <NavigationMenu className="font-['Breathing'] bg-kai-white">
                    <NavigationMenuList className="flex gap-2">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-kai-white active:bg-kai-grey hover:bg-kai-grey data-[state=open]:bg-accent/0 focus:bg-accent-0">
                                <Link href={"/products"} legacyBehavior passHref>
                                    <NavigationMenuLink className="pl-2">Our Products</NavigationMenuLink>
                                </Link>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-kai-white">
                                <ul className="w-[136px] bg-kai-white text-kai-blue shadow mt-2 p-2 rounded-md">
                                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md">
                                        <Link href={"/products?type=earrings"} legacyBehavior passHref>
                                            <NavigationMenuLink className="pl-2">Earrings</NavigationMenuLink>
                                        </Link>
                                    </li>
                                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                                        <Link href={"/products?type=necklaces"} legacyBehavior passHref>
                                            <NavigationMenuLink className="pl-2">Necklaces</NavigationMenuLink>
                                        </Link>
                                    </li>
                                    <li className="flex h-fit py-2 hover:bg-kai-grey rounded-md" >
                                        <Link href={"/products?type=sets"} legacyBehavior passHref>
                                            <NavigationMenuLink className="pl-2">Sets</NavigationMenuLink>
                                        </Link>
                                    </li>
                                </ul>
                                
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href={"/about"} legacyBehavior passHref>
                                <NavigationMenuLink>About us</NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href={"/cart"} legacyBehavior passHref>
                                <NavigationMenuLink>
                                    <ShoppingCart className="stroke-kai-blue ml-4" />
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    )
}

export default HeaderComponent