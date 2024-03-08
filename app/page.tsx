import React, { Suspense } from 'react'
import HomePage from "./page-client"
import { getHomeProductImages } from "@/functions/database"

const HomePageWrapper = async () => {
    const covers = await getHomeProductImages();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePage covers={covers} />
        </Suspense>
    )
}

export default HomePageWrapper