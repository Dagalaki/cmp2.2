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
		this.length = 2;
		this.focusedId = 1;	
		this.activeElem = null;
		this.upOption = false;
	}

	static defaultProps = {
		onBack: () => {},
		onSave: () => {}
	};

	setFocused = (focus) =>{
		if(focus){
			if(this.focusedId == 0){
				document.getElementById("_back").style.color = "blue";
				document.getElementById("_save").style.color = "white";
			}else if(this.focusedId == 1){
				document.getElementById("_back").style.color = "white";
				document.getElementById("_save").style.color = "blue";
			} 
		}

	}

	setFocused2 = () =>{

		for(var i = 0; i<length; i++){
			if(i == this.focusedId ){
				document.getElementsByClassName("button_button--lgX0P")[i].style.color = "blue";
			}else {
				document.getElementsByClassName("button_button--lgX0P")[i].style.color = "white";
			}
		}
	}

	focusOnUpOption = (focus) =>{
		if(focus){
			document.getElementById("customize").style.color = "blue";
		}else{
			document.getElementById("customize").style.color = "#41afbb";
		}
	}

	handle = () =>{

		var me = this;
		if(this.upOption){
			//do smth...
			me.props.onBack();
			return;
		}

		switch(this.focusedId){
			case 0:
				me.props.onBack();
				break;
			case 1:
				console.log(me.props);
				me.props.onSave();
				break;
			default:
				break;
		}
	}

	handleKeyPress = (key) => {
		var me = this;
		console.log("purposesList.jsx  handleKeyPress");
		document.activeElement.blur();
		switch(key){
			case 13:
				//enter
				this.handle();
				break;
			case 40:
				//down
				this.upOption = false;
				this.focusOnUpOption(false);
				this.setFocused(true);
				break;
			case 38:
				//up
				this.upOption = true;
				this.focusOnUpOption(true);
				this.setFocused(false);
				break;
			case 37:
				//left
				this.focusedId--;
				if(this.focusedId < 0) this.focusedId = 0;
				this.setFocused(true);
				break;
			case 39:
				//right
				this.focusedId++;
				if(this.focusedId > this.length-1) this.focusedId = this.length-1;
				this.setFocused(true);
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
