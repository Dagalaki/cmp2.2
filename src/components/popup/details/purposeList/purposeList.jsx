import { h, Component } from 'preact';
import style from './purposeList.less';
import detailsStyle from '../details.less';
import Label from "../../../label/label";

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'purposes'
	};
}

export default class PurposeList extends Component {

	constructor(props) {
		super(props);
	}

	static defaultProps = {
		onBack: () => {},
		onSave: () => {}
	};

	

	focusOnUpOption = (focus) =>{
		if(focus){
			document.getElementById("customize").style.color = "blue";
		}else{
			document.getElementById("customize").style.color = "#41afbb";
		}
	}

	

	handleKeyPress = (key) => {
		var me = this;
		console.log("purposesList.jsx  handleKeyPress");
		document.activeElement.blur();
		switch(key){
			case 13:
				//enter
				global.config.activeElem = null;
				global.config.focusObject = "details";
				this.props.onBack();
				break;
			case 40:
				//down
				this.focusOnUpOption(false);
				global.config.focusObject = "details";
				global.config.detailsRef.setFocused(true);
				break;
			case 38:
				//up
				this.focusOnUpOption(false);
				global.config.focusObject = "modal";
				global.config.modalRef.focusedId = 0;
				global.config.modalRef.setFocused(true);
				break;
			default:
				break;
		}
	}

	render(props, state) {
		const {
			onBack,
			onSave,
			theme,
		} = props;

		const {
			textColor,
			textLightColor,
			textLinkColor
		} = theme;

		return (
			<div ref={el => {
					this.purposeListRef = el;
					if (this.props.setPurposeListRef) {
    					this.props.setPurposeListRef(this); // Pass the PurposeList  component instance
  					}
				}} class={style.purposeList}>
				<div class={style.header}>
					<div class={detailsStyle.title} style={{color: textColor}}>
						<LocalLabel localizeKey='title'></LocalLabel>
					</div>
				</div>
				<div class={detailsStyle.description} style={{color: textLightColor}}>
					<LocalLabel localizeKey='description'></LocalLabel>
				</div>
				<div class={style.infoItems}>
					<LocalLabel localizeKey='items'>
						
					</LocalLabel>
				</div>
				<a id="customize" onClick={onBack} style={{color: textLinkColor}}><LocalLabel localizeKey='back'></LocalLabel></a>
			</div>
		);
	}
}
