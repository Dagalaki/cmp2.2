import log from './log';
import config from './config';
import { encodeVendorConsentData } from './cookie/cookie';
import { encodeVendorCookieValue, encodePublisherCookieValue } from "./cookie/cookieutils";
import { fetchPubVendorList, fetchGlobalVendorList, fetchPurposeList } from './vendor';
export const CMP_GLOBAL_NAME = '__tcfapi';
export const CMP_CALL_NAME = CMP_GLOBAL_NAME + 'Call';
export const CMP_LOCATOR_NAME = CMP_GLOBAL_NAME + 'Locator';
const CMP_RETURN_NAME = CMP_GLOBAL_NAME + 'Return';

export default class Cmp {
	constructor(store) {
		this.isLoaded = false;
		this.cmpReady = false;
		this.eventListeners = {};
		this.listenerCounter = 1;
		this.listenerIdToEventMap = {};
		this.store = store;
		//console.log("[CMP LOG] store change callback is", this.storeChange);
		store.subscribe(this.storeChange);
		this.processCommand.receiveMessage = this.receiveMessage;
		this.commandQueue = [];
		this.showStatus = { isBannerShowing:false, isModalShowing:false };
		this.isConsentDataAlreadyStored = false;
	}

	commands = {
		setDataAlreadyStored: () => {
			console.log("cmp.js : setDataAlreadyStored");
			this.isConsentDataAlreadyStored = true;
		},
		/**
		 * Get all publisher consent data from the data store.
		 */
		enablePurpose: (id, state) => {
			console.log("cmp.js : enablePurpose(" +id+", "+state+")");
			if (id === "all") {
				this.store.selectAllPurposes(state);
				//console.log("Set All Purposes to state " + state);
			} else if (id !== "" && id !== "all") {
				if (typeof state === "boolean") {
					this.store.selectPurpose(id, state);
					//console.log("Set Single Purpose (" + id + ")  to state " + state);
				}
			}
		},
		getPublisherConsents: (purposeIds, callback = () => {}) => {
			console.log("cmp.js : getPublisherConsents");
			const {
				persistedPublisherConsentData,
				persistedVendorConsentData,
			} = this.store;

			// Encode limited fields for "metadata"
			const metadata = encodePublisherCookieValue({
				...persistedPublisherConsentData,
				...persistedVendorConsentData,
			}, [
				'cookieVersion',
				'created',
				'lastUpdated',
				'cmpId',
				'cmpVersion',
				'consentScreen',
				'consentLanguage',
				'vendorListVersion',
				'publisherPurposeVersion'
			]);

			const consent = {
				metadata,
				gdprApplies: config.gdprApplies,
				hasGlobalScope: config.storeConsentGlobally,
				...this.store.getPublisherConsentsObject()
			};
			callback(consent, true);
		},

		/**
		 * Get all vendor consent data from the data store.
		 * @param {Array} vendorIds Array of vendor IDs to retrieve.  If empty return all vendors.
		 */
		getTCData: (vendorIds, callback = () => {}, listenerId) => {
			console.log("cmp.js : getVendorConsents", this.store);
			console.log("getTCData params:", vendorIds, listenerId, callback);
			// Encode limited fields for "metadata"
			const {persistedVendorConsentData} = this.store;
			/*const metadata = persistedVendorConsentData && encodeVendorCookieValue(persistedVendorConsentData, [
				'cookieVersion',
				'created',
				'lastUpdated',
				'cmpId',
				'cmpVersion',
				'consentScreen',
				'consentLanguage',
				'vendorListVersion',
			]);
			console.log("METADATA:",persistedVendorConsentData,metadata);*/
			const tcData = {
				tcString: this.generateConsentString(),
				tcfPolicyVersion: 4,
  				cmpId:1000,
  				cmpVersion: 1,
  				gdprApplies: config.gdprApplies,
  				cmpStatus: this.isLoaded?"loaded":"loading",
				eventStatus: "tcloaded",
  				listenerId: listenerId,
  				isServiceSpecific: !config.storeConsentGlobally,
  				useNonStandardTexts: false,
  				publisherCC: "GR",
  				purposeOneTreatment: 0,
  				...this.store.getVendorConsentsObject(vendorIds)
			}
			console.log("TCDATA",tcData);
			/*const consent = {
				metadata,
				tcData,
				gdprApplies: config.gdprApplies,
				hasGlobalScope: config.storeConsentGlobally,
				...this.store.getVendorConsentsObject(vendorIds)
			};*/

			callback(tcData, true);
		},
		getInAppTCData: (vendorIds, callback = () => {}) => {
			console.log("cmp.js : getVendorConsents", this.store);
			// Encode limited fields for "metadata"
			const {persistedVendorConsentData} = this.store;

			const inAppTCData = {
				tcString: this.generateConsentString(),
				tcfPolicyVersion: 4,
  				cmpId:1000,
  				cmpVersion: 1,
  				gdprApplies: config.gdprApplies,
  				eventStatus: "",
  				listenerId: undefined,
  				isServiceSpecific: !config.storeConsentGlobally,
  				useNonStandardTexts: false,
  				publisherCC: "GR",
  				purposeOneTreatment: 0,
  				...this.store.getVendorConsentsBits(vendorIds)
			}
			console.log("inAppTCDATA",inAppTCData);
			/*const consent = {
				metadata,
				tcData,
				gdprApplies: config.gdprApplies,
				hasGlobalScope: config.storeConsentGlobally,
				...this.store.getVendorConsentsObject(vendorIds)
			};*/

			callback(inAppTCData, true);
		},
		/**
		 * Get the encoded vendor consent data value.
		 */
		getConsentData: (_, callback = () => {}) => {
			console.log("cmp.js : getConsentData");
			const consentData = {
				gdprApplies: config.gdprApplies,
				hasGlobalScope: config.storeConsentGlobally,
				consentData: this.generateConsentString()
			};
			callback(consentData, true);
		},

		/**
		 * Get the entire vendor list
		 */
		getVendorList: (vendorListVersion, callback = () => {}) => {
			console.log("cmp.js : getVendorList ("+vendorListVersion+")");
			const {vendorList} = this.store;
			console.log("vendorList", vendorList);
			const {vendorListVersion: listVersion} = vendorList || {};
			console.log(vendorListVersion, listVersion);
			if (!vendorListVersion || vendorListVersion === listVersion) {
				console.log("no target version given or same as used");
				callback(vendorList, true);
			} else {
				console.log("else");
				if(vendorListVersion == "LATEST"){
					console.log("LATEST");
					callback(fetchGlobalVendorList(), true);
				}else{
					console.log("not latest");
					callback(null, false);
				}
			}
		},

		ping: (_, callback = () => {}) => {
			const pingReturn = {
				gdprApplies: config.gdprAppliesGlobally,
				cmpLoaded: true,
				cmpStatus: this.isLoaded?"loaded":"stub",
                               displayStatus: this.showStatus.isBannerShowing || this.showStatus.isModalShowing ? "visible" : "hidden", // Adjust as needed based on your implementation
                               apiVersion: '2.2', // Update to the correct TCF 2.2 API version
                               cmpVersion: 1, // Update with the actual version if available
                               cmpId: 1000, // Update with the actual CMP ID if available
                               gvlVersion: 35, // Update with the actual GVL version if available
                               tcfPolicyVersion: 4 // Update with the actual TCF version if available
                           };
				//console.log(pingReturn);
                           callback(pingReturn, true);
                       },

		/**
		 * Add a callback to be fired on a specific event.
		 * @param {string} event Name of the event
		 */
		addEventListener: (event, callback) => {
			const listenerId = this.listenerCounter++;
			this.eventListeners[listenerId] = callback;

			// Trigger load events immediately if they have already occurred
			//if (this.isLoaded) {
				this.commands.getTCData(null, (tcData, success) => {
					tcData.listenerId = listenerId;

					callback( tcData, true );
				});
			//}
			/*console.log("addEventListener event:", event);
			console.trace();
			const eventSet = this.eventListeners[event] || new Set();
			const listenerId = this.listenerCounter++;
			console.log("listenerId:", listenerId);
			eventSet.add({listenerId, callback});
			console.log("eventSet",eventSet);
			this.eventListeners[event] = eventSet;
			console.log("event listeners set:", this.eventListeners);
			this.listenerIdToEventMap[listenerId] = eventSet;
			this.commands.getTCData(null, (tcData, success) => {
				tcData.listenerId = listenerId;
				// Trigger load events immediately if they have already occurred
				if (event === 'isLoaded' && this.isLoaded) {
					callback(tcData,true);
				}
				if (event === 'cmpReady' && this.cmpReady) {
					callback(tcData,true);
				}


				console.log("add event listener tcdata:", tcData);
			//	callback(tcData, true);
			}, listenerId);
			*/
		},

		/**
		 * Remove a callback for an event.
		 * @param {string} event Name of the event to remove callback from
		 */
		removeEventListener: (listenerId,callback) => {
			console.log("REMOVING EVNT LISTENER", listenerId); 
			// If an event is supplied remove the specific listener
			if (listenerId) {
				//const eventSet = this.eventListeners[event] || new Set();
				const eventSet = this.eventListeners[listenerId];
				console.log("EVENT FOUND",eventSet);
				if(eventSet){
					// If a callback is supplied remove it
					/*if (callback) {
						//eventSet.delete(callback);
						eventSet.
					}
					// If no callback is supplied clear all listeners for this event
					else {
						eventSet.clear();
					}*/
					delete this.listenerIdToEventMap[listenerId];
					console.log("EVNT DELETED", listenerId);
					callback( true);
					/*if (eventSet.size === 0) {
						const event = eventSet.event;
						delete this.eventListeners[event];
					}*/
				}
				//this.eventListeners[event] = eventSet;
			}
			// If no event is supplied clear ALL listeners
			else {
//				this.eventListeners = {};
				callback( false );
			}
		},

		/**
		 * Trigger the consent tool banner to be shown
		 */
		showConsentTool: (_, callback = () => {}) => {
			
			console.log("cmp.js : showConsentTool");
			this.store.toggleConsentToolShowing(true);
			callback(true);
		},

		/**
		 * Trigger the consent tool modal to be shown
		 */
		showModal: (_, callback = () => {}) => {
			console.log("cmp.js : showModal");
			this.store.toggleModalShowing(true);
			callback(true);
		}
	};
	storeChange = (_store) => {
		console.log("cmp.js : storeChange()");
		console.log("[CMP LOG] STORECHANGED - store passed object", _store)
		console.log("[CMP LOG] STORE VISIBILITY: " + _store.isModalShowing + " = " + _store.isBannerShowing);
		console.log("[CMP LOG] this.showStatus VISIBILITY: " + this.showStatus.isModalShowing + " = " + this.showStatus.isBannerShowing);
		if (_store.isBannerShowing === false && this.showStatus.isBannerShowing === true) {
			this.notify("isBannerHidden");
		} else if (_store.isBannerShowing === true && this.showStatus.isBannerShowing === false) {
			this.notify("isBannerShown");
		} else if (_store.isModalShowing === true && this.showStatus.isModalShowing === false) {
			this.notify("isModalShown");
		} else if (_store.isModalShowing === false && this.showStatus.isModalShowing === true) {
			this.notify("isModalHidden");
		}
		this.showStatus.isModalShowing = _store.isModalShowing;
		this.showStatus.isBannerShowing = _store.isBannerShowing;
	};
	generateConsentString = () => {
		console.log("cmp.js : generateConsentString");
		const {
			persistedVendorConsentData,
			vendorList,
			allowedVendorIds
		} = this.store;

		const {
			selectedVendorIds = new Set(),
			selectedPurposeIds = new Set()
		} = persistedVendorConsentData || {};
		console.log("persistedVendorConsentData",persistedVendorConsentData);
		console.log("selectedVendorIds",selectedVendorIds);
		console.log("selectedVendorIds2", Array.from(selectedVendorIds).filter(id => !allowedVendorIds.size || allowedVendorIds.has(id.toString())));
		console.log("allowedVendorIds",allowedVendorIds);
		// Encode the persisted data
		return persistedVendorConsentData && encodeVendorConsentData({
			...persistedVendorConsentData,
			selectedVendorIds: new Set(Array.from(selectedVendorIds).filter(id => !allowedVendorIds.size || allowedVendorIds.has(id.toString()))),
			selectedPurposeIds: new Set(Array.from(selectedPurposeIds)),
			vendorList
		});
	};
	processCommandQueue = () => {
		console.log("cmp.js : processCommandQueue");
		
		
		const queue = [...this.commandQueue];
		if (queue.length) {
			console.log(`Process ${queue.length} queued commands`);
			console.log(`callId: ${callId}, command: ${command}, parameter: ${parameter}`);
			this.commandQueue = [];
			queue.forEach(({ callId, command, parameter, callback, event }) => {
				// If command is queued with an event we will relay its result via postMessage
				if (event) {
					this.processCommand(command, parameter, (returnValue, success) =>
						event.source.postMessage({
							[CMP_RETURN_NAME]: {
								callId,
								command,
								returnValue,
								success
							}
						}, event.origin));
				} else {
					this.processCommand(command, parameter, callback);
				}
			});
		}
	};
	/**
	 * Handle a message event sent via postMessage to
	 * call `processCommand`
	 */
	receiveMessage = ({ data, origin, source }) => {
		//window.parent.console.log("cmp.js : receiveMessage ("+data+", "+origin+", "+source+")");
		const {[CMP_CALL_NAME]: cmp} = data;
		if (cmp) {
			const {callId, command, parameter} = cmp;
			//window.parent.console.log("cmp exists: ", {callId, command, parameter});
			this.processCommand(command, parameter, (returnValue, success) =>
				source.postMessage({
					[CMP_RETURN_NAME]: {
						callId,
						command,
						returnValue,
						success
					}
				}, origin));
		}
	};
	/**
	 * Call one of the available commands.
	 * @param {string} command Name of the command
	 * @param {*} parameter Expected parameter for command
	 */
	processCommand = (command, parameter, callback) => {
		console.log("cmp.js : processCommand("+command+", "+parameter+")", callback);
		console.log("CMP:", this);
		console.log("Parameter : "+ JSON.stringify(parameter) );
		console.trace();	
		//console.log("[CMP LOG] COMMAND RECEIVED", "COMMAND", command, "persistedVendorConsentData", this.store.persistedVendorConsentData, "persistedPublisherConsentData", this.store.persistedPublisherConsentData);
		if (typeof this.commands[command] !== 'function') {
			console.error(`Invalid CMP command "${command}"`);
		}
		// Special case where we have the full CMP implementation loaded but
		// we still queue these commands until there is data available. This
		// behavior should be removed in future versions of the CMP spec
		else if (
			(!this.store.persistedVendorConsentData && (command === 'getVendorConsents' || command === 'getConsentData')) ||
			(!this.store.persistedPublisherConsentData && command === 'getPublisherConsents')) {
			console.log(`Queuing command: ${command} until consent data is available`);
			this.commandQueue.push({
				command,
				parameter,
				callback
			});
		} else {
			console.log(`Proccess command: ${command}, parameter: ${parameter}`);
			this.commands[command](parameter, callback);
		}
	}
	;
	/**
	 * Trigger all event listener callbacks to be called.
	 * @param {string} event Name of the event being triggered
	 * @param {*} data Data that will be passed to each callback
	 */
	notify = (event, data) => {
		console.log(`Notify event: ${event}`);
		const eventSet = this.eventListeners[event] || new Set();
		eventSet.forEach(listener => {
			listener({event, data});
		});

		// Process any queued commands that were waiting for consent data
		if (event === 'onSubmit') {
			console.log(")))))) Submit consent data");
			//console.log("[CMP LOG] consent already stored", this.isConsentDataAlreadyStored);
			if(this.isConsentDataAlreadyStored === true) {
				console.log("consent data alredy stored");
				this.notify("onConsentChanged");
			}
			this.processCommandQueue();
		}
		
	};
}
