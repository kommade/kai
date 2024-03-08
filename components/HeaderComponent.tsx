import Link from "next/link"
import React from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"

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
                            <NavigationMenuTrigger className="bg-kai-white active:bg-kai-grey hover:bg-kai-grey data-[state=open]:bg-accent/0 focus:bg-accent-0">Our Products</NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-kai-white">
                                <ul className="w-[136px] bg-kai-white text-kai-blue shadow mt-2 p-2 group-hover:block rounded-sm">
                                    <li>
                                        <Link className="flex h-fit py-2 hover:bg-kai-grey rounded-sm" href={"/products?type=earrings"} passHref>
                                            <NavigationMenuLink className="pl-2">Earrings</NavigationMenuLink>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="flex h-fit py-2 hover:bg-kai-grey rounded-sm" href={"/products?type=necklaces"} passHref>
                                            <NavigationMenuLink className="pl-2">Necklaces</NavigationMenuLink>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="flex h-fit py-2 hover:bg-kai-grey rounded-sm" href={"/products?type=sets"} passHref>
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
                                    <svg className="fill-kai-blue" preserveAspectRatio="xMidYMid meet" width={32} height={32} version="1.0" viewBox="-4.8 -1.1 837.0 802.8" zoomAndPan="magnify"><g id="__id174_s7c1xijv3h"><path d="M763.14,489.45c19.89-106.85,42.96-213.1,63.07-319.88c6.01-32.2-12.17-73.38-47.34-78.5 c-15.51-4.3-33.69,12.24-27.31,28.05c2,13.28,17.14,14.77,27.31,18.18c3.12,8.61,8.83,17.51,5.19,27.08 c-2.24,11.46-4.57,22.91-6.83,34.37H259.35c-10.24,0-18.55,8.3-18.55,18.55c0,10.25,8.31,18.55,18.55,18.55h510.5 c-13.85,69.5-27.86,138.99-41.51,208.56c-3.04,14.47-5.19,29.38-11.28,43.04c-10.91,4.23-23.08,2.08-34.43,2.67 c-134.67-0.37-269.35-0.07-403.94-0.15c-34.21-145.88-67.97-291.83-102.25-437.71c-4.38-27.53-27.9-52.9-57.13-51.87 C84.36,0.55,49.33-1.09,14.46,1.36c-19.22,6.6-19.22,35.02-0.37,42.22c36.8,3.49,73.98-0.96,110.78,2.15 c8.83,4.3,7.2,16.55,10.61,24.56c40.22,173.41,80.8,346.74,121.76,520.07c5.27,28.27,32.2,50.83,61.44,48.01 c143.8-0.22,287.6,0.52,431.32-0.37c27.45,0.89,27.6-44.45,0.15-43.78c-128.96-0.89-257.99-0.22-386.95-0.37 c-19.37-0.45-39.03,1.78-58.17-2.08c-8.53-18.03-10.83-38.21-15.95-57.28c138.61,0,277.21,0.07,415.82,0 C731.83,536.79,759.13,516.38,763.14,489.45z"/><path d="M334.56,654.77c-25.38,4.97-46.45,26.12-51.35,51.49c-8.31,34.95,16.62,73.09,52.09,79.1 c36.73,8.46,76.13-19.89,79.25-57.51C421.52,684.3,377.3,643.86,334.56,654.77z M366.76,732.16c-7.12,11.72-25.23,14.02-34.21,3.12 c-12.32-10.91-5.57-32.72,9.79-36.58C360.6,691.72,379.67,716.8,366.76,732.16z"/><path d="M661.71,654.62c-48.6,7.42-70.79,73.24-37.4,108.93c30.13,38.14,98.32,26.34,113.16-20.26 C757.05,696.91,710.6,642.3,661.71,654.62z M687.01,738.39c-22.78,17.73-49.34-22.71-24.26-36.8 C685.53,683.78,712.24,724.29,687.01,738.39z"/></g></svg>
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