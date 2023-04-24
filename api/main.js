import { safe, wegood, phetch, hashPassword, last, sleep } from "./utils.js";
import { validate, ANY_OF, ARRAY_OF, OPTIONAL, DYNAMIC } from "arstotzka"; 

function db(table, params, method, headers, body){
	const path = `/rest/v1/${table}?${params.join("&")}`;
	return phetch(`${process.env.SUPABASE_DB_URL}${path}`, {
		method: method || "GET",
		headers: Object.assign({
			"apikey": process.env.SUPABASE_KEY,
			"Authorization": `Bearer ${process.env.SUPABASE_KEY}`,
			"Content-Type": "application/json"
		}, headers || {})
	}, body ? JSON.stringify(body) : null)
}

async function vk(offset = 0){
	function result(success, data) {
		return {success, data}
	}
	function requestLink (accessToken, groupId, offset, batchSizeLimit) {
		return `https://api.vk.com/method/wall.get?access_token=${accessToken}&owner_id=${groupId}&offset=${offset}&count=${batchSizeLimit}&v=5.131`
	}
	
	const token = process.env.VK_TOKEN;
	const group = "-95648824";
	const size = 100;

	const url = requestLink(token, group, offset, size);

	const response = await phetch(url);
	if (response.body?.response?.items)
		return result(true, response.body.response.items);
	else
		return result(false, response);
}

function renderContentRange(from, to){
	return `${from}-${to - 1}`;
}

function parseContentRange(range){
	try {
		const parts = range.split("/");
		const leftParts = parts[0].split("-");
		const proto = {
			from: parseInt(leftParts[0], 10),
			to: parseInt(leftParts[1], 10) + 1,
			count: parseInt(parts[1], 10)
		};
		proto.renderRange = () => `${proto.from}-${Math.min(proto.to, proto.count) - 1}`;
		return proto;
	} catch(e){
		return null;
	}
}

async function getPage(page = 0, stride = 200){
	const dbr = await db("posts", ["order=post->postId.desc"], "GET", {
		"Prefer": "count=exact",
		"Range": renderContentRange(page * stride, (page + 1) * stride)
	});

	if (wegood(dbr.status)) {
		const total = parseContentRange(dbr.headers["content-range"]).count;
		return {
			countTotal: total,
			pageCount: Math.ceil(total / stride),
			rows: dbr.body
		};
	} else {
		return null;
	}
}

function cleansing(vkPosts){
	return vkPosts.map(p => ({
		postId: p.id,
		text: p.text,
		photos: p.attachments
			?.filter(a => a.type == "photo")
			?.map(a => ({
				id: a.photo.id,
				url: last(a.photo.sizes).url
			})),
		otherAttachments: p.attachments?.some(a => a.type != "photo"),
		tags: []
	}));
}

const actionSchema = (action, params = {}, secure = true) => {
	const proto = Object.assign(params, {
		action: x => x === action
	});
	if (secure) proto.access = [OPTIONAL, {
		user: [OPTIONAL, "number"],
		token: [OPTIONAL, "string"]
	}]
	return proto;
};
const actions = [
	actionSchema("login", {
		login: "string",
		password: "string"
	}, false),
	actionSchema("setSettings", {
		new: {
			login: [OPTIONAL, "string"],
			password: [OPTIONAL, "string"]
		}
	}, true),
	actionSchema("post", {
		posts: ARRAY_OF({
			id: "number",
			photos: ARRAY_OF({
				id: "number",
				url: "string"
			}),
			tags: ARRAY_OF("string")
		})
	}, true),
	actionSchema("search", {
		query: "string"
	}, false),
	actionSchema("getTagSummary", {}, false),
	actionSchema("grab", {}, true),
	actionSchema("page", {
		page: "number"
	}, false)
];
const schema = ANY_OF(...actions);
/*{
	action: name,
	access: {user, password},
	...params
}*/

async function accessGranted(action, user, token){
	const secured = action !== "login" && !!actions.find(a => a.action(action))?.access;
	if (!secured) return true;

	const response = await db("users", [`id=eq.${user}`, `select=token`], "GET");
	const valid =
		wegood(response.status) &&
		response.body &&
		response.body.length > 0;
	
	if (!valid) return false;
	const dossier = response.body[0];

	const allowed = dossier.token === hashPassword(token);
	return allowed;
}

export default async function (request, response) {
	if (request.method != "POST" || !request.body){
		response.status(400).send("Malformed request. Content-Type header and POST required.");
		return;
	}

	const validationErrors = validate(request.body, schema);

	if (validationErrors.length > 0){
		response.status(400).send(validationErrors);
		return;
	}
	const userId = (typeof request.body.access?.user === "number") ? request.body.access.user : request.cookies["user"];
	const token = request.body.access?.token || request.cookies["token"];
	delete request.body.access;

	if (!await accessGranted(request.body.action, userId, token)){
		response.status(401).send("Access denied");
		return;
	}

	switch (request.body.action){
		case ("login"): {
			const password = hashPassword(request.body.password);
			const login = request.body.login;
			
			const r = await db("users", [`login=eq.${login}`]);
			if (!wegood(r.status)){
				response.status(502).send();
				return;
			}
			if (r.body.length < 1){
				response.status(404).send();
				return;
			}

			const dossier = r.body[0];
			if (dossier.password === null){
				response.status(400).send("Password not set");
				return;
			}
			const granted = dossier.password === password;
			if (!granted){
				response.status(401).send();
				return;
			}

			const u = dossier.id;
			const t = hashPassword(`${Math.random}${r.headers.date}`);

			await db("users", [`id=eq.${u}`], "PATCH", {}, {token: hashPassword(t)});

			response.writeHead(200, [
				["Set-Cookie", `user=${u}; Secure; HttpOnly`],
				["Set-Cookie", `token=${t}; Secure; HttpOnly`]
			]).end(JSON.stringify({
				id: u
			}));
			return;
		}
		case ("setSettings"): {
			const newRow = {};
			if (request.body.new.login) newRow.login = request.body.new.login;
			if (request.body.new.password) newRow.password = hashPassword(request.body.new.password);
			const r = await db("users", [`id=eq.${userId}`], "PATCH", {}, newRow);
			if (!wegood(r.status)){
				response.status(502).send();
				return;
			}
			response.status(200).send();
			return;
		}
		case ("post"): {
			// const rows = data.map(raw => ({
			// 	post: {
			// 		photos: raw.photos,
			// 		postId: raw.postId,
			// 		caption: raw.text
			// 	},
			// 	tags: raw.tags || null,
			// 	author: userId
			// }));

			//const r = await db("posts", [], "POST", {"Prefer": "return-minimal"}, rows);

			response.status(200).send();
			return;
		}
		case ("search"): {
			const dbr = await db("posts", [`tags=cs.{${encodeURIComponent(request.body.query)}}`], "GET");
			response.status(200).send(dbr);
			return;
		}
		case ("getTagSummary"): {
			const dbr = await db("rpc/tagSummary", [], "POST");
			response.status(dbr.status).send(dbr.body);
			return;
		}
		case ("grab"): {
			const firstPage = await getPage(0, 2);
			if (!firstPage){
				response.status(502).send("DB req failed");
				return;
			}
			const lastId = firstPage.rows[0].post.postId;

			const raw = [];
			let batch = {data:[{id: Infinity}]};
			for (let offset = 0; last(batch.data).id > lastId; offset += batch.data.length){
				console.log(offset);
				batch = await vk(offset);
				if (!batch.success){
					response.status(502).send("VK req failed");
					return;
				}
				raw.push(...cleansing(batch.data));
				await sleep(200);
			}

			const newPosts = raw.filter(p => p.postId > lastId);
			const rows = newPosts.map(p => ({
				author: userId,
				tags: [],
				post: p
			}));
			const dbr = await db("posts", [], "POST", {"Prefer": "return-minimal"}, rows);

			response.status(dbr.status).send(dbr);
			return;
		}
		case ("page"): {
			const page = await getPage(request.body.page);
			response.status(page ? 200 : 502).send(page);
			return;
		}
	}
}