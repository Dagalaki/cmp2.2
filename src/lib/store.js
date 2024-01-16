import { writePublisherConsentCookie, writeVendorConsentCookie } from "./cookie/cookie";
import config from './config';
import { findLocale } from './localize';


function copyData(dataObject) {
	console.log("store.js : copyData");
	if (typeof dataObject !== 'object') {
		return dataObject;
	}
	const copy = {...dataObject};
	for (let key in copy) {
		if (copy.hasOwnProperty(key) && copy[key] instanceof Set) {
			copy[key] = new Set(copy[key]);
		}
	}
	return copy;
}

export default class Store {
	constructor( {
		cmpId = 1,
		cmpVersion = 1,
		cookieVersion = 1,
		vendorConsentData,
		publisherConsentData,
		vendorList,
		customPurposeList,
		pubVendorsList,
		allowedVendorIds
	} = {}) {
		// Keep track of data that has already been persisted
		this.persistedVendorConsentData = copyData(vendorConsentData);
		this.persistedPublisherConsentData = copyData(publisherConsentData);

		this.vendorConsentData = Object.assign(
			{
				selectedPurposeIds: new Set(),
				selectedVendorIds: new Set(),
				selectedFeatureOptInsIds: new Set(),
				selectedPublisherIds: new Set(),
				selectedCustomPurposeIds: new Set(),
				restrictions: new Set()
			},
			vendorConsentData,
			{
				cookieVersion,
				cmpId,
				cmpVersion,
				consentLanguage: findLocale().substr(0, 2).toUpperCase()
			}
		);

		this.publisherConsentData = Object.assign(
			{
				selectedCustomPurposeIds: new Set()
			},
			publisherConsentData,
			{
				cookieVersion,
				cmpId
			}
		);

		this.pubVendorsList = pubVendorsList;
		this.allowedVendorIds = new Set(allowedVendorIds);
		this.isConsentToolShowing = false;
		this.isBannerShowing = false;

		this.updateVendorList(vendorList);
		this.updateCustomPurposeList(customPurposeList);
	}
	/*
	 * Build vendor consent object from data that has already been persisted. This
	 * list will only return consent=true for vendors that exist in the current
	 * vendorList.
	 */
	getVendorConsentsObject = (vendorIds) => {
		console.log("store.js : getVendorConsentsObject", this);
		const {
			vendorList = {},
			persistedVendorConsentData = {},
			pubVendorsList = {},
			allowedVendorIds,
		} = this;
		console.log("pubVendorsList",pubVendorsList);
		const {
			publisherVendorsVersion,
			globalVendorListVersion
		} = pubVendorsList;
		console.log("persistedVendorConsentData", persistedVendorConsentData);
		const {
			cookieVersion,
			created,
			lastUpdated,
			cmpId,
			cmpVersion,
			consentScreen,
			consentLanguage,
			vendorListVersion,
			maxVendorId = 0,
			selectedVendorIds = new Set(),
			selectedPurposeIds = new Set()
		} = persistedVendorConsentData;
		console.log("vendorList",vendorList);
		const {purposes = [], vendors = [], specialFeatures = [], specialPurposes = []} = vendorList;

		// Map requested vendorIds
		const vendorMap = {};
		if (vendorIds && vendorIds.length) {
			vendorIds.forEach(id => vendorMap[id] = selectedVendorIds.has(id) && (!allowedVendorIds.size || allowedVendorIds.has(id)));
		} else {
			// In case the vendor list has not been loaded yet find the highest
			// vendor ID to map any consent data we already have
			var vendorArray = Object.values(vendors);
			const lastVendorId = Math.max(maxVendorId,
				...vendorArray.map(({id}) => id),
				...Array.from(selectedVendorIds)
			);

			// Map all IDs up to the highest vendor ID found
			for (let i = 1; i <= lastVendorId; i++) {
				vendorMap[i] = selectedVendorIds.has(i) && (!allowedVendorIds.size || allowedVendorIds.has(i));
			}
		}

		// Map all purpose IDs
		const lastPurposeId = Math.max(
			...Object.values(purposes).map(({id}) => id),
			...Array.from(selectedPurposeIds)
		);

		const purposeMap = {};
		for (let i = 1; i <= lastPurposeId; i++) {
			purposeMap[i] = selectedPurposeIds.has(i);
		}
		const vendor = {consents:vendorMap, legitimateInterests: {}};
		const purpose = {consents:purposeMap, legitimateInterests: {}};
		const specialFeatureOptins = {};
		const publisher = {consents: {}, legitimateInterests: {}};
		const customPurpose = {consents:{}, legitimateInterests: {}};
		const restrictions = {};
		return {
			cookieVersion,
			created,
			lastUpdated,
			cmpId,
			cmpVersion,
			consentScreen,
			consentLanguage,
			publisherVendorsVersion,
			globalVendorListVersion,
			vendorListVersion,
			maxVendorId,
			purpose,
			vendor,
			specialFeatureOptins,
			publisher,
			customPurpose,
			restrictions
		};
	};
	
	getPublisherConsentsObject = () => {
		console.log("store.js : getPublisherConsentsObject");
		const {
			vendorList = {},
			customPurposeList = {},
			persistedPublisherConsentData = {},
			persistedVendorConsentData = {}
		} = this;

		const {
			cookieVersion,
			created,
			lastUpdated,
			cmpId,
			vendorListVersion,
			publisherPurposeVersion,
			selectedCustomPurposeIds = new Set()
		} = persistedPublisherConsentData;

		const {selectedPurposeIds = new Set()} = persistedVendorConsentData;
		const {purposes = []} = vendorList;
		const {purposes: customPurposes = []} = customPurposeList;

		const lastStandardPurposeId = Math.max(
			...Object.values(purposes).map(({id}) => id),
			...Array.from(selectedPurposeIds)
		);

		const lastCustomPurposeId = Math.max(
			...customPurposes.map(({id}) => id),
			...Array.from(selectedPurposeIds)
		);

		// Map all purpose IDs
		const standardPurposeMap = {};
		for (let i = 1; i <= lastStandardPurposeId; i++) {
			standardPurposeMap[i] = selectedPurposeIds.has(i);
		}
		const customPurposeMap = {};
		for (let i = 1; i <= lastCustomPurposeId; i++) {
			customPurposeMap[i] = selectedCustomPurposeIds.has(i);
		}

		return {
			cookieVersion,
			created,
			lastUpdated,
			cmpId,
			vendorListVersion,
			publisherPurposeVersion,
			standardPurposeConsents: standardPurposeMap,
			customPurposeConsents: customPurposeMap
		};
	};
	persist = () => {
		console.log("store.js : persist");
		const {
			vendorConsentData,
			publisherConsentData,
			vendorList,
			customPurposeList
		} = this;

		const { vendorListVersion = 1 } = vendorList || {};

		// Update modification dates and write the cookies
		const now = new Date();
		vendorConsentData.created = vendorConsentData.created || now;
		vendorConsentData.lastUpdated = now;

		// Update version of list to one we are using
		vendorConsentData.vendorListVersion = vendorListVersion;
		publisherConsentData.vendorListVersion = vendorListVersion;
		//console.log("Publisher Consent Data", publisherConsentData);
		//console.log("Custom Purposes", this.customPurposeList);
		publisherConsentData.created = publisherConsentData.created || now;
		publisherConsentData.lastUpdated = now;

		// Write vendor cookie to appropriate domain
		console.log("store.js : writeVendorConsentCookie");
		writeVendorConsentCookie({...vendorConsentData, vendorList});

		// Write publisher cookie if enabled
		if (config.storePublisherData) {
			console.log("store.js : writePublisherConsentCookie");
			writePublisherConsentCookie({
				...vendorConsentData,
				...publisherConsentData,
				vendorList,
				customPurposeList
			});
		}

		// Store the persisted data
		this.persistedVendorConsentData = copyData(vendorConsentData);
		this.persistedPublisherConsentData = copyData(publisherConsentData);

		// Notify of date changes
		this.storeUpdate();
	};
	listeners = new Set();
	subscribe = (callback) => {
		console.log("store.js : subscribe");
		this.listeners.add(callback);
	};
	unsubscribe = (callback) => {
		console.log("store.js : unsubscribe");
		this.listeners.delete(callback);
	};
	storeUpdate = () => {
		console.log("store.js : storeUpdate, listeners: "+JSON.stringify(this.listeners));
		this.listeners.forEach(callback => callback(this));
	};
	selectVendor = (vendorId, isSelected) => {
		console.log("store.js : selectVendor");
		const {selectedVendorIds} = this.vendorConsentData;
		if (isSelected) {
			selectedVendorIds.add(vendorId);
		} else {
			selectedVendorIds.delete(vendorId);
		}
		this.storeUpdate();
	};
	selectAllPurposesAndVendors = (state) => {
		console.log("store.js : selectAllPurposesAndVendors");
		this.selectAllPurposes(state);
		const {purposes = []} = this.vendorList || {};
		purposes.forEach(({id}) => this.selectAllVendors(state, id));
	};
	selectAllVendors = (isSelected, purposeId) => {
		console.log("store.js : selectAllVendors");
		const {vendors = {}} = this.vendorList || {};
		const vendorArray = Object.values(vendors);
		const operation = isSelected ? 'add' : 'delete';
		//console.log("VENDORS BEFORE", "PURPOSE", purposeId, "LIST", this.vendorConsentData.selectedVendorIds);
		vendorArray.forEach(({id, purposeIds = []}) => {
			// If a purposeId is supplied only toggle vendors that support that purpose
			if (typeof purposeId !== 'number' || purposeIds.indexOf(purposeId) > -1) {
				this.vendorConsentData.selectedVendorIds[operation](id);
			}
		});
		//console.log("VENDORS AFTER", "PURPOSE", purposeId, "LIST", this.vendorConsentData.selectedVendorIds);
		this.selectPurpose(purposeId, isSelected);
		this.storeUpdate();
	};
	selectPurpose = (purposeId, isSelected) => {
		console.log("store.js : selectPurpose");
		const {selectedPurposeIds} = this.vendorConsentData;
		//console.log("BEFORE", this.vendorConsentData.selectedPurposeIds);
		if (isSelected) {
			selectedPurposeIds.add(purposeId);
		} else {
			selectedPurposeIds.delete(purposeId);
		}
		//console.log("AFTER", this.vendorConsentData.selectedPurposeIds);
		this.storeUpdate();
	};
	selectAllPurposes = (isSelected) => {
		console.log("store.js : selectAllPurposes");
		const {purposes = []} = this.vendorList || {};
		const operation = isSelected ? 'add' : 'delete';
		//console.log("BEFORE", this.vendorConsentData.selectedPurposeIds);
		purposes.forEach(({id}) => this.vendorConsentData.selectedPurposeIds[operation](id));
		//console.log("AFTER", this.vendorConsentData.selectedPurposeIds);
		this.storeUpdate();
	};
	selectCustomPurpose = (purposeId, isSelected) => {
		console.log("store.js : selectCustomPurpose");
		const {selectedCustomPurposeIds} = this.publisherConsentData;
		if (isSelected) {
			selectedCustomPurposeIds.add(purposeId);
		} else {
			selectedCustomPurposeIds.delete(purposeId);
		}
		this.storeUpdate();
	};
	selectAllCustomPurposes = (isSelected) => {
		console.log("store.js : selectAllCustomPurposes");
		const {purposes = []} = this.customPurposeList || {};
		const operation = isSelected ? 'add' : 'delete';
		purposes.forEach(({id}) => this.publisherConsentData.selectedCustomPurposeIds[operation](id));
		this.storeUpdate();
	};

	toggleConsentToolShowing = (isShown) => {
		console.log("store.js : toggleConsentToolShowing");
		this.isBannerShowing = typeof isShown === 'boolean' ? isShown : !this.isBannerShowing;
		this.isModalShowing = false;
		this.isFooterShowing = false;
		this.storeUpdate();
	};

	toggleModalShowing = (isShown) => {
		console.log("store.js : toggleModalShowing isShown: " + isShown);
		this.isModalShowing = typeof isShown === 'boolean' ? isShown : !this.isModalShowing;
		this.storeUpdate();
	};
	toggleFooterShowing = (isShown) => {
		console.log("store.js : toggleFooterShowing");
		this.isFooterShowing = typeof isShown === 'boolean' ? isShown : !this.isFooterShowing;
		this.isModalShowing = false;
		this.storeUpdate();
	};
	updateVendorList = vendorList => {
		console.log("store.js : updateVendorList");
		//console.log("[CMP LOG] updateVendorList");
		const {
			allowedVendorIds
		} = this;

		const {
			created,
			maxVendorId = 0
		} = this.vendorConsentData;

		// Filter vendors in vendorList by allowedVendorIds
		if (vendorList && vendorList.vendors && allowedVendorIds.size) {
			const vendorIds = Object.keys(vendorList.vendors);
			const filteredVendorIds = vendorIds.filter(id => allowedVendorIds.has(id));
			const filteredVendors = {};
			filteredVendorIds.forEach(id => {
				filteredVendors[id] = vendorList.vendors[id];
			});
			vendorList.vendors = filteredVendors;
			//vendorList.vendors = vendorList.vendors.filter(({id}) => allowedVendorIds.has(id));
		}

		const {
			vendors = [],
			purposes = {},
		} = vendorList || {};

		const purposesArray = Object.values(purposes);
		// If vendor consent data has never been persisted set default selected status
		if (!created) {
			this.vendorConsentData.selectedPurposeIds = new Set(purposesArray.map(p => p.id));
			const vendorsArray = Object.values(vendors);
			this.vendorConsentData.selectedVendorIds = new Set(vendorsArray.map(v => v.id));
		}

		const {selectedVendorIds = new Set()} = this.vendorConsentData;

		// Find the maxVendorId out of the vendor list and selectedVendorIds
		this.vendorConsentData.maxVendorId = Math.max(maxVendorId,
			...Object.values(vendors).map(({id}) => id),
			...Array.from(selectedVendorIds)
		);
		this.vendorList = vendorList;
		this.storeUpdate();
	};
	updateCustomPurposeList = customPurposeList => {
		console.log("store.js : updateCustomPurposeList");
		const {created} = this.publisherConsentData;
		//console.log("[CMP LOG] updateCustomPurposesList");
		// If publisher consent has never been persisted set the default selected status
		if (!created) {
			const {purposes = [], } = customPurposeList || {};
			this.publisherConsentData.selectedCustomPurposeIds = new Set(Object.values(purposes).map(p => p.id));
		}

		const {version = 1} = customPurposeList || {};
		this.publisherConsentData.publisherPurposeVersion = version;

		this.customPurposeList = customPurposeList;
		this.storeUpdate();
	};
}