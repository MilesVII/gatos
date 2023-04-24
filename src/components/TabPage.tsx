import * as React from "react";
import { Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

export type TabData = {
	title: string,
	key: string,
	condition?: ()=>boolean,
	contents: JSX.Element
};

type TabPageProps = {
	defaultKey: string,
	tabData: TabData[]
};

export default function TabPage(props: TabPageProps) {
	const [tab, setTab] = React.useState(props.defaultKey);

	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setTab(newValue);
	};

	const filtered = props.tabData.filter(t => t.condition === undefined || t.condition());

	return (
		<Box sx={{ width: "100%", typography: "body1" }}>
			<TabContext value={tab}>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<TabList onChange={handleChange} centered>
						{filtered.map(t => <Tab label={t.title} value={t.key} />)}
					</TabList>
				</Box>
				{filtered.map(t => <TabPanel value={t.key}>{t.contents}</TabPanel>)}
			</TabContext>
		</Box>
	);
}
