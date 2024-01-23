export default {
	version: 2,
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
		{ name: 'SpecialFeatureOptIns', type: 'bits', numBits: 12 },
		{ name: 'PurposesConsent', type: 'bits', numBits: 24 },
		{ name: 'PurposesLITransparency', type: 'bits', numBits: 24 },
		{ name: 'PurposeOneTreatment', type: 'bits', numBits: 1 },
		{ name: 'PublisherCC', type: '6bitchar', numBits: 12 },
		{ name: 'MaxVendorId', type: 'int', numBits: 16 },
		{ name: 'IsRangeEncoding', type: 'bits', numBits: 1 },
		{ name: 'BitField', type: 'bits', numBits: (decodedObject) => decodedObject.MaxVendorId },
		{ name: 'MaxVendorIdL', type: 'int', numBits: 16 },
		{ name: 'IsRangeEncodingL', type: 'bits', numBits: 1 },
		{ name: 'BitFieldL', type: 'bits', numBits: (decodedObject) => decodedObject.MaxVendorIdL },

		{ name: 'NumPubRestrictions', type: 'int', numBits: 12 }
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

