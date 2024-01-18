export default {
	version: 1,
	fields: [
		{ name: 'Version', type: 'int', numBits: 6 },
		{ name: 'Created', type: 'date', numBits: 36 },
		{ name: 'LastUpdated', type: 'date', numBits: 36 },
		{ name: 'CmpId', type: 'int', numBits: 12 },
		{ name: 'CmpVersion', type: 'int', numBits: 12 },
		{ name: 'ConsentScreen', type: 'int', numBits: 6 },
		{ name: 'ConsentLanguage', type: '6bitchar', numBits: 12 },
		{ name: 'VendorListVersion', type: 'int', numBits: 12 },
		{ name: 'TcfPolicyVersion', type: 'int', numBits: 6 },
		{ name: 'IsServiceSpecific', type: 'bits', numBits: 1 },
		{ name: 'UseNonStandardTexts', type: 'bits', numBits: 1 },
		{ name: 'SpecialFeatureOptIns', type: 'bits', numBits: 24 },
		{ name: 'PurposesConsent', type: 'bits', numBits: 24 },
		{ name: 'PurposesLITransparency', type: 'bits', numBits: 24 },
		/*{ name: 'publisherPurposeVersion', type: 'int', numBits: 12 },
		{ name: 'standardPurposeIdBitString', type: 'bits', numBits: 24 },
		{ name: 'numCustomPurposes', type: 'int', numBits: 6 },
		{
			name: 'customPurposeIdBitString',
			type: 'bits',
			numBits: (decodedObject) => decodedObject.numCustomPurposes
		}*/
	]
};

