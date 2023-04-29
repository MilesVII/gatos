//import * as React from "react";
import { Grid, Chip } from "@mui/material";

export type TagData = {
	tag: string,
	count?: number
};
type TagClick = (tag: TagData)=>void;
type LoTProps = {
	data: TagData[],
	onClick?: TagClick,
	onDelete?: (_: TagData[]) => void
}

export default function ListOfTags(props: LoTProps){
	const tags = props.data;

	return (<Grid container spacing={.5} justifyContent="center">{tags.map(t => {
		const counter = t.count === undefined ? "" : ` (${t.count})`;
		const caption = `${t.tag}${counter}`;

		const auxProps: any = {};
		if (props.onClick)
			auxProps.onClick = () => props.onClick && props.onClick(t);
		if (props.onDelete)
			auxProps.onDelete = () => props.onDelete && props.onDelete(tags.filter(tag => tag.tag !== t.tag));
		
		return <Grid item key={t.tag}>
			<Chip label={caption} {...auxProps} />
		</Grid>
	})}</Grid>);
}