MYAPP = {};

var fnPaintNonEnglishPC = function(arrCurrentRegion, strContext) {
    if (strContext == "MouseOver") {
        var fltPerCentForeign = arrCurrentRegion[5];
        var intBucket =  arrCurrentRegion[6];
    } else {
        fltPerCentForeign = 0.35;
        intBucket = 4;
    }

    var fltPCForeignXScale = xScaleNonEnglish(fltPerCentForeign);
    var strPerCentForeign = fnFormatPercent(fltPerCentForeign);

    d3.select("#popPercent").data([fltPCForeignXScale]).append("rect")
        .attr("id", "popPercentValue")
        .attr("width", function(d) {return d;})
        .attr("height", 16)
        .attr("y", 2)
        .attr("x", 2)
        .style("fill",choroplethColor(intBucket));

    d3.select("#popPercent").data([strPerCentForeign]).append("text")
        .attr("id", "popPercentText")
        .attr("x", fltPCForeignXScale + 10)
        .attr("y", 14)
        .text(strPerCentForeign);
};

var fnPaintTopN = function(lclDimension, intCurrSA2lcl, strContext) {
    // Top N Languages. TopNObject contains two 6 element arrays.
    var TopNObject;

    if (strContext == "MouseOver") {
        TopNObject = fnCreateTopNDataObject(lclDimension,intCurrSA2lcl);
    } else {
        TopNObject = fnCreateTopNDataObjectGreaterSydney();
    }

    var barHeight = 20;
    //This sets the global scale. The range of the highest values are 11 and 10272

    if (strContext == "MouseOver") {
        intDomainMax = 10272;
    } else {
        intDomainMax = 178474;
    }



    globalScale = d3.scale.linear().domain([11, intDomainMax]).range([250,330]);

    var intCurrMaxValue = d3.max(arrLangValue);
    fltCurrMaxRange = globalScale(intCurrMaxValue);


    xScale = d3.scale.linear().domain([0, d3.max(arrLangValue)]).range([0, fltCurrMaxRange]);

    bar = d3.select("#TopNSVG").selectAll("g")
        .data(TopNObject.arrLangValue)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * barHeight + ")";

        });

    bar.append("path")
        .attr("d", function(d) {

          var x = 0;
          var y = 0;
          var width = xScale(d);
          var height = barHeight - 1;
          var radius = 3;
          return "M" + x + "," + y
          + "h" + (width - radius)
          + "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius
          + "v" + (height - 2 * radius)
          + "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius
          + "h" + (radius - width)
          + "z";
        });



/*
    bar.append("rect")
        .attr("width", function(d) { return xScale(d); })
        .attr("height", barHeight - 1);
*/






    bar.append("text")
        .attr("x", function(d) { return xScale(d) + 3; })
        .attr("height", (barHeight / 2) )
        .attr("dy", "1.2em")
        .text(function(d, i) {
            return fnNumberCommas(d) + " " + TopNObject.arrLangName[i];
        });
};


// Returns path data for a rectangle with rounded right corners.
// The top-left corner is ⟨x,y⟩.




var fnPaintAreaAndPop = function(arrCurrentRegion, strContext) {
    //Area Name
    var strAreaName;
    var intPopulation;

    if (strContext == "MouseOver") {
        strAreaName = arrCurrentRegion[0];
        intPopulation = arrCurrentRegion[1];
    }
    else {
        strAreaName = "Greater Sydney Region";
        intPopulation = 4291606;
    }

    d3.select("#areaName").data(strAreaName).text(strAreaName);
    //Population
    var strPopulation = fnNumberCommas(intPopulation);
    d3.select("#population").data(strPopulation).text(strPopulation);


}

var fnCallGreaterSydney = function() {
    fnFlushGraphs();
    fnPaintNonEnglishPC(undefined, "GreaterSydney");
    fnPaintTopN(undefined, undefined, "GreaterSydney");
    fnPaintAreaAndPop(undefined, "GreaterSydney");
    fnPaintTSP(fnSydTotal());
}

var fnFlushGraphs = function () {
   d3.select("#popPercentValue").remove();
   d3.select("#popPercentText").remove();
   d3.select("#TopNSVG").selectAll("g").remove();

}

var fnInsufficientData = function() {
    var strLabel = "Insufficient data to display additional information";
    d3.select("#NELangSpeakers").data(strLabel).text(strLabel).attr("class", "insufficient");

    d3.select("#popPercent").attr("visibility","hidden");
     d3.select("#TopNSVG").attr("visibility","hidden");




    d3.select("#TopNLangSpeakers").style("opacity", 0);
    d3.select("#ratesOfChange").style("opacity", 0);


    d3.select("#tspWidget").attr("visibility","hidden");




}

var fnSufficientData = function() {
    var strLabel = "Non-English Language Speakers";
    d3.select("#NELangSpeakers").data(strLabel).text(strLabel).attr("class", "sufficient");
    var strLabelTop6 = "Top 6 Non-English Languages";
    d3.select("#TopNLangSpeakers").data(strLabelTop6).text(strLabelTop6);
    d3.select("#popPercent").style("opacity", 100);

    d3.select("#popPercent").attr("visibility","visible");

    d3.select("#TopNSVG").attr("visibility","visible");

    d3.select("#tspWidget").attr("visibility","visible");


    d3.select("#TopNLangSpeakers").style("opacity", 100);
    d3.select("#ratesOfChange").style("opacity", 100);






}

var fnMapBorders = function(sydMap) {
    d3.select("#sydMap g").append("path")
        //topojson mesh returns a multiLine geometry object.
        // datum is to bind the data to single svg not multiple svg.
        .datum(topojson.mesh(sydMap, sydMap.objects.subunitsExMS,
            function(a, b) { return a !== b ;}))
        .attr("d", path)
        .attr("class", "subunit-boundary");
};


var fnProcessTSP = function(tspData) {
    var rtnObj = {};
    tspData.forEach(function(dataRow){
        var currObj = {tc06: +dataRow["totChange.06"], eo06: +dataRow["engChange.06"],
            for06: +dataRow["forChange.06"], tc11: +dataRow["totChange.11"], eo11: +dataRow["engChange.11"],
            for11: +dataRow["forChange.11"], relevant: +dataRow["relevant"]};
        rtnObj[+dataRow.id] = currObj;
    });
    return rtnObj;
};

var fnProcessCurrTSPObject = function(tspOb) {
    arrTot = [0,tspOb.tc06, tspOb.tc11];
    arrEng = [0,tspOb.eo06, tspOb.eo11];
    arrFor = [0,tspOb.for06, tspOb.for11];
    rtnObj = {total:arrTot, english:arrEng, foreign: arrFor, relevant: tspOb.relevant};
    return rtnObj;
};

var fnSydTotal = function() {
    arrTot = [0,2.87, 11.39];
    arrEng = [0,-0.24, 2.26];
    arrFor = [0,3.11,9.13];
    rtnObj = {total:arrTot, english:arrEng, foreign: arrFor, relevant: 0};
    return rtnObj;
};



var fnSymetricArray = function(arrTwoElement)  {
   absYextent = arrTwoElement.map(Math.abs);
    if (absYextent[0] > absYextent[1] ) {
        //pos 0 is greater than pos 1...so flip sign of pos 0 and put this in pos 1
        arrTwoElement[1] = arrTwoElement[0] * -1
    }
    else  {
        arrTwoElement[0] = arrTwoElement[1] * -1
    }
    return arrTwoElement;
};





var fnPaintTSP = function(objData)  {
    // TOP, LEFT, BOTTOM, RIGHT
    var m = [10, 80, 20, 80]; // margins
    var w = 418 - m[1] - m[3]; // width
    var h = 300 - m[0] - m[2]; // height


    bottomYScale = 300 - m[2];
    bottomXScale = bottomYScale + 0;
    topPos = 0 + m[0];


    arrAllData = objData.total.concat(objData.english).concat(objData.foreign);
    arrYExtent = d3.extent(arrAllData);
    symArrYExtent = fnSymetricArray(arrYExtent);



    var graphWidth = 365;


    labels = ["2001", "2006", "2011"];
    scaleX = d3.scale.ordinal().domain(labels).range([0, graphWidth/2, graphWidth]);


    absMax = d3.max(symArrYExtent.map(Math.abs)); //maximum absolute value in current set.
    // the max(absValues) in the data set range from 0 ~ 478.  if 478 ==> 0, if 0 ==> 40 pixels.
    // this allows for some variation in the graph but squashes things down so that +478% is higher than +10% but not by much
    scaleDamper = d3.scale.linear().domain([0,478]).range([25, 0]);
    fltDampter = scaleDamper(absMax);


    scaleY = d3.scale.linear().domain(symArrYExtent).range([h - fltDampter , 0 + fltDampter]);




    //console.log(fltDampter);

    // the length of this axis is determined by scaleY.range
    //var formatPercent = d3.format("0.0%");
    if (MYAPP.TspYaxisDrawn) {d3.select("#tspWidget").selectAll(".yaxis").remove();};
/*
    var yAxisLeft = d3.svg.axis().scale(scaleY).ticks(8).
        orient("left").tickFormat(function(d) {return d + "%";});
    d3.select("#tspWidget").append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(40," + topPos + ")")// second argument shifts it down from top.
        .call(yAxisLeft);
    MYAPP.TspYaxisDrawn = true;
    */


    // in the above, the height (final position) of the YAxis is: second argument to range + plus
    // the first argument to margin.





    if (!MYAPP.TspXaxisDrawn) {
        // -h controls how far down the page the line is drawn.
        var xAxis = d3.svg.axis().scale(scaleX).ticks(2).tickSize(-h);
        xAx = d3.select("#tspWidget").append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + bottomXScale + ")")// h = the bottom position. large h ==> further down the page
            .call(xAxis);
        xAx.selectAll(".tick line").attr("y2", topPos - bottomXScale);
        xAx.selectAll(".tick text").attr("dy", "10px").attr("text-anchor", null).attr("style", null);
        //draw horizontal line
        d3.select("#tspWidget").append("line").attr("x1", "0")
            .attr("x2", "365").attr("y1", "145").attr("y2", "145").attr("class", "zeroLine");

        // draw legend

        var lgdStartYPos = 230;
        var lgdStartXPos = 95;
        var lgdLineLength = 40;
        var lgdVertDistance = 17;

        var lgdYPosLine2 = lgdStartYPos + lgdVertDistance;
        var lgdYPosLine3 = lgdStartYPos + lgdVertDistance + lgdVertDistance;

        var lgdTextXStartPos = 15;
        var lgdTextYOffset = "3px";


        // lines
        d3.select("#tspWidget").append("line").attr("x1", lgdStartXPos.toString())
            .attr("x2", (lgdStartXPos+ lgdLineLength).toString() ).
            attr("y1", lgdStartYPos.toString()).attr("y2", lgdStartYPos.toString()).attr("class", "legendTotal");

        d3.select("#tspWidget").append("line").attr("x1", lgdStartXPos.toString())
            .attr("x2", (lgdStartXPos+ lgdLineLength).toString() ).
            attr("y1", lgdYPosLine2.toString()).attr("y2", lgdYPosLine2.toString()).attr("class", "legendEnglish");

        d3.select("#tspWidget").append("line").attr("x1", lgdStartXPos.toString())
            .attr("x2", (lgdStartXPos+ lgdLineLength).toString() ).
            attr("y1", lgdYPosLine3.toString()).attr("y2", lgdYPosLine3.toString()).attr("class", "legendForeign");


        // text
        d3.select("#tspWidget").append("text").attr("x", lgdTextXStartPos.toString())
            .attr("y",lgdStartYPos.toString()).text("Total change:").attr("class", "lgdText").attr("dy", lgdTextYOffset);

        d3.select("#tspWidget").append("text").attr("x", lgdTextXStartPos.toString())
            .attr("y",lgdYPosLine2.toString()).text("English only:").attr("class", "lgdText").attr("dy", lgdTextYOffset);

        d3.select("#tspWidget").append("text").attr("x", lgdTextXStartPos.toString())
            .attr("y",lgdYPosLine3.toString()).text("Non-english:").attr("class", "lgdText").attr("dy", lgdTextYOffset);







        MYAPP.TspXaxisDrawn = true;
    };








    // the second argument to translate above is about 280 or so which puts the xAxis further down the page.
    // so the negative second attribute draws the line up.


    // LINE STUFF
    if (MYAPP.TspPathDrawn) {d3.select("#tspWidget").selectAll(".tspLineGroup").remove(); };

    var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        // experiment with basis (is not through point). monotone is through point
        .interpolate("basis")
        .x(function(d,i) {
            // verbose logging to show what's actually being done
            //console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + scaleX(i) + ' using our xScale.');
            // return the X coordinate where we want to plot this datapoint
            return scaleX(i);
        })
        .y(function(d) {
            // verbose logging to show what's actually being done
            //console.log("here is data point " + d);

            // return the Y coordinate where we want to plot this datapoint
            return scaleY(d);
        })

    if (objData.relevant == 0) {
        //translate (X,Y)  X determines where the lines start.
        grpLines = d3.select("#tspWidget").append("g").attr("class", "tspLineGroup").attr("transform", "translate(0,10)");
        grpLines.append("path").attr("class", "lineTotal").attr("d", line(objData.total));
        grpLines.append("path").attr("class", "lineEnglish").attr("d", line(objData.english));
        grpLines.append("path").attr("class", "lineForeign").attr("d", line(objData.foreign));
        MYAPP.TspPathDrawn = true;

        // arr2011 = [objData.total[2], objData.english[2], objData.foreign[2]];


        fltTot = objData.total[2];
        fltEng = objData.english[2];
        fltFor = objData.foreign[2];

        yPosTot = scaleY(fltTot);
        yPosEng = scaleY(fltEng);
        yPosFor = scaleY(fltFor);

        var boolDspTot = true;
        var boolDspEng = true;
        var boolDspFor = true;
        var TOLERANCE = 15;

        if (Math.abs((yPosTot - yPosEng)) < TOLERANCE) {
            boolDspEng = false
        }
        ;
        if (Math.abs((yPosTot - yPosFor)) < TOLERANCE) {
            boolDspFor = false
        }
        ;
        if (Math.abs((yPosEng - yPosFor)) < TOLERANCE) {
            boolDspFor = false
        }
        ;



        var strDxValue = "50px"

        grpLines.append("text").attr("x", scaleX("2011")).attr("dx", strDxValue)
            .attr("y", scaleY(fltTot)).text(fltTot.toFixed(1) + "%")
            .attr("class", fltTot > 0? "positive":"negative");

        if (boolDspEng) {
            grpLines.append("text").attr("x", scaleX("2011")).attr("dx", strDxValue)
                .attr("y", scaleY(fltEng)).text(fltEng.toFixed(1) + "%")
                .attr("class", fltEng > 0? "positive":"negative");
        }

        if (boolDspFor) {
            grpLines.append("text").attr("x", scaleX("2011")).attr("dx", strDxValue)
                .attr("y", scaleY(fltFor)).text(fltFor.toFixed(1) + "%")
                .attr("class", fltFor > 0? "positive":"negative");
        }
    };




 };  // fnPaintTSP


queue()   // initialises queue
.defer(d3.json, "geometry/sydneyTopo.json")
.defer(d3.csv, "csv/sydRegions.csv") 
.defer(d3.csv,"csv/dfTopN.csv")
.defer(d3.csv, "csv/tsp.csv")


.await(ready);

function ready(error, sydMap, sydRegion, topN, tsp) {
	if (error) return console.error(error);

    arrTSP = fnProcessTSP(tsp);



    //Data structures
    objSA2Bucket = fnSA2toBucket(sydRegion);  // {SA2Number : Choropleth Bucket}
    SA2Obj = fnSydRegionToJSON(sydRegion);   //  {SA2Number : Array[0..6]}
    var data = crossfilter(fnCvtNumericTopN(topN));  // initialise crossfilter
    dimensionObject = fnCreateDimensions(data);

    // Create the map
    var g = d3.select("#sydMap").append("g");
        g.selectAll("path")
        .data(topojson.object(sydMap, sydMap.objects.subunitsExMS).geometries)
        .enter().append("path")
        .attr("d", path)
        .style("fill", function(d)  {
            var intCurSA2Fill = parseInt(d.id);  // returns SA2 associated with topoJSON polygon
            var intBucketNum = parseInt(objSA2Bucket[intCurSA2Fill]); // converts SA2 to bucket #
            return choroplethColor(intBucketNum); // converts bucket # to colour.
            })

    .on("mouseover", function(d) {
            var intCurrSA2 = parseInt(d.id); // get the current SA2

            arrCurTSPObj = fnProcessCurrTSPObject(arrTSP[intCurrSA2]); //time series profile


           fnPaintTSP (arrCurTSPObj);

           d3.select(this).style("fill", "#FF0000"); // on hover fill with another color
            var intCurrBucket = SA2Obj[intCurrSA2][6];  //if intCurrBucket == 0 ==> no data for that area.
            fnFlushGraphs();
            fnPaintAreaAndPop(SA2Obj[intCurrSA2], "MouseOver");
            if (typeof(MouseOutTimer) != "undefined") {clearTimeout(MouseOutTimer);}

            if (intCurrBucket != 0) {fnPaintNonEnglishPC(SA2Obj[intCurrSA2], "MouseOver"); }

            if (intCurrBucket != 0) {fnPaintTopN(dimensionObject, intCurrSA2, "MouseOver"); }
            if (intCurrBucket == 0) {fnInsufficientData()} else {fnSufficientData()};
            }) // mouseover

    .on("mouseout", function(d) {
        d3.select(this).style("fill", function (d) {
            var intCurSA2FillOut = parseInt(d.id);
            var intBucketNum = parseInt(objSA2Bucket[intCurSA2FillOut]);
            return choroplethColor(intBucketNum);
            })
        fnFlushGraphs();
        MouseOutTimer = setTimeout(function(){fnCallGreaterSydney()}, 1000);
     }); // mouseout
    //zoom and pan
    var zoom = d3.behavior.zoom()
        .on("zoom",function() {
            g.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+1+")");
            g.selectAll("path")
                .attr("d", path.projection(projection));
        });  // zoom definition
    d3.select("#sydMap").call(zoom);
    fnMapBorders(sydMap);
    fnCallGreaterSydney();

}; // function ready