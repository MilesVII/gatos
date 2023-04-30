import * as React from "react";

import ListOfTags from "./components/ListOfTags";
import type { TagData } from "./components/ListOfTags";
import { Stack, Pagination } from "@mui/material";
import { api, patchPage, PagingData } from "./utils";
import type { ToastData } from "./App"
import PostCard from "./components/PostCard";

type SearchTabProps = {
	tags: TagData[],
	authorized: boolean,
	backdropControl: (_: boolean) => void,
	toastControl: (_: ToastData | null) => void
};

export default function SearchTab(props: SearchTabProps){
	const [searchPosts, setSearchPosts] = React.useState<PagingData | null>(null);
	const [page, setPage] = React.useState<number>(0);
	const [currentTag, setCurrentTag] = React.useState<TagData>({tag: ""});

	function scrollIntoSearchSpacer(){
		const spacer = document.querySelector("#tagSpacer");
		spacer?.scrollIntoView({behavior: "smooth", block: "start"});
	}

	function searchTag(tag: TagData, page = 1){
		props.backdropControl(true);
		api("search", {query: tag.tag, page: page - 1}).then(r => {
			if (r.success) {
				setSearchPosts(r.content);
				setCurrentTag(tag);
				setPage(page);
				setTimeout(() => scrollIntoSearchSpacer(), 0);
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
		if (!searchPosts) return;
		if (patchPage(searchPosts, id, newTags)){
			setSearchPosts({...searchPosts});
		}
	}

	return (<>
		<ListOfTags data={props.tags} onClick={searchTag} />
		<hr id="tagSpacer" />
		<Stack spacing={1}>
			{(searchPosts?.pageCount || 0) > 1 && <Stack alignItems="center">
				<Pagination
					count={searchPosts?.pageCount}
					page={page}
					onChange={(_e, page) => searchTag(currentTag, page)}
					color="primary"
				/>
			</Stack>}
			{searchPosts?.rows.map(post => 
				<PostCard
					key={post.id}
					data={post}
					onEdit={props.authorized ? editPost : undefined}
					tagOptions={props.authorized ? props.tags.map(t => t.tag) : undefined}
				/>
			)}
		</Stack>
	</>);
}