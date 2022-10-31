
var weekDaysMap = [
    "Sunday", 
    "Monday", 
    "Tuesday", 
    "Wednesday", 
    "Thursday", 
    "Friday", 
    "Saturday", 
]

var eventMap = {
    "222": "2x2x2",
    "333": "3x3x3",
    "333fm": "3x3x3 Fewest Moves",
    "333ft": "3x3x3 With Feet",
    "333oh": "3x3x3 One-Handed",
    "333mbf": "3x3x3 Multi-Blind",
    "333bf": "3x3x3 Blindfolded",
    "444bf": "4x4x4 Blindfolded",
    "555bf": "5x5x5 Blindfolded",
    "444": "4x4x4",
    "555": "5x5x5",
    "666": "6x6x6",
    "777": "7x7x7",
    "sq1": "Square-1",
    "clock": "Clock",
    "minx": "Megaminx",
    "pyram": "Pyraminx",
    "skewb": "Skewb",
}

var placeMap = [
    "First Place awarded to:", 
    "Second Place awarded to:", 
    "Third Place awarded to:",  
]

var eventFormatMap = {
    "a":"Average time of:",
    "m":"Mean time of:",
    "1":"Best time of:",
    "2":"Best time of:",
    "3":"Best time of:",
}

var multiblindFormatText = "Best result:"
var fewestMovesFormatText = "Moves:"

// Various badge settings
// Important classes
// .wca-id (p): Competitor ID is inserted into element
// .wca-name (p): Competitor Name is inserted into element
// .wca-country (img): Competitor country flag is set as the source of the image
// .wca-schedule (table): Competitor schedule is built into table
// .wca-comp-id (p): Competitor competition ID is inserted into element
var templates = [
    {
        name: "SCA Basic 3x3",
        description: "3 rows of 3 badges for printing on a landscape A4 page, no schedule",
        link: "./templates/SCA-standard.html",
        isCertificate: false,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 3,
        pageColumns: 3,
        badgeWidth: 9.9,
        badgeHeight: 7,
        badgeScale: 1.0,
    },
    {
        name: "SCA Book",
        description: "Individual portrait badge and schedule for printing on a single landscape A6 page",
        link: "./templates/SCA-book.html",
        isCertificate: false,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 1,
        pageColumns: 1,
        badgeWidth: 29.7,
        badgeHeight: 20.9818,
        badgeScale: 1.0,
    },
    {
        name: "SCA Book 2x2",
        description: "2 rows of 2 columns of portrait badges and schedule for printing on a landscape A4 page",
        link: "./templates/SCA-book.html",
        isCertificate: false,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 2,
        pageColumns: 2,
        badgeWidth: 29.7,
        badgeHeight: 20.9818,
        badgeScale: 0.5,
    },
    {
        name: "SCA Landscape Book",
        description: "Individual landscape badge and schedule for printing on a single landscape A6 page",
        link: "./templates/SCA-book-landscape.html",
        isCertificate: false,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 1,
        pageColumns: 1,
        badgeWidth: 29.7,
        badgeHeight: 20.9818,
        badgeScale: 1.0,
    },
    {
        name: "SCA Landscape Book 2x2",
        description: "2 rows of 2 columns of landscape badges and schedule for printing on a landscape A4 page",
        link: "./templates/SCA-book-landscape.html",
        isCertificate: false,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 2,
        pageColumns: 2,
        badgeWidth: 29.7,
        badgeHeight: 20.9818,
        badgeScale: 0.5,
    },
    {
        name: "SCA Certificate",
        description: "Landscape certificates for all events",
        link: "./templates/SCA-certificate.html",
        isCertificate: true,
        pageWidth: 29.7,
        pageHeight: 20.9818,
        pageRows: 1,
        pageColumns: 1,
        badgeWidth: 29.7,
        badgeHeight: 20.9818,
        badgeScale: 1.0,
    }
]

// Settings
var settings = {
    template: 0,
    marginPercentage: 0.03,
    // Badge settings
    includeStaffing: true,
    includeStations: true,
    hideStaffOnlyAssignments: false,
    // Certificate settings
    certOrganiser: "Name",
    certRole: "WCA DELEGATE",
    certBorderTint: "#006400",
    certTextColor: "#006400",
    certPageColor: "#dfefdf",
} 

// Data storage

// The core WCIF file with all competition information
var wcif = undefined
// All child activities by activityId 
var activities = {}
// Raw background image data for name badges
var backgroundImage = ""

// Shrink a text element until it's overall height is
// within 'lines' number of lines tall with the initial font size
function fitText(textElem, lines) {
    // Get height and maximum height allowed
    var height = textElem.height();
    var maxHeight = parseInt(textElem.css("font-size"), 10) * lines;

    // If too tall, reduce font size until it fits
    while (maxHeight < height) {
        size = parseInt(textElem.css("font-size"), 10);
        textElem.css("font-size", size - 1);
        height = textElem.height();

        // Adjust position
        // Assumed font is positioned relative to bottom
        var bottom = parseInt(textElem.css("bottom"), 10);
        textElem.css("bottom", bottom + 1);
    }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
}

const STATUS_MODE_INFO = 0;
const STATUS_MODE_WARN = 1;
const STATUS_MODE_ERROR = 2;
function setStatus(text, mode) {
    $("#status").removeClass();
    $("#status").text(text);
    if (mode == STATUS_MODE_WARN) {
        $("#status").addClass("warn");
    } else if (mode == STATUS_MODE_ERROR) {
        $("#status").addClass("error");
    } else {
        $("#status").addClass("info");
    }
}

// Template has been selected
function templateChanged(select) {
    settings.template = Number(select.value);

    if (templates[settings.template].isCertificate) {
        $(".badge-only").hide();
        $(".certificate-only").show();
    } else {
        $(".badge-only").show();
        $(".certificate-only").hide();
    }
}

// Load a WCIF file from the user
function readWCIF(input) {

    // Get file
    let file = input.files[0]; 
    let fileReader = new FileReader(); 
    fileReader.readAsText(file); 
    fileReader.onload = function() {
        wcif = JSON.parse(fileReader.result);
        if (wcif == undefined) {
            alert("Invalid WCIF file provided");
        }

        activities = {}
        for (var v=0; v<wcif.schedule.venues.length; v++) {
            var venue = wcif.schedule.venues[v];
            for (var r=0; r<venue.rooms.length; r++) {
                var room = venue.rooms[r];
                for (var a=0; a<room.activities.length; a++) {
                    var activity = room.activities[a];

                    activities[activity.id] = {
                        parentActivityCode: activity.activityCode,
                        activityCode: activity.activityCode,
                        roundStartTime: activity.startTime,
                        roundEndTime: activity.endTime,
                        timezone: venue.timezone,
                    }

                    for (var c=0; c<activity.childActivities.length; c++) {
                        var childActivity = activity.childActivities[c];

                        activities[childActivity.id] = {
                            parentActivityCode: activity.activityCode,
                            activityCode: childActivity.activityCode,
                            roundStartTime: activity.startTime,
                            roundEndTime: activity.endTime,
                            timezone: venue.timezone,
                        }
                    }
                }
            }
        }
        console.log(activities)
    }; 
    fileReader.onerror = function() {
        alert(fileReader.error);
    }; 
}

function readBackground(input) {
    let file = input.files[0]; 
    let fileReader = new FileReader(); 
    fileReader.readAsDataURL(file); 
    fileReader.onload = function() {
        backgroundImage = fileReader.result;

        $("#background-image-style").remove()
        var backgroundImageStyle = $(`<style id='background-image-style'>.background-image {background-image:url('${backgroundImage}');}</style>`)
        $("body").append(backgroundImageStyle);

    }; 
    fileReader.onerror = function() {
        alert(fileReader.error);
    }; 
}

function generate() {
    if (wcif == undefined) {
        console.log("Missing WCIF data")
        return;
    }

    var persons = wcif.persons.filter((a) => {
        if (a.registration != null) {
            if (a.registration.status == "accepted") {
                return true;
            }
        }
        return false;
    })

    persons.sort((a,b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    var template = templates[settings.template];

    $("#template").load(template.link, function() {

        $("#template").hide(); 

        if (template.isCertificate) {
            if (backgroundImage != "") {
                $(".wca-border").attr('src', backgroundImage);
            }

            var backgroundTint = hexToRgb(settings.certBorderTint);

            $("#border-filter-values").attr('values', `${backgroundTint.r/255} 0 0 0 0 0 ${backgroundTint.g/255} 0 0 0 0 0 ${backgroundTint.b/255} 0 0 0 0 0 1 0`);
        }

        var doc = $("#print-document");
        doc.empty();
    
        doc.css("width",`${template.pageWidth}cm`);
    
        var index = 0;
        var pageIndex = 0;
        var badgeIndex = 0;
        
        if (!template.isCertificate)
        {
            while (true) {
                if (badgeIndex >= (template.pageRows * template.pageColumns)) {
                    if (index >= persons.length) {
                        break;
                    }
                    pageIndex+=1;
                    badgeIndex=0;
                }
        
                if (badgeIndex == 0) {
                    var newPage = $(`<div class='print-page' style='width:${template.pageWidth}cm;height:${template.pageHeight}cm'></div>`)
                    newPage.css("transform",`scale(${1.0 - settings.marginPercentage})`)
                    doc.append(newPage)
                }
        
                var badge = $('#badge-template').children().first().clone();
                badge.css("width",`${template.badgeWidth}cm`);
                badge.css("height",`${template.badgeHeight}cm`);
                badge.css("transform",`scale(${template.badgeScale})`)
                badge.css("transform-origin",`0% 0%`)

                badge.removeAttr("id");
                badge.show();
                if (index >= persons.length) {
                    badge.find(".wca-name").text(" ");
                    badge.find(".wca-id").text(" ");
                    badge.find(".wca-comp-id").text("-");
                    badge.find(".wca-country").attr("src", "");
                    badge.find(".wca-country").hide();
                } else {
                    badge.find(".wca-name").text(persons[index].name);
                    badge.find(".wca-id").text(persons[index].wcaId);
                    badge.find(".wca-comp-id").text(`${persons[index].registrantId}`);
                    badge.find(".wca-country").attr("src", `https://flagcdn.com/h80/${persons[index].countryIso2.toLowerCase()}.png`);
                }
                var by = Math.floor(badgeIndex / template.pageColumns);
                var bx = badgeIndex % template.pageRows

                badge.css("top", `${by * template.badgeHeight * template.badgeScale}cm`)
                badge.css("left", `${bx * template.badgeWidth * template.badgeScale}cm`)
        
                if (bx == 0) {
                    badge.css("border-left","none");
                }
                if (bx == template.pageColumns-1) {
                    badge.css("border-right","none");
                }
                if (by == 0) {
                    badge.css("border-top","none");
                }
                if (by == template.pageRows-1) {
                    badge.css("border-bottom","none");
                }

                var personalSchedule = {}
                if (index < persons.length && badge.find(".wca-schedule").length > 0) {
                    for (var a=0; a<persons[index].assignments.length; a++) {
                        var assignment = persons[index].assignments[a];
                        var activity = activities[assignment.activityId];
                        if (activities[assignment.activityId] == undefined) {
                            console.warn(`MISSING ACTIVITY ${assignment.activityId}`);
                        } else {
                            var startTime = moment(activity.roundStartTime).tz(activity.timezone); 
                            var endTime = moment(activity.roundEndTime).tz(activity.timezone);

                            var day = startTime.day();
                            if (personalSchedule[day] == undefined) {
                                personalSchedule[day] = {
                                    day: day,
                                    sortTime: startTime.unix(),
                                    assignments: {},
                                    sortedAssignments: [],
                                }
                            }

                            //console.log(`${assignment.assignmentCode} in ${activity.activityCode}`)
                            var codes = activity.activityCode.split('-')
                            var event = codes[0]
                            var group = codes[2]

                            if (personalSchedule[day].assignments[activity.parentActivityCode] == undefined) {
                                personalSchedule[day].assignments[activity.parentActivityCode] = {
                                    timeText: `${startTime.format("HH[<sup>]mm[</sup>]")} - ${endTime.format("HH[<sup>]mm[</sup>]")}`,
                                    sortTime: startTime.unix(),
                                    eventCode: event,
                                    eventText: eventMap[event],
                                    competing: -1,
                                    stationNumber: null,
                                    judging: [],
                                };
                            }
                            
                            if (assignment.assignmentCode == "competitor") {
                                personalSchedule[day].assignments[activity.parentActivityCode].competing = group.substr(1);
                                personalSchedule[day].assignments[activity.parentActivityCode].stationNumber = assignment.stationNumber;
                            } else if (assignment.assignmentCode == "staff-judge") {
                                personalSchedule[day].assignments[activity.parentActivityCode].judging.push(group.substr(1));
                            } else {
                                console.warn(`MISSING ASSIGNMENT CODE ${assignment.assignmentCode}`);
                            }
                            
                        }
                    }

                    var sortedSchedule = []
                    for (let value of Object.values(personalSchedule)) {
                        sortedSchedule.push(value);
                    }

                    sortedSchedule.sort((a,b) => {
                        if (a.sortTime < b.sortTime) {
                            return -1;
                        }
                        if (a.sortTime > b.sortTime) {
                            return 1;
                        }
                        return 0;
                    });

                    for (var i=0; i<sortedSchedule.length; i++) {   
                        for (let value of Object.values(sortedSchedule[i].assignments)) {
                            sortedSchedule[i].sortedAssignments.push(value);
                        }
                        
                        sortedSchedule[i].sortedAssignments.sort((a,b) => {
                            if (a.sortTime < b.sortTime) {
                                return -1;
                            }
                            if (a.sortTime > b.sortTime) {
                                return 1;
                            }
                            return a.eventCode > b.eventCode;
                        });
                    }

                    var table = badge.find(".wca-schedule").first();
                    var tableContent = "<tbody>";
                    tableContent += "<tr><td>Time</td><td>Event</td><td>Group</td>"
                    if (settings.includeStations) {
                        tableContent += "<td>Station</td>";
                    }
                    if (settings.includeStaffing) {
                        tableContent += "<td>Staff</td>";
                    }
                    tableContent += "</tr>";
                    for (var i=0; i<sortedSchedule.length; i++) {   
                        tableContent += `<tr><td colspan="5" class="wca-schedule-header">${ weekDaysMap[sortedSchedule[i].day]}</td></tr>`
                        for (var j=0; j<sortedSchedule[i].sortedAssignments.length; j++) {   
                            var assignment = sortedSchedule[i].sortedAssignments[j];

                            // If the competitor isn't competing, and we don't show staffing or don't want to show staff only roles in a round
                            // Then don't show this assignment   
                            if (assignment.competing == -1 && (!settings.includeStaffing || settings.hideStaffOnlyAssignments)) {
                                continue
                            }

                            var roleText = "";
                            for (var k=0; k<assignment.judging.length; k++) {
                                if (k == 0) {
                                    roleText += "Judging:"
                                }
                                if (k == 0) {
                                    roleText += ` ${assignment.judging[k]}`
                                } else {
                                    roleText += `, ${assignment.judging[k]}`
                                }
                            }

                            var eventIcon = `<i class="cubing-icon icon event-${assignment.eventCode}"></i>`

                            var competingGroup = assignment.competing;
                            if (assignment.competing == -1 && settings.includeStaffing) {
                                competingGroup = "-";
                            }

                            tableContent += `<tr><td>${assignment.timeText}</td><td>${eventIcon} ${assignment.eventText}</td><td>${competingGroup}</td>`
                            if (settings.includeStations) {
                                if (assignment.competing == -1) {
                                tableContent += `<td>-</td>`;
                                } else if (assignment.stationNumber == null) {
                                    tableContent += `<td>any</td>`;
                                } else {
                                    tableContent += `<td>${assignment.stationNumber}</td>`;
                                }
                            }
                            if (settings.includeStaffing) {
                                tableContent += `<td>${roleText}</td>`;
                            }
                            tableContent += "</tr>";
                        }
                    }
                    tableContent += "</tbody>";
                    table.append(tableContent);
                }

                var page = doc.find(".print-page").last();
                page.append(badge);

                badgeIndex+=1;
                index+=1;
            }
        } else {
            var certDate = moment(wcif.schedule.startDate).add(wcif.schedule.numberOfDays-1, 'days')
            certDate = certDate.format("D MMMM Y")
            for (var e=0; e<wcif.events.length+1; e++) {
                var eventText = "";
                var resultPrefixText = "";
                if (e != wcif.events.length) {
                    eventText = eventMap[wcif.events[e].id];
                    resultPrefixText = eventFormatMap[wcif.events[e].rounds[wcif.events[e].rounds.length - 1].format];
                    if (wcif.events[e].id == "333mbf") {
                        resultPrefixText = multiblindFormatText;
                    }
                    if (wcif.events[e].id == "333fm") {
                        resultPrefixText = fewestMovesFormatText;
                    }
                }
                for (var p=2; p>=0; p--) {                    
                    
                    var newPage = $(`<div class='print-page' style='width:${template.pageWidth}cm;height:${template.pageHeight}cm'></div>`)
                    newPage.css("transform",`scale(${1.0 - settings.marginPercentage})`)
                    doc.append(newPage)

                    var placeText = "Awarded to:";
                    if (e != wcif.events.length) {
                        placeText = placeMap[p];
                    }

                    var cert = $('#badge-template').children().first().clone();
                    cert.css("background-color", settings.certPageColor);
                    cert.css("width",`${template.badgeWidth}cm`);
                    cert.css("height",`${template.badgeHeight}cm`);
    
                    cert.removeAttr("id");
                    cert.show();

                    cert.find(".wca-comp-name").text(wcif.name);
                    cert.find(".wca-event").text(eventText);
                    cert.find(".wca-place").text(placeText);
                    cert.find(".wca-result-prefix").text(resultPrefixText);
                    cert.find(".wca-date").text(certDate);
                    cert.find(".wca-sig-name").text(settings.certOrganiser);
                    cert.find(".wca-sig-role").text(settings.certRole);

                    cert.find(".wca-comp-name").css("color", settings.certTextColor);
                    cert.find(".wca-event").css("color", settings.certTextColor);
                    cert.find(".wca-place").css("color", settings.certTextColor);
                    cert.find(".wca-result-prefix").css("color", settings.certTextColor);
                    cert.find(".date").css("color", settings.certTextColor);
                    cert.find(".line-left").css("color", settings.certTextColor);
                    cert.find(".line-right").css("color", settings.certTextColor);
                    cert.find(".wca-sig-role").css("color", settings.certTextColor);
                    
                    cert.css("top", `0cm`)
                    cert.css("left", `0cm`)
            
                    var page = doc.find(".print-page").last();
                    page.append(cert);

                    if (e == wcif.events.length) {
                        break;
                    }
                }
            }
        }

        $("#print-button").prop("disabled", false);

        preview();
        $("#document-preview").css("height", $("#document-preview").innerWidth() * (template.pageHeight / template.pageWidth));
        
    });
}

function preview() {

    var headHtml = ""
    headHtml += '<link rel="stylesheet" type="text/css" href="./style.css">';
    headHtml += '<link rel="stylesheet" type="text/css" href="./cubingIcons.css">';
    headHtml += '<link rel="stylesheet" type="text/css" href="./print.css">';

    var bodyHtml = ""
    bodyHtml += $("#badge-template-style").prop('outerHTML')
    if ($("#background-image-style").prop('outerHTML') != undefined) {
        bodyHtml += $("#background-image-style").prop('outerHTML');
    }
    if ($("#badge-svg-filter").prop('outerHTML') != undefined) {
        bodyHtml += $("#badge-svg-filter").prop('outerHTML');
    }


    $("#print-document").show();
    bodyHtml += $("#print-document").prop('outerHTML');
    $("#print-document").hide();

    bodyHtml += '<script src="./jquery.min.js"></script>';
    bodyHtml += '<script src="./document.js"></script>';
    bodyHtml += '<script>$(document).ready(function () { fixNameText() });</script>';

    $('#document-preview').contents().find('head').html(headHtml)
    $('#document-preview').contents().find('body').html(bodyHtml)
    $('#document-preview').show();
}

function print() {
    var printwin = window.open("");

    printwin.document.open();
    printwin.document.write('<html><head><link rel="stylesheet" type="text/css" href="./style.css">');
    printwin.document.write('<link rel="stylesheet" type="text/css" href="./cubingIcons.css">');
    printwin.document.write('<link rel="stylesheet" type="text/css" href="./print.css"></head><body>');
    printwin.document.write($("#badge-template-style").prop('outerHTML'));
    if ($("#background-image-style").prop('outerHTML') != undefined) {
        printwin.document.write($("#background-image-style").prop('outerHTML'));
    }    
    if ($("#badge-svg-filter").prop('outerHTML') != undefined) {
        printwin.document.write($("#badge-svg-filter").prop('outerHTML'));
    }
    $("#print-document").show();
    printwin.document.write($("#print-document").prop('outerHTML'));
    $("#print-document").hide();

    printwin.document.write('<script src="./jquery.min.js"></script>');
    printwin.document.write('<script src="./document.js"></script>');
    printwin.document.write('<script>$(document).ready(function () { fixNameText(); window.print(); window.stop(); window.close(); });</script>');
    printwin.document.write('</body></html>');
    printwin.document.close();
}

$(document).ready(function () {
    // Setup template dropdown
    var option = '';
    for (var i=0;i<templates.length;i++) {
        if (!templates[i].isCertificate) {
            option += '<option value="' + i + '">' + templates[i].name + '</option>';
        }
    }
    option += '<option disabled>──────────</option>'
    for (var i=0;i<templates.length;i++) {
        if (templates[i].isCertificate) {
            option += '<option value="' + i + '">' + templates[i].name + '</option>';
        }
    }
    $('#select-template').html(option);
    $('#select-template').val(String(settings.template));

    $(".certificate-only").hide();

    $("#document-preview").hide();
    $("#print-document").hide();

    // Only tested to work on chromium web browsers
    if (navigator.userAgent.indexOf('Chrome') == -1) {
        alert("Printing has only been tested on Google Chrome and Microsoft Edge. I highly recommend you use either or your final printout may be incorrect")
    }
});
