var map;
var circles = [];
var assets = [];
var events = [];
var markers = [];

$(function(){
	var mapProp = {
    	center:new google.maps.LatLng(1.2634206, 103.821618),
    	zoom:15,
    	mapTypeId:google.maps.MapTypeId.ROADMAP
  	};
  	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
    $( "#datepicker" ).datepicker();
    //Create slider for distance
    $("#slider").slider({
        min: 0,
        max: 100,
        value: 100,
        slide:updateSliderValue,
        change: updateSliderValue
    });
    updateSliderValue();
    $("#filter-event-btn").click(function(){
        getEventsAssets();
        drawEventMarkers();
    });
})

function getEventsAssets(){
    dateFilter = $("#datepicker").val();
    regionFilter = $("#regionpicker").val();
    console.log(dateFilter + " " + regionFilter);
    $.ajax({
        method: "POST",
        url: '/index/get-events-assets/',
        type: "text",
        data: {csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']")[0].value,
               dateFilter:dateFilter, regionFilter: regionFilter},
        success: function(msg){
            if(msg.response == 'success'){
                displayEvents(msg.events);
            }
        }
    });
}

function displayEvents(events){
    if(events.length){
        var eventTableBody = $("#event-table tbody");
        for(var i = 0, len = events.length; i < len; i++){
            var row = $("<tr></tr>").addClass("clickable-row");
            row.append("<td>" + events[i].event.name + "</td>");
            row.append("<td>" + events[i].event.date + "</td>");
            row.append("<td>"+ events[i].event.country +"</td>");
            row.append("<td style='display: none;'>"+ events[i].event.lat +"</td>");
            row.append("<td style='display: none;'>"+ events[i].event.lng +"</td>");
            eventTableBody.append(row);
        }
        $("#event-table").show();
        $("#slider").show();
        $("#slider-value").show();
        assignRowClickEvent();
    }
}

function displayAssets(){

}

function assignRowClickEvent(){
    var $table = $('table.scroll'),
    $bodyCells = $table.find('tbody tr:first').children(),colWidth;
    $(window).click(function() {
        colWidth = $bodyCells.map(function() {
            return $(this).width();
        }).get();
        $table.find('thead tr').children().each(function(i, v) {
            $(v).width(colWidth[i]);
        });
    }).click();
    //Make a table row clickable
    $(".clickable-row").click(function() {
        console.log($(this));
        identifier = $(this).closest("table").attr("id");
        if(identifier == "event-table"){
            handleEventClick($(this));
        } else if(identifier == "asset-table"){
            handleAssetClick($(this));
        }
    });
}

function drawEventMarkers(){
    var eventImg = {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
        size: new google.maps.Size(21, 34),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(10, 34)};
    
    $("#event-table tbody tr").each(function(){
        attrs = $(this).find("td");
        name = $(attrs[0]).text();
        date = $(attrs[1]).text();
        country = $(attrs[2]).text();
        lat = $(attrs[3]).text();
        lng = $(attrs[4]).text();
        latLng = {lat: parseFloat(lat), lng:parseFloat(lng)};
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: eventImg
        });
        markers.push(marker);
        var infowindow = new google.maps.InfoWindow({
            content: name
        });
        marker.addListener('click', function() {
            console.log('event marker clicked');
        });
        marker.addListener('mouseover', function() {
            infowindow.open(map, this);
        });
        marker.addListener('mouseout', function() {
            infowindow.close();
        });
    });
}

function drawAssetMarkers(assets){
    var assetImg = {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|3B5998",
        size: new google.maps.Size(21, 34),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(10, 34)};
    for(var i =0, len = assets.length; i<len; i++){
        name = assets[i].asset.name;
        lat = assets[i].asset.lat;
        lng = assets[i].asset.lng;
        latLng = {lat: parseFloat(lat), lng:parseFloat(lng)};
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: assetImg
        });
        markers.push(marker)
        var infowindow = new google.maps.InfoWindow({
            content: name
        });
        marker.addListener('click', function() {
            console.log('asset marker clicked');
        });
        marker.addListener('mouseover', function() {
            infowindow.open(map, this);
        });
        marker.addListener('mouseout', function() {
            infowindow.close();
        });
    }
}

function updateSliderValue(){
    var value = $("#slider").slider("value");
    $("#slider-value").text("Distance: "+value+" km");
}

function handleAssetClick(asset_row){
    console.log('clicked on asset')
    attrs = $(asset_row).find("td");
    name = $(attrs[0]).text();
    country = $(attrs[1]).text();
    lat = $(attrs[2]).text();
    lng = $(attrs[3]).text();
    data = {name: name, country: country, lng: lng, lat: lat, type:"asset"};
    postAjaxRequest(data);
}

function handleEventClick(event_row){
    console.log('clicked on event');
    attrs = $(event_row).find("td");
    name = $(attrs[0]).text();
    date = $(attrs[1]).text();
    country = $(attrs[2]).text();
    lat = $(attrs[3]).text();
    lng = $(attrs[4]).text();
    data = {name: name, date: date, country: country, lng: lng, lat: lat, type:"event"};
    postAjaxRequest(data);
}

function postAjaxRequest(data){
    if(data.type =="event"){
        url = "/index/event/"
    }else if(data.type == "asset"){
        url = "/index/asset/"
    }else{
        return;
    }
    data['csrfmiddlewaretoken'] = $("[name='csrfmiddlewaretoken']")[0].value;
    data['distance'] = $("#slider").slider("value");
    $.ajax({
        method: "POST",
        url: url,
        type: "text",
        data: data,
        success: function(msg){
            if(msg.response == 'success'){
                displayResult(data, msg);
                clearMarkers();
                drawEventMarkers();
                drawAssetMarkers(msg.assets);
            }
        }
    });
}

function displayResult(target, data){
    $("#result").hide().empty();
    var distance = parseFloat($("#slider").slider("value"));
    var text_info = $("<div></div>").text("Within " + distance + " km of " + target.name + ":");
    var table = $("<table></table>").addClass("table-bordered");
    if(data.assets.length!=0){
        table.append("<thead><td>Asset</td><td>Country</td><td>Distance</td></thead>");
        for(var i = 0, len = data.assets.length; i<len; i++){
            var row = $("<tr></tr>");
            row.append("<td>" + data.assets[i].asset.name + "</td>");
            row.append("<td>" + data.assets[i].asset.country + "</td>");
            row.append("<td>"+ data.assets[i].distance.toFixed(2) +" km</td>");
            table.append(row);
        }
    }else if(data.events.length!=0){
        table.append("<thead><td>Event</td><td>Date</td><td>Country</td><td>Distance</td></thead>");
        for(var i = 0, len = data.events.length; i<len; i++){
            var row = $("<tr></tr>");
            row.append("<td>" + data.events[i].event.name + "</td>");
            row.append("<td>" + data.events[i].event.date + "</td>");
            row.append("<td>" + data.events[i].event.country + "</td>");
            row.append("<td>"+ data.events[i].distance.toFixed(2) +" km</td>");
            table.append(row);
        }
    }else{
        text_info.append(" 0 results");
    }
    $("#result").append(text_info).append(table).show();
    var latLng = {lat:parseFloat(target.lat), lng:parseFloat(target.lng)};
    clearCircles();
    var circ = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.1,
        map: map
    });
    circ.setRadius(distance*1000);
    circ.setCenter(latLng);
    circles.push(circ);
    map.panTo(latLng);
    map.fitBounds(circ.getBounds());
}

function clearCircles(){
    for(var i = 0, len = circles.length; i<len; i++){
        circles[i].setMap(null);
    }
}

function clearMarkers(){
    console.log("clearMarkers");
    console.log(markers);
    for(var i = 0, len = markers.length; i<len; i++){
        markers[i].setMap(null);
    }
    markers = [];
    console.log(markers);
}