
Object.prototype.addClass = function (className) {
	if (!this.hasClass(className)) {
		if (this.className) this.className += " " + className;
		else this.className = className;
	}
};
Object.prototype.removeClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	if(typeof this.className.replace === "function") this.className = this.className.replace(regexp, "$2");
};

Object.prototype.hasClass = function (className) {
	var regexp = this.addClass[className];
	if (!regexp) regexp = this.addClass[className] = new RegExp("(^|\\s)" + className + "(\\s|$)");
	return regexp.test(this.className);
};

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
