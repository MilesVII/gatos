import { Card, Alert, CardActions, CardContent, Button, ImageList, ImageListItem, Backdrop } from "@mui/material";
import ListOfTags, { TagData } from "./ListOfTags";
import { useState, useRef} from "react";

import type { PostData } from "../utils";
import TagAdder from "./TagAdder";

type PostCardProps = {
	data: PostData,
	onEdit?: (id: number, tags: string[]) => void
	tagOptions?: string[]
};

const viewerCSS = {
	maxHeight: "90%",
	maxWidth: "90%"
}

const clickableImgCSS = {
	cursor: "pointer",
	maxHeight: "40vh",
	objectFit: "contain" as any // wow csstype how did you mess up so bad
}

export default function PostCard(props: PostCardProps) {
	const [viewer, setViewer] = useState<string | null>(null);
	const imgRef = useRef<HTMLImageElement>(null);


	const handleClose = () => {
		setViewer(null);
	}

	const p = props.data;

	const lotAuxProps: any = {};
	if (props.onEdit)
		lotAuxProps.onDelete = (newList: TagData[]) => props.onEdit && props.onEdit(p.id, newList.map(td => td.tag));

	function addTag(newTag: string){
		props.onEdit && props.onEdit(props.data.id, [newTag, ...(props.data.tags || [])])
	}

	return (
		<Card style={{backgroundColor: "lavender"}}>
			<CardContent>
				<ImageList cols={Math.min(3, p.post.photos?.length)} rowHeight={"auto"}>
					{p.post.photos.map((photo, i) => (
						<ImageListItem key={photo.id}>
							<img
								src={photo.url}
								loading="lazy"
								ref={i === 0 ? imgRef : undefined}
								onError={()=>{if (imgRef.current) imgRef.current.src = "/error.svg"}}
								onClick={()=>setViewer(photo.url)}
								style={clickableImgCSS}
							/>
						</ImageListItem>
					))}
				</ImageList>
				<div>{p.post.caption}</div>
				{p.post.otherAttachments && <Alert severity="warning">This post has other attachments</Alert>}
				<ListOfTags data={p.tags?.map(t => ({tag: t})) || []} {...lotAuxProps} />
			</CardContent>
			<CardActions>
				{props.onEdit && <TagAdder 
					tagOptions={props.tagOptions || []}
					onAdd={addTag}
				/>}
				<Button style={{marginLeft: "auto"}} href={`https://vk.com/wall-95648824_${p.post.postId}`}>Open post</Button>
			</CardActions>
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={!!viewer}
				onClick={handleClose}
			>
				<img src={viewer || "it never happens"} style={viewerCSS} />
			</Backdrop>
		</Card>
	);
}