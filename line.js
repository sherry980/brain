var data = [];
    var bandPos = [-1, -1];
    var pos;
    var xdomain = 50;
    var ydomain = 100;
    var colors = ["steelblue", "green"];

    var margin = {
      top: 40,
      right: 40,
      bottom: 50,
      left: 60
    }
    var width = 760 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
    var zoomArea = {
      x1: 0,
      y1: 0,
      x2: xdomain,
      y2: ydomain
    };
    var drag = d3.behavior.drag();

    //data for testing
    
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var x = d3.scale.linear()
      .range([0, width]).domain([0, xdomain]);

    var y = d3.scale.linear()
      .range([height, 0]).domain([0, ydomain]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (margin.left/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .text("Value");

    svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (width/2) +","+(height-(margin.bottom/3))+")")  // centre below axis
      .text("Date");
    
    var band = svg.append("rect")
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "band");

    svg.append("g")
      .attr("class", "x axis")
      .call(xAxis)
      .attr("transform", "translate(0," + height + ")");

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

function getGraphData() {
      var d1 = [];
      var d2 = [];
      console.log(attentionValues)
      for (var i = 0; i <= xdomain; i++) {
        d1Value = attentionValues[i].Value;
        console.log(d1Value);
        d1.push([i, d1Value]);
      }

      data.push(d1);

      var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) {
        return x(d[0]);
      })
      .y(function(d) {
        return y(d[1]);
      });

      for (idx in data) {
        svg.append("path")
          .datum(data[idx])
          .attr("class", "line line" + idx)
          .attr("clip-path", "url(#clip)")
          .style("stroke", colors[idx])
          .attr("d", line);
      }

      var curtain = svg.append('rect')
        .attr('x', -1 * 760)
        .attr('y', -1 * 450)
        .attr('height', 450)
        .attr('width', 760)
        .attr('class', 'curtain')
        .attr('transform', 'rotate(180)')
        .style('fill', '#ffffff')

      var t = svg.transition()
          .delay(0)
          .duration(attentionValues.length*1000)
          .ease('linear')
          .each('end', function() {
            d3.select('line.guide')
              .transition()
              .style('opacity', 0)
              .remove()
          });

      t.select('rect.curtain')
          .attr('width', 0);
    

  
    var zoomOverlay = svg.append("rect")
      .attr("width", width - 10)
      .attr("height", height)
      .attr("class", "zoomOverlay")
      .call(drag);

    var zoomout = svg.append("g");

    zoomout.append("rect")
      .attr("class", "zoomOut")
      .attr("width", 75)
      .attr("height", 40)
      .attr("x", -12)
      .attr("y", height + (margin.bottom - 20))
      .on("click", function() {
        zoomOut();
      });

    zoomout.append("text")
      .attr("class", "zoomOutText")
      .attr("width", 75)
      .attr("height", 30)
      .attr("x", -10)
      .attr("y", height + (margin.bottom - 5))
      .text("Zoom Out");

    zoom();

    drag.on("dragend", function() {
      var pos = d3.mouse(this);
      var x1 = x.invert(bandPos[0]);
      var x2 = x.invert(pos[0]);

      if (x1 < x2) {
        zoomArea.x1 = x1;
        zoomArea.x2 = x2;
      } else {
        zoomArea.x1 = x2;
        zoomArea.x2 = x1;
      }

      var y1 = y.invert(pos[1]);
      var y2 = y.invert(bandPos[1]);

      if (x1 < x2) {
        zoomArea.y1 = y1;
        zoomArea.y2 = y2;
      } else {
        zoomArea.y1 = y2;
        zoomArea.y2 = y1;
      }

      bandPos = [-1, -1];

      d3.select(".band").transition()
        .attr("width", 0)
        .attr("height", 0)
        .attr("x", bandPos[0])
        .attr("y", bandPos[1]);

      zoom();
    });

    drag.on("drag", function() {

      var pos = d3.mouse(this);

      if (pos[0] < bandPos[0]) {
        d3.select(".band").
        attr("transform", "translate(" + (pos[0]) + "," + bandPos[1] + ")");
      }
      if (pos[1] < bandPos[1]) {
        d3.select(".band").
        attr("transform", "translate(" + (pos[0]) + "," + pos[1] + ")");
      }
      if (pos[1] < bandPos[1] && pos[0] > bandPos[0]) {
        d3.select(".band").
        attr("transform", "translate(" + (bandPos[0]) + "," + pos[1] + ")");
      }

      //set new position of band when user initializes drag
      if (bandPos[0] == -1) {
        bandPos = pos;
        d3.select(".band").attr("transform", "translate(" + bandPos[0] + "," + bandPos[1] + ")");
      }

      d3.select(".band").transition().duration(1)
        .attr("width", Math.abs(bandPos[0] - pos[0]))
        .attr("height", Math.abs(bandPos[1] - pos[1]));
    });

    function zoom() {
      //recalculate domains
      if (zoomArea.x1 > zoomArea.x2) {
        x.domain([zoomArea.x2, zoomArea.x1]);
      } else {
        x.domain([zoomArea.x1, zoomArea.x2]);
      }

      if (zoomArea.y1 > zoomArea.y2) {
        y.domain([zoomArea.y2, zoomArea.y1]);
      } else {
        y.domain([zoomArea.y1, zoomArea.y2]);
      }

      //update axis and redraw lines
      var t = svg.transition().duration(750);
      t.select(".x.axis").call(xAxis);
      t.select(".y.axis").call(yAxis);

      t.selectAll(".line").attr("d", line); 
    }

    var zoomOut = function() {
      x.domain([0, xdomain]);
      y.domain([0, ydomain]);

      var t = svg.transition().duration(750);
      t.select(".x.axis").call(xAxis);
      t.select(".y.axis").call(yAxis);

      t.selectAll(".line").attr("d", line);     
    }
}