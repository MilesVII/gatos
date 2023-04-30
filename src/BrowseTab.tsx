import * as React from "react";

import { Stack, Pagination } from "@mui/material";
import { api, patchPage, PagingData } from "./utils";
import type { ToastData } from "./App"
import PostCard from "./components/PostCard";

type BrowseTabProps = {
	posts: PagingData,
	authorized: boolean,
	onPageFlip: (newPage: PagingData) => void,
	backdropControl: (_: boolean) => void,
	toastControl: (_: ToastData | null) => void
};

export default function SearchTab(props: BrowseTabProps){
	const [page, setPage] = React.useState(1);
	
	function flipBrowsingPage(_event: any, page: number) {
		props.backdropControl(true);
		
		api("page", {page: (page - 1)}).then(r => {
			if (r.success) {
				props.onPageFlip(r.content);
				setPage(page);
			} else {
				props.toastControl({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
			props.backdropControl(false);
		});
	}

	function editPost(id: number, newTags: string[]){
		if (patchPage(props.posts, id, newTags)){
			props.onPageFlip({...props.posts});
		}
	}

	return (<>
		<Stack spacing={1}>
			<Stack alignItems="center">
				<Pagination count={props.posts.pageCount} page={page} onChange={flipBrowsingPage} color="primary" />
			</Stack>
			{props.posts.rows.map(post => 
				<PostCard key={post.id} data={post} onEdit={props.authorized ? editPost : undefined} />
			)}
		</Stack>
	</>);
}