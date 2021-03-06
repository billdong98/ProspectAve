window.data = {};
window.club = "null";

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});


$(document).ready(function(){
    // initialize calendar
    vanillaCalendar.init({
        disablePastDays: true
    });

    // Clears radio buttons (Eliminates caching)
    clearEditRadios();
    clearGetRadios();

    // initialize date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 30, // no troll 
        minDate: 0
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    $("#image-upload").change(function (){
     selectFile();
    });
    download();
    
    // counter 4 hour offset
    $(".vcal-date--today").removeClass("vcal-date--today");
    var td = moment().format('MM/DD/YYYY');
    currentDay = document.getElementById(td);
    currentDay.classList.add('vcal-date--today');
    currentDay.classList.add('vcal-date--selected');
});

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
            downloadSuccess(res);
        },
        error: function (xhr, status, error) {
            alert("Couldn't download data!");
            console.log(xhr);
        }
    }); 
}

// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(json){
    console.log(json);

    var identity = json["identity"];
    if(identity == null){
        alert("You need to be logged in to access this page.");
        $(location).attr('href', "https://prospectave.io:1738/login");
        return;
    }

    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    window.club = club;
    $("#club_display").html(club + " Mass Upload Form");

    var rows = json["rows"];
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

        if(!(date in window.data)){
            window.data[date] = row;
        }
    }

    // set club data
    var club_name = club;
    var dispVal = club;
    if(club == "Cap") {
        club_name = "Cap & Gown";
        dispVal = "Cap & Gown";
    }
    
    if(club != "Tiger Inn" && club != "Cloister")      club_name += " Club";
    if(club == "Cloister") club_name += " Inn";

    // personalizing interface
    $("#title").html(club_name + " Control Panel");
    $("#hereswhere").html("Welcome, " + name + "! Select a date to add, edit, or delete events for your club!");
    $("#post_form_title").html("Bulk Upload " + club + "'s Schedule");

    // add logo to sidebar and title
    var c = club.toLowerCase();
    if(c == "tiger inn") c = "ti";

    // add title
    $("#sidebar").prepend('<div class="club_container"><img id="sidebarlogo" class="logo-fade" style="align:center" src="images/Logos/' + c + '-w.png"/><p id="clubname">' + dispVal + "</p></div>");

    // highlight all the right dates
    showDatesWithEvents();

    // load today
    updateDisp(new Date());
}

// submits an edited set of data for an existing event  
function submitEdit(obj){
    var form = new FormData();
    for (var key in obj) {
        if(!obj.hasOwnProperty(key)) continue;
        form.append(key, obj[key]);
    }

    console.log(form);
    console.log("Submitting edit");

    if (form.d == "" || form.s == 0) {
        alert("Edit is incomplete!");
        return false;
    }

    $.ajax({
        url: "https://www.prospectave.io:1738/edit",
        method: 'POST',   
        processData: false,
        contentType: false,  
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
            console.log("EDIT SUCCESS: " + res);
            location.reload();
        }
    })   
}

// post an event given the defined JSON format
function postEvents(obj){
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

// delete this row in the database.
function deleteEvent(date, club){
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

// Make no edit radio buttons checked (Eliminates caching bug)
function clearEditRadios(){ 
    $('input:radio[name=radio-edit-in]').each(function() { $(this).prop('checked', false)});
}

// Make no get radio buttons checked (Eliminates caching bug)
function clearGetRadios(){ 
    $('input:radio[name=radio-get-in]').each(function() { $(this).prop('checked', false)});
}