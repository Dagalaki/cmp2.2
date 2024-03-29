import vendor2 from './vendor/version1';
import publisher1 from './publisher/version1';

const NUM_BITS_VERSION = 6;

const vendorVersionList = [
	vendor2
];

const vendorVersionMap = vendorVersionList.reduce((acc, definition) => {
	acc[definition.version] = definition;
	console.log("acc",acc);
	return acc;
}, {});

const publisherVersionList = [
	publisher1
];

const publisherVersionMap = publisherVersionList.reduce((acc, definition) => {
	acc[definition.version] = definition;
	return acc;
}, {});

export {
	NUM_BITS_VERSION,
	vendorVersionList,
	vendorVersionMap,
	publisherVersionList,
	publisherVersionMap
};
