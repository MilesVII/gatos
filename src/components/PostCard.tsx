//import * as React from 'react';
import { Card, Alert, CardActions, CardContent, Button, ImageList, ImageListItem } from '@mui/material';
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
		photos: VKPhoto[],
		otherAttachments: boolean
	},
	tags: string[]
}
type PostCardProps = {
	data: PostData
};

export default function PostCard(props: PostCardProps) {
	const p = props.data;
	if(!p.post.photos) console.log(p.id);
	
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
				{p.post.otherAttachments && <Alert severity="warning">Has other attachments</Alert>}
				<ListOfTags data={p.tags.map(t => ({tag: t}))} onClick={()=>{}} />
			</CardContent>
			<CardActions>
				<Button href={`https://vk.com/wall-95648824_${p.post.postId}`}>Open post</Button>
			</CardActions>
		</Card>
	);
}