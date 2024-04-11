import React from 'react';
import FooterComponent from '@/components/FooterComponent';
import HeaderComponent from '@/components/HeaderComponent';
import SignUpCycleComponent from "@/components/SignUpCycleComponent";

const SignUpPage = () => {
    return (
        <main className='flex flex-col items-center justify-between min-h-screen'>
            <div className='w-full h-fit min-h-[100vh] min-w-[1024px] relative flex flex-col'>
                <HeaderComponent/>
                <section className='mt-[80px] min-h-[calc(100vh-_140px)] w-full h-fit flex flex-col justify-start items-center py-6'>
                    <div className="w-[90%] justify-between flex flex-col gap-4">
                        <h2 className="text-center w-fit text-[24px]">SIGNUP</h2>
                        <SignUpCycleComponent/>
                    </div>
                </section>
                <FooterComponent />
            </div>
        </main>
    )
}

export default SignUpPage;