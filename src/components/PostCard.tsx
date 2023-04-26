//import * as React from 'react';
import { Card, CardActions, CardContent, Button, ImageList, ImageListItem } from '@mui/material';
import ListOfTags from "./ListOfTags";

type VKPhoto = {
	id: number,
	url: string
}
export type PostData = {
	id: number,
	post: {
		postId: number,
		caption: string,
		photos: VKPhoto[]
	},
	tags: string[]
}
type PostCardProps = {
	data: PostData
};

export default function PostCard(props: PostCardProps) {
	const p = props.data;
	return (
		<Card sx={{ minWidth: 275 }}>
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
				<ListOfTags data={p.tags.map(t => ({tag: t}))} onClick={()=>{}} />
			</CardContent>
			<CardActions>
				<Button >Open post</Button>
			</CardActions>
		</Card>
	);
}