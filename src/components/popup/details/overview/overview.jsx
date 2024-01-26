import { h, Component } from 'preact';
import style from './overview.less';
import Switch from '../../../switch/switch';
import style2 from '../vendors/vendors.less';
import detailsStyle from '../details.less';
import Label from "../../../label/label";
import VendorConsents from "./vendorconsents/vendorconsents";
import '../../../../lib/globals';


export const VK_LEFT = 37;
export const VK_RIGHT = 39;
export const VK_UP = 38;
export const VK_DOWN = 40;
export const VK_ENTER = 13;
export const VK_BACK = 461;



class VendorsLabel extends Label {
	static defaultProps = {
		prefix: 'vendors'
	};
}

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


export default class Overview extends Component {

	constructor(props) {
		super(props);
		this.i = 0;
		this.buttons = [];
		this.pursposesClassname = null;
		this.focusedId = 0;
		this.tabs = [];
		this.activeTab = 0;
		this.onTabs = true;
		this.onConsents = false;
		this.consentBtns = [];
		this.activeConsent = 0;
	}

	static defaultProps = {
		vendors: [],
		selectedVendorIds: new Set(),
		selectedPurposeLegIntIds: new Set(),
		selectedPurposeConsentIds: new Set(),
	};

	setFocusOnTabs = (focus) =>{
		for(var i = 0; i<this.tabs.length; i++){
			if(focus){
				if(i == this.activeTab){
					document.getElementById(this.tabs[i].id).style.borderBottom = "solid 3px blue";
				}else{
					document.getElementById(this.tabs[i].id).style.borderBottom = "solid 3px transparent";
				}
			}else{
					document.getElementById(this.tabs[i].id).style.borderBottom = "solid 3px transparent";
				}
		}
		
	}

	setFocused = (focus) => {
		if(this.onTabs) this.setFocusOnTabs(true);
		
		console.log("overview.jsx focus on : " + this.focusedId);
		for(var i = 0; i< this.buttons.length ; i++){
			if(focus){
				if(i == this.focusedId){
					console.log(this.buttons[i].id);
					document.getElementById(this.buttons[i].id).style.color = "blue";
					
				}else{
					document.getElementById(this.buttons[i].id).style.color = "#41afbb";
					
				}
			}else{
				document.getElementById(this.buttons[i].id).style.color = "#41afbb";
				
			}
		}
	}

	openTab = () => {
		
		for(var i = 0; i< this.tabs.length; i++){
			console.log("opentab: "+this.tabs[i].contId);
			if(i == this.activeTab ) {
				console.log("br1");
				console.log(this.tabs[i].contId);
				if(document.getElementById(this.tabs[i].contId)) document.getElementById(this.tabs[i].contId).style.display = "block";
			}
			else{
				console.log("br2");
				console.log(this.tabs[i].contId);
				if(document.getElementById(this.tabs[i].contId)) document.getElementById(this.tabs[i].contId).style.display = "none";
				 }
		}
	}

	setFocusOnConsent = (focus) => {
	this.onTabs = true;
		console.log("focus on consent : " + this.activeConsent);
		for(var i=0; i< this.consentBtns.length; i++){
			if(focus){
				if(i == this.activeConsent) {
					document.getElementById("check_"+this.consentBtns[i].id).style.opacity = "0.3";
					document.getElementById("check_"+this.consentBtns[i].id).style.transform = "scale(1.556)";
					//classList.add("consentfocus");
				}else{
					 document.getElementById("check_"+this.consentBtns[i].id).style.opacity = "0";
					document.getElementById("check_"+this.consentBtns[i].id).style.transform = "none";
				}
			}else {
				document.getElementById("check_"+this.consentBtns[i].id).style.opacity = "0";
					document.getElementById("check_"+this.consentBtns[i].id).style.transform = "none)";
			}
			
		}
	}

	handleConsents = (key) => {
		switch(key){
			case VK_DOWN:
				this.activeConsent++;
				if(this.activeConsent > 4) this.scrollUp();
				if(this.activeConsent > this.consentBtns.length -1){ 		this.activeConsent = this.consentBtns.length-1;
					this.setFocusOnConsent(false);
					console.log("end of consents, go to basic menu, must scroll up ");
					
					global.config.modalRef.focusedId = 1;
					global.config.modalRef.setFocused(true);
					global.config.focusObject = "modal";
					this.onConsents = false;
					this.onTabs = false;
					break;
				}
				this.setFocusOnConsent(true);
				break;
			case VK_UP:
				if(this.activeConsent == 4) this.scrollDown();
				this.activeConsent--;
				if(this.activeConsent <0 ) {
					this.activeConsent= 0;
					this.onConsents = false;
					this.onTabs = true;
					this.setFocusOnConsent(false);
					this.setFocusOnTabs(true);
					break;
				}
				this.setFocusOnConsent(true);
				break;
			case VK_LEFT:
				var dataId = this.consentBtns[this.activeConsent].id;
				var isSelected = true;
				this.handleSelectPurposeConsent({dataId, isSelected: !isSelected});
				break;
			case VK_RIGHT:
				var dataId = this.consentBtns[this.activeConsent].id;
				var isSelected = false;
				this.handleSelectPurposeConsent({dataId, isSelected: !isSelected});
				break;
			case VK_ENTER:
				var dataId = this.consentBtns[this.activeConsent].id;
				var isSelected = false;
				this.handleSelectPurposeConsent({dataId, isSelected: !isSelected});
				break;
			default:
				break;
		}
	}

	handleTabs = (key) => {
		document.activeElement.blur();
		console.log("handle tabs");
		switch(key){
			case VK_RIGHT:
				this.activeTab++;
				if(this.activeTab > this.tabs.length-1) this.activeTab = this.tabs.length-1;
				this.setFocusOnTabs(true);
				break;
			case VK_LEFT:
				this.activeTab--;
				if(this.activeTab <0) this.activeTab = 0;
				this.setFocusOnTabs(true);
				break;
			case VK_ENTER:
				this.openTab();
				if(this.activeTab == 1){ //vendorconsents
					global.config.focusObject ="vendorconsents";
					global.config.vendorConsentsRef.setFocused(true);
				}
				break;
			case VK_UP:
				global.config.focusObject = "modal";
				global.config.modalRef.focusedId = 0;
				global.config.modalRef.setFocused(true);
				this.setFocusOnTabs(false);
				break;
			case VK_DOWN:
				//must handle consents ... should create consents.jsx
				this.onConsents=true;
				this.onTabs = false;
				this.setFocusOnConsent(true);
				this.setFocusOnTabs(false);
				break;
			default:
				break;
		}
	}

	scrollUp = (top) => {
		document.getElementById("_overviewMainCont").style.position = "relative";
		if(!top)document.getElementById("_overviewMainCont").style.top="-355px";
		else document.getElementById("_overviewMainCont").style.top="-"+top+"";
	}

	scrollDown = () => {
		document.getElementById("_overviewMainCont").style.top="0px";
	}

	handleKeyPress = (key) => {

		if(this.onConsents){
			this.handleConsents(key);
			return true;
		}

		if(this.onTabs){
			this.handleTabs(key);
			return true;
		}

		if(global.config.focusObject == "vendors"){

			global.config.vendorsRef.handleKeyPress(key);
			return true;
		}


		console.log("overview.jsx key: " + key);
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

		global.config.focusObject = "overview";

		console.log("overview.jsx class: "+classname);
		this.buttons[this.i] = purposeItem;
		this.purposesClassname = classname;
		this.i++;
	}

	handlePurposeItemClick = purposeItem => {
		console.log("overview.jsx PurposeItemClick , purposeItem: " + purposeItem);
		return () => {
			this.props.onPurposeClick(purposeItem);
		};
	};

	handleSelectPurposeLegInt = ({dataId, isSelected}) => {
	console.log("handle legitimate interest");
		console.log("overview.jsx handleSelectPurposeLegInt ("+dataId+" ," +isSelected+") ");
		global.config.store.selectLegIntPurpose(dataId, isSelected); //in store.js
	};

	handleSelectPurposeConsent = ({dataId, isSelected}) => {
	console.log("handle consent");
		console.log("overview.jsx handleSelectPurposeConsent ("+dataId+" ," +isSelected+") ");
		global.config.store.selectPurpose(dataId, isSelected); // in store.js
	};
        
        handleGeneralePurposeClick = purposeItem => {
        console.log("overview.jsx handleGeneralePurposeClick , purposeItem: " + purposeItem);
		return () => {
			this.props.onGeneralPurposeClick(purposeItem);
		};
	};
        handleCustomPurposeItemClick = (customPurposeItem, visitedCustomPurposes) => {
        console.log("overview.jsx handleCustomPurposeItemClick");
                return () => {
			this.props.onCustomPurposeClick(customPurposeItem, visitedCustomPurposes);
		};
	};

	

	render(props, state)
	{
	console.log("overview.jsx : render");
		const {
			purposes,
                        customPurposes,
                        visitedCustomPurposes,
                        publisherConsentData,
			onVendorListClick,
			onPurposeListClick,
			theme,
			vendors,
			selectedVendorIds,
			selectedPurposeIds,
			selectedLegIntPurposeIds,
			selectedPurposeDetails
		} = props;
          
		const {
			textColor,
                        primaryColor,
			dividerColor,
			textLinkColor
		} = theme;  

		this.tabs[0] = {id:"purposesConsents", "contId":"_purposesConsents"};
		this.tabs[1] = {id:"vendorConsents", "contId": "_vendorConsents"};

		const filteredPurposes = Object.values(purposes).filter((purposeItem) =>
			vendors.some(
				(vendor) =>
				vendor.purposes.includes(purposeItem.id) ||
				vendor.legIntPurposes.includes(purposeItem.id) ||
				vendor.flexiblePurposes.includes(purposeItem.id) ||
				vendor.specialPurposes.includes(purposeItem.id)
			)
		);

		for(var i=0; i< filteredPurposes.length; i++){
				var id = filteredPurposes[i].id;
				this.consentBtns[i] = {id: id};
			}

console.log("Filtered Purposes: ");
console.log(filteredPurposes);


		const filteredLegIntPurposes = Object.values(purposes).filter((purposeItem) => 
			vendors.some(
				(vendor) =>
				vendor.legIntPurposes.includes(purposeItem.id)
			)
		);

		this.buttons[0] = {id:"closeX"};
		this.buttons[1] = {id:"wholink"};
		this.buttons[2] = {id:"whatlink"};

console.log("Filtered Leg Int Purposes: ");
console.log(filteredLegIntPurposes);
/*var me =this;
const legintpurposes = filteredLegIntPurposes.map(function(purposeItem, me) {
	me.handleSelectPurposeLegInt(purposeItem.id, true);
});
console.log(legintpurposes);
*/
               // console.log("visitedCustomPurposes", visitedCustomPurposes);
		return (
			<div id="_overviewMainCont"
			ref={el => {
					this.overviewRef = el;
					if (this.props.setOverviewRef) {
    					this.props.setOverviewRef(this); // Pass the Overview component instance
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
					<div class="focused"><LocalLabel id="purposesConsents" localizeKey='links.purposes.titlePurposes'></LocalLabel></div>
					<div><LocalLabel id="vendorConsents" localizeKey='links.purposes.titleVendors'></LocalLabel></div>
				</div>



                <div class={style.customPurposeSeparator}>
					
				</div>                
				<div id="_purposesConsents" class={style.purposeItems}>
					{Object.values(filteredPurposes).map((purposeItem, index) => (
						
						<div  class={style.purposeItem} style={{borderColor: dividerColor}}>
							<span class={style.purposeTitle}><PurposesLabel localizeKey={`purpose${purposeItem.id}.menu`}>{purposeItem.name}</PurposesLabel></span>
							<table>
								<tr>
									<td class={style2.allowColumn}>
										{purposeItem.id > -1 ?
											<span   class={style2.allowSwitch}>
												<LocalLabel  id={"legint_accept_" + purposeItem.id} localizeKey='links.purposes.legInt'></LocalLabel> <Switch 
													color={primaryColor}
													dataId={purposeItem.id}
													id={"legInt_" + purposeItem.id}
													isSelected={selectedLegIntPurposeIds.has(purposeItem.id)}
													onClick={this.handleSelectPurposeLegInt}
												/>
												<LocalLabel  id={"accept_" + purposeItem.id} localizeKey='links.purposes.consent'></LocalLabel> <Switch 
													color={primaryColor}
													dataId={purposeItem.id}
													id={"check_" + purposeItem.id}
													isSelected={selectedPurposeIds.has(purposeItem.id)}
													onClick={this.handleSelectPurposeConsent}
												/>
											</span> :
											<VendorsLabel localizeKey='optOut'>requires opt-out</VendorsLabel>
										}
									</td>
								</tr>
							</table>
						</div>
					))}
				</div>
				<VendorConsents
					selectedVendorIds={selectedVendorIds}
					selectedPurposeDetails={selectedPurposeDetails}
					vendors={vendors}
					selectedLegIntPurposeIds={selectedLegIntPurposeIds}
					theme={theme}
					setVendorConsentsRef={ref => this.vendorConsentsRef= global.config.vendorConsentsRef = ref}
				/>
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
