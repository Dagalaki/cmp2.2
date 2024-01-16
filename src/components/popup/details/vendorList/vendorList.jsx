import { h, Component } from 'preact';
import style from './vendorList.less';
import detailsStyle from '../details.less';
import ExternalLinkIcon from '../../../externallinkicon/externallinkicon';
import Label from "../../../label/label";

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'vendors'
	};
}

export default class VendorList extends Component {
	constructor(props) {
		super(props);
		this.length = 2;
		this.focusedId = 1;	
		this.activeElem = null;
		this.upOption = false;
	}

	static defaultProps = {
		vendors: [],
	};
	
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

	focusOnUpOption = (focus) =>{
		if(focus){
			document.getElementById("customize").style.color = "blue";
		}else{
			document.getElementById("customize").style.color = "#41afbb";
		}
	}

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

	handleKeyPress = (key) => {
		var me = this;
		console.log("vendorList.jsx  handleKeyPress");
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
				this.setFocused("true");
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

	render(props, state, englishFPData) {
		
		const {
            purposes,
			vendors,
			onBack,
			onSave,
			theme,
		} = props;

		const {
			textColor, 
			textLightColor,
			textLinkColor
		} = theme;
		//console.log("[CMP LOG] VENDORS!!!!", vendors); 
		//console.log("[CMP LOG] PURPOSES: ", purposes); 
		
		
		
		
		return (
			<div  ref={el => {
					this.vendorListRef = el;
					if (this.props.setVendorListRef) {
    					this.props.setVendorListRef(this); // Pass the VendorList  component instance
  					}
				}}  class={style.vendorList}>
				<div class={style.header}>
					<div class={detailsStyle.title} style={{color: textColor}}>
						<LocalLabel localizeKey='title'></LocalLabel>
					</div>
				</div>
				<div class={detailsStyle.description} style={{color: textLightColor}}>
					<LocalLabel localizeKey='description'></LocalLabel>
				</div>
				<a id="customize" onClick={onBack} style={{color: textLinkColor}} class={style.customize}><LocalLabel localizeKey='back'></LocalLabel></a>
				<table>
					{Object.values(vendors).map(({name, urls, legIntPurposes, features, purposes:purposeIds, flexiblePurposes, specialPurposes, specialFeatures}, index) => (
						<tr class={index % 2 === 0 ? style.even : style.odd}>
							<td>
								<div 
									class={style.company} 
									style={{color: textLightColor}}
								>
								
								<h4 class={style.fpvendor} >{name}<a href={urls[0].privacy} className={style.policy} style={{color: textLinkColor}} target='_blank'><ExternalLinkIcon color={textLinkColor} /></a></h4>
									<LocalLabel class={[style.fptitle, (legIntPurposes.length < 1) ? style.fptitlehidden : ''].join(' ')} localizeKey='legint'></LocalLabel>
									{legIntPurposes.map(function(value) {
											return <Label className={style.fpvalue} localizeKey={`purposes.purpose${value}.title`}>{purposes[value-1].name}</Label>
									})}
										
																			
									<LocalLabel className={[style.fptitle, (features.length < 1) ? style.fptitlehidden : ''].join(' ')} localizeKey='features'></LocalLabel>
									{features.map(function(value){										
										return <Label className={style.fpvalue} localizeKey={`features.feature${value}.name`}></Label>
									})}
										
									<LocalLabel className={[style.fptitle, (features.length < 1) ? style.fptitlehidden : ''].join(' ')} localizeKey='purposes'></LocalLabel>
									{purposeIds.map(function(value){
										return <Label className={style.fpvalue} localizeKey={`purposes.purpose${value}.title`}>{purposes[value].name}</Label>
									})}
										
									
								</div>
							</td>
						</tr>
					))}
				</table>
			</div>
		);
	}
}
