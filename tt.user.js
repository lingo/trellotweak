// ==UserScript==
// @name           TwelloTreak
// @namespace      http://github.com/lingo/twellotreak
// @description    Adjustments for Trello use
// @author         Luke Hudson <lukeletters@gmail.com>
// @require        http://code.jquery.com/jquery-1.11.2.min.js
// @require        https://api.trello.com/1/client.js?key=c768e1f132c751744dc9647e8e2cf4cf

// ==/UserScript==
var Trello;


// function findAndSendTrello() {
// 	$.get('https://api.trello.com/1/client.js?key=c768e1f132c751744dc9647e8e2cf4cf')
// 		.done(function(data, status, xhr) {
// 			var src = data;
// 			src = '(function() {' + src + '; '
// 				+ '	var event = document.createEvent("CustomEvent"); '
// 				+ ' event.initCustomEvent("TwelloTreak_doneExecuteTrello", true, true, {"passback": window.Trello });'
// 				+ ' window.dispatchEvent(event);'
// 				+ '})(window)';

// 			$("<script type=\"text/javascript\">"
// 				+ src
// 				+ String.fromCharCode(60) + "/script>").appendTo(document.body);

// 			window.addEventListener("TwelloTreak_doneExecuteTrello", function (e) {
// 				console.log('Got event', e, Trello);
// 				var event = document.createEvent("CustomEvent");
// 				event.initCustomEvent("TwelloTreak_findAndSendTrello", true, true, {
// 					"passback": window.Trello
// 				});
// 				window.dispatchEvent(event);
// 			});
// 		})
// 		.fail(function (d,s,x) {
// 			console.error(d,s,x);
// 		});
// }

function addStyleSheet(css) {
	$("<style>" + css + "</style>").appendTo(document.head);
}

function addScript(js) {
	console.log(js);
	$("<script type=\"text/javascript\">" + js + "</script>").appendTo(document.body);
}

// function loadTrello(cb) {
// 	window.addEventListener("TwelloTreak_findAndSendTrello", function (e) {
// 	  var Trello = e.detail.passback;
// 	  console.log('Got event', e);
// 	  cb(Trello);
// 	});
// 	var src = '(' + findAndSendTrello + ')(jQuery);';
// 	addScript(src);
// }

var logmsg      = function() {};
var linkingMode = false;
var linkFirst   = null;
//// FOR DEBUG, uncomment following line:
// if (typeof(unsafeWindow) !== 'undefined'
// 	&& typeof(unsafeWindow.console) !== 'undefined'
// 	&& typeof(unsafeWindow.console.log) !== 'undefined') {
// 	logmsg = unsafeWindow.console.log;
// } else if (typeof(GM_log) !== 'undefined') {
// 	logmsg = GM_log;
// } else if (typeof(console) !== 'undefined' && typeof(console.log) !== 'undefined') {
// 	logmsg = console.log;
// }

// logmsg("Loaded.");

// Retrieve field name and values config stored in localStorage
// and initially configured through extension Options page.
// function getConfig(cb) {
// 	chrome.extension.sendRequest({'type': 'getEnabled'}, function(response) {
// 		if (response.enabled) {
// 			chrome.extension.sendRequest({'type': 'getConfig'}, function(response) {
// 				// console.log(response);
// 				cb(response);
// 			});
// 		}
// 	});
// }

// logmsg("Ready...");
/*
 * Loop through the defined fields, replacing text or selecting options
 */
// getConfig(cb);


function showCardNumbers() {
	var css=".card-short-id.hide { "
	+ " display: inline-block !important; "
	+ " font-weight: bold; "
	+ " font-size: 16px; "
	+ " background: #E3E3E3; "
	+ " color: #0e74af; "
	+ " padding: 0.25em; "
	+ " border-radius: 0 5px 0 0;"
	+ " position: absolute; "
	+ " z-index: 30; "
	+ " top: 0; "
	+ " right: 0; "
	+ "}"
	+ " .list-card-operation { display: none !important; }"
	+ " body.tt-linking { background: orange !important; }"
	+ " .list-card.tt-linking-first { background: green !important; }"
	+ " body.tt-linking .list-card:hover { background: cyan !important; }";
	addStyleSheet(css);
}

function getBoardID() {
	var boardID = document.location.toString().replace(/.*\/b\/([^\/]+)\/.*/, '$1');
}

function postComment(cardID, comment, cb) {
	var url = "cards/"+ cardID + "/actions/comments";
	Trello.post(url, { text: "Hello from jsfiddle.net!"}, cb);
}

function getCardID(cardElt) {
	cardElt      = $(cardElt);
	var titleElt = cardElt.find('.list-card-title');
	var href     = titleElt.attr('href');
	https://trello.com/c/e4otwNhF/130-english-professionals-dropdown-shows-nothing
	href = href.replace(/.*\/c\/([^\/]+)\/.*/, '$1');
	return href;
}

function getCardShortID(cardElt) {
	cardElt      = $(cardElt);
	return cardElt.find('.card-short-id').text().replace(/^#/, '');
}

function createCardDialog() {
	t = $('<div id="copy-url-dialog"><textarea cols="60"></textarea></div>');
	t.appendTo(document.body);
	t.css({
		zIndex:      999,
		position:    "absolute",
		top:         "50%",
		left:        "50%",
		marginLeft:  "auto",
		marginRight: "auto",
		transform:   "translate(-50%, -50%)"
	});
	return t;
}

function showCardDialog(cardID, textContent){
	prompt('This is the URL for card ' + cardID + "\r\nPress Ctrl+C or ⌘+C to copy", textContent);
}

function linkCards(target) {
	$(document.body).removeClass('tt-linking');
	$('.tt-linking-first').removeClass('tt-linking-first');

	var srcID  = getCardID(linkFirst);
	var destID = getCardID(target);

	confirm("Link " + srcID + ' <=> ' + destID);

	if (srcID && destID) {
		postComment(srcID, 'Ref: #' + getCardShortID(target), function() {
			postComment(destID, 'Ref: #' + getCardShortID(linkFirst), function() {
				linkingMode = false;
				linkFirst   = null;
			});
		});
	}
}

function bindCardNumbers() {
	var handler = function(e){
		var $this = $(e.target);
		if (linkingMode !== false && $this.parents('.list-card').length) {
			linkCards($this.closest('.list-card'));
			e.stopPropagation();
			e.preventDefault()
		}
		if (!$this.hasClass('card-short-id')) {
			return true;
		}
		showCardDialog($this.text(), $this.parent().get(0).href);
		e.stopPropagation();
		e.preventDefault()
	};
	document.addEventListener('click', handler, true);
}

function bindLinking() {
	var handler = function(e) {
		if (e.keyCode === 76 && e.shiftKey) {
			// Shift+L
			// linkingMode = 'first';
			var card = linkFirst;
			if (card && card.length) {
				console.log('first is', card);
				card.addClass('tt-linking-first');
				linkingMode = 'first';
				$(document.body).addClass('tt-linking');
			}
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	}
	document.addEventListener('keyup', handler, true);
	$(document).on('mouseenter mouseleave', '.list-card', function(e) {
		if (linkingMode !== false) {
			return;
		}
		if (e.type === 'mouseenter') {
			linkFirst = $(e.target).closest('.list-card');
		} else {
			linkFirst = null;
		}
	});
}


showCardNumbers();
bindCardNumbers();

// loadTrello(function(Trello) {
// 	console.log('gotTrello client', Trello);
// 	bindLinking();
// })
