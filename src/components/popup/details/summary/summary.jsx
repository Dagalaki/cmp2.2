import { h, Component } from 'preact';
import style from './summary.less';
import Switch from '../../../switch/switch';
import detailsStyle from '../details.less';
import Label from "../../../label/label";
import '../../../../lib/globals';


export const VK_LEFT = 37;
export const VK_RIGHT = 39;
export const VK_UP = 38;
export const VK_DOWN = 40;
export const VK_ENTER = 13;
export const VK_BACK = 461;


class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'banner'
	};
}

class SummaryLabel extends Label {
	static defaultProps = {
		prefix: 'summary'
	};
}
class PurposesLabel extends Label {
	static defaultProps = {
		prefix: 'purposes'
	};
}


export default class Summary extends Component {

	constructor(props) {
		super(props);
		this.i = 0;
		this.buttons = [];
		this.pursposesClassname = null;
		this.focusedId = 0;
		
	}

	static defaultProps = {
		vendors: [],
	};

	setFocused = (focus) => {
		this.purposeClassname = "summary_learnMore--QHtl7";
		console.log("summary.jsx focus on : " + this.focusedId);
		for(var i = 0; i< this.buttons.length ; i++){
			if(focus){
				if(i == this.focusedId){
					document.getElementsByClassName(this.purposesClassname)[i].style.color = "blue";
				}else{
					document.getElementsByClassName(this.purposesClassname)[i].style.color = "#41afbb";
				}
			}else{
				document.getElementsByClassName(this.purposesClassname)[i].style.color = "#41afbb";
			}
		}
	}

	handleKeyPress = (key) => {
		if(global.config.focusObject == "vendors"){

			global.config.vendorsRef.handleKeyPress(key);
			return true;
		}

		console.log("summary.jsx key: " + key);
		switch(key){
			case VK_UP:
				this.focusedId--;
				if(this.focusedId <0){
					this.focusedId = 0;
					this.setFocused(false);
					global.config.focusObject = "modal";
					global.config.modalRef.focusedId = 0;
					global.config.modalRef.setFocused(true);
					

				 	break;
				 }
				this.setFocused(true);
				break;
			case VK_DOWN:
				this.focusedId++;
				if(this.focusedId > this.buttons.length-1) {
					this.focusedId = this.buttons.length-1;
					this.setFocused(false);
					global.config.focusObject = "modal";
					global.config.modalRef.focusedId = 1;
					global.config.modalRef.setFocused(true);
					document.getElementsByClassName("summary_summary--39BrN")[0].style.position = "relative";
					document.getElementsByClassName("summary_summary--39BrN")[0].style.top="-255px";
				 	break;
				}
				this.setFocused(true);
				break;
			case VK_ENTER:
				if(global.config.focusObject == "modal"){
					global.config.detailsRef.props.onSave();
					break;
				}
				global.config.focusObject = "vendors";
				//call details.jsx handlePurposeClick
				
				global.config.detailsRef.handlePurposeClick(this.buttons[this.focusedId]);
				
				break;
			case VK_BACK:
				
				global.config.detailsRef.handleBack();
				break;
			default:
				break;
		}
		return true;
	}

	addPurposeItemAtag = (purposeItem, classname) => {

		global.config.focusObject = "summary";

		console.log("summary.jsx class: "+classname);
		this.buttons[this.i] = purposeItem;
		this.purposesClassname = classname;
		this.i++;
	}

	handlePurposeItemClick = purposeItem => {
		console.log("summary.jsx PurposeItemClick , purposeItem: " + purposeItem);
		return () => {
			this.props.onPurposeClick(purposeItem);
		};
	};
        
        handleGeneralePurposeClick = purposeItem => {
        console.log("summary.jsx handleGeneralePurposeClick , purposeItem: " + purposeItem);
		return () => {
			this.props.onGeneralPurposeClick(purposeItem);
		};
	};
        handleCustomPurposeItemClick = (customPurposeItem, visitedCustomPurposes) => {
        console.log("summary.jsx handleCustomPurposeItemClick");
                return () => {
			this.props.onCustomPurposeClick(customPurposeItem, visitedCustomPurposes);
		};
	};

	render(props, state)
	{
	console.log("summary.jsx : render");
		const {
			purposes,
                        customPurposes,
                        visitedCustomPurposes,
                        publisherConsentData,
			onVendorListClick,
			onPurposeListClick,
			theme,
			vendors
		} = props;
                
		const {
			textColor,
                        primaryColor,
			dividerColor,
			textLinkColor
		} = theme;  

		const filteredPurposes = Object.values(purposes).filter((purposeItem) =>
			vendors.some(
				(vendor) =>
				vendor.purposes.includes(purposeItem.id) ||
				vendor.legIntPurposes.includes(purposeItem.id) ||
				vendor.flexiblePurposes.includes(purposeItem.id) ||
				vendor.specialPurposes.includes(purposeItem.id)
			)
		);
               // console.log("visitedCustomPurposes", visitedCustomPurposes);
		return (
			<div 
			ref={el => {
					this.summaryRef = el;
					if (this.props.setSummaryRef) {
    					this.props.setSummaryRef(this); // Pass the Summary component instance
  					}
				}}
			class={style.summary}>
				
				<div class={detailsStyle.title} style={{color: textColor}}>
					<SummaryLabel localizeKey='title'></SummaryLabel>
				</div>
				<div class={detailsStyle.description}>
					<SummaryLabel localizeKey='description'>
					
					</SummaryLabel>
				</div>
                                
                <div class={style.customPurposeSeparator}>
					<LocalLabel localizeKey='links.purposes.titleGeneral'></LocalLabel>
				</div>                
				<div class={style.purposeItems}>
					{Object.values(filteredPurposes).map((purposeItem, index) => (
						
						<div  class={style.purposeItem} style={{borderColor: dividerColor}}>
							<span class={style.purposeTitle}><PurposesLabel localizeKey={`purpose${purposeItem.id}.menu`}>{purposeItem.name}</PurposesLabel></span>
							<a onLoad={this.addPurposeItemAtag(purposeItem, style.learnMore)} class={style.learnMore} onClick={this.handlePurposeItemClick(purposeItem)} style={{color: textLinkColor}}>
								<SummaryLabel localizeKey='detailLink'></SummaryLabel>
							</a>
						</div>
					))}
				</div>
                                          
				<div class={detailsStyle.description} style="display:none; margin-bottom: 30px;">
					<center>
						<a id="acceptGeneral" class={detailsStyle.selectAllConds} onClick={this.handleGeneralePurposeClick(true)} style="background-color: #FFFFFF;display: block;float: left;width: 40%;margin: 0 5%0 5%;">
							<SummaryLabel localizeKey='acceptAll'></SummaryLabel>
						</a>
						<a id="denyGeneral" class={detailsStyle.selectAllConds}  onClick={this.handleGeneralePurposeClick(false)} style={{color: textLinkColor}} style="background-color: #FFFFFF;display: block;float: left;width: 40%;margin: 0 5%0 5%;">
							<SummaryLabel localizeKey='denyAll'></SummaryLabel>
						</a>
					</center>
				</div>
				<div class={style.customPurposeSeparator}>
					<LocalLabel localizeKey='links.purposes.titleCustom'></LocalLabel>
				</div>
				<div class={style.customPurposeItems}>
					{customPurposes.map((customPurposeItem, zindex) => (
					<div>
						<div class={style.customPurposeItem} style={{borderColor: dividerColor}}>
								<span class={style.customPurposeTitle}><PurposesLabel localizeKey={`customPurpose${customPurposeItem.id}.menu`}>{customPurposeItem.name}</PurposesLabel></span>

								<Switch
										class={style.customPurposeSwitch}
										color={primaryColor} 
										dataId={customPurposeItem.id}
										isSelected= {visitedCustomPurposes[customPurposeItem.id]}
										onClick={this.handleCustomPurposeItemClick(customPurposeItem, visitedCustomPurposes)}
								/>
								<br clear="all" />
						</div>
						<p class={style.customPurposeDesc} dangerouslySetInnerHTML={{__html: customPurposeItem.description}} />
					</div>    

					))}
				</div>
                                
				<div class={detailsStyle.title} style={{color: textColor}}>
					<SummaryLabel localizeKey='who.title'></SummaryLabel>
				</div>
				<div class={detailsStyle.description}>
					<SummaryLabel localizeKey='who.description'>
						
					</SummaryLabel>&nbsp;
					<a  id="wholink"  onClick={onVendorListClick} style={{color: textLinkColor}}><SummaryLabel localizeKey='who.link'></SummaryLabel></a>
				</div>
				<div class={detailsStyle.title} style={{color: textColor}}>
					<SummaryLabel localizeKey='what.title'></SummaryLabel>
				</div>
				<div class={detailsStyle.description}>
					<SummaryLabel localizeKey='what.description'>
						
					</SummaryLabel>&nbsp;
					<a id="whatlink" onClick={onPurposeListClick} style={{color: textLinkColor}}><SummaryLabel localizeKey='what.link'></SummaryLabel></a>
				</div>
			</div>
		);
	}
}
