"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, Form, FormMessage } from "./ui/form"
import { shippingFormSchema, shippingProviders } from "@/lib/zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { setShippingDetails } from "@/functions/database";
import { useToast } from "./ui/use-toast";



export function InputShippingDetailsComponent({ open, close, action }: { open: boolean, close: () => void, action: (shippingDetails: z.infer<typeof shippingFormSchema>) => void }) {
    const form = useForm<z.infer<typeof shippingFormSchema>>({
        resolver: zodResolver(shippingFormSchema),
        defaultValues: {
            shipping_provider: shippingProviders[0],
            tracking_number: ""
        }
    });

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-['TT_Chocolates']">Input Shipping Information</DialogTitle>
                    <DialogDescription>
                        This will be shown to the customer when they view their order.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(action)} className="w-full flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="shipping_provider"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Provider</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Provider" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tracking_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tracking Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="RA000000000SG" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button className="mt-4" type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
