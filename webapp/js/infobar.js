var currentDate = moment(Date.now()).format('MM/DD/YYYY');
var infobar = document.getElementById("infobar"); 
var out1;
var out2;

$(document).ready(function() {
    var infobar = document.getElementById("infobar");
    infobar.style.display="none";
});
function download(club){
    console.log("Downloading");
    $.ajax({
        url: "http://www.prospectave.io:1738/status",
        type: 'GET',   
        contentType: 'json',    
        success: function(res) {
            downloadSuccess(res, club);
        },
        error: function (xhr, status, error) {
            console.log(xhr);
        }
    }); 
}
function downloadSuccess(rows, currentClub){
    console.log(rows);
    // iterate over each JSON object
    for (i = 0; i < rows.length; i++) {
        var row = rows[i];
        var club = row["club_name"];
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];

        if(date == "" || club == "" || status == "") continue; 

        if (date == currentDate && club == currentClub) {
            out2 = out1 + "<div class='inner'> <nav> <ul> <li><a href='#intro'>Club: " + club + "</a></li> <li><a href='#one'>Date: " + date + "</a></li><li><a href='#two'>Information: " + info + "</a></li> </ul> </nav> </div>";
            return;
        }
    }
}

function showInfo(club) { 
    out1 = '<img src="images/Logos/' + club.toLowerCase() + '.png" style="left: 10%; top: 10%; height: 20%; width: auto;"/>'; 

    out2 = out1 + "<div class='inner'> <nav> <ul> <li><a href='#intro'>No events on this date!</a></li> </ul> </nav> </div>";
    download(club);
    infobar.innerHTML = out2;
    infobar.style.display="";
    sidebar.style.display="none";
}

function hideInfo() { 
    infobar.style.display="none";
    sidebar.style.display="";
}