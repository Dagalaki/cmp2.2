import { h, Component } from 'preact';
import style from './vendorList.less';
import detailsStyle from '../details.less';
import ExternalLinkIcon from '../../../externallinkicon/externallinkicon';
import Label from "../../../label/label";

export const VK_LEFT = 37;
export const VK_RIGHT = 39;
export const VK_UP = 38;
export const VK_DOWN = 40;
export const VK_ENTER = 13;
export const VK_BACK = 461;

class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'vendors'
	};
}

export default class VendorList extends Component {
	constructor(props) {
		super(props);
	}

	static defaultProps = {
		vendors: [],
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
		
		document.activeElement.blur();
		switch(key){
			case VK_ENTER:
				//enter
				global.config.activeTab =1;
				global.config.activeElem = null;
				global.config.focusObject = "modal";
				global.config.modalRef.setFocused(true);
				this.props.onBack();
				break;
			case VK_DOWN:
				//down
				
				this.focusOnUpOption(false);
				global.config.focusObject = "details";
				global.config.detailsRef.setFocused(true);
				break;
			case VK_UP:
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
