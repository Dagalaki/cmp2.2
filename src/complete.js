import 'core-js/fn/array/reduce';
import 'core-js/fn/array/fill';
import 'core-js/fn/array/map';
import 'core-js/fn/array/for-each';
import 'core-js/fn/array/filter';
import 'core-js/fn/array/from';
import 'core-js/fn/set';
import log from './lib/log';
import { init } from './lib/init';
import { CMP_GLOBAL_NAME, CMP_CALL_NAME, CMP_LOCATOR_NAME } from "./lib/cmp";

function handleConsentResult(cmp, {vendorListVersion: listVersion} = {}, {created, vendorListVersion} = {}, publisherConsents) {
	try {
		//console.log("[CMP LOG] - handleConsentResult");
		//console.log("[CMP LOG] - vendorlistVersion", vendorListVersion);
		//console.log("[CMP LOG] - listVersion", listVersion);
		//console.log("[CMP LOG] - created", created);
		//console.log("[CMP LOG] - config", config);
		//console.log("[CMP LOG] - publisherConsents", publisherConsents);
	} catch (e) {
		//console.log("[CMP LOG] - handleConsentResult ERROR", e);
	}
	if (!created) {
		log.debug('No consent data found. Showing consent tool');
		cmp('showConsentTool');
	} else if (!listVersion) {
		log.debug('Could not determine vendor list version. Not showing consent tool');
	} else if (vendorListVersion !== listVersion) {
		log.debug('Consent found for version ${vendorListVersion}, but received vendor list version ${listVersion}. Showing consent tool');
		cmp('showConsentTool');
	} else if (config.storePublisherData === true && !publisherConsents) {
		log.debug('Vendor Consent found. But Publisher Consent is set to be stored and it\'s missing');
		cmp('showConsentTool');
	} else {
		log.debug('Consent found. Not showing consent tool');
		cmp('setDataAlreadyStored');
	}
}

function checkConsent(cmp) {
	try {
		//console.log("[CMP LOG] - checkConsent",cmp);
	} catch (e) {
		//console.log("[CMP LOG] - checkConsent ERROR");
		//console.log(e);
	}
	if (!cmp) {
		log.error('CMP failed to load');
	} else if (!window.navigator.cookieEnabled) {
		log.warn('Cookies are disabled. Ignoring CMP consent check');
	} else {
		cmp('getVendorList', null, vendorList => {
			//console.log("[CMP LOG] - complete #1 Getting Vendor List");
			
			const timeout = setTimeout(() => {
				//console.log("[CMP LOG] - complete #timeout1#", "STORE PUBLISHER DATA: "+config.storePublisherData);
				handleConsentResult(cmp, vendorList);
			}, 100);
			
			cmp('getVendorConsents', null, vendorConsents => {
				//console.log("[CMP LOG] - complete #2 Getting Vendor Consent");
				clearTimeout(timeout);
				if (config.storePublisherData === true) {
					const timeout_publisher = setTimeout(() => {
						//console.log("[CMP LOG] - complete #timeout2#", "STORE PUBLISHER DATA: "+config.storePublisherData);
						handleConsentResult(cmp, vendorList, vendorConsents);
					}, 100);
					cmp('getPublisherConsents', null, publisherConsents => {
						//console.log("[CMP LOG] - complete #3 Getting Publisher Consent", publisherConsents);
						clearTimeout(timeout_publisher);
						handleConsentResult(cmp, vendorList, vendorConsents, publisherConsents);
					});
				} else {
					handleConsentResult(cmp, vendorList, vendorConsents);
				}
			});
		});
	}
}

// Preserve any config options already set
const {config} = window[CMP_GLOBAL_NAME] || {};
const configUpdates = {
	globalConsentLocation: '//acdn.adnxs.com/cmp/docs/portal.html',
	...config
};

// Add locator frame
function addLocatorFrame() {
	if (!window.frames[CMP_LOCATOR_NAME]) {
		if (document.body) {
			const frame = document.createElement('iframe');
			frame.style.display = 'none';
			frame.name = CMP_LOCATOR_NAME;
			document.body.appendChild(frame);
		} else {
			setTimeout(addLocatorFrame, 5);
		}
	}
}

addLocatorFrame();

// Add stub
const {commandQueue = []} = window[CMP_GLOBAL_NAME] || {};
const cmp = function (command, parameter, callback) {
	commandQueue.push({
		command,
		parameter,
		callback
	});
};
cmp.commandQueue = commandQueue;
cmp.receiveMessage = function (event) {
	const data = event && event.data && event.data[CMP_CALL_NAME];
	if (data) {
		const {callId, command, parameter} = data;
		commandQueue.push({
			callId,
			command,
			parameter,
			event
		});
	}
};

window[CMP_GLOBAL_NAME] = cmp;

// Listen for postMessage events
const listen = window.attachEvent || window.addEventListener;
listen('message', event => {
	window[CMP_GLOBAL_NAME].receiveMessage(event);
}, false);

// Initialize CMP and then check if we need to ask for consent
init(configUpdates).then(() => checkConsent(window[CMP_GLOBAL_NAME]));
