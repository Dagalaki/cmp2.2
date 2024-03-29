import config from './config';

const logLevels = [
	'debug',
	'info',
	'warn',
	'error'
];

export default logLevels.reduce((logger, funcName, index) => {
	logger[funcName] = function (...args) {
		const consoleFunc = funcName === 'debug' ? 'log' : funcName;
		const { logging } = config;
		if (logging && console && typeof console[consoleFunc] === 'function') {
			const enabledLevelIndex = logLevels.indexOf(logging.toString().toLocaleLowerCase());
			if (logging === true || (enabledLevelIndex > -1 && index >= enabledLevelIndex)) {
				const [message, ...rest] = [...args];
				console[consoleFunc](`[CMP] ${funcName.toUpperCase()} - ${message}`, ...rest);
			//if (message.indexOf("Notify event") > -1) {
				//try {
				//window.forwardedCmpEvents(message);
				//} catch (e) {
				//console.log("ERRORERRORERROR");
				//console.log(e);
				//}
			//}
			}
		}
	};
	return logger;
}, {});

