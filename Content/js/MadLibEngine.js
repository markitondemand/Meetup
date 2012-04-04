var madLib_class = function () { };

madLib_class.prototype.wordCollection = {}; /* will populate this with a collection of words */
madLib_class.prototype.templateHTML = "";  /* will populate this with an html blob as a string to create the html template */

madLib_class.prototype.init = function ()
{

}

/****************************************************/
/*	setupWordCollection
this function sets up the words that will be used in the madLib
you can either pass your own collection oArgs.data or it will
use the word collection from madLibWordDB. This method also sets
up the wordCollectionPointer which keep track of the position in
each category so you can use all values
		
word collection format
{
wordCategory: [val1, val2,..]
,wordCategory2: [val1, val2,..]
}

*/
/****************************************************/
madLib_class.prototype.setupWordCollection = function (oArgs)
{
	var oArgs = oArgs || {};

	if (oArgs.data)
	{
		this.wordCollection = oArgs.data;
	}

	this.wordCollectionPointer = {};

	for (var category in this.wordCollection)
	{
		this.wordCollectionPointer[category] = { index: 0, length: this.wordCollection[category].length };
	}
}


/****************************************************/
/*	getTemplateFragment
this method will take the templateHTMLArray join it up and
then return a DOM fragment

*NOTE - this method will not parse out the words

returns a dom fragment of the madlib
*/
/****************************************************/
madLib_class.prototype.getTemplateFragment = function ()
{	
	var $frag = jQuery(this.templateHTML);

	return $frag[0];
}


/****************************************************/
/*	addTemplateToPage
this method will take the templateHTMLArray join it up and
then add it to the DOM on the element #madLibContent

*NOTE - this method will not parse out the words

returns the element that was just appended to the DOM
*/
/****************************************************/
madLib_class.prototype.addTemplateToPage = function ()
{	
	var $frag = jQuery(this.templateHTML);

	jQuery("#madLibContent").append($frag);

	return $frag[0];
}


/****************************************************/
/*	addAndFillTemplate
this method will take the templateHTMLArray join it up and
then add it to the DOM on the element #madLibContent this will
also call the parseHTML method which will add in the word
collection

returns the element that was just appended to the DOM
*/
/****************************************************/
madLib_class.prototype.addAndFillTemplate = function ()
{	
	var $frag = jQuery(this.templateHTML);

	jQuery("#madLibContent").append($frag);

	this.parseHTML($frag[0]);

	this.fillNextWord();

	return $frag[0];
}


/****************************************************/
/*	parseHTML
this method will take the madlib html and create a queue (rElements)
which fillNextWord uses to iterate over the html

*NOTE you
		
-element  - a DOM element that is the madLib template
		
returns the same element that was passed in
*/
/****************************************************/
madLib_class.prototype.parseHTML = function (element)
{
	var self = this;
	this.rElements = [];

	var $frag = jQuery(element);

	$frag.find('span[data-ML]').each(function ()
	{
		self.rElements.push(jQuery(this)[0]);
	});

	return element;
}


/****************************************************/
/*	fillNextWord
used to fill the next word in the queue using the next word
in the word collection, for each category it will iterate through
the array and start at the begining after it reaches the last item
*/
/****************************************************/
madLib_class.prototype.fillNextWord = function ()
{

	if (!this.rElements.length) { return false; }

	var $currentElement = jQuery(this.rElements.shift());
	var wordCategory = $currentElement.attr("data-ML").toLowerCase();
	var currentWord = "----";
	
	if (this.wordCollection[wordCategory])
	{
		currentPointer = this.wordCollectionPointer[wordCategory];
		currentWord = this.wordCollection[wordCategory][currentPointer.index];

		if ((currentPointer.index + 1) >= currentPointer.length) { currentPointer.index = 0; }
		else currentPointer.index++;

	}

	var bStandardFill = this.preFillHandler($currentElement[0], currentWord, wordCategory)

	if (bStandardFill)
	{
		$currentElement.html(currentWord);
	}

	this.postFillHandler($currentElement[0]);
};


/****************************************************/
/*	preFillHandler
this method will be called before the current word is added into
the element
		
-Element  - a DOM element of the span about to be modified
-currentWord  - the currenlty selected word from the collection
-wordCategory  - the category as found on the span tag
			
return boolean specifying whether or not to do the standard fill of just making the span HTML the word
*/
/****************************************************/
madLib_class.prototype.preFillHandler = function (element, currentWord, wordCategory)
{


	return true;
}

/****************************************************/
/*	postFillHandler
this method will be called after the current word has been added
to the span tag
		
-Element  - a DOM element of the span that was just modified
		
generally this function should call fix next word to continue the
process of parsing the madlib
*/
/****************************************************/
madLib_class.prototype.postFillHandler = function (element)
{


	this.fillNextWord();
}




var madLibEngine = new madLib_class();