import React, { Suspense } from 'react'
import HomePage from "./page-client"
import { getHomeProductImages } from "@/functions/database"
import LoadingComponent from "@/components/LoadingComponent";

const HomePageWrapper = async () => {
    const covers = await getHomeProductImages();
    return (
        <Suspense fallback={<LoadingComponent/>}>
            <HomePage covers={covers} />
        </Suspense>
    )
}

export default HomePageWrapper