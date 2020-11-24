window.onerror = function (msg, url, lineNo, columnNo, error) {
	console.error(msg + " (" + url + " " + lineNo + ":" + columnNo + ")");
	return false;
}

var pre = document.getElementById("log-container");

var getLogFunc = function (level) {
	var defaultFunc = console[level].bind(console);
	return function () {
		defaultFunc.apply(console, arguments);
		var msg = Array.from(arguments).join(" ");
		pre.textContent = pre.textContent + "\n[" + level + "] " + msg;
	};
}

console.log = getLogFunc("log");
console.error = getLogFunc("error");
console.warn = getLogFunc("warn");
console.debug = getLogFunc("debug");