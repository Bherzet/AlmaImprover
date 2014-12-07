// ==UserScript==
// @name        AlmaImprover
// @namespace   tzima.cz
// @description Improves the UI of almamather.zcu.cz to make it a little bit more usable.
// @include     https://almamather.zcu.cz/*
// @version     1
// @grant       none
// ==/UserScript==

// ---------- router ----------
var userID = "T00000";
var course = "M1";
var domain = "https://almamather.zcu.cz";

if (matchesURLMask("$#/almamather_predmety")) {
    improveHomepage();
} else {
    improveAlma();
    if (matchesURLMask("^" + domain + "/" + course + "/saolin"))   improveSaolin();
    if (matchesURLMask("^" + domain + "/" + course + "/vysledky")) improveResults();
}

// ---------- helpers ----------
/**
 * @param  {String} what String to compare with.
 * @return {Boolean}     True if string starts with [what].
 */
String.prototype.startsWith = function(what) {
    return this.indexOf(what) == 0;
}

/**
 * @param  {String} what String to compare with.
 * @return {Boolean}     True if string ends with [what].
 */
String.prototype.endsWith = function(what) {
    return this.indexOf(what, this.length - what.length)  != -1;
}

/**
 * Checks whether the current URL matches the given masks.
 * @param  {Array, String} urls All masks to be applied.
 * @param  {Boolean}       and  If true, use the logical AND. Use OR otherwise.
 * @return {Boolean}            True if URL matches the mask(s).
 */
function matchesURLMask(urls, and) {
    var result = !!and;
    function use(result, and, value) {
        return eval("result" + (!!and ? "&" : "|") + "value;");
    }
    ((urls instanceof Array) ? urls : [urls]).every(function(url){
        if      (url.startsWith("^")) result = use(result, and, document.URL.startsWith(url.substring(1)));
        else if (url.startsWith("$")) result = use(result, and, document.URL.endsWith(url.substring(1)));
        else                          result = use(result, and, document.URL == url);

        return result || !!and;
    });
    return !!result;
}

/**
 * Finds elements with the specified name of the HTML tag and CSS class.
 * @param  {String}  tagName   Name of the HTML tag.
 * @param  {String}  className Name of the CSS class.
 * @param  {Boolean} all       true: find all elements, false: find one element (default false)
 * @return {Object, Array}     Found element(s). Returns array if all==true, single object otherwise.
 */
function getElementByClass(tagName, className, all) {
    var result = [];
    Array.prototype.slice.call(document.getElementsByTagName(tagName)).every(function(tag){
       if (tag.className == className) {
         result.push(tag);
       }
      
       return (result.length == 0) || !!all;
    });

    return !!all ? result : result[0];
}

/**
 * Removes given element(s) from the DOM.
 * @param {Array, Object} elements Either a single element or an array of elements to be removed.
 */
function removeElement(elements) {
    elements = (elements instanceof Array) ? elements : [elements];
    elements.forEach(function(element){
        element.parentElement.removeChild(element);
    });
}

/**
 * Reverses order of all child nodes of the given node.
 *
 * ORIGINAL AUTHOR: http://stackoverflow.com/a/7943390/2709026
 * I am not an author of this function. I only modified the code so
 * it matches the same coding style as the rest of the code.
 */
function reverseChildNodes(node) {
    var parentNode  = node.parentNode;
    var nextSibling = node.nextSibling;
    var frag        = node.ownerDocument.createDocumentFragment();

    parentNode.removeChild(node);
    while(node.lastChild) {
        frag.appendChild(node.lastChild);
    }
  
    node.appendChild(frag);
    parentNode.insertBefore(node, nextSibling);
    return node;
}

// ---------- for all of the almamather pages ----------
/**
 * Removes left and right side panels. Removes those fucking "<br>" tags (a few hundreds of them, actually)
 * which makes the page too long.
 */
function removeFuckingPanels() {
    removeElement(getElementByClass("div", "T19_checkersviewBOX"));
    removeElement(getElementByClass("div", "T19_right T19_noipad", true));
    removeElement(getElementByClass("div", "T19_left T19_noipad", true));

    Array.prototype.slice.call(getElementByClass("div", "T19_telo").childNodes).forEach(function(element){
       if (element.tagName.toLowerCase() == "br") {
          removeElement(element);
       }
    });
}

// ---------- for the title page ----------
/**
 * Removes that fucking animation from the title page, which is completely useless, but slows
 * down the entire browser.
 */
function removeFuckingFrontPageCanvas() {
    removeElement(document.getElementById("halfviz"));
}

// ---------- for the results page ----------
/**
 * @return A HTML element which is representing the user's result row.
 */
function findResultRow(userId) {
   var result = false;
   getElementByClass("div", "T22_nick", true).every(function(element){
       if (element.textContent.indexOf(userId) != -1) {
           result = element.parentElement.parentElement;
       }

       return !result;
   });
   return result;
}

/**
 * Highlights the row with user's results so he doesn't have to use a CTRL+F.
 */
function highlightResultRow() {
    var row = findResultRow(userID);
    row.style.background = "#EEE";
    row.id = "userRow";
}

/**
 * Removes the original button's functionality, so it navigates you directly
 * to the row with your results instead of showing you your profile (which is pointless).
 */
function installGoToResultButton() {
    var link = getElementByClass("div", "T19_jmeno").childNodes[0];
    link.href = "#userRow";
    link.target = "";
}

// ---------- for the saolin ----------
/**
 * Reverses a order of Saolins so you don't have to go to the end of page to find
 * the last ones.
 */
function reverseSaolinsOrder() {
    reverseChildNodes(getElementByClass("div", "T19_telo_pad").childNodes[4]);
}

// ---------- grouping functions for complete improvement of the specific page(s) ----------
/**
 * This function should be applied on every page, except the title one.
 */
function improveAlma() {
    removeFuckingPanels();
}

/**
 * This function should be applied on the homepage (only!).
 */
function improveHomepage() {
    removeFuckingFrontPageCanvas();
}

/**
 * This function should be applied on the Saolin page (only!).
 */
function improveSaolin() {
    reverseSaolinsOrder();
}

/**
 * This function should be applied on the results page (only!).
 */
function improveResults() {
    highlightResultRow();
    installGoToResultButton();
}

