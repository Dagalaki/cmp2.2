import { h, Component } from 'preact';
import style from './app.less';
import { SECTION_PURPOSES, SECTION_VENDORS } from './popup/details/details';
import Popup from './popup/popup';
import Banner from './banner/banner';
import '../lib/globals';

export default class App extends Component {
	

	static defaultProps = {
		theme: {}
	};

	bannerRef = null;


	state = {
		firstTime: true,
		store: this.props.store,
		selectedDetailsPanelIndex: SECTION_PURPOSES,
		visitedPurposes: {},
		visitedCustomPurposes: {},
	};
	handleKeyCode = () => {
  		// Attach the event listener to the window
  		window.addEventListener('keyup', this.handleKeyUp);
	};
	handleKeyUp = (e) => {
		e.preventDefault();
		
		console.log("app.jsx : globals focus on " + global.config.focusObject);

		const key = e.keyCode || e.which;
		console.log("app.jsx: key=" + key);

		console.log("((((  "+this.state.firstTime+"  ))))");
		if(key == 13 && this.state.firstTime){
		 this.state.firstTime = false;
		 return;
		 }
		console.log("=== isBannerShowing: " + this.state.store.isBannerShowing);
		console.log("=== Banner state isExpanded: " + this.bannerRef.state["isExpanded"])

		console.log("=== isModalShowing: " + this.state.store.isModalShowing);

		if(global.config.focusObject == "modal"){
			this.modalRef.handleKeyPress(key);

			return;
		}

		if(this.modalRef && this.state.store.isModalShowing && typeof this.modalRef.handleKeyPress === 'function'){
			
			console.log("Modal Handle KeyPress");
			this.modalRef.handleKeyPress(key);

			return;
		}

		if(global.config.focusObject == "summary" || global.config.focusObject == "vendors") {
			this.modalRef.handleKeyPress(key);
			return true;
		}

  // Ensure that this.bannerRef is defined before calling handleKeyPress
		//console.log("app.jsx: bannerRef=");
		//console.log(this.bannerRef);
		if (this.bannerRef && this.state.store.isBannerShowing == true && typeof this.bannerRef.handleKeyPress === 'function') {
			console.log("Banner Handle KeyPress");
			this.bannerRef.handleKeyPress(key);
		}
	};
	onSave = () => {
		this.state.firstTime = true;
		const { store, notify } = this.props;
		store.persist();
		notify('onSubmit');
		store.toggleConsentToolShowing(false);
	};


	onChangeDetailsPanel = panelIndex => {
		this.props.store.toggleModalShowing(true);
		this.setState({
			selectedDetailsPanelIndex: Math.max(0, panelIndex)
		});
                
	};
	onGeneralAcceptance = state => {
		//console.log("ENDED BY HERE", state);    
	};
        
	onSelectPurpose = purposeItem => {
		const { visitedPurposes } = this.state;
		const { store } = this.props;
		const {
			selectAllVendors,
			vendorConsentData: { created }
		} = store;
		// If this is the user's first visit according to their cookie data
		// our workflow is to default all vendor consents to disallow for
		// each purpose they inspect.
		if (!created &&
			!visitedPurposes[purposeItem.id]) {
			selectAllVendors(false, purposeItem.id);
		}
		this.setState({
			visitedPurposes: {
				...visitedPurposes,
				[purposeItem.id]: true
			}
		});

		store.toggleModalShowing(true);
		this.setState({
			selectedPurposeDetails: purposeItem,
			selectedDetailsPanelIndex: SECTION_VENDORS
		});
	};
        
        onSelectCustomPurpose = (customPurposeItem, _visitedCustomPurposes) => {
		
		const { store } = this.props;
                //console.log("customPurposeItem", customPurposeItem);    
                //console.log("_visitedCustomPurposes BEFORE", _visitedCustomPurposes);
                //console.log("Current State", _visitedCustomPurposes.hasOwnProperty(customPurposeItem.id));             
                let stateCustomPurpose = null;
                if(_visitedCustomPurposes.hasOwnProperty(customPurposeItem.id) === true) {
                    if(_visitedCustomPurposes[customPurposeItem.id] === true) {
                        _visitedCustomPurposes[customPurposeItem.id] = false;
                        stateCustomPurpose = false;
                    } else {
                        _visitedCustomPurposes[customPurposeItem.id] = true;
                        stateCustomPurpose = true;
                    }
                } else {
                   _visitedCustomPurposes[customPurposeItem.id] = true; 
                   stateCustomPurpose = true;
                }
                
                this.setState({
                        visitedCustomPurposes: {
                                ...visitedCustomPurposes,
                                [customPurposeItem.id]: stateCustomPurpose
                        }
                });
                store.selectCustomPurpose(customPurposeItem.id, stateCustomPurpose);
                const { visitedCustomPurposes } = this.state;
                store.storeUpdate();
	};

	updateState = (store) => {
		this.setState({ store });
	};

	componentWillMount() {
		const { store } = this.props;
		store.subscribe(this.updateState);
	}
	componentDidMount() {
  // Add the event listener when the component mounts
		this.handleKeyCode();
	}
	componentWillUnmount() {
  // Remove the event listener when the component unmounts to avoid memory leaks
		window.removeEventListener('keyup', this.handleKeyUp);
	}
	render(props, state) {


		const {
			store,
			selectedDetailsPanelIndex,
			selectedPurposeDetails,
		} = state;
		const {
			theme,
		} = props;

		const {
			isModalShowing,
			isBannerShowing,
			toggleModalShowing,
			vendorList = {},
		} = store;

		global.config.store = store;
		const { purposes = [] } = vendorList; 
		return (
			
			<div class={[style.gdpr, (isBannerShowing  || isModalShowing) ? style.gdpr_visible : ''].join(' ')}>
				<Banner isShowing={isBannerShowing}
						isModalShowing={isModalShowing}
						onSave={this.onSave}
						onShowModal={toggleModalShowing}
						onSelectPurpose={this.onSelectPurpose}
                                                onSelectCustomPurpose={this.onSelectCustomPurpose}
						onChangeDetailsPanel={this.onChangeDetailsPanel}
                                                onGeneralAcceptance={this.onGeneralAcceptance}
						theme={theme}
						purposes={purposes}
						selectedPurposeDetails={selectedPurposeDetails}
						setBannerRef={ref => this.bannerRef = ref}
				/>
				<Popup store={store}
					   onSave={this.onSave}
					   onChangeDetailsPanel={this.onChangeDetailsPanel}
					   onSelectPurpose={this.onSelectPurpose}
                                           visitedCustomPurposes={this.visitedCustomPurposes}
                                           onSelectCustomPurpose={this.onSelectCustomPurpose}
                                           onGeneralAcceptance={this.onGeneralAcceptance}
					   selectedDetailsPanelIndex={selectedDetailsPanelIndex}
					   theme={theme}
					   selectedPurposeDetails={selectedPurposeDetails}
					   setModalRef={ref => this.modalRef = global.config.modalRef = ref}
				/>
			</div>
			
		);
	}
}
