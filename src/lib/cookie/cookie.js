import Promise from 'promise-polyfill';
import log from '../log';
import {
	padRight,
	encodeVendorCookieValue,
	decodeVendorCookieValue,
	encodePublisherCookieValue,
	decodePublisherCookieValue
} from './cookieutils';

import { sendPortalCommand } from '../portal';
import pack from '../../../package.json';
import config from '../config';

const PUBLISHER_CONSENT_COOKIE_NAME = 'pubconsent';
const PUBLISHER_CONSENT_COOKIE_MAX_AGE = 33696000;

const VENDOR_CONSENT_COOKIE_NAME = 'euconsent';
const VENDOR_CONSENT_COOKIE_MAX_AGE = 33696000;


function encodeVendorIdsToBits(maxVendorId, selectedVendorIds = new Set()) {
	console.log("cookie.js : encodeVendorIdsToBits");
	let vendorString = '';
	for (let id = 1; id <= maxVendorId; id++) {
		vendorString += (selectedVendorIds.has(id) ? '1' : '0');
	}
	return padRight(vendorString, Math.max(0, maxVendorId - vendorString.length));
}

function encodePurposeIdsToBits(purposes, selectedPurposeIds = new Set()) {
	console.log("cookie.js : encodePurposeIdsToBits");
	const maxPurposeId = Math.max(0,
		...Object.values(purposes).map(({id}) => id),
		...Array.from(selectedPurposeIds));
	let purposeString = '';
	for (let id = 1; id <= maxPurposeId; id++) {
		purposeString += (selectedPurposeIds.has(id) ? '1' : '0');
	}
	return purposeString;
}

function decodeBitsToIds(bitString) {
	console.log("cookie.js : decodeBitsToIds");
	return bitString.split('').reduce((acc, bit, index) => {
		if (bit === '1') {
			acc.add(index + 1);
		}
		return acc;
	}, new Set());
}

function convertVendorsToRanges(maxVendorId, selectedIds) {
	console.log("cookie.js : convertVendorsToRanges");
	let range = [];
	const ranges = [];
	for (let id = 1; id <= maxVendorId; id++) {
		if (selectedIds.has(id)) {
			range.push(id);
		}

		// If the range has ended or at the end of vendors add entry to the list
		if ((!selectedIds.has(id) || id === maxVendorId) && range.length) {
			const startVendorId = range.shift();
			const endVendorId = range.pop();
			range = [];
			ranges.push({
				isRange: typeof endVendorId === 'number',
				startVendorId,
				endVendorId
			});
		}
	}
	return ranges;
}

function encodeVendorConsentData(vendorData) {
	console.log("cookie.js : encodeVendorConsentData");
	const {vendorList = {}, selectedPurposeIds, selectedVendorIds, maxVendorId} = vendorData;
	const {purposes = {}} = vendorList;

	console.log(vendorData);

	// Encode the data with and without ranges and return the smallest encoded payload
	const noRangesData = encodeVendorCookieValue({
		...vendorData,
		maxVendorId,
		purposeIdBitString: encodePurposeIdsToBits(Object.values(purposes), selectedPurposeIds),
		isRange: false,
		vendorIdBitString: encodeVendorIdsToBits(maxVendorId, selectedVendorIds)
	});

	const vendorRangeList = convertVendorsToRanges(maxVendorId, selectedVendorIds);
	const rangesData = encodeVendorCookieValue({
		...vendorData,
		maxVendorId,
		purposeIdBitString: encodePurposeIdsToBits(Object.values(purposes), selectedPurposeIds),
		isRange: true,
		defaultConsent: false,
		numEntries: vendorRangeList.length,
		vendorRangeList
	});

	return noRangesData.length < rangesData.length ? noRangesData : rangesData;
}

function decodeVendorConsentData(cookieValue) {
	console.log("cookie.js : decodeVendorConsentData");
	const {
		cookieVersion,
		cmpId,
		cmpVersion,
		consentScreen,
		consentLanguage,
		vendorListVersion,
		purposeIdBitString,
		maxVendorId,
		created,
		lastUpdated,
		isRange,
		defaultConsent,
		vendorIdBitString,
		vendorRangeList
	} = decodeVendorCookieValue(cookieValue);

	const cookieData = {
		cookieVersion,
		cmpId,
		cmpVersion,
		consentScreen,
		consentLanguage,
		vendorListVersion,
		selectedPurposeIds: decodeBitsToIds(purposeIdBitString),
		maxVendorId,
		created,
		lastUpdated
	};

	if (isRange) {
		const idMap = vendorRangeList.reduce((acc, {isRange, startVendorId, endVendorId}) => {
			const lastVendorId = isRange ? endVendorId : startVendorId;
			for (let i = startVendorId; i <= lastVendorId; i++) {
				acc[i] = true;
			}
			return acc;
		}, {});

		cookieData.selectedVendorIds = new Set();
		for (let i = 0; i <= maxVendorId; i++) {
			if ((defaultConsent && !idMap[i]) ||
				(!defaultConsent && idMap[i])) {
				cookieData.selectedVendorIds.add(i);
			}
		}
	}
	else {
		cookieData.selectedVendorIds = decodeBitsToIds(vendorIdBitString);
	}

	return cookieData;
}

function encodePublisherConsentData(publisherData) {
	console.log("cookie.js : encodePublisherConsentData");
	const {
		vendorList = {},
		customPurposeList = {},
		selectedPurposeIds,
		selectedCustomPurposeIds
	} = publisherData;
	const {purposes: customPurposes = []} = customPurposeList;
	const {purposes = {}} = vendorList;

	return encodePublisherCookieValue({
		...publisherData,
		numCustomPurposes: customPurposes.length,
		standardPurposeIdBitString: encodePurposeIdsToBits(Object.values(purposes), selectedPurposeIds),
		customPurposeIdBitString: encodePurposeIdsToBits(customPurposes, selectedCustomPurposeIds)
	});
}

function decodePublisherConsentData(cookieValue) {
	console.log("cookie.js : decodePublisherConsentData");
	const {
		cookieVersion,
		cmpId,
		vendorListVersion,
		publisherPurposeVersion,
		created,
		lastUpdated,
		customPurposeIdBitString
	} = decodePublisherCookieValue(cookieValue);

	return {
		cookieVersion,
		cmpId,
		vendorListVersion,
		publisherPurposeVersion,
		created,
		lastUpdated,
		selectedCustomPurposeIds: decodeBitsToIds(customPurposeIdBitString)
	};

}

function readCookie(name) {
	console.log("cookie.js : readCookie");
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);

	if (parts.length === 2) {
		return parts.pop().split(';').shift();
	}
}

function writeCookie(name, value, maxAgeSeconds, path = '/') {
	console.log("cookie.js : writeCookie");
	const maxAge = maxAgeSeconds === null ? '' : `;max-age=${maxAgeSeconds}`;
	const expires = maxAgeSeconds === null ? '' : ';expires=' + new Date(new Date() * 1 + maxAgeSeconds * 1000).toUTCString();
	document.cookie = `${name}=${value};path=${path}${maxAge}${expires}`;
}

function readPublisherConsentCookie() {
	console.log("cookie.js : readPublisherConsentCookie");
	// If configured try to read publisher cookie
	if (config.storePublisherData) {
		const cookie = readCookie(PUBLISHER_CONSENT_COOKIE_NAME);
		log.debug('Read publisher consent data from local cookie', cookie);
		if (cookie) {
			return decodePublisherConsentData(cookie);
		}
	}
}

function writePublisherConsentCookie(publisherConsentData) {
	console.log("cookie.js : writePublisherConsentCookie");
	log.debug('Write publisher consent data to local cookie', publisherConsentData);
	writeCookie(PUBLISHER_CONSENT_COOKIE_NAME,
		encodePublisherConsentData(publisherConsentData),
		PUBLISHER_CONSENT_COOKIE_MAX_AGE,
		'/');
}


/**
 * Read vendor consent data from third-party cookie on the
 * global vendor list domain.
 *
 * @returns Promise resolved with decoded cookie object
 */
function readGlobalVendorConsentCookie() {
	console.log("cookie.js : readGlobalVendorConsentCookie");
	log.debug('Request consent data from global cookie');
	return sendPortalCommand({
		command: 'readVendorConsent',
	}).then(result => {
		log.debug('Read consent data from global cookie', result);
		if (result) {
			return decodeVendorConsentData(result);
		}
	}).catch(err => {
		log.error('Failed reading global vendor consent cookie', err);
	});
}

/**
 * Write vendor consent data to third-party cookie on the
 * global vendor list domain.
 *
 * @returns Promise resolved after cookie is written
 */
function writeGlobalVendorConsentCookie(vendorConsentData) {
	console.log("cookie.js : writeGlobalVendorConsentCookie");
	log.debug('Write consent data to global cookie', vendorConsentData);
	return sendPortalCommand({
		command: 'writeVendorConsent',
		encodedValue: encodeVendorConsentData(vendorConsentData),
		vendorConsentData,
		cmpVersion: pack.version
	}).catch(err => {
		log.error('Failed writing global vendor consent cookie', err);
	});
}

/**
 * Read vendor consent data from first-party cookie on the
 * local domain.
 *
 * @returns Promise resolved with decoded cookie object
 */
function readLocalVendorConsentCookie() {
	console.log("cookie.js : readLocalVendorConsentCookie");
	//console.log("[CMP LOG] - readLocalVendorConsentCookie", this);
	const cookie = readCookie(VENDOR_CONSENT_COOKIE_NAME);
	log.debug('Read consent data from local cookie', cookie);
	return Promise.resolve(cookie && decodeVendorConsentData(cookie));
}

/**
 * Write vendor consent data to first-party cookie on the
 * local domain.
 *
 * @returns Promise resolved after cookie is written
 */
function writeLocalVendorConsentCookie(vendorConsentData) {
	console.log("cookie.js : writeGlobalVendorConsentCookie");
	console.trace();
	log.debug('Write consent data to local cookie', vendorConsentData);
	return Promise.resolve(writeCookie(VENDOR_CONSENT_COOKIE_NAME,
		encodeVendorConsentData(vendorConsentData),
		VENDOR_CONSENT_COOKIE_MAX_AGE,
		'/'));
}

function readVendorConsentCookie() {
	console.log("cookie.js : readVendorConsentCookie");
	//console.log("[CMP LOG - store consent globally", config.storeConsentGlobally);
	return config.storeConsentGlobally ?
		readGlobalVendorConsentCookie() : readLocalVendorConsentCookie();
}

function writeVendorConsentCookie(vendorConsentData) {
	console.log("cookie.js : writeVendorConsentCookie");
	console.log(vendorConsentData);
	return config.storeConsentGlobally ?
		writeGlobalVendorConsentCookie(vendorConsentData) : writeLocalVendorConsentCookie(vendorConsentData);
}

export {
	readCookie,
	writeCookie,
	encodeVendorConsentData,
	decodeVendorConsentData,

	convertVendorsToRanges,

	encodePublisherConsentData,
	decodePublisherConsentData,

	readGlobalVendorConsentCookie,
	writeGlobalVendorConsentCookie,
	readLocalVendorConsentCookie,
	writeLocalVendorConsentCookie,
	readVendorConsentCookie,
	writeVendorConsentCookie,

	readPublisherConsentCookie,
	writePublisherConsentCookie,

	PUBLISHER_CONSENT_COOKIE_NAME,
	VENDOR_CONSENT_COOKIE_NAME
};
