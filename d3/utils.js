/**
 * Created by zurich on 29.06.14.
 */
var fnSA2toBucket = function(sydRegion) {
    var returnObj = {};
    sydRegion.forEach(function(element) {
        returnObj[element.SA2_MAIN] =  element.bucket;
    });
    return returnObj;
};
//=========================================================================
// Map Projections / Scale / Positions
var mapWidth = 586;
var mapHeight = 300;


var projection = d3.geo.mercator()
    .center([151.076, -33.843])
    .scale(50000)
    .translate([(mapWidth / 2), (mapHeight / 2)]);

var path = d3.geo.path()
    .projection(projection);
//=========================================================================

//Map Colours
var choroplethColorDomain = [0, 1, 2, 3, 4, 5, 6];
var choroplethColor = d3.scale.linear().domain(choroplethColorDomain)
    .range(["#edf8fb","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"]);


//=========================================================================
// Create {Key: Array[7]} Where key is SA2 and Array[7] are various items relating to the SA2 region

var fnSydRegionToJSON = function(sydRegion) {
    var objSA2 = {};
    sydRegion.forEach(function(element) {
        tempArr = [];
        tempArr.push(element.SA2_NAME);             //pos 0
        tempArr.push(parseInt(element.totPop));     //pos 1
        tempArr.push(parseInt(element.engOnly));    //pos 2
        tempArr.push(parseInt(element.foreign));    //pos 3
        tempArr.push(parseInt(element.notStated));  //pos 4
        tempArr.push(parseFloat(element.forPC));    //pos 5
        tempArr.push(parseInt(element.bucket));     //pos 6
        objSA2[element.SA2_MAIN] =  tempArr;
    }); // forEach
    return(objSA2);
};


var fnNumberCommas =  function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//=========================================================================
// Non-English Language Speakers Widget

//Hard code a scale. 418 pixels is the max length of slider
var xScaleNonEnglish = d3.scale.linear()
    .domain([0, 1])
    .range([0, 418]);


var fnFormatPercent = function(fltPerCent) {
    integerPercent = Math.round(fltPerCent * 100) / 1;
    strPercent = integerPercent.toString();
    return strPercent + "%";

};

//=========================================================================
// Top N Languages Widget

var fnCvtNumericTopN = function(dataStructure) {
    dataStructure.forEach(function(element) {
        element.value = +element.value ;

    });
    return dataStructure;
};

var fnCreateDimensions = function(dataObject)  {
    var dimObject = {};
    var dimSA2 = dataObject.dimension(function(d) {return d.SA2_MAIN; }); // we will filter on this
    var dimValue = dataObject.dimension(function(d) {return d.value; }); // value is the number of speakers
    dimObject.dimSA2 = dimSA2;
    dimObject.dimValue = dimValue;
    return dimObject;

}

var fnCreateTopNDataObject = function(dimObject, intCurSA2Number) {
    dimObject.dimSA2.filterExact(intCurSA2Number.toString());  //need to filter by current SA2 Number
    arrLangName = []; //stores the language name
    arrLangValue = []; //stores the language value
    dimObject.dimValue.top(6).forEach(function(p, i) {
        arrLangName.push(p.variable);
        arrLangValue.push(p.value);
    }); //forEach
    var TopNDataObject = {};


    TopNDataObject.arrLangName = arrLangName;
    TopNDataObject.arrLangValue = arrLangValue
    dimObject.dimSA2.filter();  //clear the filter
    return TopNDataObject;
}

var fnCreateTopNDataObjectGreaterSydney = function() {
    arrLangName = ["Arabic", "Mandarin", "Cantonese", "Vietnamese", "Greek", "Italian"];
    arrLangValue = [178474, 133734, 131920, 84972, 80517, 68103];
    var TopNDataObject = {};
    TopNDataObject.arrLangName = arrLangName;
    TopNDataObject.arrLangValue = arrLangValue
    return TopNDataObject;


}








