$( document ).ready(function() {
    $( "#year_s" ).datepicker();
    $( "#year_s" ).datepicker("setDate",new Date("2016-09-01 00:00"));
    $( "#year_e" ).datepicker();
    $( "#year_e" ).datepicker("setDate",new Date("2017-05-31 00:00"));
    $( "#thanks_s" ).datepicker();
    $( "#thanks_s" ).datepicker("setDate",new Date("2016-11-18 00:00"));
    $( "#thanks_e" ).datepicker();
    $( "#thanks_e" ).datepicker("setDate",new Date("2016-11-28 00:00"));
    $( "#winter_s" ).datepicker();
    $( "#winter_s" ).datepicker("setDate",new Date("2016-12-15 00:00"));
    $( "#winter_e" ).datepicker();
    $( "#winter_e" ).datepicker("setDate",new Date("2017-01-03 00:00"));
    $( "#spring_s" ).datepicker();
    $( "#spring_s" ).datepicker("setDate",new Date("2017-03-02 00:00"));
    $( "#spring_e" ).datepicker();
    $( "#spring_e" ).datepicker("setDate",new Date("2017-03-20 00:00"));
});

function getDate(name){
    return moment($(name).datepicker("getDate"));
}

var generated;

function generate(days) {
    var array = document.getElementById('name_input').value.split(/[ ]*,[ ]*/);
    //var array =[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56];
    /*var array = ["Wilford", "Sammy", "Isreal", "Donny", "Clarence", "Ben", "Reuben", "Kenneth", "Stewart", "Dante", "Gayle", "Benton", "Bret", "Bob", "Brant", "Sergio", "Robert", "Calvin", "Emile", "Jamar", "Henry", "Mohammed", "Oren", "Thaddeus", "Harold", "Jim", "Joan", "Victor", "Hipolito", "Yong", "Eduardo", "Carmelo", "German", "Ernesto", "Augustus", "Tyson", "Denny", "Darnell", "Francisco", "Alfred", "Maynard", "Elisha", "Sang", "Chester", "Cedrick", "Michal", "Robt", "Filiberto", "Damian", "Pedro", "Jerald", "Lyndon", "Harris", "Glenn", "Clint", "Lyle", "Michael", "Barrett", "Modesto", "Leonel"];*/
    array = shuffle(array);
    //console.log(array);

    console.log(array);
    if(array == null || array.length < 10){
        alert("Invalid input!");
        return;
    }

    //break processing
    var yS = getDate("#year_s");
    var tgS = getDate("#thanks_s");
    var tgE = getDate("#thanks_e");
    var wS = getDate("#winter_s");
    var wE = getDate("#winter_e");
    var sS = getDate("#spring_s");
    var sE = getDate("#spring_e");
    var yE = getDate("#year_e");

    console.log(yS);
    //dynamic pair (experimental)
    teams = [];
    var groups = group(array,6);
    if(groups[0].length == groups[5].length){ 
        //console.log("Divisible by 6: " + array.length);
        groups[0][groups[0].length] = groups[1].splice(-1, 1);
        //console.log("Created artificial offset!");
    }
    //Feeder array construction
    /* K1: 0, K2: 1, T1: 2, T2: 3, V1: 4, V2: 5 */
    var K1 = groups[0].concat(groups[4]).concat(groups[2]);
    var T1 = groups[2].concat(groups[0]).concat(groups[4]);
    var V1 = groups[4].concat(groups[2]).concat(groups[0]);
    var K2 = groups[1].concat(groups[3]).concat(groups[5]);
    var T2 = groups[3].concat(groups[5]).concat(groups[1]);
    var V2 = groups[5].concat(groups[1]).concat(groups[3]);

    var feeders = [K1,K2,T1,T2,V1,V2];

    //counters K12 T12 V12
    var counters = [0,0,0,0,0,0];

    /*set start to the year's start*/
    var d = moment(yS);
    hello = d;
    for(var i =0; d<=yE; i++){
        if(within(d,yS,tgS,tgE,wS,wE,sS,sE,yE)){
            var formattedDate = (d.month() + 1) + "/" + d.date() + "/" +d.year();
            var team = {
                date: formattedDate,
                k1: K1[counters[0]],
                k2: K2[counters[1]],
                t1: T1[counters[2]],
                t2: T2[counters[3]],
                v1: V1[counters[4]],
                v2: V2[counters[5]]
            };
            //console.log("K: {" + team.k1 + ", " + team.k2 + "} T: {" + team.t1 + ", " + team.t2+"} V: {" + team.v1 + ", " + team.v2 + "}");
            for(var j=0;j<counters.length;j++){
                counters[j]++;
                if(counters[j] >= feeders[j].length){
                    counters[j] = 0;
                }
            }
            teams[teams.length] = team;
        }
        d.add(1, 'day'); 
    }
    generated = teams;
    enable();
    display(teams,"schedule-container-admin");
    //console.log(ConvertToCSV(JSON.stringify(teams)));
}

function within(d,yS,tgS,tgE,wS,wE,sS,sE,yE){
    if(d<yS || d>yE){
        console.log(d + " is out of bounds");
        return false;
    }
    if(d>=tgS && d<=tgE){
        //console.log(d + " is in TG break");
        return false;
    }

    if(d>=wS && d<=wE){
        //console.log(d + " is in winter break");
        return false;
    }

    if(d>=sS && d<=sE){
        //console.log(d + " is in spring break");
        return false;
    }
    return true;
}

//enables the button
function enable(){
    $('#upload-button').prop('disabled', false);
    $('#upload-button').css("background-color","green");
    var lastStyle = $('style').last();
    $('#upload-button').val("Upload");
    $('#upload-button').css("color","white !important;");

    $('#csv-button').prop('disabled', false);
    $('#csv-button').css("background-color","green");
    $('#csv-button').css("color","white !important;");
}

//disables the button after the data is uploaded
function disable(){
    $('#upload-button').prop('disabled', true);
    var lastStyle = $('style').last();
    $('#upload-button').val("Uploaded");
    lastStyle.html(lastStyle.html() + '\n#upload-button { color:red !important; }');
    $('#upload-button').css("color","white !important;");
}

function upload(){
    console.log("Uploading");
    var password = prompt("Insert the housemaster password");
    var code = btoa(password);
    console.log(code);
    //use the cached generated teams
    $.ajax({
        url: "http://107.180.64.70:8081",
        type: 'POST',   
        beforeSend: function(request) {
            request.setRequestHeader("Authentication", code);
        },
        contentType: 'application/json',  
        data: JSON.stringify(generated), //stringify is important,  
        error: function (xhr, status, error) {
            handleError(xhr);
        },
        success: function(res) {
            uploadSuccess(res);
        }
    }); 
}

//downloads this month from the Node server
function download(){
    console.log("Downloading");
    //use the cached generated teams
    $.ajax({
        url: "http://107.180.64.70:8081",
        type: 'GET',   
        contentType: 'json',    
        success: function(res) {
            downloadSuccess(res);
        },
        error: function (xhr, status, error) {
            handleError(xhr);
        }
    }); 
}

function handleError(xhr){
    console.log("ERROR: " + xhr.status);
    switch(xhr.status){
        case 0:
            alert("0: Server is unreachable.");
            break;
        case 400:
            alert("400: Bad request! Check your input.");
            break;
        case 403:
            alert("403: Invalid password! Upload permission denied.");
            break;
        case 500:
            alert("500: Internal server error.");
            break;
    }
}

function uploadSuccess(res){
    console.log(res);
    console.log("Successful upload!");
    disable();
}

function downloadSuccess(data){
    console.log("Successful download!");
    $('#pdf-button').prop('disabled', false);
    //console.log(data);
    display(data,"schedule-container-month");
}

Date.prototype.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
];

Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};

function display(teams, loc){
    console.log("Displaying at : " + loc);
    var myTableDiv = document.getElementById(loc);
    $("#" + loc).empty(); //clear table
    var table = document.createElement('TABLE');
    table.className = "custom-table";

    var month;
    if(loc == "schedule-container-month"){
        table.id = "month-schedule";
        var date = new Date(teams[2].date + " 00:00:00");
        month = date.getMonthName();
        $("#month-title").text(month + " Chore Schedule");
    }

    var tableBody = document.createElement('TBODY');
    table.border = '1';
    table.appendChild(tableBody);

    var heading = ["Kitchen","", "Trash","","Vacuum",""];

    //add headers!
    var tr = document.createElement('TR');
    tableBody.appendChild(tr);

    var th = document.createElement('TH')
    th.setAttribute("colspan","1");
    th.appendChild(document.createTextNode("Date"));
    th.style.textAlign = "center";
    tr.appendChild(th);
    for (i = 0; i < heading.length; i++) {
        var th = document.createElement('TH')
        th.setAttribute("colspan","1");
        th.appendChild(document.createTextNode(heading[i]));
        th.style.textAlign = "left";
        tr.appendChild(th);
    }

    //TABLE ROWS
    for (i = 0; i < teams.length; i++) {
        var tr = document.createElement('TR'); //generate a row
        for (var key in teams[i]) {
            if (teams[i].hasOwnProperty(key)) { 
                var td = document.createElement('TD');
                if(key == "date"){
                    var d = moment(teams[i]["date"]);
                    var formattedDate = (d.month() + 1) + "/" + d.date() + "/" +d.year();
                    td.appendChild(document.createTextNode(formattedDate));
                } else{
                    td.appendChild(document.createTextNode(teams[i][key]));
                }
                tr.appendChild(td);
            }
        }
        tableBody.appendChild(tr);
    }  
    myTableDiv.appendChild(table);
}

//splits up an array of names into N semi-equal groups (largest groups will be 1 greater than the others)
function group(names,n){
    var extra = names.length % n;
    var minSize = (names.length - extra)/n;

    //console.log(minSize + " : " + extra);
    //names = shuffle(names);
    var groups = [];
    for(var i=0; i<n; i++){
        groups[groups.length] = [];
    }

    var count = 0;

    var cap = 0;
    var pointer = -1;

    for(i=0;i<names.length;i++){
        if(cap <= 0){
            pointer++;
            var cap = minSize;
            if(extra > 0){
                cap++;
                extra--;
            }
        }
        var end = groups[pointer].length;
        groups[pointer][end] = names[i];
        cap--;
    }
    //console.log("Split into " + n);
    return groups;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//detect when there is a hash change
$(window).bind('hashchange', function() {
    var hash = document.location.hash;
    var page = hash.replace('#', '');
    //console.log("Opened page: " + page);

    if(page == "month"){
        console.log("Loading this month.");
        download();
    }
});


