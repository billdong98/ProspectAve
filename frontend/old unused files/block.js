var headers;
var count;

$(document).ready(function(){
    headers = $("#boxes").html();
    count = 5;
    
    // initializing the date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 50 // no troll 
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    downloadSuccess();
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



// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(){
    
    // dummy data
    var json = {"identity":{"netID":"mman","club":"Cap"},
                "rows":[{"club_name":"Cap","date":"04/21/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""},{"club_name":"Cap","date":"04/28/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""}
                       , {"club_name":"Cap","date":"05/05/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""}, {"club_name":"Cap","date":"05/12/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""}
                       , {"club_name":"Cap","date":"05/19/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""}, {"club_name":"Cap","date":"05/26/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":""}
                       
                       
                       ]}
    
    
    /*
    var identity = json["identity"];
    if(identity == null){
        alert("You are NOT logged in! Bye!");
        window.location("https://prospectave.io:1738/login");
        return;
    }*/
    
    
    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    
    var rows = json["rows"];
    
    $("#title").html(club + " Control Panel (" + name + ")");

    $("#form2").html("Upload " + club + "'s Schedule");

    // test.html output
    var boxes = $("#boxes");
    var out = "";
    var clr = "blue";
    // iterate over each JSON object
    var i = 0;
    console.log(count);
    while (i < rows.length && i < count) {
        var data = rows[i++];
        console.log(data);
        var club = data["club_name"];
        var date = data["date"];
        var poster = data["poster"];
        var post_date = data["post_date"];
        var status = data["status"];
        var info = data["info"];
        // format them into blocks
        out += '<div class = "4u"><div class="boxed ' + clr + '"><h3>' + club + '</h3>' + date + "<br> Status: " + status + "<br>Poster: " + poster + "<br>Post Date: " + post_date + "<br>Description: " + info + "</div></div>";
        // alternating colors
        if (clr == "blue")
            clr = "orange";
        else   
            clr = "blue";
    }
    
    // SET THE VALUES INSIDE TABLE
    boxes.html(out + headers);
    
    // if all stuff are shown don't show expand button
    if (count >= rows.length) {
        var expand = document.getElementById("expand");
        expand.style.display = "none";
    }

    matchHeight();
}

//increases number of boxes shown at once
function increase() {
    count += 3;
    downloadSuccess();
}

function matchHeight() {
    var blocks = document.getElementsByClassName("boxed");
    var i;
    var maxHeight = 0;
    var h;
    console.log("changing height");
    for (i = 0; i < blocks.length; i++) {
        h = blocks[i].clientHeight;
        console.log(h);
        if (h > maxHeight) {
            maxHeight = h;
        }
    }
    console.log(maxHeight);
    for (i = 0; i < blocks.length; i++) {
        console.log("height arrange");
        blocks[i].style.height = maxHeight + "px";
    }
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