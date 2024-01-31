

if (typeof console  != "undefined") 
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};

console.log = function(message) {
    console.olog(message);
    global.config.lines++;
    
    if(global.config.lines > 18){
    	document.getElementById('debug').innerHTML = "";
    	global.config.lines = 0;
    }
    document.getElementById('debug').innerHTML += ('<p>' + message + '</p>');
};
console.error = console.debug = console.info =  console.log


module.exports = global.config = {
	lines:0,
	activeElem: null,
	activeTab: null,
	focusObject : null,
	detailsRef: null,
	summaryRef: null,
	vendorsRef: null,
	modalRef:null,
	overviewRef:null,
	vendorConsentsRef:null,
	vendorlistRef: null,
	purposelistRed: null,
	store:null
	
};
