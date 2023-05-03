const styles = {
	progressbar: {
		transitionProperty: "opacity",
		transitionDuration: ".4s"
	},
	centered: {
		position: "absolute" as any,
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)"
	},
	back: {
		maxWidth: "42vw",
		zIndex: "0",
		filter: "opacity(40%) grayscale(100%)"
	},
	fore: {
		maxWidth: "42vw",
		zIndex: "1",
		clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
		transitionProperty: "all",
		transitionDuration: "1s"
	}
};

//https://www.figma.com/community/file/1027476340987030497/Genshin-Impact-%E2%80%94-Elements
type LoaderProps = {
	image: string,
	progress: number
};

export default function GenshinLoader(props: LoaderProps) {
	function progressClipPath(width: number){
		let percent = Math.round(width * 100);
		return `polygon(0% 0%, ${percent}% 0%, ${percent}% 100%, 0% 100%)`
	}
	const fore = {
		...styles.centered,
		...styles.fore,
		clipPath: progressClipPath(props.progress)
	};
	const back = {
		...styles.centered,
		...styles.back
	};
	return (
		<div style={styles.progressbar}>
			<img src={props.image} style={back} />
			<img src={props.image} style={fore} />
		</div>
	);
}