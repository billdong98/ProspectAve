/* -------------------- CALENDAR FUNCTIONS -------------------- */

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

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = Date.parse($(d).attr("data-calendar-date"));
    updateDisp(date);
}


/* ------------------ MULTIDAY FORM FUNCTIONS ------------------ */

// clear the dates on the multi-day date picker
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

// Toggles the bottom multiday form
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


/* ---------------- CALENDAR IO PANEL FUNCTIONS ------------------ */

var edit_status = 0;
$("input:radio[name=radio-edit-in]").click(function() {
    edit_status = $(this).val();
});

// pass in a date object to change the current date
// triggered by clicking a new date on the calendar
// updates the panel to its default (club_info OR register_panel)
function updateDisp(date){    
    // format the date in two different ways
    var dateString = moment(date).format('MM/DD/YYYY');
    var formattedDate = moment(date).format("ddd, MMM Do");
    
    closeEditing();
    
    $('#edit_info').unbind('click');
    $('#delete_info').unbind('click');
    
    var row = window.data[dateString];
    if(row === undefined){ 
        // if there's no event, display the "no data" text
        $("#event_panel").css('display','none');

        $("#register_panel").animate({'opacity': 0}, 130, function () {  
            $("#register_panel").css('display', 'block');    
            $("#reg_date_info").html(formattedDate);
            $("#date_var").html(dateString);
            // show the button that populates the field with the picked date
            $('#add_button').unbind('click');
            $('#add_button').click(function() {
                addEvent(dateString);
            });
        }).animate({'opacity': 1}, 130);
    } else {

        $("#register_panel").css('display','none');
        var club = row["club_name"];
        window.club = club;
        var date = row["date"];
        var poster = row["poster"];
        var post_date = row["post_date"];
        var status = row["status"];
        var info = row["info"];

        $("#event_panel").animate({'opacity': 0}, 130, function () {  
            $("#club_info").css('display', 'block'); 
            $("#event_panel").css('display', 'block');
            // update each field of the display
            $("#date_info").html(formattedDate);
            $("#status_info").html("Status: " + status);
            $("#description_info").html(info);
            $("#poster_info").html(poster);
            $("#postdate_info").html(post_date);  
        }).animate({'opacity': 1}, 130); 
        
        // set event listeners for these buttons
        $('#edit_info').click(function() {
            loadEditing(dateString, status, info);
        });
        $('#delete_info').click(function() {
            deleteEvent(date, club);
        });
    }
}

// opens a modified version of the edit panel to add a new event
function addEvent(date){
    $("#register_panel").css('display','none');
    edit_status = 0; //default
    
    $("#event_panel").animate({'opacity': 0}, 130, function () {  
        $("#club_info").css('display', 'block'); 
        $("#event_panel").css('display', 'block');
        $("#status_info").css('display','none');
        $("#description_info").css('display','none');
        $("#poster_info_li").css('display','none');
        $("#post_date_info_li").css('display','none');

        $("#edit_buttons").css('display', 'block');
        $("#normal_buttons").css('display', 'none');
        $("#edit_description").css('display', 'block');
        $("#edit_status").css('display', 'block');
    }).animate({'opacity': 1}, 130); 
                                     

    $('#cancel_edit').unbind('click');
    $('#submit_edit').unbind('Cancel Draft');
    $('#cancel_edit').click(function() {
        closeAdd();
    });

    $('#submit_edit').unbind('click');
    $('#submit_edit').html('Add Event');
    $('#submit_edit').click(function() {
        var s = edit_status;
        var i = $("#edit_description").val();
        console.log("Adding new event! " + s + " " + i);
        if(s != 0){
            var obj = {"c": window.club, "d": [date], "s": s, "i": i};
            postEvents(obj);
        } else {
            alert("Please select a status!");
        }
    });
}

// close the add event panel
function closeAdd(){
    $("#register_panel").css('display','none');
    
    $("#register_panel").animate({'opacity': 0}, 130, function () {  
        $("#register_panel").css('display','block');
        $("#club_info").css('display', 'none');
        closeEditing();
    }).animate({'opacity': 1}, 130); 
}


// opens the editing tools with the given status and description
function loadEditing(date, status, description){
    $("#description_info").css('display', 'none');
    $("#status_info").css('display', 'none');
    $("#normal_buttons").css('display', 'none');
    $("#poster_info_li").css('display', 'none');
    $("#post_date_info_li").css('display', 'none');
    
    $("#edit_buttons").css('display', 'block');
    $("#edit_description").css('display', 'block');
    $("#edit_description").val(description);
    $("#edit_status").css('display', 'block');
   
    $("#radio-edit-" + status.toLowerCase()).click();
    edit_status = status;
    
    $('#cancel_edit').unbind('click');
    $('#cancel_edit').html('Cancel Edit');
    $('#cancel_edit').click(function() {
        closeEditing();
    });

    $('#submit_edit').unbind('click');
    $('#submit_edit').html('Submit Edit');
    $('#submit_edit').click(function() {
        var s = edit_status;
        var i = $("#edit_description").val();
        if(s != status || i != description){
            submitEdit(date, s, i);
        } else {
            alert("No information was changed.");
        }
    });
}


// on date change, hide them.
// on cancel, (add cancel button), hide? idkkk!
// TODO: A LOT
function closeEditing(){
    edit_status = 0;
    $('#submit_edit').unbind('click');
    $('#cancel_edit').unbind('click');

    $("#description_info").css('display', 'block');
    $("#status_info").css('display', 'block');
    $("#normal_buttons").css('display', 'block');
    $("#poster_info_li").css('display', 'block');
    $("#post_date_info_li").css('display', 'block');

    $("#edit_buttons").css('display', 'none');
    $("#edit_description").css('display', 'none');
    $("#edit_description").attr("placeholder", "Enter a description here");
    $("#edit_description").val("");
    $("#edit_status").css('display', 'none');
    edit_status = 0;
}