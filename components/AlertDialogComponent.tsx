"use client"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
	variant?: "primary" | "danger",
	open: boolean,
	headerText: string,
	descriptionText: string,
	cancelText?: string,
	actionText?: string,
	close: () => void,
	action: () => void
};

export function AlertDialogComponent({
	open,
	headerText,
	descriptionText,
	cancelText = "Cancel",
	actionText = "Continue",
	close,
	action
}: Props) {
	return (
		<AlertDialog open={open}>
			<AlertDialogContent className="bg-kai-white">
				<AlertDialogHeader>
					<AlertDialogTitle className="font-['TT_Chocolates']">{headerText}</AlertDialogTitle>
					<AlertDialogDescription>
						{descriptionText}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={close} className="bg-kai-white border-0">{cancelText}</AlertDialogCancel>
					<AlertDialogAction onClick={action} className="bg-kai-red hover:bg-kai-red/80">{actionText}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
    