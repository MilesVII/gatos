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

import { Stack } from "@mui/material";

//type StateHookSetter<T> = React.Dispatch<React.SetStateAction<T>>;

let once = true;

export default function App() {
	const [tab, setTab] = React.useState("b");
	const [authorized, setAuthorized] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [tags, setTags] = React.useState<TagData[]>([]);
	const [browsePosts, setBrowsePosts] = React.useState<PostData[]>([]);
	const [searchPosts, setSearchPosts] = React.useState<PostData[]>([]);

	React.useEffect(() => {
		console.log("greet call")
		if (!once) return;
		once = false;
		api("greet", {page: 0}).then(r => {
			setLoading(false);
			if (r.content?.auth) setAuthorized(true);
			console.log(r);
			const sorted: TagData[] = r.content?.tags?.sort((a: TagData, b: TagData) => (b.count || 0) - (a.count || 0));
			setTags(sorted);
			setBrowsePosts(r.content?.page?.rows);
		});
	}, []);
	const tryLogin = (creds: Creds) => {
		setLoading(true);
		api("login", creds).then(r => {
			if (r.success) {
				setAuthorized(true);
				setTab("b");
			}
			setLoading(false);
		});
	}
	function searchTag(tag: TagData){
		const spacer = document.querySelector("#tagSpacer");
		api("search", {query: tag.tag}).then(r => {
			if (r.success) {
				spacer?.scrollIntoView({behavior: "smooth"});
				setSearchPosts(r.content?.body);
			}
		});
	}

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
			title: "Browse",
			key: "b",
			contents: <Stack spacing={0.5}>
				{browsePosts.map(post => <PostCard key={post.id} data={post}/>)}
			</Stack>
		},
		{
			title: "Search",
			key: "s",
			contents: <>
				<ListOfTags data={tags} onClick={searchTag} />
				<hr id="tagSpacer" />
				<Stack spacing={0.5}>
					{searchPosts.map(post => <PostCard key={post.id} data={post}/>)}
				</Stack>
			</>
		}
	];
	
	if (loading)
		return <>loading</>
	else
		return (<>
			<TabPage tab={tab} setTab={setTab} tabData={tabs} />
		</>);
}