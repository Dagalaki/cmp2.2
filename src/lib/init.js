import { h, render } from 'preact';
import Promise from 'promise-polyfill';
import Store from './store';
import Cmp, { CMP_GLOBAL_NAME } from './cmp';
import { readVendorConsentCookie, readPublisherConsentCookie } from './cookie/cookie';
import { fetchPubVendorList, fetchGlobalVendorList, fetchPurposeList } from './vendor';
import log from './log';
import pack from '../../package.json';
import config from './config';

const CMP_VERSION = 1;

// CMP_ID is the ID of your consent management provider according to the IAB. Get an ID here: https://advertisingconsent.eu/cmps/
//const CMP_ID = 223;
const CMP_ID = 1000;

// The cookie specification version, as determined by the IAB. Current is 1.
const COOKIE_VERSION = 2;

export function init(configUpdates) {
	console.log("init.js : init");
	config.update(configUpdates);
	log.debug('Using configuration:', config);
	const startTime = Date.now();

	// Fetch the current vendor consent before initializing
	console.log("init.js : fetch the current vendor before initializing");
	return Promise.all([
		readVendorConsentCookie(),
		fetchPubVendorList()
	])
		.then(([vendorConsentData, pubVendorsList]) => {
			console.log("INIT VENDOR CONSENT",vendorConsentData);
			const {vendors} = pubVendorsList || {};
                                
			// Check config for allowedVendorIds then the pubVendorList
			console.log("init.js : check config for allowedVendorIds then the pubVendorList");
			const {allowedVendorIds: configVendorIds} = config;
			const allowedVendorIds = configVendorIds instanceof Array && configVendorIds.length ? configVendorIds :
				vendors && vendors.map(vendor => vendor.id);

			// Initialize the store with all of our consent data
			console.log("init.js : Initialize the store with all of our consent data");
			const store = new Store({
				cmpVersion: CMP_VERSION,
				cmpId: CMP_ID,
				cookieVersion: COOKIE_VERSION,
				vendorConsentData,
				publisherConsentData: readPublisherConsentCookie(),
				pubVendorsList,
				allowedVendorIds
			});
			console.log("init.js [CMP LOG] VENDOR CONSENT DATA", vendorConsentData);
			// Pull queued command from __tcfapi stub
			const {commandQueue = []} = window[CMP_GLOBAL_NAME] || {};

			// Replace the __tcfapi with our implementation
			const cmp = new Cmp(store);
			store.cmp = cmp;
			// Expose `processCommand` as the CMP implementation
			window[CMP_GLOBAL_NAME] = cmp.processCommand;

			// Notify listeners that the CMP is loaded
			console.log(`init.js Successfully loaded CMP version: ${pack.version} in ${Date.now() - startTime}ms`);
			cmp.isLoaded = true;
			cmp.notify('isLoaded');

			// Render the UI
			const App = require('../components/app').default;
			render(<App store={store} theme={config.theme} notify={cmp.notify} />, document.body);


			// Execute any previously queued command
			cmp.commandQueue = commandQueue;
			cmp.processCommandQueue();
			console.log("init.js before fetching gvl");
			// Request lists
			return Promise.all([
				fetchGlobalVendorList().then((vendorList) => {
					store.vendorList = vendorList;
					return vendorList;	
				})
				.then(store.updateVendorList),
				fetchPurposeList().then(store.updateCustomPurposeList)
			]).then(() => {
				cmp.cmpReady = true;
				cmp.notify('cmpReady');
			}).catch(err => {
				log.error('Failed to load lists. CMP not ready', err);
			});
		})
		.catch(err => {
			log.error('Failed to load CMP', err);
		});
}
