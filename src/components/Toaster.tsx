import * as React from "react";
import { Alert, Stack, Snackbar } from "@mui/material";

export type ToastData = {
	message: string,
	expirationMs?: number,
	type?: "info" | "success" | "warning" | "error"
};

type ToasterProps = {
	toasts: ToastData[]
};

export default function Toaster(props: ToasterProps) {
	const [open, setOpen] = React.useState(false);

	// const handleClick = () => {
	// 	setOpen(true);
	// };

	setOpen(false);
	return (
		<Stack spacing={2} sx={{ width: '100%' }}>
			<Snackbar open={open} autoHideDuration={6000}>
				<>{props.toasts.map((t, i) => 
					<Alert key={i} severity={t.type || "info"} sx={{ width: '100%' }}>
						{t.message}
					</Alert>
				)}</>
			</Snackbar>
		</Stack>
	);
}
