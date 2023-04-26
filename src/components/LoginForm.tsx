import * as React from "react";
import { Button, TextField } from "@mui/material";

type HookSetter = React.Dispatch<React.SetStateAction<string>>;

export type Creds = {login: string, password: string};
type LoginFormProps = {
	submit: (c: Creds)=>void
}
export default function LoginForm(props: LoginFormProps){
	const [login, setLogin] = React.useState('');
	const [password, setPassword] = React.useState('');

	const handleChange = (f: HookSetter) => {
		return (e: any) => f(e?.target?.value);
	};
	const handleSubmit = (event: any) => {
		event?.preventDefault();
		props.submit({
			login,
			password
		});
	};

	return (<form onSubmit={handleSubmit}>
		<TextField 
			id="login" 
			label="Login" 
			variant="standard" 
			value={login}
			onChange={handleChange(setLogin)}
			required
		/>
		<TextField 
			id="password" 
			label="Password" 
			variant="standard" 
			value={password}
			onChange={handleChange(setPassword)}
			type="password"
			required
		/>
		<Button
			variant="outlined"
			color="primary"
			type="submit"
		>Sign In</Button>
	</form>);
}