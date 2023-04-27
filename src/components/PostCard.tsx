import { Card, Alert, CardActions, CardContent, Button, ImageList, ImageListItem } from "@mui/material";
import ListOfTags from "./ListOfTags";
import * as React from "react";

type VKPhoto = {
	id: number,
	url: string
}
export type PostData = {
	id: number,
	post: {
		postId: number,
		caption: string,
		photos: VKPhoto[],
		otherAttachments: boolean
	},
	tags: string[] | null
}
type PostCardProps = {
	data: PostData,
	onRender?: () => void
};

export default function PostCard(props: PostCardProps) {
	let [once] = React.useState(true);
	React.useEffect(() => {
		if (!once) return;
		once = false; //To avoid rendering
		if (props.onRender) props.onRender();
	})

	const p = props.data;
	return (
		<Card>
			<CardContent>
				<ImageList cols={3} rowHeight={"auto"}>
					{p.post.photos.map(photo => (
						<ImageListItem key={photo.id}>
							<img
							src={photo.url}
							loading="lazy"
							/>
						</ImageListItem>
					))}
				</ImageList>
				<div>{p.post.caption}</div>
				{p.post.otherAttachments && <Alert severity="warning">This post has other attachments</Alert>}
				<ListOfTags data={p.tags?.map(t => ({tag: t})) || []} />
			</CardContent>
			<CardActions>
				<Button href={`https://vk.com/wall-95648824_${p.post.postId}`}>Open post</Button>
			</CardActions>
		</Card>
	);
}