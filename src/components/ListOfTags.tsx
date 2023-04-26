//import * as React from "react";
import { Grid, Chip } from "@mui/material";

export type TagData = {
	tag: string,
	count?: number
};
type LoTProps = {
	data: TagData[],
	onClick: (tag: TagData)=>void
}

export default function ListOfTags(props: LoTProps){
	const tags = props.data;

	return (<Grid container spacing={.5} justifyContent="center">{tags.map(t => {
		const counter = t.count === undefined ? "" : ` (${t.count})`;
		const caption = `${t.tag}${counter}`;
		return <Grid item key={t.tag}>
			<Chip label={caption} onClick={() => {props.onClick(t)}} />
		</Grid>
	})}</Grid>);
}