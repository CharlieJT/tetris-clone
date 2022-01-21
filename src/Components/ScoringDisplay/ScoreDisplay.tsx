import styled from "styled-components";

type ScoreDisplayProps = {
	title: string;
	value: string | number;
	windowWidth: number;
};

const TitleStyles = styled.div`
	padding: 1vmin;
	border-bottom: 2px solid #5e5e5e;
	font-size: 2.4vmin;
`;

const ValueStyles = styled.div`
	padding-top: 1vmin;
	text-align: center;
	font-size: 3.5vmin;
`;

const ScoreDisplay = ({
	title,
	value,
	windowWidth,
}: ScoreDisplayProps): React.ReactElement => {
	return (
		<div
			style={{
				border: (windowWidth ?? 0) < 600 ? "none" : "3px solid #5e5e5e",
			}}
		>
			<TitleStyles>{title}</TitleStyles>
			<ValueStyles>{value}</ValueStyles>
		</div>
	);
};

export default ScoreDisplay;
