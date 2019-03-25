
async function init(){
    console.log("Downloading data for all clubs");
    var res = await download();

    var identity = res["identity"];
    if(identity == null || identity.club != "ADMIN"){
        alert("You need to be logged in to access this page.");
        $(location).attr('href', "http://prospectave.io/failed_login.html");
        return;
    }

    var officers = await downloadOfficers();

    console.log(res);
    console.log(officers);

    window.data = res.rows;
    window.officers = officers.auth_list;

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

     // loop over all officers
    for(var i=0; i<window.officers.length; i++){
        var row = window.officers[i];
        var tr = createOfficerRow(row, i);

        $('#officer-table tr:last').after(tr);

        (function(r){
            $("#auth_delete_" + i).click(() =>{
                deleteOfficer(r);
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

function createOfficerRow(row, val){
    var out = "<tr>";
    out += `<td>${row["club"]}</td>`;
    out += `<td>${row["netid"]}</td>`;

    var del_id = "auth_delete_" + val;
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

/* ---------------- OFFICER MANAGEMENT ---------------- */
//downloads officer data from the Node server
function downloadOfficers(){
    return new Promise(resolve => {
        console.log("Downloading officers");
        $.ajax({
            url: "https://www.prospectave.io:1738/auth_download",
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

// adds a new officer
function submitOfficer(){
    var club = $("#auth-club-select").val();
    var netid = $("#netid-input").val();

    var b = {"netID": netid, "club": club};
    console.log("Posting: " + JSON.stringify(b));

    $.ajax({
        url: "https://www.prospectave.io:1738/auth_add",
        method: 'POST',   
        processData: false,
        contentType: false,
        cache: false,  
        xhrFields: {
            withCredentials: true //send cookies
        },
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        data: JSON.stringify(b),
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("ADMIN UPLOAD SUCCESS: " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });
}

// deletes an officer
function deleteOfficer(row){
    console.log(row);
    var netid = row["netid"];
    var club = row["club"];
    var obj = {"netID": netid};

    console.log("Trying to delete: " + netid + " , for " + club);
    var res = confirm("Are you sure you want to delete this officer?");
    if(!res){
        console.log("User canceled delete");
        return;
    } 

    $.ajax({
        url: "https://www.prospectave.io:1738/auth_delete",
        method: 'POST',   
        processData: false,
        contentType: false,
        cache: false,  
        xhrFields: {
            withCredentials: true //send cookies
        },
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        data: JSON.stringify(obj),
        error: function (xhr, status, error) {
            console.log(xhr);
            console.log(error);
            console.log(status);
        },
        success: function(res) {
            console.log("ADMIN DELETE SUCCESS: " + res);
            location.reload(); //DONT HAVE TO DO THIS. SIMPLE SOLUTION FOR NOW.
        }
    });
}



/* ---------------- INIT ---------------- */
$(document).ready(function(){
    init();


    $("#submit-button").click(function(){
        submit();
    });


    $("#auth-submit-button").click(function(){
        submitOfficer();
    });
});
