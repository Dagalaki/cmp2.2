import { h, Component } from 'preact';
import style from './button.less';

export default class Button extends Component {

	static defaultProps = {
		onClick: () => {},
		invert: false
	};


	render(props) {
	console.log("button.jsx : render");
		const {
			children,
			onClick,
			invert,
			backgroundColor,
			textColor,
			id
		} = props;

		return (
			<button id={id}
				class={[style.button, props.class, invert ? style.invert : ''].join(' ')}
				onClick={onClick}
				style={{background: backgroundColor, color: textColor}}
				>
				{children}
			</button>
		);
	}
}
