import * as React from "react";
//import { Box, Tab } from "@mui/material";
import TabPage from "./components/TabPage";
import type { TabData } from "./components/TabPage";
import { api } from "./utils";
//import type { APIResponse } from "./utils";

let once = true;

export default function App() {
	const [tab, setTab] = React.useState("b");
	const [l, setL] = React.useState(false);
	const [loading, setLoading] = React.useState(true);

	if (once){
		once = false;
		api("greet", {page: 0}).then(r => {
			setLoading(false);
			console.log(r);
		});
	}

	const login = () => {
		setL(true)
		setTab("b");
	}
	const tabs: TabData[] = [
		{
			title: "Login",
			key: "l",
			condition: () => {
				console.log(l);
				return !l;
			},
			contents: <><a onClick={login}>L</a></>
		},
		{
			title: "Browse",
			key: "b",
			contents: <>B</>
		},
		{
			title: "Search",
			key: "s",
			contents: <>S</>
		}
	];
	
	if (loading)
		return <>loading</>
	else
		return (
			<TabPage tab={tab} setTab={setTab} tabData={tabs} />
		);
}