export function safe<T>(cb: ()=>T): null | T {
	try {
		return cb();
	} catch(e) {
		return null;
	}
}

export type PostData = {
	id: number,
	post: {
		postId: number,
		caption: string,
		photos: {
			id: number,
			url: string
		}[],
		otherAttachments: boolean
	},
	tags: string[] | null
};

export type PagingData = {
	pageCount: number,
	rows: PostData[]
};

export function patchPage(page: PagingData, id: number, newTags: string[]){
	const target = page.rows.find(r => r.id === id);
	if (target) {
		target.tags = newTags;
		return true;
	}
	return false;
}

export function sendPatch(id: number, newTags: string[]){
	return api("patch", {
		id: id,
		tags: newTags
	});
}

export type APIResponse = {
	success: boolean,
	code: number,
	statusMessage: string,
	content: any
};
export async function api(action: string, payload: any = {}): Promise<APIResponse>{
	const response = await fetch("/api/main", {
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: JSON.stringify({
			action: action,
			...payload
		})
	});
	const responseRaw = await response.text();
	const responseParsed = safe(() => JSON.parse(responseRaw));
	
	return {
		success: response.ok,
		code: response.status,
		statusMessage: response.statusText,
		content: responseParsed || responseRaw
	};
}