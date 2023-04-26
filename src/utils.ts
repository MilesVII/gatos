export type APIResponse = {
	success: boolean,
	content: any
};

export function safe<T>(cb: ()=>T): null | T {
	try {
		return cb();
	} catch(e) {
		return null;
	}
}

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
	if (response.ok){
		return {
			success: true,
			content: await response.json()
		};
	} else {
		return {
			success: false,
			content: null//await response.json()
		};
	}
}