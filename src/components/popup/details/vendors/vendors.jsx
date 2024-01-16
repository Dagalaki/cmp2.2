import { h, Component } from 'preact';
import style from './vendors.less';
import detailsStyle from '../details.less';
import Switch from '../../../switch/switch';
import Label from "../../../label/label";
import ExternalLinkIcon from '../../../externallinkicon/externallinkicon'


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
class PurposesLabel extends Label {
	static defaultProps = {
		prefix: 'purposes'
	};
}

export default class Vendors extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSelectAll: true
		};
		this.buttons = [];
		this.i=0;
		this.focusedId = 0;
		this.onallowAll = true;
		this.focusOnMain = true;
	}

	static defaultProps = {
		vendors: [],
		selectedVendorIds: new Set(),
		selectVendor: () => {},
		selectAllVendors: () => {},
		selectedPurposeDetails: {}
	};

	addButton = (id, selected) => {
		this.buttons[this.i] = {id: id, selected:selected};
		this.i++;
	}


	handleKeyPress = (key) =>{
		document.activeElement.blur()
		console.log("vendors.jsx key : " + key);
		switch(key){
			case VK_ENTER:
				if(this.focusOnMain){
					global.config.detailsRef.handleButtonClick();
					break;
				}

				if(this.onallowAll){
					this.handleToggleAll();
					break;
				}
				var dataId =  this.buttons[this.focusedId].id;
				var ind = "check_" + this.buttons[this.focusedId].id;
				var isSelected = document.getElementById(ind).checked;
				this.handleSelectVendor({dataId, isSelected: !isSelected});
				break;
			case VK_RIGHT:
				if(this.onallowAll) break;
				if(this.focusOnMain) {
					global.config.detailsRef.handleKeyPress(key);
					break;
				}
				var dataId =  this.buttons[this.focusedId].id;
				var isSelected = false;
				this.handleSelectVendor({dataId, isSelected: !isSelected});
				break;
			case VK_LEFT:
				if(this.onallowAll) break;
				if(this.focusOnMain) {
					global.config.detailsRef.handleKeyPress(key);
					break;
				}
				var dataId =  this.buttons[this.focusedId].id;
				var isSelected = true;
				this.handleSelectVendor({dataId, isSelected: !isSelected});
				break;
			case VK_DOWN:
				if(this.focusOnMain){
					break;
				}
				if(this.onallowAll){
					this.onallowAll = false;
					this.setFocusOnAllowAll(false);
					this.focusedId = 0;
					this.setFocused(true);
					break;
				}
				this.focusedId ++;
				if(this.focusedId > this.buttons.length-1 ) {
					this.focusedId = this.buttons.length-1;
					this.setFocused(false);
					global.config.detailsRef.focusedId = 0;
					global.config.detailsRef.setFocused(true);
					this.focusOnMain = true;
					break;
				}
				this.setFocused(true);
				break;
			case VK_UP:
				if(this.focusOnMain){
					this.setFocused(true);
					this.focusOnMain = false;
				}
				this.focusedId--;
				if(this.focusedId < 0){
					this.onallowAll = true;
					this.focusedId = 0;
					this.setFocused(false);
					this.setFocusOnAllowAll(true);
					break;
				}
				this.setFocused(true);
				break;
			case VK_BACK:
				global.config.detailsRef.handleBack();
				break;
			default:
				break;
		}
	}

	setFocused = (focus) => {
		
		console.log("focus on " + this.focusedId );
		for(var i = 0; i< this.buttons.length; i++){
			var ind = "accept_" + this.buttons[i].id;
			if(focus){
				if(i == this.focusedId) document.getElementById(ind).style.color = "blue";
				else document.getElementById(ind).style.color = "#41afbb";
			}else{
				document.getElementById(ind).style.color = "#41afbb";
			}
		}
	}

	setFocusOnAllowAll = (focus) => {
		console.log("vendors.jsx focus on Allow All");
		if(focus) {
			this.onallowAll = true;
			document.getElementById("allow-all").style.color = "blue";
		}
		else {
			this.onallowAll = false;
			document.getElementById("allow-all").style.color = "#41afbb";
		}
	}

	handleToggleAll = () => {
		const { id: selectedPurposeId } = this.props.selectedPurposeDetails;
		const {isSelectAll} = this.state;
		this.props.selectAllVendors(isSelectAll, selectedPurposeId);
		this.setState({isSelectAll: !isSelectAll});
	};

	handleSelectVendor = ({dataId, isSelected}) => {

		console.log("vendors.jsx handleSelectVendor ("+dataId+" ," +isSelected+") ");
		this.props.selectVendor(dataId, isSelected);
	};

	render(props, state) {

		const { isSelectAll } = state;
		const {
			vendors,
			purposes,
			selectedVendorIds,
			selectedPurposeDetails,
			theme,
		} = props;

		console.log("vendors.jsx render " );
		console.log(props.selectedVendorIds);

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


			for(var i=0; i< validVendors.length; i++){
				var id = validVendors[i].id;
				var selected = selectedVendorIds.has(id);
				this.buttons[i] = {id: id, selected:selected};
				
			}

		return (
			<div onLoad="{this.setFocusOnAllowAll(true)}" ref={el => {
					this.vendorsRef = el;
					if (this.props.setVendorsRef) {
    					this.props.setVendorsRef(this); // Pass the Vendors component instance
  					}
				}} class={style.vendors}>
				<div class={style.header}>
					<div class={detailsStyle.title} style={{color: textColor}}>
						<PurposesLabel localizeKey={`purpose${selectedPurposeId}.title`}>{name}</PurposesLabel>
					</div>
				</div>
				<div class={detailsStyle.description} style={{color: textLightColor}}>
					<p><PurposesLabel localizeKey={`purpose${selectedPurposeId}.description`}>{description}</PurposesLabel></p>
					<p><PurposesLabel localizeKey='optoutdDescription'>
						
					</PurposesLabel></p>
				</div>
				<a class={style.toggleAll} onClick={this.handleToggleAll} style={{color: primaryColor}}>
					{isSelectAll ?
						<VendorsLabel id="allow-all" localizeKey='acceptAll' color="blue">Allow All</VendorsLabel> :
						<VendorsLabel id="disallow-all"  localizeKey='acceptNone'>Disallow All</VendorsLabel>
					}
				</a>
				<div class={style.vendorContent}>
					<table class={style.vendorList}>
						<tbody>
							{validVendors.map(({id, name, purposes: purposeIds, policyUrl, policyUrlDisplay}, index) => (

								<tr key={id} class={index % 2 === 0 ? style.even : ''}>
									<td>
										<div class={style.vendorName}>
											{name}
											<a href={policyUrl} class={style.policy} style={{ color: textLinkColor}} target='_blank'><ExternalLinkIcon color={textLinkColor} /></a>
										</div>
									</td>
									<td class={style.allowColumn}>
										{purposeIds.indexOf(selectedPurposeDetails.id) > -1 ?
											<span   class={style.allowSwitch}>
												<VendorsLabel  id={"accept_" + id} localizeKey='accept'></VendorsLabel> <Switch 
													color={primaryColor}
													dataId={id}
													id={"check_" + id}
													isSelected={selectedVendorIds.has(id)}
													onClick={this.handleSelectVendor}
												/>
											</span> :
											<VendorsLabel localizeKey='optOut'>requires opt-out</VendorsLabel>
										}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
}
