import { h, Component } from 'preact';
import style from './intro.less';
import Button from '../../button/button';
import Label from '../../label/label';
import CloseButton from '../../closebutton/closebutton';

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'intro'
	};
}

const HOST_PARTS = ((window && window.location && window.location.hostname) || '').split('.');
const DOMAIN = HOST_PARTS.length > 0 ? HOST_PARTS.slice(-2).join('.') : '';

export default class Intro extends Component {

	static defaultProps = {};

	render(props, state) {
		console.log("intro.jsx : render");
		const {
			onAcceptAll,
			onShowPurposes,
			onClose
		} = props;

		return (
			<div class={style.intro}>
				<CloseButton
					class={style.close}
					onClick={onClose}
				/>
				<div class={style.title}>
					<LocalLabel localizeKey='title'></LocalLabel> {DOMAIN}
				</div>
				<div class={style.description}>
					<LocalLabel localizeKey='description'></LocalLabel>
				</div>
				<div class={style.options}>
					<Button
						class={style.rejectAll}
						invert={true}
						onClick={onShowPurposes}
					>
						<LocalLabel localizeKey='showPurposes'></LocalLabel>
					</Button>
					<Button
						class={style.acceptAll}
						onClick={onAcceptAll}
					>
						<LocalLabel localizeKey='acceptAll'></LocalLabel>
					</Button>
				</div>
			</div>
		);
	}
}
