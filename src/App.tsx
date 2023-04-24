//import * as React from "react";
//import { Box, Tab } from "@mui/material";
import TabPage from "./components/TabPage";
import type { TabData } from "./components/TabPage";

const tabs: TabData[] = [
	{
		title: "Login",
		key: "l",
		contents: <>Penis</>
	},
	{
		title: "Browse",
		key: "b",
		contents: <>Benis</>
	},
	{
		title: "Search",
		key: "s",
		contents: <>Senis</>
	}
];

export default function App() {
	return (
		<TabPage defaultKey="b" tabData={tabs} />
	);
}