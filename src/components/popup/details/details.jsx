import { h, Component } from 'preact';
import style from './details.less';
import Button from '../../button/button';
import Vendors from './vendors/vendors';
import VendorList from './vendorList/vendorList';
import Summary from './summary/summary';
import Panel from '../../panel/panel';
import PurposeList from './purposeList/purposeList';
import Label from "../../label/label";
import '../../../lib/globals';

export const VK_LEFT = 37;
export const VK_RIGHT = 39;
export const VK_UP = 38;
export const VK_DOWN = 40;
export const VK_ENTER = 13;
export const VK_BACK = 461;



class LocalLabel extends Label {
	static defaultProps = {
		prefix: 'details'
	};
}

export const SECTION_PURPOSES = 0;
export const SECTION_VENDOR_LIST = 1;
export const SECTION_PURPOSE_LIST = 2;
export const SECTION_VENDORS = 3;

export default class Details extends Component {

	activeElem = null;

	detailsRef = null;
	purposeListRef = null;
	vendorListRef = null;
	summaryRef = null;
	
	
	constructor(props) {
		super(props);
		this.focusedId = 2;	
		this.buttons = [];
	}

	setFocused = (focus) =>{

		for(var i = 0; i< this.buttons.length; i++){
			if(focus){
				console.log(this.buttons[i].id);
				if(i == this.focusedId) document.getElementById(this.buttons[i].id).style.color = "blue";
				else document.getElementById(this.buttons[i].id).style.color = "white";
			}else document.getElementById(this.buttons[i].id).style.color = "white";
		}

	}	

	handleKeyPress = (key) =>{
	console.log("details.jsx " + key);
		switch(key){
			case VK_RIGHT:
				this.focusedId++;
				if(this.focusedId > this.buttons.length-1) this.focusedId = this.buttons.length-1;
				this.setFocused(true);
				break;
			case VK_LEFT:
				this.focusedId--;
				if(this.focusedId < 0 ) this.focusedId = 0;
				this.setFocused(true);
				break;
			case VK_UP:
				global.config.focusObject = "summary";
				global.config.summaryRef.setFocused(true);
				break;
			case VK_DOWN:
				break;
			case VK_ENTER:
				break;

			default:
				break;
		}
	}

	handleButtonClick= () =>{
		if(this.focusedId == 3){
			console.log("details.jsx handleButtonClick handleBack");
			this.handleBack();
		}else if(this.focusedId == 2){
			console.log("details.jsx handleButtonClick props onSave");
			this.props.onSave();
		}else if(this.focusedId == 0){
			console.log("must implement deny all");
			this.props.denyAll();
		}else if (this.focusedId == 1){
			console.log("must implement accept all");
			this.props.acceptAll();
		}
	}

	handlePanelClick = panelIndex => {
		console.log("details.jsx handlePanelClick panelIndex: " + panelIndex);
		return () => {
			this.props.onChangeDetailsPanel(Math.max(0, panelIndex));
		};
	};

	handleBack = () => {
		this.activeElem = null;
		console.log("details.jsx handleBack");
		this.props.onChangeDetailsPanel(SECTION_PURPOSES);
	}; 

	handlePurposeClick = purposeItem => {
		console.log("details.jsx handlePurposeClick");
		const {
			onChangeDetailsPanel,
			onSelectPurpose,
		} = this.props;

		onChangeDetailsPanel(SECTION_VENDORS);
		onSelectPurpose(purposeItem);
	};
        handleGeneralPurposeClick = state => {
        	console.log("details.jsx handleGeneralPurposeClick state" +state);
            //console.log("Clicked on general acceptance....", state, this.props);
            this.props.store.selectAllPurposesAndVendors(state);
	};
        handleCustomPurposeClick = (customPurposeItem, visitedCustomPurposes) => {
            const {			
			onSelectCustomPurpose,
		} = this.props;

		//console.log("customPurposeItem", customPurposeItem);
                //console.log("visitedCustomPurposes", visitedCustomPurposes);
                this.props.store.selectCustomPurpose();
		onSelectCustomPurpose(customPurposeItem, this.visitedCustomPurposes);
	};
        visitedCustomPurposes = {};

	render(props, state) {
	console.log("details.jsx : render");
            //console.log("renderizzato");
		const {
			onSave,
			onClose,
			store,
			theme,
			selectedPanelIndex,
			selectedPurposeDetails
		} = props;

		const {
			backgroundColor,
			textLightColor,
			dividerColor,
			secondaryColor,
			secondaryTextColor,
			primaryColor,
			primaryTextColor,
		} = theme;
		const {
			vendorList = {},
			customPurposeList = {},                        
			vendorConsentData,
			publisherConsentData,
			selectPurpose,
			selectCustomPurpose,
			selectAllVendors,
			selectVendor
		} = store;
                
                
		const { selectedPurposeIds, selectedVendorIds } = vendorConsentData;
		const { selectedCustomPurposeIds } = publisherConsentData;
		const { purposes = [], vendors = [] } = vendorList;
		const { purposes: customPurposes = [] } = customPurposeList;
                
                for(var prop in this.visitedCustomPurposes) {
                    console.log("[CMP LOG] details.jsx...RESULT", prop);
                }
                //console.log("[CMP LOG] details.jsx...VisitedCustomPurposes is empty?", JSON.stringify(this.visitedCustomPurposes) === JSON.stringify({}));
                
                //console.log("[CMP LOG] details.jsx...visitedCustomPurposes (1)", this.visitedCustomPurposes, this.visitedCustomPurposes.length);        
                //console.log("[CMP LOG] details.jsx...customPurposeList", customPurposeList);                
                //console.log("[CMP LOG] details.jsx...publisherConsentData", publisherConsentData.selectedCustomPurposeIds);
                if(JSON.stringify(this.visitedCustomPurposes) === JSON.stringify({}) === true) {
                    publisherConsentData.selectedCustomPurposeIds.forEach( a => {
                        //console.log("[CMP LOG] details.jsx...", a);
                        this.visitedCustomPurposes[a] = true; 
                    });
                }                
                //console.log("[CMP LOG] details.jsx...visitedCustomPurposes (2)", this.visitedCustomPurposes, this.visitedCustomPurposes.length);
                
		const formattedVendors = Object.values(vendors)
			.map(vendor => {
				console.log('Current vendor:', vendor); // Log the current vendor
    			return {
      				...vendor,
      				policyUrl: vendor.policyUrl && vendor.policyUrl.indexOf('://') > -1 ? vendor.policyUrl : `http://${vendor.policyUrl}`
    			};
    		})
			.sort(({ name: n1 }, { name: n2 }) => n1.toLowerCase() === n2.toLowerCase() ? 0 : n1.toLowerCase() > n2.toLowerCase() ? 1 : -1);

		
		this.buttons[0] = {id:"_denyall", active:true};
		this.buttons[1] = {id:"_acceptall", active:true};
		this.buttons[2] = {id:"_save", active:true};
		/*this.buttons[3] = {id:"_back", active:false};
*/


		return (
			
			<div
				ref={el => {
					this.detailsRef = el;
					if (this.props.setDetailsRef) {
    					this.props.setDetailsRef(this); // Pass the Details component instance
  					}
				}}
			 class={style.details} style={{
				backgroundColor: backgroundColor,
				color: textLightColor
			}}>
				<div class={style.body}>
					<Panel selectedIndex={selectedPanelIndex}>
						<Summary
							purposes={purposes}
                            customPurposes={customPurposes}
                            visitedCustomPurposes={this.visitedCustomPurposes}
                            publisherConsentData={publisherConsentData}
							onPurposeClick={this.handlePurposeClick}
                            onCustomPurposeClick={this.handleCustomPurposeClick}
                            onGeneralPurposeClick={this.handleGeneralPurposeClick}
							onVendorListClick={this.handlePanelClick(SECTION_VENDOR_LIST)}
							onPurposeListClick={this.handlePanelClick(SECTION_PURPOSE_LIST)}
							theme={theme}
							setSummaryRef={ref => this.summaryRef= global.config.summaryRef = ref}
							vendors={formattedVendors}
						/>
						<VendorList
                            purposes={purposes}
                            customPurposes={customPurposes}
							vendors={formattedVendors}
							onBack={this.handleBack}
							onSave={onSave}
							theme={theme}
							setVendorListRef={ref => this.vendorListRef =ref}
						/>
						<PurposeList
							onSave={onSave}
							onBack={this.handleBack}
							theme={theme}
							setPurposeListRef={ref => this.purposeListRef = ref}
						/>
						<Vendors
							vendors={formattedVendors}
							purposes={purposes}
							selectVendor={selectVendor}
							selectAllVendors={selectAllVendors}
							selectedVendorIds={selectedVendorIds}
							selectedPurposeDetails={selectedPurposeDetails}
							theme={theme}
							setVendorsRef={ref => this.vendorsRef = global.config.vendorsRef=ref}
						/>
					</Panel>
				</div>
				<div class={style.footer} style={{ borderColor: dividerColor }}>
					{selectedPanelIndex > 0 &&
					<Button id={"_back"}
						class={style.back}
						onClick={this.handleBack}
						backgroundColor={secondaryColor}
						textColor={secondaryTextColor}
					>&lt; <LocalLabel localizeKey='back'></LocalLabel></Button>
					}
					
					<Button id={"_denyall"}
						class={style.save}
						onClick={this.handleDenyAll}
						backgroundColor={secondaryColor}
						textColor={secondaryTextColor}
					><LocalLabel localizeKey='denyall'></LocalLabel></Button>
					
					<Button id={"_acceptall"}
						class={style.save}
						onClick={this.handleAcceptAll}
						backgroundColor={secondaryColor}
						textColor={secondaryTextColor}
					><LocalLabel localizeKey='acceptall'></LocalLabel></Button>
					
					
					<Button id={"_save"}
						class={style.save}
						onClick={onSave}
						backgroundColor={primaryColor}
						textColor={"blue"}
					><LocalLabel localizeKey='save'></LocalLabel></Button>
				</div>
			</div>
		);
	}
}
