import { h, Component } from 'preact';
import style from '../overview.less';
import Switch from '../../../../switch/switch';
import style2 from '../../vendors/vendors.less';
import detailsStyle from '../../details.less';
import Label from "../../../../label/label";
import '../../../../../lib/globals';
import ExternalLinkIcon from '../../../../externallinkicon/externallinkicon'


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


export default class VendorConsents extends Component {

	constructor(props) {
		super(props);
		this.i = 0;
		this.buttons = [];
		this.pursposesClassname = null;
		this.focusedId = 0;
	}

	static defaultProps = {
		vendors: [],
		selectedVendorIds: new Set(),
		selectVendor: () => {},
		selectAllVendors: () => {},
		selectedPurposeDetails: {}
	};

	setFocused = (focus) => {
		console.log("vendorconsents.jsx focus on : " + this.focusedId);
		for(var i=0; i< this.buttons.length; i++){
			if(focus){
				if(i == this.focusedId) {
					document.getElementById("check_"+this.buttons[i].id).style.opacity = "0.3";
					document.getElementById("check_"+this.buttons[i].id).style.transform = "scale(1.556)";
					//classList.add("consentfocus");
				}else{
					 document.getElementById("check_"+this.buttons[i].id).style.opacity = "0";
					document.getElementById("check_"+this.buttons[i].id).style.transform = "none";
				}
			}else {
				document.getElementById("check_"+this.buttons[i].id).style.opacity = "0";
					document.getElementById("check_"+this.buttons[i].id).style.transform = "none)";
			}
		}
	}

	handleKeyPress = (key) => {
	if(global.config.focusObject != "vendorconsents") return true;

		switch(key){
			case VK_UP:
				this.focusedId--;
				if(this.focusedId < 0){
					this.focusedId = 0;
					global.config.focusObject = "overview";
					global.config.overviewRef.onTabs = true;
					this.setFocused(false);
					global.config.overviewRef.setFocusOnTabs(true);
					break;
				}
				this.setFocused(true);
				break;
			case VK_DOWN:
				this.focusedId++;
				if(this.focusedId > this.buttons.length-1) {
					this.focusedId = this.buttons.length-1;
					this.setFocused(false);
					console.log("end of consents, go to basic menu, must scroll up ");
					global.config.overviewRef.scrollUp(200);
					global.config.modalRef.focusedId = 1;
					global.config.modalRef.setFocused(true);
					global.config.focusObject = "modal";
					break;
				}
				this.setFocused(true);
				break;
			case VK_LEFT:
				var dataId = this.buttons[this.focusedId].id;
				var isSelected = true;
				this.handleSelectVendorConsent({dataId, isSelected: !isSelected});
				break;
			case VK_RIGHT:
				var dataId = this.buttons[this.focusedId].id;
				var isSelected = false;
				this.handleSelectVendorConsent({dataId, isSelected: !isSelected});
				break;
			case VK_ENTER:
				var dataId = this.buttons[this.focusedId].id;
				var isSelected = false;
				this.handleSelectVendorConsent({dataId, isSelected: !isSelected});
				break;
			default:
				break;
		}
	}


mayRefresh = (val) =>{
	if(val == false ) return "No Refresh";
	else return "May Refresh";
}
	
	toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
	}

secondsToDhms = (seconds) => {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600*24));
	var h = Math.floor(seconds % (3600*24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);

	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
	}

	handleSelectVendorConsent = ({dataId, isSelected}) => {
	console.log("handle consent");
		console.log("vendorconsents.jsx handleSelectVendorConsent ("+dataId+" ," +isSelected+") ");
		global.config.store.selectVendor(dataId, isSelected); // in store.js
	};

	render(props, state){
		const {
			vendors,
			theme,
			selectedVendorIds,
			selectedPurposeDetails,
			selectedLegIntPurposeIds,
		} = props;

		const {
			textColor,
			textLightColor,
			textLinkColor,
			primaryColor
		} = theme;

const {
			id: selectedPurposeId,
			name,
			description
		} = selectedPurposeDetails;

const validVendors = vendors
			.filter(({legIntPurposes = [], purposes = []}) => legIntPurposes.indexOf(selectedPurposeId) > -1 || purposes.indexOf(selectedPurposeId) > -1);

console.log("Vendors: ");
console.log(vendors);

for(var i=0; i< vendors.length; i++){
				var id = vendors[i].id;
				this.buttons[i] = {id: id};
			}

		return (
			<div id="_vendorConsents" style="display:none" 
			ref={el => {
					this.vendorConsentsRef = el;
					if (this.props.setVendorConsentsRef) {
    					this.props.setVendorConsentsRef(this); // Pass the VendorConsent component instance
  					}
				}}
			class={style.purposeItems}>
					{vendors.map(({cookieMaxAgeSeconds, cookieRefresh, dataRetention, id, name, purposes: purposeIds, policyUrl, policyUrlDisplay}, index) => (

						<div  class={style.purposeItem} >
							<div class="vrow">
							<div class={style.vendorName}>
											{name}
											<a href={policyUrl} class={style.policy} target='_blank'><ExternalLinkIcon /></a>
										</div>
							<table>
								<tr>
									<td class={style2.allowColumn}>
										{id > -1 ?
											<span   class={style2.allowSwitch}>
												<LocalLabel  id={"legint_accept_" + id} localizeKey='links.purposes.legInt'></LocalLabel> <Switch 
													color={primaryColor}
													dataId={id}
													id={"legInt_" + id}
													isSelected={selectedLegIntPurposeIds && selectedLegIntPurposeIds.has(id)}
													onClick={this.handleSelectPurposeLegInt}
												/>
												<LocalLabel  id={"accept_" + id} localizeKey='links.purposes.consent'></LocalLabel> <Switch 
													color={primaryColor}
													dataId={id}
													id={"check_" + id}
													isSelected={selectedVendorIds.has(id)}
													onClick={this.handleSelectVendoConsent}
												/>
											</span> :
											<VendorsLabel localizeKey='optOut'>requires opt-out</VendorsLabel>
										}
									</td>
								</tr>
							</table>
							</div>
							<div class="vrow" style="position:relative; left:100px">
							<table style="text-align:left">
							<tr><th>Maximum Device Storage: </th><td>{this.secondsToDhms(cookieMaxAgeSeconds)}</td></tr>
							<tr><th>Refresh State: </th><td>{this.mayRefresh(cookieRefresh)}</td></tr>
							<tr><th>Retention Period: </th><td>{dataRetention.stdRetention} days</td></tr>
							</table>
							
							</div>
						</div>
					))}
				</div>
		);

	}
}