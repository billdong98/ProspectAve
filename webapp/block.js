var headers;
var count;

$(document).ready(function(){
    headers = $("#boxes").html();
    count = 10;
    download();
    
    // initializing the date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 50 // no troll 
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    
});

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});

function getForm() {
    var x = document.getElementById("myForm");
    var y = document.getElementById("addEvent");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.text = "Hide";
    }
    else {
        x.style.display = "none";
        y.text="Create";
    }
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
        url: "https://www.prospectave.io:1738/status",
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
    var boxes = $("#boxes");
    var out = "";
    var clr = "blue";
    // iterate over each JSON object
    var i = 0;
    while (i < rows.length && i < count) {
        var data = rows[i++];
        console.log(data);
        var club = data["club_name"];
        var date = data["date"];
        var poster = data["poster"];
        var post_date = data["post_date"];
        var status = data["status"];
        var info = data["info"];
        out += '<div class = "3u"><div class="boxed ' + clr + '"><h3>' + club + '</h3>' + date + "<br> Status: " + status + "<br>Poster: " + poster + "<br>Post Date: " + post_date + "<br>Description: " + info + "</div></div>";
        if (clr == "blue")
            clr = "orange";
        else   
            clr = "blue";
    }
    
    if (count >= rows.length) {
        var expand = document.getElementById("expand");
        expand.style.display = "none";
    }
    // SET THE VALUES INSIDE TABLE
    boxes.html(out + headers);
}

//increases number of boxes shown at once
function increase() {
    count += 10;
    download();
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
    if (club == "" || status == 0 || dates == "") {
        alert("Form is incomplete!");
        return false;
    }
    var obj = {"c": club, "d": dates, "p": poster, "s": status, "i": info};
    console.log(obj);
    console.log(JSON.stringify(obj));
    
    $.ajax({
        url: "https://www.prospectave.io:1738/officer_post",
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