import * as React from "react";
import TabPage from "./components/TabPage";
import type { TabData } from "./components/TabPage";
import LoginForm from "./components/LoginForm";
import { Creds } from "./components/LoginForm";
import type { TagData } from "./components/ListOfTags";
import GenshinLoader from "./components/GenshinLoader";
import SearchTab from "./SearchTab";
import BrowseTab from "./BrowseTab";

import { PagingData, api, sendPatch } from "./utils";

import { Backdrop, CircularProgress, Button, Snackbar, Alert, TextField, FormControl, Select, MenuItem } from "@mui/material";

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
	const [toast, setToast] = React.useState<ToastData | null>(null);
	const [renameSrc, setRenameSrc] = React.useState("");

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
			setRenameSrc(sorted[0].tag);

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

	function grab() {
		setBackdrop(true);
		api("grab", {page: 0}).then(r => {
			setBackdrop(false);
			if (r.success) {
				setBrowsePosts(r.content?.page);
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
		});
	}

	function syncEdit(id: number, newTags: string[]){
		const newbie = newTags.find(t => !tags.some(tt => tt.tag === t));
		if (newbie) setTags([...tags, {tag: newbie}]);
		sendPatch(id, newTags).then(r => {
			if (!r.success)
				setToast({
					text: `Failed to edit: ${r.code} ${r.statusMessage}`,
					type: "error"
				});
		});
	}

	function rename(){
		const src = renameSrc;
		const dst = (document.querySelector("#rename_dst") as HTMLInputElement).value ?? "";
		if (dst.length <= 0) return;
		setBackdrop(true);
		api("rename", {src: src, dst: dst}).then(r => {
			setBackdrop(false);
			if (r.success) {
				const nt = tags.map(t => t);
				const target = nt.find(t => t.tag === src);
				if (target) {
					target.tag = dst;
					setTags(nt);
					setRenameSrc(nt[0].tag);
					(document.querySelector("#rename_dst") as HTMLInputElement).value == "";
				}
			} else {
				setToast({
					text: `${r.code} ${r.statusMessage}`,
					type: "error"
				});
			}
		});
		console.log(src);
		console.log(dst);
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
				<div className="settingsRow">
					<Button variant="outlined" onClick={grab}>Grab new posts</Button>
					<Button variant="outlined" onClick={signOut}>Sign out</Button>
				</div>
				<div className="settingsRow" style={{marginTop: "1em"}}>
					<FormControl variant="standard" sx={{ m: 1, minWidth: "17vw" }}>
						<Select
							id="rename_src_select"
							value={renameSrc}
							onChange={e => setRenameSrc(e.target.value)}
						>
							{tags.map(t => <MenuItem key={t.tag} value={t.tag}>{t.tag}</MenuItem>)}
						</Select>
					</FormControl>
					<TextField id="rename_dst" label="dst" variant="standard" size="small" />
					<Button variant="outlined" onClick={rename}>Rename</Button>
				</div>
			</>
		},
		{
			title: "Browse",
			key: "b",
			contents: <>{browsePosts && <BrowseTab
				posts={browsePosts}
				authorized={authorized}
				tagOptions={tags.map(t => t.tag)}
				onEdit={syncEdit}
				onPageFlip={setBrowsePosts}
				backdropControl={setBackdrop}
				toastControl={setToast}
			/>}</>
		},
		{
			title: "Search",
			key: "s",
			contents: <SearchTab
				tags={tags}
				authorized={authorized}
				onEdit={syncEdit}
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