import { writePublisherConsentCookie, writeVendorConsentCookie } from "./cookie/cookie";
import config from './config';
import { findLocale } from './localize';



function createHttpRequest(url, callback, options) {
	var req = new XMLHttpRequest();
	//req.timeout = 500;
	if (callback) {
		req.onreadystatechange = function () {
			if (req.readyState !== 4) {
				return;
			}
			if (callback) {
				try {
					if (req.status >= 200 && req.status < 300) {
						callback(req.responseText);
					} else {
						callback(null);
					}
				} catch (e) {
					if (console && console.log) {
						console.log('Error while processing URL ' + url + ': ' + e + ' - Result was: ' + req.status + '/' + req.responseText);
						console.log(e);
					}
				}
			}
			req.onreadystatechange = null;
			req = null;
		};
	}
	
	try {
		req.open((options ? options.method : null) || 'GET', url, true);
		if (!options || !options.dosend) {
			req.send(null);
		} else {
			options.dosend(req);
		}
	} catch (e) {
		req.onreadystatechange = null;
		try {
			callback(null);
		} catch (e2) {}
		req = null;
	}
	return req;
}

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
		cookieVersion = 2,
		vendorConsentData,
		publisherConsentData,
		vendorList,
		customPurposeList,
		pubVendorsList,
		allowedVendorIds
	} = {}) {
		console.log("store.js constructor cookieVersion before:", cookieVersion);

		// Keep track of data that has already been persisted
		this.persistedVendorConsentData = copyData(vendorConsentData);
		this.persistedPublisherConsentData = copyData(publisherConsentData);
		console.log("store.js constructor cookieVersion:", cookieVersion);
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
		console.log("storejs constructor -> vendorConsentData", this.vendorConsentData);
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
	getVendorConsentsBits = (vendorIds) => {
		console.log("store.js : getVendorConsentsBits", this);
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
			vendorIds.forEach(id => vendorMap[id] = selectedVendorIds.has(id) && (!allowedVendorIds.size || allowedVendorIds.has(id.toString())));
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
				console.log("vendorIds");
				console.log(selectedVendorIds, i, selectedVendorIds.has(i));
				vendorMap[i] = selectedVendorIds.has(i) && (!allowedVendorIds.size || allowedVendorIds.has(i.toString()))?'1':'0';
			}
		}

		// Map all purpose IDs
		const lastPurposeId = Math.max(
			...Object.values(purposes).map(({id}) => id),
			...Array.from(selectedPurposeIds)
		);
		console.log(typeof vendorList.vendors, vendorList.vendors);	
		const getAllUniquePurposes = (vendorList) => {
			const allPurposes = Object.values(vendorList.vendors).reduce((accumulator, vendor) => {
   				 // Check if the properties exist and are iterable
				if (vendor.legIntPurposes && vendor.legIntPurposes.length) {
					console.log("legintpurposes:",vendor.legIntPurposes);
					 accumulator.push(...vendor.legIntPurposes);
					console.log("legIntPurposes accum", accumulator);
				}
				if (vendor.flexiblePurposes && vendor.flexiblePurposes.length) {
					accumulator.push(...vendor.flexiblePurposes);
				}
				if (vendor.purposes && vendor.purposes.length) {
					accumulator.push(...vendor.purposes);
				}
				return accumulator;
			}, []);
			const uniquePurposes = [...new Set(allPurposes)].sort((a,b) => a - b);
			return uniquePurposes;
		};
		const uniquePurposes =  getAllUniquePurposes(vendorList);
		const purposeMap = {};
		for (let i = 1; i <= lastPurposeId; i++) {
			console.log(uniquePurposes, i, uniquePurposes.includes(i));
			purposeMap[i] = uniquePurposes.includes(i)?'1':'0';
		}
		console.log("vendorMap:",vendorMap);
		console.log("purposeMap:", purposeMap);
		console.log("vendor bit string:", Object.values(vendorMap).join(""));
		console.log("purpose bit string:", Object.values(purposeMap).join(""));
		const vendor = {consents:Object.values(vendorMap).join(""), legitimateInterests: {}};
		const purpose = {consents:Object.values(purposeMap).join(""), legitimateInterests: {}};
		const specialFeatureOptins = {};
		const publisher = {consents: {}, legitimateInterests: {}};
		const customPurpose = {consents:{}, legitimateInterests: {}};
		const restrictions = {};
		return {
			vendor,
			specialFeatureOptins,
			publisher,
			purpose,
			restrictions
		};
	};
	
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
		const legIntVendorMap = {};
		if (vendorIds && vendorIds.length) {
			vendorIds.forEach(id => vendorMap[id] = selectedVendorIds.has(id) && (!allowedVendorIds.size || allowedVendorIds.has(id.toString()))?1:0);
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
				var vend = vendors[i];
				if(i == 47) console.log("VENDORRRRR", vend);
			//	console.log("selecting vendor ids");
			//	console.log(selectedVendorIds, i, selectedVendorIds.has(i));
			//	console.log(allowedVendorIds.size, allowedVendorIds, allowedVendorIds.has(i.toString()));
				vendorMap[i] = selectedVendorIds.has(i) && (!allowedVendorIds.size || allowedVendorIds.has(i.toString()));
				legIntVendorMap[i] = vend && vendorMap[i] && vend.legIntPurposes && vend.legIntPurposes.length > 0;
			}
		}
		console.log("vendorMap", vendorMap, "legint", legIntVendorMap);
		const getAllUniquePurposes = (vendorList) => {
			const uniquePurposes = [];
			const uniqueLegIntPurposes = [];

			Object.values(vendorList.vendors).forEach((vendor) => {
				console.log("vendor", vendor);
				if (vendor.legIntPurposes && vendor.legIntPurposes.length) {
					console.log("legint", vendor.legIntPurposes);
					uniquePurposes.push(...vendor.legIntPurposes);
					uniqueLegIntPurposes.push(...vendor.legIntPurposes);
				}
				if (vendor.flexiblePurposes && vendor.flexiblePurposes.length) {
					console.log("flex", vendor.flexiblePurposes);
					uniquePurposes.push(...vendor.flexiblePurposes);
				}
				if (vendor.purposes && vendor.purposes.length) {
					console.log("normal", vendor.purposes);
					uniquePurposes.push(...vendor.purposes);
				}
			});

			// Deduplicate and sort the arrays
			const sortedUniquePurposes = [...new Set(uniquePurposes)].sort((a, b) => a - b);
			const sortedUniqueLegIntPurposes = [...new Set(uniqueLegIntPurposes)].sort((a, b) => a - b);

			return {
				uniquePurposes: sortedUniquePurposes,
				uniqueLegIntPurposes: sortedUniqueLegIntPurposes
			};
		};
		const {uniquePurposes, uniqueLegIntPurposes} = getAllUniquePurposes(vendorList);
		//const uniquePurposes =  getAllUniquePurposes(vendorList);
		const purposeMap = {};
		console.log("both purpose arrays", {uniquePurposes, uniqueLegIntPurposes});
		// Map all purpose IDs
		const lastPurposeId = Math.max(
			...Object.values(purposes).map(({id}) => id),
			...Array.from(selectedPurposeIds)
		);

		for (let i = 1; i <= lastPurposeId; i++) {
			console.log(uniquePurposes, i, uniquePurposes.includes(i));
			purposeMap[i] = uniquePurposes.includes(i);
		}
		const legIntMap = {};
		for (let i = 1; i <=lastPurposeId; i++) {
			legIntMap[i] = uniqueLegIntPurposes.includes(i);
		}
	
		console.log("purposeMap",purposeMap);
		const vendor = {consents:vendorMap, legitimateInterests: legIntVendorMap};
		const purpose = {consents:purposeMap, legitimateInterests: legIntMap};
		const specialFeatureOptins = {};
		const publisher = {consents: {}, legitimateInterests: legIntMap};
		const customPurpose = {consents:{}, legitimateInterests: legIntMap};
		const restrictions = {};
		return {
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
		console.log("store.js : vendorConsentData", vendorConsentData);
		const { vendorListVersion = 1 } = vendorList || {};

		// Update modification dates and write the cookies
		const now = new Date();
		now.setHours(0,0,0,0);
		vendorConsentData.created = /*vendorConsentData.created ||*/ now;
		vendorConsentData.lastUpdated = now;

		// Update version of list to one we are using
		vendorConsentData.vendorListVersion = vendorListVersion;
		publisherConsentData.vendorListVersion = vendorListVersion;
		//console.log("Publisher Consent Data", publisherConsentData);
		//console.log("Custom Purposes", this.customPurposeList);
		publisherConsentData.created = /*publisherConsentData.created ||*/ now;
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
		console.log("store.js persist vendorConsentData");
		console.log(vendorConsentData);
		console.log("store.js persist publisherConsentData");
		console.log(publisherConsentData);
		this.persistedVendorConsentData = copyData(vendorConsentData);
		this.persistedPublisherConsentData = copyData(publisherConsentData);

		// Notify of date changes
		this.storeUpdate();

		window.__tcfapi("getTCData", 2, function (tcData, success) {
			 if (success) {
			        console.log("success");
			 }

			 console.log("TCDATA");
			 console.log(tcData);

			 const vendorMap = {};
			 vendorMap[0] = (tcData.vendor.consents[47])? 1: 0;
			 vendorMap[1] = (tcData.vendor.consents[126])? 1: 0;
			 //console.log('in persist', tcData.vendor.consents, vendorMap);

			 const purposeMap = {};

			 var url = "sendToDB.php?v47=" + tcData.vendor.consents[47] + "&v126="+ tcData.vendor.consents[126] ;
			console.log("in persist purposes", tcData.purpose);
			 for(var i=1;i<=11; i++){
			 	purposeMap[i] = (tcData.purpose.consents[i])? 1: 0;
			 }
			 var url = "sendToDB.php?vendors="+Object.values(vendorMap).join("") + "&purposes="+Object.values(purposeMap).join("");
			 console.log(">>>>>>>>> store.js send to DB: " + url);
			 createHttpRequest(url, function(ret){
			 	console.log(ret);

			 });

			 for(var i =1; i<= 11; i++){
			 	

			 	if (tcData.vendor.consents[47] && tcData.purpose.consents[i]) {
        			console.log("Vendor ID 47 has consent for purpose ID " + i);
 				}else if(tcData.vendor.consents[47] && !tcData.purpose.consents[i]){
 					console.log("Vendor ID 47 has NO consent for purpose ID " + i);
 				}
 				if (tcData.vendor.consents[126] && tcData.purpose.consents[i]) {
        			console.log("Vendor ID 126 has consent for purpose ID " + i);
 				}else if(tcData.vendor.consents[126] && !tcData.purpose.consents[i]){
 					console.log("Vendor ID 126 has NO consent for purpose ID " + i);
 				}
 				if (tcData.vendor.legitimateInterests[47] && tcData.purpose.legitimateInterests[i]) {
				        console.log("User has been informed of vendor ID 47's legitimate interest for purpose ID "+i+" and hasn't objected to it");
				 }
				 if (!tcData.vendor.legitimateInterests[47] || !tcData.purpose.legitimateInterests[i]) {
				        console.log("User has objected to vendor ID 47's legitimate interest for purpose ID "+i);
				 }
				 if (tcData.vendor.legitimateInterests[126] && tcData.purpose.legitimateInterests[i]) {
				        console.log("User has been informed of vendor ID 126's legitimate interest for purpose ID "+i+" and hasn't objected to it");
				 }
				 if (!tcData.vendor.legitimateInterests[126] || !tcData.purpose.legitimateInterests[i]) {
				        console.log("User has objected to vendor ID 126's legitimate interest for purpose ID "+i);
				 }
			 }

		}, [47,126]);
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
		console.log("BEFORE", this.vendorConsentData.selectedPurposeIds);
		if (isSelected) {
			selectedPurposeIds.add(purposeId);
		} else {
			selectedPurposeIds.delete(purposeId);
		}
		console.log("AFTER", this.vendorConsentData.selectedPurposeIds);
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
		console.log("store.js : updateVendorList", vendorList);
		//console.log("[CMP LOG] updateVendorList");
		const {
			allowedVendorIds
		} = this;

		const {
			created,
			maxVendorId = 0,
			selctedPurposeIds
		} = this.vendorConsentData;

		// Filter vendors in vendorList by allowedVendorIds
		if (vendorList && vendorList.vendors && allowedVendorIds.size) {
			const vendorIds = Object.keys(vendorList.vendors);
			const filteredVendorIds = vendorIds.filter(id => allowedVendorIds.has(id.toString()));
			const filteredVendors = {};
			filteredVendorIds.forEach(id => {
				filteredVendors[id] = vendorList.vendors[id];
			});
			vendorList.vendors = filteredVendors;
			//vendorList.vendors = vendorList.vendors.filter(({id}) => allowedVendorIds.has(id));
		}
		this.vendorList = vendorList;

		const {
			vendors = [],
			purposes = {},
			specialPurposes = {}
		} = vendorList || {};

		const purposesArray = Object.values(purposes);
		// If vendor consent data has never been persisted set default selected status
		console.log("purposes array:",purposesArray);
		if (!created) {
			this.vendorConsentData.selectedPurposeIds = new Set(purposesArray.map(p => p.id));
			console.log("selectedPurposeIds",this.vendorConsentData.selectedPurposeIds);
			const vendorsArray = Object.values(vendors);
			this.vendorConsentData.selectedVendorIds = new Set(vendorsArray.map(v => v.id));
			console.log(this.vendorConsentData.selectedVendorIds);
		}

		const {selectedVendorIds = new Set(), selectedPurposeIds = new Set()} = this.vendorConsentData;

		// Find the maxVendorId out of the vendor list and selectedVendorIds
		this.vendorConsentData.maxVendorId = Math.max(maxVendorId,
			...Object.values(vendors).map(({id}) => id),
			...Array.from(selectedVendorIds)
		);
		console.log("max vendor id", this.vendorConsentData.maxVendorId);
		console.log("selectedVendorIds", selectedVendorIds);
		// Update selectedPurposeIds based on specialPurposes
		selectedVendorIds.forEach(vendorId => {
			const vendor = vendors[vendorId];
			console.log("Vendor:", vendor);

			if (vendor && vendor.specialPurposes && Array.isArray(vendor.specialPurposes)) {
				console.log("Vendor specialPurposes:", vendor.specialPurposes);

				for (let i = 0; i < vendor.specialPurposes.length; i++) {
					const specialPurposeId = vendor.specialPurposes[i];
					console.log("Checking specialPurposeId:", specialPurposeId);
					console.log("selectedPurposeIds",selectedPurposeIds/*, selectedPurposeIds.has(specialPurposeId)*/);
					if (!selectedPurposeIds.has(specialPurposeId)) {
						console.log("selcted purpose ids does NOT have "+specialPurposeId);
						selectedPurposeIds.add(specialPurposeId);
						console.log("Added specialPurposeId:", specialPurposeId);
					} else {
						console.log("specialPurposeId already in selectedPurposeIds:", specialPurposeId);
					}
				}
			}
		});

		console.log("UPDATED VENDOR DATA",this.vendorConsentData);
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
