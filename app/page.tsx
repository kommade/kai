import React, { Suspense } from 'react'
import HomePage from "./page-client"
import { getHomeProductImages } from "@/functions/database"
import MessageComponent from "@/components/MessageComponent";

const HomePageWrapper = async () => {
    const covers = await getHomeProductImages();
    return (
        <Suspense fallback={<MessageComponent message="Loading..."/>}>
            <HomePage covers={covers} />
        </Suspense>
    )
}

export default HomePageWrapper