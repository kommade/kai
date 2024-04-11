"use client";

import React, { useEffect, useState } from 'react'
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"
import { useForm } from "react-hook-form"
import { set, z } from "zod"
import { signupFormSchemaPersonal, signupFormSchemaCredentials } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import Link from "next/link";
import { Button } from "./ui/button";
import { checkNewUser, createNewUser } from "@/functions/database";
import { createCustomerIntital, createPortalSession } from "@/functions/stripe";
import { useToast } from "./ui/use-toast";
import { Loader2Icon } from "lucide-react";

const SignUpCycleComponent = () => {
    type partialSignUp = Partial<z.infer<typeof signupFormSchemaPersonal & typeof signupFormSchemaCredentials>>
    const [signUpInfo, setSignUpInfo] = useState<partialSignUp>({})
    const { toast } = useToast()
    const [api, setApi] = useState<CarouselApi>()
    const personalFormRef = React.useRef<HTMLFormElement>(null)
    const authFormRef = React.useRef<HTMLFormElement>(null)
    const [response, setResponse] = useState<string | null>(null)
    const [stripePortal, setStripePortal] = useState<string | null>(null)
    const handleScrollNext = () => {
        if (api?.selectedScrollSnap() === 0) {
            personalFormRef.current?.dispatchEvent(new Event('submit', { bubbles: true }))
        } else if (api?.selectedScrollSnap() === 1) {
            authFormRef.current?.dispatchEvent(new Event('submit', { bubbles: true }))
        }
    }
    const personalForm = useForm<z.infer<typeof signupFormSchemaPersonal>>({
        resolver: zodResolver(signupFormSchemaPersonal),
        defaultValues: {
            first_name: "",
            last_name: ""
        }
    });
    const authForm = useForm<z.infer<typeof signupFormSchemaCredentials>>({
        resolver: zodResolver(signupFormSchemaCredentials),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    const onSubmit = (data: partialSignUp, e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        setSignUpInfo((prev) => ({ ...prev, ...data }))
        if (api?.selectedScrollSnap() === 0) api?.scrollNext();
    }
    useEffect(() => {
        const getStripePortal = async () => {
            if (signupFormSchemaPersonal.safeParse(signUpInfo).success && signupFormSchemaCredentials.safeParse(signUpInfo).success) {
                const newUser = await checkNewUser(signUpInfo.email!)
                if (newUser) {
                    setResponse('')
                    api?.scrollNext()
                    const userInfo = {
                        name: signUpInfo.first_name! + (signUpInfo.last_name ? " " +  signUpInfo.last_name! : ""),
                        email: signUpInfo.email!,
                        password: signUpInfo.password!
                    }
                    const customer_id = await createCustomerIntital(userInfo.name, userInfo.email);
                    if (customer_id) {
                        const newUser = await createNewUser(userInfo.email, userInfo.password, userInfo.name, customer_id)
                        if (newUser) {
                            const portalUrl = await createPortalSession(customer_id)
                            if (portalUrl) {
                                setStripePortal(portalUrl)
                            } else {
                                toast({ description: 'An error occurred. Please try again.', duration: 5000, variant: 'destructive' })
                            }
                        } else {
                            toast({ description: 'An error occurred. Please try again.', duration: 5000, variant: 'destructive' })
                        }
                    }
                } else {
                    setResponse('This email already has an account.')
                }
            }
        }
        getStripePortal()
    }, [signUpInfo])
    return (
        <div className="flex flex-col items-center justify-center">
            <Carousel className="w-[70%] bg-kai-grey rounded-3xl" setApi={setApi}>
                <CarouselContent className="w-full h-[300px]">
                    <CarouselItem>
                        <section className="flex justify-evenly items-center h-full w-full">
                            <div className="flex flex-col w-[50%] items-center">
                                <h3 className="text-2xl">Create a new account</h3>
                                <h3>Enter your name</h3>
                            </div>
                            <Form {...personalForm}>
                                <form ref={personalFormRef} onSubmit={personalForm.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center gap-4 w-[50%]">
                                    <FormField
                                        control={personalForm.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem className="w-full flex flex-col justify-center">
                                                <FormControl className="w-[70%] max-w-[250px]">
                                                    <Input placeholder="First name" autoComplete="given-name" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={personalForm.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem className="w-full flex flex-col justify-center">
                                                <FormControl className="w-[70%] max-w-[250px]">
                                                    <Input placeholder="Last name (optional)" autoComplete="family-name" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </form>
                            </Form>
                        </section>
                    </CarouselItem>
                    <CarouselItem>
                        <section className="flex justify-evenly items-center h-full w-full">
                            <div className="flex flex-col w-[50%] items-center">
                                <h3 className="text-2xl">Choose your login details</h3>
                                <h3>Enter your email and password</h3>
                            </div>
                            <Form {...authForm}>
                                <form ref={authFormRef} onSubmit={authForm.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center gap-4 w-[50%]">
                                    <FormField
                                        control={authForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="w-full flex flex-col justify-center">
                                                <FormControl className="w-[70%] max-w-[250px]">
                                                    <Input placeholder="Email" autoComplete="email" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={authForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="w-full flex flex-col justify-center">
                                                <FormControl className="w-[70%] max-w-[250px]">
                                                    <Input type="password" placeholder="Password" autoComplete="new-password" {...field} />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormMessage>
                                        {response}
                                    </FormMessage>
                                </form>
                            </Form>
                        </section>
                    </CarouselItem>
                    <CarouselItem>
                        <section className="flex justify-evenly items-center h-full w-full">
                            <div className="flex flex-col w-[50%] items-center">
                                <h3 className="text-2xl">Enter billing information</h3>
                                <h3>Your information is not stored with us, but<br/> securely stored using <Button variant={"link"} className="p-0 text-white h-[16px]"><Link href={"stripe.com/en-sg"} target="_blank" rel="noreferrer noopener"><h3>Stripe</h3></Link></Button></h3>
                            </div>
                            <div className="w-[50%] h-[40px] flex justify-evenly items-center">
                                {
                                    stripePortal ? <Button className="w-[150px]" onClick={() => window.open(stripePortal)}>Go to Stripe</Button> :
                                        <Loader2Icon className="animate-spin"/>
                                }
                                <Button className="w-[150px]" variant={"destructive"}>Skip for now</Button>
                            </div>
                        </section>
                    </CarouselItem>
                </CarouselContent>
                <CarouselNext customScrollNext={handleScrollNext}/>
                <CarouselPrevious/>
            </Carousel>
        </div>
    )
}

export default SignUpCycleComponent