import { Autocomplete, Button, TextField } from "@mui/material";
import * as React from "react";

type TAProps = {
	tagOptions: string[],
	onAdd: (newTag: string) => void
}

export default function TagAdder(props: TAProps){
	const [candidate, setCandidate] = React.useState("");

	function onSubmit(event: any){
		event?.preventDefault();
		const tagToAdd = candidate.toLowerCase().trim();
		if (tagToAdd === "") return;
		setCandidate("");
		props.onAdd(tagToAdd);
	}

	return <form onSubmit={onSubmit} style={{display: "inline-flex"}}>
		<Autocomplete
			freeSolo
			options={props.tagOptions}
			sx={{ width: "30vw" }}
			inputValue={candidate}
			onInputChange={(_e, newValue) => setCandidate(newValue)}
			renderInput={(params: any) => <TextField {...params} size="small" label="Add tag" />}
		/>
		<Button color="primary" type="submit">+</Button>
	</form>
}
