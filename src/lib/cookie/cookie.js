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
	console.log("cookie.js : decodeBitsToIds", bitString);
	console.trace();
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
	console.log("vendorData",vendorData);
	const {purposes = {}} = vendorList;

	// Encode the data with and without ranges and return the smallest encoded payload
	const noRangesData = encodeVendorCookieValue({
		...vendorData,
		maxVendorId,
		purposeIdBitString: encodePurposeIdsToBits(Object.values(purposes), selectedPurposeIds),
		isRange: false,
		vendorIdBitString: encodeVendorIdsToBits(selectedVendorIds)
	});

//	const vendorRangeList = convertVendorsToRanges(maxVendorId, selectedVendorIds);
/*	const rangesData = encodeVendorCookieValue({
		...vendorData,
		maxVendorId,
		purposeIdBitString: encodePurposeIdsToBits(Object.values(purposes), selectedPurposeIds),
		isRange: true,
		defaultConsent: false,
		numEntries: vendorRangeList.length,
		vendorRangeList
	});
*/
//	return noRangesData.length < rangesData.length ? noRangesData : rangesData;
	return noRangesData;
}
function stringToBinary(string) {
  let binary = '';
  for (let i = 0; i < string.length; i++) {
    const charCode = string.charCodeAt(i).toString(2);
    binary += charCode;// + '0'.repeat(8 - charCode.length);
  }
  return binary;
}
const fields = [
	{name:'Version', length:6,type:"int"},
	{name:'Created', length:36,type:"date"},
	{name:'LastUpdated',length:36,type:"date"},
	{name:'CmpId',length:12,type:"int"},
	{name:'CmpVersion', length:12,type:"int"},
	{name:'ConsentScreen', length:6,type:"int"},
	{name:'ConsentLanguage', length:12,type:"string"},
	{name:'VendorListVersion',length:12,type:"int"},
	{name:'TcfPolicyVersion', length:6,type:"int"},
	{name:'IsServiceSpecific', length:1,type:"boolean"},
	{name:'UseNonStandardTexts', length:1,type:"boolean"},
	{name:'SpecialFeatureOptins',length:12,type:"binary"},
	{name:'PurposesConsent',length:24,type:"binary"},
	{name:'PurposesLITransparency',length:24,type:"binary"}
];
function base64ToBinarySplit6(base64) {
  const binaryString = atob(base64);
  let result = '';

  let remainingBits = '';

  for (let i = 0; i < binaryString.length; i++) {
    const byte = binaryString.charCodeAt(i).toString(2).padStart(8, '0');
    const combinedBits = remainingBits + byte;

    // Split the combined bits into 6-bit chunks
	  var j = 0;
    for (j = 0; j < combinedBits.length - 5; j += 6) {
      result += combinedBits.slice(j, j + 6);
    }

    // Save any remaining bits for the next iteration
    remainingBits = combinedBits.slice(j);
  }

  return result.trim();
}
function convertBinaryToObject(binary, type) {
  if (type === 'int') {
    return parseInt(binary, 2);
  } else if (type === 'date') {
    // Implement date conversion logic based on your requirements
    return 'Date Conversion Not Implemented';
  } else if (type === 'boolean') {
    return binary === '1';
  } else if (type === 'string') {
    // Convert binary to string
    let result = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8);
      result += String.fromCharCode(parseInt(byte, 2));
    }
    return result;
  } else {
    // Assume binary type, return as is
    return binary;
  }
}
function splitCoreString(coreString) {
		console.log("fields", fields);
	var binaryCoreString = stringToBinary(atob(coreString));
	let startIndex = 0;
	console.log("binary string", binaryCoreString);
	const binaryFields = fields.map(item => {
		console.log(startIndex, startIndex + item.length);
    		var fieldBinary = binaryCoreString.slice(startIndex, startIndex + item.length);
		startIndex += item.length; // Move to the next field
		console.log(item.name+" - ",fieldBinary);
		//fieldBinary = '0'.repeat(fieldBinary.length%8) + fieldBinary;
		return fieldBinary;
	});

  return binaryFields;
}
function toLittleEndian(binary) {
  return binary
    .match(/.{1,8}/g) // Split into 8-bit chunks
    .map(chunk => chunk.split('').reverse().join('')) // Reverse the bits within each chunk
    .join(''); // Join the chunks back together
}
function binaryToDecimal(binary, type) {
  if (type === 'int') {
    return parseInt(binary, 2);
  } else if (type === 'date') {
    // Implement date conversion logic based on your requirements
    return 'Date Conversion Not Implemented';
  } else if (type === 'boolean') {
    return binary === '1';
  } else {
    // Assume binary type, return as is
    return binary;
  }
}
function printConvertedFields(binaryFields) {
  const littleEndianFields = binaryFields.map((field, index) => toLittleEndian(field));
  littleEndianFields.forEach((field, index) => {
    const decimalValue = binaryToDecimal(field, fields[index].type);
    console.log(`${fields[index].name}:\n   Binary: ${binaryFields[index]}\n   Little Endian: ${field}\n   Converted Value: ${decimalValue}\n`);
  });
}
function decodeVendorConsentData(cookieValue) {
	console.log("cookie.js : decodeVendorConsentData", cookieValue);
// Replace URL-safe characters
	//var binaryFields = base64ToBinarySplit6(cookieValue.split('.')[0]);
	//printConvertedFields(binaryFields);
	//console.log("binary fields:", binaryFields);

	/*const objectsArray = fields.map((field) => {
		var start = 0;
	  const bytes = binaryFields.slice(start, start+field.length);
	  binaryFields = binaryFields.slice(start+field.length);
		start+=field.length;
	  return { ...field, bytes };
	});
	console.log("objectArray",objectsArray);
	const objectsArrayConverted = objectsArray.map((obj) => ({
	  ...obj,
	  value: convertBinaryToObject(obj.bytes, obj.type),
	}));
	console.log("Objects Array Converted:", objectsArrayConverted);*/
	const {
		Version,
		CmpId,
		CmpVersion,
		ConsentScreen,
		ConsentLanguage,
		VendorListVersion,
		PurposesConsent,
		Created,
		LastUpdated,
		IsServiceSpecific,
		PurposesLITransparency,
		SpecialFeatureOptIns,
		TcfPolicyVersion,
		UseNonStandardTexts
	} = decodeVendorCookieValue(cookieValue);
	console.log("decoding cookie:", decodeVendorCookieValue(cookieValue));
	console.log("purposeIdBitString",PurposesConsent);
	const cookieData = {
		cookieVersion: Version,
		created: Created,
		lastUpdated: LastUpdated,
		cmpId: CmpId,
		cmpVersion: CmpVersion,
		consentScreen: ConsentScreen,
		consentLanguage: ConsentLanguage,
		vendorListVersion: VendorListVersion,
		PurposesConsent: decodeBitsToIds(PurposesConsent),
		PurposesLITransparency: decodeBitsToIds(PurposesLITransparency),
		SpeacialFeatureOptIns: decodeBitsToIds(SpecialFeatureOptIns)


	};
	console.log("data",cookieData);
	if (typeof isRange !== "undefined" && isRange) {
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
		//cookieData.selectedVendorIds = decodeBitsToIds(vendorIdBitString);
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
	console.log("cookie.js : writeCookie", name, value);
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
	console.log('Read consent data from local cookie', cookie);
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
