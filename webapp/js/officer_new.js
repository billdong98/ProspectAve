window.data = {};

var radio_status = 0;
$("input:radio[name=radio-get-in]").click(function() {
    radio_status = $(this).val();
});

$(document).ready(function(){
    // initialize calendar
    vanillaCalendar.init({
        disablePastDays: true
    });

    // initialize date picker
    $("#schedule_date_picker").multiDatesPicker({
        maxPicks: 40 // no troll 
        // addDates: [today, tomorrow] PUT IN CURRENT CHOICES
    });
    downloadSuccess();
    
    updateDisp(new Date());
});

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = Date.parse($(d).attr("data-calendar-date"));
    updateDisp(date);
}
    
// pass in a date object to change the current date
function updateDisp(date){    
    // format the date in two different ways
    var dateString = moment(date).format('MM/DD/YYYY');
    var formattedDate = moment(date).format("ddd, MMM Do");
    
    var row = window.data[dateString];
    if(row === undefined){ 
        // if there's no event, display the "no data" text

        $("#reg_date_info").html(formattedDate);
        $("#date_var").html(dateString);
        $("#club_info").css('display', 'none');
        $("#register_panel").css('display', 'block');
        // show the button that populates the field with the picked date
        $('#add_button').unbind('click');
        $('#add_button').click(function() {
            populateForm({}, date);
        });
    } else {
        // update each field of the display
        $("#date_info").html(formattedDate);
        $("#club_info").css('display', 'block');
        $("#register_panel").css('display', 'none');

        var club = row["club_name"];
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];

        $("#status_info").html("Status: " + status);
        $("#description_info").html(info);
        $("#poster_info").html(poster);
        $("#postdate_info").html(post_date);   
        
        // set event listeners for these buttons
        $('#edit_info').click(function() {
            populateForm(row, date);
        });
        $('#delete_info').click(function() {
            deleteRow(row);
        });
        
    }
}

// handles the results from the node server
// Parameter: rows is a JSON object array
function downloadSuccess(){

    // dummy data
    var json = {"identity":{"netID":"mman","club":"Cap"},
                "rows":[{"club_name":"Cap","date":"04/21/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"What is life supposed to be. Blah blah blah blah blah blah blah blah blah blahancnpie djiapscabob iaofiajcknojd uebofuahoakcobdu joefieisjc anch"}, {"club_name":"Cap","date":"04/28/2018","poster":"Officer page","post_date":"04-12-2018","status":"PUID","info":""},  {"club_name":"Cap","date":"04/23/2018","poster":"Officer page","post_date":"04-12-2018","status":"List","info":"Hi"}, {"club_name":"Cap","date":"04/25/2018","poster":"Officer page","post_date":"04-12-2018","status":"Pass","info":"Last"}

                       ]};

    var name = json["identity"]["netID"];
    var club = json["identity"]["club"];
    $("#club_display").html(club + " Event Form — " + name);

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

    /*
    var identity = json["identity"];
    if(identity == null){
        alert("You are NOT logged in! Bye!");
        window.location("https://prospectave.io:1738/login");
        return;
    }*/

    $("#title").html(club + " Control Panel — " + name + "");
    $("#form2").html("Upload " + club + "'s Schedule");

    // add logo to sidebar
    var logo = document.getElementById(club.toLowerCase() + "logo");
    logo.style.display = "initial";
    
    // highlight all the right dates
    showDatesWithEvents();
}

// Colors calendar if date has an event 
function showDatesWithEvents() {
    console.log("Highlighting dates");
    for (var date in window.data) {
        var currentDay = document.getElementById(date);
        if (new Date(date) >= new Date() && currentDay != null){

            var status = window.data[date].status;
            if(status === "PUID"){
                currentDay.classList.add('vcal-date--PUID');
            } else if (status === "Pass"){
                currentDay.classList.add('vcal-date--pass');
            } else if(status === "List"){
                currentDay.classList.add('vcal-date--list');
            }

        }
    }
}

function clearDatePicker(){
    console.log("Clearing dates");
    $('#schedule_date_picker').multiDatesPicker('resetDates', 'picked');
}

// populate the post form with data
function populateForm(row, date){
    console.log("Populating form");
    console.log(row);
    console.log(date);

    // reset the post form
    document.getElementById("post_form").reset();
    clearDatePicker();

    // add the date onto the calendar
    $('#schedule_date_picker').multiDatesPicker('addDates', [date]);
    
    // add a new event (blank date on calendar)
    if(jQuery.isEmptyObject(row)){
        
    } else { // there is row data
        
        $("#schedule_message").val(row['info']);
        var status = row['status'].toLowerCase();
        $("#radio-" + status).click();
        
    }
    
    // open if needed, or scroll
    if ($("#post_form_container").css("display") === "none"){

        // open the form and scroll to it
        toggleForm();
    } else {
        // scroll to it
        $('html, body').animate({
            scrollTop: $('#post_form_container').offset().top - 30
        }, 500);
    }
}

// delete this row in the database.
function deleteRow(row){
    
}

function toggleForm() {
    var x = document.getElementById("post_form_container");
    var button = document.getElementById("show_form");
    if (x.style.display === "none") {
        x.style.display = "block";
        button.text = "Hide";

        $('html, body').animate({
            scrollTop: $('#post_form_container').offset().top - 30
        }, 500);
    }
    else {
        x.style.display = "none";
        button.text = "Create";
    }
}



function submitForm(){

}

function upload(){
    return false;
}