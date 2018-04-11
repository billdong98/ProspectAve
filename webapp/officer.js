var headers;

$(document).ready(function(){
    headers = $("#table").html();
    download();
});

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
        
        out += "<tr><td>" + club + "</td><td>" + date + "</td><td>" + poster + "</td><td>" + post_date + "</td><td>" + status + "</td><td>" + info + "</td>";
        
        console.log(club);
        console.log(date);
        console.log(poster);
        console.log(post_date);
        console.log(status);
        console.log(info);
    }
    
    // SET THE VALUES INSIDE TABLE
    table.html(headers + out);
}

// uploads 
function upload(){
    console.log("Uploading");
    
    var club = $("#c").val();
    var date = $("#d").val();
    var poster = $("#n").val();
    var status = $("#s").val();
    var info = $("#i").val();
    
    var obj = {"c": club, "d": date, "p": poster, "s": status, "i": info};
    console.log(obj);
    console.log(JSON.stringify(obj));
    
    $.ajax({
        url: "http://www.prospectave.io:1738/officer_post",
        type: 'POST',   
        contentType: 'application/json',  
        data: JSON.stringify(obj), //stringify is important
        error: function (xhr, status, error) {
            console.log(xhr);
        },
        success: function(res) {
            console.log("SUCCESS: res");
            download();
        }
    });
    
    return false;
}