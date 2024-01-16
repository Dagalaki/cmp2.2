import { h, Component } from 'preact';
import {Localize} from '../../lib/localize';

const lookup = new Localize().lookup;

export default class Label extends Component {
	static defaultProps = {
		prefix: ''
	};

	render(props, state) {
		const { prefix, localizeKey, id,color, className, children } = props;
		const key = prefix ? `${prefix}.${localizeKey}` : localizeKey;
		const localizedContent = lookup(key);
		
		return (
			<span id={props.id}  
				class={props.class || className}
				style={"color:color"}
				dangerouslySetInnerHTML={localizedContent && {__html: localizedContent}}>
				{!localizedContent && children}
			</span>
		);
	}
}
