var objs = [];
var shownItems = 0;

var table_template = [
      { head: "Time", selector: "time" }
    , { head: "Name", selector: "name" }
    , { head: "PID", selector: "pid"}
    , { head: "Component", selector: "component"}
    , { head: "Level", selector: "level"}
    , { head: "Message", selector: "msg"}
];

// HELPER FUNCTIONS
//

function atBottom(){
    return $(window).scrollTop() === $(document).height() -  $(window).height();
}


// REAL FUNCTIONS
//

function loadFile(){
    $.ajax( {
        url: $('#logfile').val(),
        dataType: 'text',
        success: function(data){
            objs = processLines(data);
            shownItems = 0;
            displayData(0, 50);
        }
    });
    objs = [];
    $('#logtable > tbody').html('');
    $('#configure').removeClass('disabled');
    //Make some loading logic
}

//Return array
function processLines(data){
    var lines = data.split('\n');
    var result = new Array();
    for(var i = 0; i < lines.length-1; i++){ //Last line doesn't count
        try{
            result.push(JSON.parse(lines[i]));
        }catch(err){
            console.log(err, "i", i,"line", lines[i]);
        }
    }

    return result;
}
function displayData(start, end){
    var tbody = $('#logtable > tbody');
    var i = start;
    for(; i < end && i < objs.length; i++)
            tbody.append(mkTableRow(objs[i]));

    shownItems += i;
}
//Returns jQuery tr object
function mkTableRow(obj){
    var info_row = $('<tr>');
    info_row.append('<td class="expand"><i class="icon-chevron-right"></i></td>');
    table_template.forEach(function(value,index){
        info_row.append('<td>'+obj[value.selector]+'</td>');
    });

    var data_row = $('<tr>');
    data_row.hide();
    var data = JSON.stringify(obj, undefined, 2);
    var colspan = table_template.length;
    data_row.append('<td colspan="'+colspan+'"><pre class=".pre-scrollable">'+data+'</pre></td>')

    var res = [info_row, data_row];

    return res;
}

function deleteTemplateField(e){
    //Delete the field
    // Maybe update model
    console.log("Deleting template field", e);
    $(e.delegateTarget).remove();
    fixupTemplateFields();
}

function moveTemplateFieldUp(e){
    //Move it you SOAB
    console.log("Moving template field up", e);
    var row = $(e.delegateTarget);
    var above = $(e.delegateTarget.previousElementSibling);
    row.detach();
    above.before(row);

    fixupTemplateFields();
}

function moveTemplateFieldDown(e){
    console.log("Moving template field down", e);
//    nextElementSibling
    var row = $(e.delegateTarget);
    var below = $(e.delegateTarget.nextElementSibling);
    row.detach();
    below.after(row);

    fixupTemplateFields();
}

function fixupTemplateFields(){
    $('#fields > tbody button').removeClass('disabled');
    var first_up = $('#fields > tbody tr:first-child td:nth-child(4) > div button:nth-child(2)');
    var last_down = $('#fields > tbody tr:last-child td:nth-child(4) > div button:nth-child(3)');
    first_up.addClass('disabled');
    last_down.addClass('disabled');
}

function createTableFromTemplate(){
    var chosefields_tablebody = $('#fields > tbody');
    chosefields_tablebody.html('');
    var logtable_tableheader_row = $('#logtable > thead > tr');
    logtable_tableheader_row.html('');

    logtable_tableheader_row.append('<th>_</th>');

    table_template.forEach(function(value, index){
        var trow = $('<tr>');
        trow.data('templateid', index);
        trow.append('<td>'+value.head+'</td>');
        trow.append('<td>'+value.selector+'</td>');
        trow.append('<td>Not implemented</td>');

        var btns = $('<td>');
        var btngroup = $('<div>');
        btngroup.addClass('btn-group');

        btns.append(btngroup);
        //Delete button
        var delbtn = $('<button>'); delbtn.addClass('btn btn-small btn-delete');
        delbtn.append('<i class="icon-remove"></i> ');

        btngroup.append(delbtn);
        //Up button
        var upbtn = $('<button>'); upbtn.addClass('btn btn-small btn-up');
        upbtn.append('<i class="icon-arrow-up"></i> ');

        btngroup.append(upbtn);
        //Down button
        var downbtn = $('<button>'); downbtn.addClass('btn btn-small btn-down');
        downbtn.append('<i class="icon-arrow-down"></i> ');

        btngroup.append(downbtn);

        trow.append(btns);
        chosefields_tablebody.append(trow);

        //Also add to logtable
        logtable_tableheader_row.append('<th>'+value.head+'</th>');
    });

    //'#fields > tbody tr:last-child td:nth-child(4) > div button:nth-child(3)'
   fixupTemplateFields();
}


$(document).ready(function(){
    function load(){ loadFile(); return false; }
    $('#fileform').submit(load);
    $('#logview').click(load);

    $(window).scroll(function(){
        if(atBottom()){
            displayData(shownItems, shownItems+50);
        }
        return false;
    });

    $('#logtable > tbody').on('click', '.expand', function(event){
        var data_row = event.currentTarget.parentElement.nextSibling;
        $(data_row).toggle()
        if($(data_row).is(':visible')){
            $(event.currentTarget).attr('rowspan', '2');
            $('i', event.currentTarget)
                .removeClass('icon-chevron-right')
                .addClass('icon-chevron-down');
        }else{
            $(event.currentTarget).removeAttr('rowspan');
            $('i', event.currentTarget)
                .removeClass('icon-chevron-down')
                .addClass('icon-chevron-right');
        }
        return false;
    });

    createTableFromTemplate();

    var foos = $('#fields > tbody button');
    $('#fields > tbody > tr').on('click', 'button.btn-delete', deleteTemplateField);
    $('#fields > tbody > tr').on('click', 'button.btn-up', moveTemplateFieldUp);
    $('#fields > tbody > tr').on('click', 'button.btn-down', moveTemplateFieldDown);

    $('#addtemplatefield').click(function(){
        var row = $('<tr>');
        row.append('<td><input type="text" name="header" class="input-medium" /></td>');
        var td = $('<td>');
        var div = $('<div>'); div.addClass('input-prepend');
            div.append('<span class="add-on">obj.</span> ');
            div.append('<input type="text" name="selector"  class="input-medium" />');

            td.append(div);
        row.append(td);
        row.append('<td>Not implemented</td>');

        //Make buttons
        var btns = $('<td>');
        var btngroup = $('<div>');
        btngroup.addClass('btn-group');

        btns.append(btngroup);
        //Delete button
        var delbtn = $('<button>'); delbtn.addClass('btn btn-small btn-delete');
        delbtn.append('<i class="icon-remove"></i> ');

        btngroup.append(delbtn);
        //Up button
        var upbtn = $('<button>'); upbtn.addClass('btn btn-small btn-up');
        upbtn.append('<i class="icon-arrow-up"></i> ');

        btngroup.append(upbtn);
        //Down button
        var downbtn = $('<button>'); downbtn.addClass('btn btn-small btn-down');
        downbtn.append('<i class="icon-arrow-down"></i> ');

        btngroup.append(downbtn);

        row.append(btns);


        $('#fields > tbody').append(row);

        row.on('click', 'button.del-btn', deleteTemplateField);
        row.on('click', 'button.down-btn', moveTemplateFieldDown);
        row.on('click', 'button.up-btn', moveTemplateFieldUp);
        
        fixupTemplateFields();
    });
    var debug = "JOHN";
});

