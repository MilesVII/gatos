import * as React from "react";
import TabPage from "./components/TabPage";
import type { TabData } from "./components/TabPage";
import { api } from "./utils";
import LoginForm from "./components/LoginForm";
import { Creds } from "./components/LoginForm";
import ListOfTags from "./components/ListOfTags";
import type { TagData } from "./components/ListOfTags";
import PostCard from "./components/PostCard";
import { PostData } from "./components/PostCard";
import GenshinLoader from "./components/GenshinLoader";

import { Stack, Backdrop, CircularProgress, Pagination } from "@mui/material";

//type StateHookSetter<T> = React.Dispatch<React.SetStateAction<T>>;

let once = true;

export default function App() {
	const [tab, setTab] = React.useState("b");
	const [authorized, setAuthorized] = React.useState(false);
	const [backdrop, setBackdrop] = React.useState(false);
	const [loadingProgress, setLoadingProgress] = React.useState(0);
	const [tags, setTags] = React.useState<TagData[]>([]);
	const [browsePosts, setBrowsePosts] = React.useState<PostData[]>([]);
	const [searchPosts, setSearchPosts] = React.useState<PostData[]>([]);
	const [pageCount, setPageCount] = React.useState(1);
	const [page, setPage] = React.useState(1);

	React.useEffect(() => {
		if (!once) return;
		once = false;
		api("greet", {page: 0}).then(r => {
			setLoadingProgress(.99);
			setTimeout(() => setLoadingProgress(1.1), 640);
			if (r.content?.auth) setAuthorized(true);
			const sorted: TagData[] = r.content?.tags?.sort((a: TagData, b: TagData) => (b.count || 0) - (a.count || 0));
			setTags(sorted);
			setBrowsePosts(r.content?.page?.rows);
			setPageCount(r.content?.page?.pageCount);
		});
	}, []);

	const tryLogin = (creds: Creds) => {
		setBackdrop(true);
		api("login", creds).then(r => {
			if (r.success) {
				setAuthorized(true);
				setTab("b");
			}
			setBackdrop(false);
		});
	}
	function searchTag(tag: TagData){
		setBackdrop(true);
		api("search", {query: tag.tag}).then(r => {
			if (r.success) {
				setSearchPosts(r.content?.body);
			}
			setBackdrop(false);
		});
	}
	function scrollIntoSearchSpacer(){
		const spacer = document.querySelector("#tagSpacer");
		spacer?.scrollIntoView({behavior: "smooth", block: "start"});
	}
	function flipBrowsingPage(_event: React.ChangeEvent<unknown>, page: number) {
		setBackdrop(true);
		
		api("page", {page: (page - 1)}).then(r => {
			if (r.success) {
				setBrowsePosts(r.content?.rows);
				setPage(page);
			}
			setBackdrop(false);
		});
	};

	const tabs: TabData[] = [
		{
			title: "Login",
			key: "l",
			condition: () => {
				return !authorized;
			},
			contents: <LoginForm submit={tryLogin} />
		},
		{
			title: "Editor",
			key: "e",
			condition: () => {
				return authorized;
			},
			contents: <>Editor!</>
		},
		{
			title: "Browse",
			key: "b",
			contents: <>
				<Stack spacing={0.5}>
					<Stack alignItems="center">
						<Pagination count={pageCount} page={page} onChange={flipBrowsingPage} color="primary" />
					</Stack>
					{browsePosts.map(post => 
						<PostCard key={post.id} data={post} />
					)}
				</Stack>
			</>
		},
		{
			title: "Search",
			key: "s",
			contents: <>
				<ListOfTags data={tags} onClick={searchTag} />
				<hr id="tagSpacer" />
				<Stack spacing={0.5}>
					{searchPosts.map((post, i) => 
						<PostCard
							key={post.id}
							data={post}
							onRender={i == 0 ? scrollIntoSearchSpacer : undefined}
						/>
					)}
				</Stack>
			</>
		}
	];
	
	//<img id="loader" src="/loader.gif" />
	if (loadingProgress < 1)
		return <GenshinLoader image="/loader.svg" progress={loadingProgress} />
	else
		return (<>
			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
				open={backdrop}
			>
					<CircularProgress color="inherit" />
			</Backdrop>
			<TabPage tab={tab} setTab={setTab} tabData={tabs} />
		</>);
}