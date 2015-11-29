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
        value: 10,
        slide: updateSliderValue,
        change: updateSliderValue
    });
    localStorage.clear();
    updateSliderValue();
    $("#filter-event-btn").click(function(){
        getEvents();
    });
    $("#filter-asset-btn").click(function(){
        getAssets();
    });
    //Running every 10s in order to check for new event
    var count = 0;
    window.setInterval(function(){
        if($("#event-table").is(":visible")){
            getEvents();
        }
    }, 5000);
    $("#asset-email-btn").click(function(){
        var clickedObject = JSON.parse(localStorage.getItem('clicked'));
        var emailAdd = clickedObject.email;
        var subject = "Incident Report";
        var body = "Dear Sir/Mdm,\n\n"
        var tableRows = $("#result table").find("tr");
        for(var i=1, len=tableRows.length; i<len; i++){
            var attrs = $(tableRows[i]).find("td");
            body+="Incident: "+$(attrs[0]).text()+"\n"+
                  "Country: "+$(attrs[2]).text()+"\n"+
                  "Date: "+$(attrs[1]).text()+"\n\n";
        }
        body+="Please take action.";
        $(location).attr("href", "mailto:"
                         + emailAdd
                         +"?subject="
                         + encodeURIComponent(subject)
                         + "&body="
                         + encodeURIComponent(body));
    });
})

function getEvents(){
    var dateFilter = $("#datepicker").val();
    var regionFilter = $("#regionpicker").val();
    if(datepicker && datepicker.length !=0 && regionFilter){
        $.ajax({
        method: "POST",
        url: '/index/get-events-assets/',
        type: "text",
        data: {csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']")[0].value,
               dateFilter:dateFilter, regionFilter: regionFilter,
               type:'events'},
        success: function(msg){
            if(msg.response == 'success'){
                displayEvents(msg.events);
            }
        }
    });
    }else{
        alert("Date and Region could not be empty.");
    }
}

function getAssets(){
    dateFilter = $("#datepicker").val();
    regionFilter = $("#regionpicker").val();
    if(datepicker && datepicker.length !=0 && regionFilter){
        $.ajax({
            method: "POST",
            url: '/index/get-events-assets/',
            type: "text",
            data: {csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']")[0].value,
                   dateFilter:dateFilter, regionFilter: regionFilter,
                   type:'assets'},
            success: function(msg){
                if(msg.response == 'success'){
                    displayAssets(msg.assets);
                }
            }
        });
    }else{
        alert("Date and Region could not be empty.");
    }
}

function displayEvents(events){
    if(events.length){
        if((events.length+1)!=$("#event-table tr").length){
            var currentEvents = [];
            $("#event-table tr").each(function(index, value){
                currentEvents.push($($(value).find("td")[0]).text());
            });
            var newEvents = events.filter(function(obj){
                return (currentEvents.indexOf(obj.event.name)==-1);
            });
            var eventTableBody = $("#event-table tbody");
            if(currentEvents.length == 1){
                $(eventTableBody).find("tr").each(function(){
                    $(this).remove();
                });
                for(var i = 0, len = events.length; i < len; i++){
                    var row = getRowFromEvent(events[i]);
                    eventTableBody.append(row);
                }
            }else{
                for(var i=0, len=newEvents.length; i<len; i++){
                    var row = getRowFromEvent(newEvents[i]);
                    eventTableBody.prepend(row);
                }
            }        
        }
        $("#event-table").show();
        $("#asset-table").hide();
        $("#slider").show();
        $("#slider-value").show();
        assignRowClickEvent();
    }else{
        $("#event-table").hide();
        $("#asset-table").hide();
        $("#slider").hide();
        $("#slider-value").hide();
        $("#result").hide();
    }
}

function getRowFromEvent(event){
    var row = $("<tr></tr>").addClass("clickable-row");
    row.append("<td>" + event.event.name + "</td>");
    row.append("<td>" + event.event.date + "</td>");
    row.append("<td>"+ event.event.country +"</td>");
    row.append("<td style='display: none;'>"+ event.event.lat +"</td>");
    row.append("<td style='display: none;'>"+ event.event.lng +"</td>");
    return row;
}

function displayAssets(assets){
    if(assets.length){
        var assetTableBody = $("#asset-table tbody");
        $(assetTableBody).find("tr").each(function(){
            $(this).remove();
        });
        for(var i = 0, len = assets.length; i < len; i++){
            var row = $("<tr></tr>").addClass("clickable-row");
            row.append("<td>" + assets[i].asset.name + "</td>");
            row.append("<td>"+ assets[i].asset.country +"</td>");
            row.append("<td style='display: none;'>"+ assets[i].asset.lat +"</td>");
            row.append("<td style='display: none;'>"+ assets[i].asset.lng +"</td>");
            row.append("<td style='display: none;'>"+ assets[i].asset.email +"</td>");
            assetTableBody.append(row);
        }
        $("#asset-table").show();
        $("#event-table").hide();
        $("#slider").show();
        $("#slider-value").show();
        assignRowClickEvent();
    }else{
        $("#asset-table").hide();
        $("#-table").hide();
        $("#slider").hide();
        $("#slider-value").hide();
        $("#result").hide();
    }
}

function assignRowClickEvent(){
    var $table = $('table.scroll'), $bodyCells = $table.find('tbody tr:first').children(), colWidth;
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
        identifier = $(this).closest("table").attr("id");
        if(identifier == "event-table"){
            handleEventClick($(this));
        } else if(identifier == "asset-table"){
            handleAssetClick($(this));
        }
    });
}

function drawEventMarkers(events){
    var eventImg = {
        url: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FE7569",
        size: new google.maps.Size(21, 34),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(10, 34)};
    
    $.each(events, function( i, event ){
        name = event.event.name;
        lat = event.event.lat;
        lng = event.event.lng;
        latLng = {lat: parseFloat(lat), lng:parseFloat(lng)};
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: eventImg
        });
        markers.push(marker);
        var content = name+"<br/>"+
                      "Country: "+event.event.country+"<br/>"+
                      "Date: "+event.event.date+"<br/>";
        var infowindow = new google.maps.InfoWindow({
            content: content
        });
        marker.addListener('click', function() {
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
    $.each( assets, function( i, asset ){
        name = asset.asset.name;
        lat = asset.asset.lat;
        lng = asset.asset.lng;
        latLng = {lat: parseFloat(lat), lng:parseFloat(lng)};
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: assetImg
        });
        markers.push(marker);
        var content = name+"<br/>"+
                      "Country: "+asset.asset.country+"<br/>"+
                      "Email: "+asset.asset.email+"<br/>";
        var infowindow = new google.maps.InfoWindow({
            content: content
        });
        marker.addListener('click', function() {
        });
        marker.addListener('mouseover', function() {
            infowindow.open(map, this);
        });
        marker.addListener('mouseout', function() {
            infowindow.close();
        });
    });
}

function updateSliderValue(){
    var value = $("#slider").slider("value");
    $("#slider-value").text("Distance: "+value+" km");
    clickedObject = JSON.parse(localStorage.getItem('clicked'));
    if(clickedObject && clickedObject.hasOwnProperty('type')){
        if(clickedObject.type == 'event'){
            handleEventClick(clickedObject);
        }else if(clickedObject.type == 'asset'){
            handleAssetClick(clickedObject);
        }
    }
}

function handleAssetClick(asset_row){
    var name, date, country, lat, lng, email;
    if(asset_row.hasOwnProperty('type') && asset_row.type == 'asset'){
        name = asset_row.name;
        country = asset_row.country;
        lat = asset_row.lat;
        lng = asset_row.lng;
        email = asset_row.email;
    }else{
        attrs = $(asset_row).find("td");
        name = $(attrs[0]).text();
        country = $(attrs[1]).text();
        lat = $(attrs[2]).text();
        lng = $(attrs[3]).text();
        email = $(attrs[4]).text();
    }
    date = $("#datepicker").val();
    data = {name: name, country: country, lng: lng, lat: lat, date: date, email:email, type:"asset"};
    localStorage.setItem('clicked', JSON.stringify(data));
    postAjaxRequest(data);
}

function handleEventClick(event_row){
    var name, date, country, lat, lng;
    if(event_row.hasOwnProperty('type') && event_row.type == 'event'){
        name = event_row.name;
        date = event_row.date;
        country = event_row.country;
        lat = event_row.lat;
        lng = event_row.lng;
    }else{
        attrs = $(event_row).find("td");
        name = $(attrs[0]).text();
        date = $(attrs[1]).text();
        country = $(attrs[2]).text();
        lat = $(attrs[3]).text();
        lng = $(attrs[4]).text();
    }
    data = {name: name, date: date, country: country, lng: lng, lat: lat, type:"event"};
    localStorage.setItem('clicked', JSON.stringify(data));
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
                drawEventMarkers(msg.events);
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
    if(target.type =='event' && data.assets.length!=0){
        table.append("<thead><td>Asset</td><td>Country</td><td>Distance</td><td>Email</td></thead>");
        for(var i = 0, len = data.assets.length; i<len; i++){
            var row = $("<tr></tr>");
            row.append("<td>" + data.assets[i].asset.name + "</td>");
            row.append("<td>" + data.assets[i].asset.country + "</td>");
            row.append("<td>"+ data.assets[i].distance.toFixed(2) +" km</td>");
            row.append("<td>"+
                       "<button type='button' name='"+
                       data.assets[i].asset.email+
                       "' class='btn btn-default email-btn fa fa-envelope'>"+
                       "</button></td>");
            table.append(row);
        }
        $("#asset-email-btn").hide();
    }else if(target.type == 'asset' && data.events.length!=0){
        table.append("<thead><td>Event</td><td>Date</td><td>Country</td><td>Distance</td></thead>");
        for(var i = 0, len = data.events.length; i<len; i++){
            var row = $("<tr></tr>");
            row.append("<td>" + data.events[i].event.name + "</td>");
            row.append("<td>" + data.events[i].event.date + "</td>");
            row.append("<td>" + data.events[i].event.country + "</td>");
            row.append("<td>"+ data.events[i].distance.toFixed(2) +" km</td>");
            table.append(row);
        }
        $("#asset-email-btn").show();
    }else{
        text_info.append(" 0 results");
        $("#asset-email-btn").hide();
    }
    $("#result").append(text_info).append(table).show();
    $(".email-btn").on("click", function(){
        var emailAdd = $(this).attr("name");
        var subject = "Incident Report";
        var clickedObject = JSON.parse(localStorage.getItem('clicked'));
        var body = "Dear Sir/Mdm,\n\n"+
                   "Incident: " + clickedObject.name + "\n" +
                   "Country: " + clickedObject.country + "\n" +
                   "Date: " + clickedObject.date +
                   "\n\nPlease take action.";
        $(location).attr("href", "mailto:"
                             + emailAdd
                             +"?subject="
                             + encodeURIComponent(subject)
                             + "&body=" 
                             + encodeURIComponent(body));

    });
    var latLng = {lat:parseFloat(target.lat), lng:parseFloat(target.lng)};
    clearCircles();
    var circ = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 1,
        fillColor: "#FF0000",
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
    circles = [];
}

function clearMarkers(){
    for(var i = 0, len = markers.length; i<len; i++){
        markers[i].setMap(null);
    }
    markers = [];
}