$(document).ready(function(){
    vanillaCalendar.init({
        disablePastDays: true
    });
});

// triggered by selecting a new date on the calendar
function changeDate(d){
    var date = $(d).attr("data-calendar-date");
    var dateString = moment(Date.parse(date)).format('MM/DD/YYYY');
    console.log(dateString);
}