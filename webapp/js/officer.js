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



//downloads the data for THIS club as json
function download(){
    console.log("Downloading");

    $.ajax({
        url: "https://www.prospectave.io:1738/officer_download/",
        xhrFields: {
          withCredentials: true
       },
        type: 'GET', 
        crossDomain: true,
        contentType: 'json',    
        success: function(res) {
            officerDownloaded(res);
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    }); 
}

// callback function for officer data (netID, club, rows)
function officerDownloaded(json){
    console.log(json);
    
    var identity = json["identity"];
    console.log(json);
    if(identity == null){
        alert("You are NOT logged in! Bye!");
        return;
    }
    
    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    
    var rows = json["rows"];
    
    $("#title").html(club + " Control Panel");
    
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