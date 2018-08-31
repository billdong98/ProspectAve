
async function init(){
    console.log("Downloading data for all clubs");
    var res = await download();

    var identity = res["identity"];
    if(identity.club != "ADMIN"){
        alert("You need to be logged in to access this page.");
        $(location).attr('href', "http://prospectave.io/failed_login.html");
        return;
    }

    console.log(res);

    window.data = res.rows;

    // loop over all rows
    for(var i=0; i<window.data.length; i++){
        var row = window.data[i];

        // if it is in the past, don't add it
        if (moment().subtract(1, "days").startOf('day') > moment(row.date, "MM/DD/YYYY")) continue;

        var tr = createRow(row, i);

        $('#status-table tr:last').after(tr);

        (function(r){
            $("#delete_" + i).click(() =>{
                deleteEvent(r);
            });
        }(row));
    }
}


function createRow(row, val){
    var out = "<tr>";
    out += `<td>${row["club_name"]}</td>`;
    out += `<td>${row["date"]}</td>`;
    out += `<td>${row["status"]}</td>`;
    out += `<td>${row["info"]}</td>`;
    out += `<td>${row["image"]}</td>`;
    out += `<td>${row["poster"]}</td>`;
    out += `<td>${row["post_date"]}</td>`;

    var del_id = "delete_" + val;
    var del = `<a id="${del_id}" target="_blank" class="icon fa-trash fa-lg"></a>`
    out += `<td>${del}</td>`;
    out += "</tr>";

    return out;
}

//downloads ALL data from the Node server
function download(){
    return new Promise(resolve => {
        console.log("Downloading");
        $.ajax({
            url: "https://www.prospectave.io:1738/officer_download",
            xhrFields: {
                withCredentials: true
            },
            type: 'GET', 
            crossDomain: true,
            contentType: 'json',   
            success: function(res) {
                resolve(res);
            },
            error: function (xhr, status, error) {
                console.log(xhr);
            }
        }); 
    });
}


// adds a new event 
function submit(){
    var club = $("#club-select").val();
    var date = $("#date-input").val();

    date = moment(date, "YYYY-MM-DD")
        .format("MM/DD/YYYY");

    var info = $("#info-input").val();
    var status = $("#status-select").val();

    var files = $("#image-upload").prop("files");

    var obj = {"c": club, "d": date, "s": status, "i": info, "uploadedImage": ""};
    if(files.length > 0) obj["uploadedImage"] = files[0];

    if(date == "") {
        alert("Missing date!");
        return;
    }

    console.log("Adding new event!");
    console.log(JSON.stringify(obj));

    var form = new FormData();
    for (var key in obj) {
        if(!obj.hasOwnProperty(key)) continue;
        form.append(key, obj[key]);
    }

    $.ajax({
        url: "https://www.prospectave.io:1738/officer_post",
        method: 'POST',   
        processData: false,
        contentType: false,
        cache: false,  
        xhrFields: {
            withCredentials: true //send cookies
        },
        crossDomain: true,
        data: form,
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("UPLOAD SUCCESS: " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });
}


function deleteEvent(row){
    console.log(row);
    var date = row["date"];
    var club = row["club_name"];
    console.log("Trying to delete : " + date + " , for " + club);
    var res = confirm("Are you sure you want to delete this event?");
    if(!res){
        console.log("User canceled delete");
        return;
    } 
    var form = new FormData();
    form.append("d", date);
    form.append("c", club);

    $.ajax({
        url: "https://www.prospectave.io:1738/delete",
        type: 'POST',   
        processData: false,
        contentType: false,
        cache: false,  
        xhrFields: {
            withCredentials: true //send cookies
        },
        crossDomain: true,
        data: form,
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
            alert("Something went wrong!");
        },
        success: function(res) {
            console.log("Successfully deleted " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });   
}

$(document).ready(function(){
    init();


    $("#submit-button").click(function(){
        submit();
    });
});
