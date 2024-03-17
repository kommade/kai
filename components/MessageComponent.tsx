"use client";

import FooterComponent from "./FooterComponent"
import HeaderComponent from "./HeaderComponent";

const MessageComponent = ({ message }: { message: string }) =>  (
        <main className="flex flex-col items-center justify-between min-h-screen">
            <div className="w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col">
                <HeaderComponent />
                <h3 className="mt-[80px] min-h-[calc(100vh-_140px)] text-lg w-full h-fit flex flex-col justify-center items-center">
                    {message}
                </h3>
                <FooterComponent />
            </div>
        </main>
    )

export default MessageComponent