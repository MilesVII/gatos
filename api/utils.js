import * as https from "https";
import { pbkdf2Sync } from "node:crypto";

export function safe(cb){
	try {
		return cb();
	} catch (e) {
		return null;
	}
}

export function wegood(statusCode){
	return (statusCode >= 200 && statusCode < 300);
}

export function last(a){
	return a[a.length - 1];
}

export function sleep(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function phetch(url, options = {}, payload){
	return new Promise(resolve => {
		options.method = options.method || "GET";

		const req = https.request(url, options, res => {
			let responseData = [];
			res.on("data", chunk => {
				responseData.push(chunk);
			});
			res.on("end", () => {
				const raw = Buffer.concat(responseData);
				let responseBody = raw.toString();

				resolve({
					status: res.statusCode || 0,
					headers: res.headers,
					body: safe(() => JSON.parse(responseBody)) || responseBody,
					raw: raw
				});
			});
		});

		if (payload) req.write(payload);

		req.end()
	});
}

export function hashPassword(raw){
	const key = pbkdf2Sync(raw, "m1ku39", 700, 64, "sha512");
	return key.toString("hex");
}