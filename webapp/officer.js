var headers;

$(document).ready(function(){
    headers = $("#table").html();
    download();
    
    // initializing the date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 50 // no troll 
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    
});

function getForm() {
    var x = document.getElementById("myForm");
    var y = document.getElementById("addEvent");
    if (x.style.display === "none") {
        x.style.display = "block";
        }
    else
        x.style.display = "none";
    if (y.style.display==="none")
        y.style.display = "block";
    else
        y.style.display ="none";
}
function getForm2() {
    var x = document.getElementById("myForm2");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else
        x.style.display = "none";
}

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});

function getForm() {
    var x = document.getElementById("myForm");
    var y = document.getElementById("addEvent");
    if (x.style.display === "none") {
        x.style.display = "block";
    }
    else
        x.style.display = "none";
    if (y.style.display==="none")
        y.style.display = "block";
    else
        y.style.display ="none";
}
function getForm2() {
    var x = document.getElementById("myForm2");
    var button = document.getElementById("show_form2");
    if (x.style.display === "none") {
        x.style.display = "block";
        button.text = "Hide";
    }
    else {
        x.style.display = "none";
        button.text = "Create";
    }
}



//downloads ALL data from the Node server
function download(){
    console.log("Downloading");

    $.ajax({
        url: "http://www.prospectave.io:1738/status",
        type: 'GET',   
        contentType: 'json',    
        success: function(res) {
            downloadSuccess(res);
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    }); 
}

// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(rows){

    console.log(rows);
    
    // test.html output
    var table = $("#table");
    var out = "";
    
    // iterate over each JSON object
    for (i = 0; i < rows.length; i++) {
        var data = rows[i];
        console.log(data);
        var club = data["club_name"];
        var date = data["date"];
        var poster = data["poster"];
        var post_date = data["post_date"];
        var status = data["status"];
        var info = data["info"];
        
        out += "<tr><td>" + club + "</td><td>" + date + "</td><td>" + status + "</td><td>" + poster + "</td><td>" + post_date + "</td><td>" + info + "</td>";
    }
    
    // SET THE VALUES INSIDE TABLE
    table.html(headers + out);
}

// uploads 
function upload(){
    console.log("Uploading");
    //http://dubrox.github.io/Multiple-Dates-Picker-for-jQuery-UI/
    var dates = $("#schedule_date_picker").val().split(", ");

    console.log(dates);
    
    
    var club = $("#club_selector").val();
    var poster = "Officer page";
    var status = radio_status;
    var info = $("#schedule_message").val();

    var obj = {"c": club, "d": dates, "p": poster, "s": status, "i": info};
    console.log(obj);
    console.log(JSON.stringify(obj));
    
    $.ajax({
        url: "http://www.prospectave.io:1738/officer_post",
        type: 'POST',   
        contentType: 'application/json',  
        data: JSON.stringify(obj), //stringify is important
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("SUCCESS: res");
            download();
        }
    });
    
    alert("Form submitted!");   
    return false;
}

function remove() {

    return false;
}