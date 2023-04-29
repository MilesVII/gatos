import * as React from "react";
import TabPage from "./components/TabPage";
import type { TabData } from "./components/TabPage";
import LoginForm from "./components/LoginForm";
import { Creds } from "./components/LoginForm";
import type { TagData } from "./components/ListOfTags";
import PostCard from "./components/PostCard";
import GenshinLoader from "./components/GenshinLoader";

import { PagingData, api, patchPage } from "./utils";

import { Stack, Backdrop, CircularProgress, Pagination, Button, Snackbar, Alert } from "@mui/material";
import SearchTab from "./SearchTab";

//type StateHookSetter<T> = React.Dispatch<React.SetStateAction<T>>;

let once = true;

export type ToastData = {
	text: string,
	type: "info" | "error" | "success" | "warning"
};

export default function App() {
	const [tab, setTab] = React.useState("b");
	const [authorized, setAuthorized] = React.useState(false);
	const [backdrop, setBackdrop] = React.useState(false);
	const [loadingProgress, setLoadingProgress] = React.useState(0);
	const [tags, setTags] = React.useState<TagData[]>([]);
	const [browsePosts, setBrowsePosts] = React.useState<PagingData | null>(null);
	const [page, setPage] = React.useState(1);
	const [toast, setToast] = React.useState<ToastData | null>(null);

	React.useEffect(() => {
		if (!once) return;
		once = false;
		api("greet", {page: 0}).then(r => {
			setLoadingProgress(.99);
			setTimeout(() => setLoadingProgress(1.1), 640);
			if (r.content?.auth) setAuthorized(true);
			const sorted: TagData[] = r.content?.tags?.sort((a: TagData, b: TagData) => (b.count || 0) - (a.count || 0));
			setTags(sorted);
			setBrowsePosts(r.content?.page);

			if (!r.success) {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
		});
	}, []);

	function tryLogin(creds: Creds) {
		setBackdrop(true);
		api("login", creds).then(r => {
			if (r.success) {
				setAuthorized(true);
				setTab("b");
				setToast({
					text: "Login successfull",
					type: "info"
				});
			} else if (r.code == 401){
				setToast({
					text: "Login failed",
					type: "error"
				});
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
			setBackdrop(false);
		});
	}
	function signOut() {
		setBackdrop(true);
		api("signOut", {}).then(r => {
			if (r.success) {
				setAuthorized(false);
				setTab("b");
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
			setBackdrop(false);
		});
	}
	function flipBrowsingPage(_event: any, page: number) {
		setBackdrop(true);
		
		api("page", {page: (page - 1)}).then(r => {
			if (r.success) {
				setBrowsePosts(r.content);
				setPage(page);
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
			setBackdrop(false);
		});
	}
	function grab() {
		setBackdrop(true);

		api("grab", {}).then(r => {
			setBackdrop(false);
			if (r.success) {
				flipBrowsingPage(null, page)
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
		});
	}

	function editPost(id: number, newTags: string[]){
		if (!browsePosts) return;
		if (patchPage(browsePosts, id, newTags)){
			setBrowsePosts({...browsePosts});
		}
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
			title: "Editor",
			key: "e",
			condition: () => {
				return authorized;
			},
			contents: <>
				<Button onClick={grab}>Grab new posts</Button>
				<Button onClick={signOut}>Sign out</Button>
			</>
		},
		{
			title: "Browse",
			key: "b",
			contents: <>
				<Stack spacing={1}>
					<Stack alignItems="center">
						<Pagination count={browsePosts?.pageCount} page={page} onChange={flipBrowsingPage} color="primary" />
					</Stack>
					{browsePosts?.rows.map(post => 
						<PostCard key={post.id} data={post} onEdit={authorized ? editPost : undefined} />
					)}
				</Stack>
			</>
		},
		{
			title: "Search",
			key: "s",
			contents: <SearchTab
				tags={tags}
				authorized={authorized}
				backdropControl={setBackdrop}
				toastControl={setToast}
			 />
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
			<Snackbar
				open={!!toast}
				autoHideDuration={6000}
				onClose={() => setToast(null)}
			>
				<Alert severity={toast?.type}>{toast?.text}</Alert>
			</Snackbar>
			<TabPage tab={tab} setTab={setTab} tabData={tabs} />
		</>);
}