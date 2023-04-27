//import * as React from "react";
import { Grid, Chip } from "@mui/material";

export type TagData = {
	tag: string,
	count?: number
};
type TagClick = (tag: TagData)=>void;
type LoTProps = {
	data: TagData[],
	onClick?: TagClick
}

export default function ListOfTags(props: LoTProps){
	const tags = props.data;

	return (<Grid container spacing={.5} justifyContent="center">{tags.map(t => {
		const counter = t.count === undefined ? "" : ` (${t.count})`;
		const caption = `${t.tag}${counter}`;

		const safeClick = () => props.onClick && props.onClick(t);
		const chip = props.onClick ? <Chip label={caption} onClick={safeClick} /> : <Chip label={caption} />
		return <Grid item key={t.tag}>
			{chip}
		</Grid>
	})}</Grid>);
}