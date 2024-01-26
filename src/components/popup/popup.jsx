import { h, Component } from 'preact';
import style from './popup.less';
import Details from './details/details';
import CloseButton from '../closebutton/closebutton';
import '../../lib/globals';

export const SECTION_PURPOSES = 0;
export const SECTION_VENDOR_LIST = 1;
export const SECTION_PURPOSE_LIST = 2;
export const SECTION_VENDORS = 3;

export default class Popup extends Component {

	constructor(props) {
		super(props);
		this.length = 3;
		this.focusedId = 1;	
	}

	handleClose = () => {
		global.config.focusObject = "banner";
		console.log("popup.jsx :  handleClose");
		const {store} = this.props;
        this.props.onChangeDetailsPanel(0);
		store.toggleModalShowing(false);
	};


	handle = () => {
		var me = this;
		const {store} = this.props;
		//alert("handle focus on "  +me.focusedId);
		switch(me.focusedId){
			case 0:
				me.handleClose();
				break;
			case 1:
				//summary.who.link
				console.log("popup.jsx Who is using this information");
				me.props.onChangeDetailsPanel(Math.max(0, SECTION_VENDOR_LIST)); 
				me.detailsRef.activeElem = "vendorList";
				global.config.focusObject = "vendorList";
				break;
			case 2:
				//summary.what.link
				console.log("popup.jsx What information is being used");
				//store.toggleModalShowing(true);
				me.props.onChangeDetailsPanel(Math.max(0, SECTION_PURPOSE_LIST)); 
				me.detailsRef.activeElem = "purposeList";
				global.config.focusObject = "purposeList";
				break;
			case 3:
				console.log("popup.jsx onSave Continue Using site");
				me.props.onSave();
				break;
			default:
				break;
		}
	}

	setFocused = (focus) => {	
		console.log("popup.jsx focus on " + this.focusedId);
		var closeBtn = document.querySelector("[class^=closebutton]");
		if(this.focusedId == 0 && focus){
			if(closeBtn) closeBtn.style.boxShadow = "0 0 0 4px hsl(101.5, 42.3%, 56.5%)"; 
		}else{
			if(closeBtn) closeBtn.style.boxShadow = "0 0 0 2px hsla(0,0%,47%,.65)";
		}
		var whatLink = document.getElementById("whatlink");
		if(this.focusedId == 2 && focus){
			console.log("focus on 2");
			if(whatLink) whatLink.style.color = "blue";
		}else {
			if(whatLink) whatLink.style.color = "#41afbb";
		}

		var whoLink = document.getElementById("wholink");
		if(this.focusedId == 1 && focus){
			console.log("focus on 1");
			if(whoLink) whoLink.style.color = "blue";
		}else {
			if(whoLink) whoLink.style.color = "#41afbb";
		}

		var btn = document.querySelector("[class^=button_button--]");
		if(this.focusedId == 3 && focus){ //close
			console.log("focus on 3");
			if(btn) btn.style.color = "#27686f";
		}else {
			if(btn) btn.style.color = "white";
		}
	}

	handleKeyPress = (key) => {

		if(global.config.focusObject == "vendorconsents"){
			global.config.vendorConsentsRef.handleKeyPress(key);
			return true;
		}

		console.log("popup.jsx handleKeyPress : " + global.config.focusObject);

		if(global.config.focusObject == "details"){
			global.config.detailsRef.handleKeyPress(key);
			return true;
		}

		if(global.config.focusObject == "summary" || global.config.focusObject == "overview"){
			global.config.overviewRef.handleKeyPress(key);
			return true;
		}

		if(global.config.focusObject == "vendors"){
			global.config.vendorsRef.handleKeyPress(key);
			return true;
		}

		if(this.detailsRef.activeElem == "purposeList" || global.config.focusObject == "purposeList"){
			console.log("active elem is "  + this.detailsRef.activeElem);
			if(this.detailsRef.purposeListRef) this.detailsRef.purposeListRef.handleKeyPress(key);
			
			return true;
		}
		//if(this.props.store.isModalShowing && !this.detailsRef.activeElem) this.detailsRef.activeElem = "vendorList";
		if(this.detailsRef.activeElem == "vendorList"  || global.config.focusObject == "vendorList"){
			//alert("active elem is "  + this.detailsRef.activeElem);
			if(this.detailsRef.vendorListRef) this.detailsRef.vendorListRef.handleKeyPress(key);
			
			return true;
		}


		document.activeElement.blur();
		var me = this;
		console.log("popup.jsx handleKeyPress key "+ key);
		switch(key){
			case 13:

				console.log("key is ENTER");
   				me.handle();
				break;
			case 40:
				console.log("key is DOWN");
   				
   				me.focusedId++;
   				if(me.focusedId == 1){
   					me.setFocused(false);
					global.config.focusObject = "overview";
					global.config.overviewRef.focusedId = 0;
					global.config.overviewRef.setFocused(true);
					break;
   				}
				if(me.focusedId > me.length -1){
					me.focusedId = me.length-1;
					me.setFocused(false);
					global.config.detailsRef.setFocused(true);
					global.config.focusObject = "details";
					break;
				}
				me.setFocused(true);
				break;
			case 38:
				console.log("key is UP");
   				
				if(me.focusedId == 1){
   					me.setFocused(false);
					
					if(global.config.overviewRef.activeTab == 0){// Purposes
						this.setFocused(false);
						global.config.focusObject = "overview";
						global.config.overviewRef.setFocusOnConsent(true);
						global.config.overviewRef.onConsents =true;
					}else if(global.config.overviewRef.activeTab == 1){// Vendors
						global.config.focusObject = "vendorconsents";
						this.setFocused(false);
						global.config.vendorConsentsRef.setFocused(true);
					}
					global.config.overviewRef.scrollDown();
					break;
   				}
   				me.focusedId--;
				if(me.focusedId < 0) {
					me.focusedId = 0;
				}
				me.setFocused(true);
				break;
			case 461:
				me.handleClose();
				break;
			default:
				break;
		}
	}

	render(props, state) {

	console.log("popup.jsx : render");
		const {
			store,
			onSave,
			theme,
			onChangeDetailsPanel,
			onSelectPurpose,            
            onSelectCustomPurpose,
			selectedDetailsPanelIndex,
			selectedPurposeDetails,
		} = props;
		const {overlayBackground, secondaryColor, backgroundColor} = theme;
		const {isModalShowing, vendorConsentData} = store;
        this.setFocused();        
		return (
			<div
				ref={el => {
					this.modalRef = el;
					if (this.props.setModalRef) {
    					this.props.setModalRef(this); // Pass the Modal component instance
  					}
				}}
				class={style.popup}
				style={{display: isModalShowing ? 'flex' : 'none'}}
			>
				<div
					class={style.overlay}
					style={{background: overlayBackground}}
					onClick={this.handleClose}
				/>
				{isModalShowing ?
					<div class={style.content}>
						<CloseButton onClick={this.handleClose} stroke={secondaryColor} fill={backgroundColor} />
						<Details
							onSave={onSave}
							store={store}
							onClose={this.handleClose}
							onChangeDetailsPanel={onChangeDetailsPanel}
							onSelectPurpose={onSelectPurpose}
                                                        
                                                        onSelectCustomPurpose={onSelectCustomPurpose}
							selectedPanelIndex={selectedDetailsPanelIndex}
							selectedPurposeDetails={selectedPurposeDetails}
							theme={theme}
							setDetailsRef={ref => (this.detailsRef = global.config.detailsRef = ref)}
							
						/>
					</div> : null
				}
			</div>
		);

	}
}
