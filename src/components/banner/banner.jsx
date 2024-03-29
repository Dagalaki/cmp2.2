import { h, Component } from 'preact';
import style from './banner.less';
import Label from '../label/label';
import ChevronIcon from '../chevronicon/chevronicon';
import { SECTION_VENDOR_LIST } from '../popup/details/details';
import '../../lib/globals';
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

class PurposesLabel extends Label {
	static defaultProps = {
		prefix: 'purposes'
	};
}

const PANEL_COLLECTED = 0;
const PANEL_PURPOSE = 1;
const PANEL_FEATURE = 2;


export default class Banner extends Component {

	constructor(props) {
		super(props);
		this.ulTop = 0;
		this.onDescVendorLink =false;
		this.rmlength = 3;
		this.rmfocusedId = 2;
		this.rmfocusedIdBullet = 0;
		this.state = {
			isExpanded: false,
			selectedPanelIndex: 0,
		};
		this.onBullets = false;
		var me = this;
		this.RMB = null;
		this.ulfocusedId = 0;
		this.purposes = [];
		this.cnt = 0;
	}

	triggerEvent = ( elem, event ) => {
		  var clickEvent = new Event( event ); // Create the event.
		  elem.dispatchEvent( clickEvent );    // Dispatch the event.
		}

	rmhandle = () => {
		console.log("call to rm handle");
		var me = this;

		switch(me.rmfocusedId){
			case 0:
				console.log("banner.jsx: Know More");
				window.kw_customizeInfoPrivacy();
				break;
			case 1:
				console.log("banner.jsx: Manage Your Choices");
				global.config.focusObject = "details";
				me.handleLearnMore();
				break;
			case 2:
				console.log("banner.jsx: Continue to App");
				me.props.onSave();
				break;
			default:
				break;
		}
	};

	scrollULListUp = () =>{
		this.ulTop -= 300;
		document.getElementsByClassName("banner_content--1bZDZ")[0].style.top = this.ulTop+"px";
		document.getElementsByClassName("banner_content--1bZDZ")[0].style.position = "relative";
	}

	scrollULListDown = () =>{
		this.ulTop += 300;
		document.getElementsByClassName("banner_content--1bZDZ")[0].style.top = this.ulTop+"px";
		document.getElementsByClassName("banner_content--1bZDZ")[0].style.position = "relative";
	}

	ulsetFocused = (focus)=>{

		
		var ullist = document.getElementById("purpose-list").getElementsByTagName("li");
		
		/*if(this.ulfocusedId == ullist.length-1){
				document.getElementsByClassName("banner_content--1bZDZ")[0].style.top = "-220px";
				document.getElementsByClassName("banner_content--1bZDZ")[0].style.position = "relative";
			}
			if(this.ulfocusedId == ullist.length-2){
				document.getElementsByClassName("banner_content--1bZDZ")[0].style.top = "-0px";
				document.getElementsByClassName("banner_content--1bZDZ")[0].style.position = "relative";
			}
*/
		for(var i=0; i<ullist.length; i++){
			if(focus){
				if(i == this.ulfocusedId ) ullist[i].getElementsByTagName("a")[0].style.color = "blue";
				else ullist[i].getElementsByTagName("a")[0].style.color = "#41afbb";
			}else{
				ullist[i].getElementsByTagName("a")[0].style.color = "#41afbb";
			}
		}
	}

	rmsetFocused = () => {
		console.log("set focus on " + this.rmfocusedId);
		document.activeElement.blur();
		var RM = document.querySelector("[class^=banner_consent--]");
		
		var me =this;
		for(var i=0; i<me.rmlength; i++){
			if(i == me.rmfocusedId){
				var o = RM.getElementsByTagName("a")[i];
				//console.log(o);
				o.style.backgroundColor = "#41afbb";
				o.style.color = "#fff";
			}else{
				var o = RM.getElementsByTagName("a")[i];
				//console.log(o);
				o.style.color = "#41afbb";
				o.style.backgroundColor = "#fff";
			}
		}
		if(!this.RMB){
			this.RMB = Array.prototype.slice.call(document.querySelectorAll("[class^=banner_option--]"));
			var extra = Array.prototype.slice.call(document.querySelectorAll("[class^=banner_learnMore--"));
			this.RMB.concat(extra);
		}
		for(var i=0; i < this.RMB.length; i++){
			var o = this.RMB[i];
			//console.log(o);
			if(i!=3)
				o.classList.remove("banner_expanded--2lZxB");
			else
				o.style.color = "unset";
		}
		
	};
	rmsetFocusedBullets = (focus) => {
	document.getElementsByClassName("banner_content--1bZDZ")[0].style.top = "0px";
		console.log("set focus on bullet " + this.rmfocusedIdBullet);
		document.activeElement.blur();
		if(!this.RMB){
			this.RMB = Array.prototype.slice.call(document.querySelectorAll("[class^=banner_option--]"));
			var extra = Array.prototype.slice.call(document.querySelectorAll("[class^=banner_learnMore--"));
			this.RMB.concat(extra);
		}
		var me =this;
		for(var i=0; i < this.RMB.length; i++){
			console.log(i,me.rmfocusedIdBullet,  this.RMB[i]) ;
			
			if(!focus){
				var o = this.RMB[i];
				o.style.color = "unset";
				continue;
			}
			if(i == me.rmfocusedIdBullet){
				

				var o = this.RMB[i];
				//console.log(o);
				if(i<3){
					o.classList.add("banner_expanded--2lZxB");
				}
				else
					o.style.color= "#27686f";

					
				if(i == 1){//Purposes for Storing Information
					this.ulfocusedId = 0;
					this.ulsetFocused(true);
					global.config.focusObject = "ul-purposes";
					return true;
				} 
			}else{
				var o = this.RMB[i];
				//console.log(o);
				if(i<3)
					o.classList.remove("banner_expanded--2lZxB");
				else
					o.style.color = "unset";
			}
		}
		var RM = document.querySelector("[class^=banner_consent--]");
		
		for(var i=0; i<me.rmlength; i++){
			var o = RM.getElementsByTagName("a")[i];
			//console.log(o);
				o.style.color = "#41afbb";
				o.style.backgroundColor = "#fff";
		}
		
	};


	handleInfo = (index) => () => {
		const { isExpanded, selectedPanelIndex } = this.state;
		this.setState({
			selectedPanelIndex: index,
			isExpanded: index !== selectedPanelIndex || !isExpanded
		});
	};

	handleWindowClick = e => {
		if (!this.bannerRef || !this.bannerRef.contains(e.target)) {
			this.props.onSave();
		}
	};

	ulhandleKeyPress = (key) => {
		switch(key){
			case VK_UP:
				this.ulfocusedId--;
				if(this.ulfocusedId <0){
					this.ulfocusedId = 0;
					this.ulsetFocused(false);
					global.config.focusObject = null;
					this.rmfocusedIdBullet = 0;
					this.rmsetFocusedBullets(true);
					break;
				}
				if([3, 6, 9].includes(this.ulfocusedId)) this.scrollULListDown();

				this.ulsetFocused(true);
				break;
			case VK_DOWN:
				var ullist = document.getElementById("purpose-list").getElementsByTagName("li");
				this.ulfocusedId++;
				if(this.ulfocusedId > ullist.length-1){
					this.ulfocusedId = 0;
					this.ulsetFocused(false);
					global.config.focusObject = null;
					this.rmfocusedIdBullet = 2;
					this.rmsetFocusedBullets(true);
					break;
				}
				if([4, 7, 10].includes(this.ulfocusedId)) this.scrollULListUp();

				this.ulsetFocused(true);
				break;
			case VK_ENTER:
				global.config.focusObject = "vendors";
				var elem = document.getElementById("purpose_" + this.ulfocusedId);
				//this.triggerEvent( elem, 'click' );
				this.handlePurposeItemClick(this.purposes[this.ulfocusedId]);
				global.config.store.toggleModalShowing(true);
				break;
			default:
				break;
		}
	}

	handleKeyPress = (key) => {
		
		if(global.config.focusObject == "ul-purposes"){
			this.ulhandleKeyPress(key);
			return true;
		}

		var me = this;
			console.log("banner.jsx : handle key press " + key);
   			if(key == VK_ENTER){
   				console.log("key is ENTER");
   				if(this.onDescVendorLink){
	   				
	   				global.config.focusObject = "vendorlist";
					var elem = document.getElementById("purpose_" + this.ulfocusedId);
					global.config.activeElem = "vendorlist";
					global.config.focusObject = "details";
					global.config.modalRef.props.onChangeDetailsPanel(Math.max(0, SECTION_VENDOR_LIST)); 
					global.config.store.toggleModalShowing(true);
					return true;
   				}
   				if(!me.onBullets){
   					me.rmhandle();
   				}else{
   					if(me.rmfocusedIdBullet == 3){
   						document.querySelector("[class^=banner_learnMore--").click();
   					}
   				}
   			}else if (key == VK_LEFT){
   				console.log("key is LEFT");
   				if(!me.onBullets){
   					me.onBullets = true;
   					me.rmsetFocusedBullets(true);
   				}
   			}else if (key == VK_RIGHT) {
   				console.log("key is RIGHT");
   				if(me.onBullets){
   					me.onBullets = false;
   					me.rmsetFocused();
   				}
   			}else if(key == VK_DOWN){
   				console.log("key is DOWN");
   				console.log("in bullets:"+me.onBullets);
   				if(me.onBullets){
   					
   					me.rmfocusedIdBullet++;
					if(me.rmfocusedIdBullet > me.RMB.length - 1) {
						me.rmfocusedIdBullet = me.RMB.length - 1;
						console.log("rm focused bullet id : " + me.rmfocusedIdBullet);
						document.getElementById("_descriptionvendorlink").style.color = "blue";
						me.rmsetFocusedBullets(false);
						this.onDescVendorLink= true;
						return true;
					}
					me.rmsetFocusedBullets(true);
   				}else{
   					console.log("rm focused id : " + me.rmfocusedId);
   					me.rmfocusedId++;
   					if(me.rmfocusedId > me.rmlength -1) me.rmfocusedId = me.rmlength-1;
   					me.rmsetFocused();
   				}
   			}else if(key == 38){
   				console.log("key is UP");
   				console.log("in bullets:"+me.onBullets);
   				if(me.onBullets){
   					
   					me.rmfocusedIdBullet--;
					if(me.rmfocusedIdBullet < 0) me.rmfocusedIdBullet = 0;
					console.log("rm focused bullet id : " + me.rmfocusedIdBullet);
					me.rmsetFocusedBullets(true);
   				}else{
   					console.log("rm focused id : " + me.rmfocusedId);
   					me.rmfocusedId--;
   					if(me.rmfocusedId < 0) me.rmfocusedId = 0;
   					me.rmsetFocused();
   				}
   			}

	};

	handleLearnMore = () => {
		this.props.onShowModal(true);
	};

	addPurpose = purposeItem => {
		this.purposes[this.cnt] = purposeItem;
		this.cnt++;
	}

	handlePurposeItemClick = purposeItem => {
	//	console.log("banner.jsx handlePurposeItemClick, purposeItem");
	//	console.log(purposeItem);
		return () => {
			this.props.onSelectPurpose(purposeItem);
		};
	};

	handleVendorListClick = () => {
		this.props.onChangeDetailsPanel(SECTION_VENDOR_LIST);
	};


	
	render(props, state) {
		var me =this;
		

		const { isShowing, onSave, theme, purposes } = props;
		const { selectedPanelIndex, isExpanded } = state;
		const {
			primaryColor,
			primaryTextColor,
			backgroundColor,
			textColor,
			textLightColor,
			textLinkColor,
		} = theme;

		return (
			<div
				ref={el => {
					this.bannerRef = el;
					if (this.props.setBannerRef) {
    					this.props.setBannerRef(this); // Pass the Banner component instance
 }
		 		}}
				class={[style.banner, !isShowing ? style.hidden : ''].join(' ')}
				style={{
					boxShadow: `0px 0px 5px ${primaryColor}`,
					backgroundColor: backgroundColor,
					color: textLightColor
				}}
			>
                            
				<div class={style.content}>
					<div
						class={style.message}
						ref={el => this.messageRef = el}
					>
						<div class={style.info}>
							<div class={style.title} style={{ color: textColor }}>
								<img class={style.logoimage} src="https://gedi.mgr.consensu.org/kwcmp/icon_gedidigital.jpg" />
								<LocalLabel localizeKey='title'></LocalLabel>
								<br clear="all" />
							</div>
							<LocalLabel localizeKey='description'>
								</LocalLabel>
							
							<div class={style.options}>
								<div
									class={[style.option, selectedPanelIndex === PANEL_COLLECTED && isExpanded ? style.expanded : ''].join(' ')}>
									<a
										onClick={this.handleInfo(PANEL_COLLECTED)}
										class={style.detailExpand}
									>
										<ChevronIcon color={textLinkColor}/>
										<LocalLabel localizeKey='links.data.title'>
										</LocalLabel>
									</a>
									<div
										className={style.optionDetails}
										style={{ color: textLightColor }}
									>
										<LocalLabel localizeKey='links.data.description'>
											
										</LocalLabel>
									</div>
								</div>
								<div
									class={[style.option, selectedPanelIndex === PANEL_PURPOSE && isExpanded ? style.expanded : ''].join(' ')}>
									<a
										onClick={this.handleInfo(PANEL_PURPOSE)}
										class={style.detailExpand}
									>
										<ChevronIcon color={textLinkColor} />
										<LocalLabel localizeKey='links.purposes.title'></LocalLabel>
									</a>

									<div
										class={style.optionDetails}
										style={{ color: textLightColor }}
									>
										<ul id="purpose-list">
											{Object.values(purposes).map((purposeItem, index) => (
												<li class={style.purposeItem}>
													<a class={style.learnMore} onClick={this.handlePurposeItemClick(purposeItem)} style={{color: textLinkColor}}>
														<PurposesLabel localizeKey={`purpose${purposeItem.id}.menu`}>{purposeItem.name}</PurposesLabel>
													</a><br />
														<PurposesLabel class={style.purposeDescription} localizeKey={`purpose${purposeItem.id}.description`}>{purposeItem.description}</PurposesLabel>
												</li>
											))}
										</ul>
									</div>
									
								</div>
								<div
									class={[style.option, selectedPanelIndex === PANEL_FEATURE && isExpanded ? style.expanded : ''].join(' ')}>
									<a
										onClick={this.handleInfo(PANEL_FEATURE)}
										class={style.detailExpand}
									>
										<ChevronIcon color={textLinkColor} />
										<LocalLabel localizeKey='links.features.title'></LocalLabel>
									</a>

									<div
										class={style.optionDetails}
										style={{ color: textLightColor }}
									>
										<ul>
												<li class={style.purposeItem}>
													<LocalLabel class={style.featureName} localizeKey='links.features.feature1.name'></LocalLabel>
													<br />
													<LocalLabel class={style.featureDescription} localizeKey='links.features.feature1.description'></LocalLabel>
												</li>
												<li class={style.purposeItem}>
													<LocalLabel class={style.featureName} localizeKey='links.features.feature2.name'></LocalLabel>
													<br />
													<LocalLabel class={style.featureDescription}  localizeKey='links.features.feature2.description'></LocalLabel>
												</li>
												<li class={style.purposeItem}>
													<LocalLabel class={style.featureName} localizeKey='links.features.feature3.name'></LocalLabel>
													<br />
													<LocalLabel class={style.featureDescription}  localizeKey='links.features.feature3.description'></LocalLabel>
												</li>
										</ul>
									</div>
									
								</div>
								<div class={style.optionDetails} style={{ color: textLightColor }}>	
									<a class={style.learnMore} onClick={this.handleVendorListClick} style={{color: textLinkColor}}>
										<LocalLabel id="_descriptionvendorlink" localizeKey='descriptionvendorlink'>
										</LocalLabel>
									</a>
								</div>
							</div>
						</div>
						<div class={style.consent}>
                                                        <a class={style.learnMore} href="javascript:window.kw_customizeInfoPrivacy()"
							   style={{ color: primaryColor, borderColor: primaryColor }}>
								<LocalLabel localizeKey='links.infoprivacy'></LocalLabel>
							</a>
                                                      
							<a class={style.learnMore} onClick={this.handleLearnMore}
							   style={{ color: primaryColor, borderColor: primaryColor }}>
								<LocalLabel localizeKey='links.manage'></LocalLabel>
							</a>
                                                      
							<a
								class={style.continue}
								onClick={onSave}
								style={{
									backgroundColor: primaryColor,
									borderColor: primaryColor,
									color: primaryTextColor
								}}
							>
								<LocalLabel localizeKey='links.accept'></LocalLabel>
							</a>
						</div>
					</div>
				</div>
			</div>
				
			
		);
		
	}
	

}
