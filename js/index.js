var objs = [];
var filtered = [];
var editor = {};
var shownItems = 0;

var table_template = [
      { head: "Time", selector: "time" }
    , { head: "Name", selector: "name" }
    , { head: "Component", selector: "component"}
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
            processLines(data);
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
    var lines = data.split('\n')
    lines = lines.slice(0, lines.length-1);
    objs = lines.map(function(line){ return JSON.parse(line); });

    fnFilter = new Function("obj", editor.getValue());
    filtered = objs.filter(fnFilter);

    $("#orgNumLines").text(objs.length.toString());
    $("#filtNumLines").text(filtered.length.toString());
}
function displayData(start, end){
    var tbody = $('#logtable > tbody');
    var i = start;
    for(; i < end && i < filtered.length; i++)
            tbody.append(mkTableRow(filtered[i]));

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
    $(e.currentTarget).parent().parent().parent().remove();
    fixupTemplateFields();
}

function moveTemplateFieldUp(e){
    //Move it you SOAB
    console.log("Moving template field up", e);
    var row = $(e.currentTarget).parent().parent().parent();
    var above = $(row[0].previousElementSibling);
    row.detach();
    above.before(row);

    fixupTemplateFields();
}

function moveTemplateFieldDown(e){
    console.log("Moving template field down", e);
//    nextElementSibling
    var row = $(e.currentTarget).parent().parent().parent();
    var below = $(row[0].nextElementSibling);
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

    logtable_tableheader_row.append('<th></th>');

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

function appendTemplateTableRow(){
        var row = $('<tr>');
        var head_td = $('<td>');
            var head_input = $('<input>');
            head_input.attr("name", "header"); 
            head_input.attr("type", "text"); 
            head_input.addClass("input-medium");
            
            head_td.append(head_input);
        row.append(head_td);

        var selector_td = $('<td>');
        var selector_div = $('<div>'); selector_div.addClass('input-prepend');
            selector_div.append('<span class="add-on">obj.</span> ');
            
            var selector_input = $("<input>");
            selector_input.attr("name", "selector"); 
            selector_input.attr("type", "text"); 
            selector_input.addClass("input-medium");

            selector_div.append(selector_input);

            selector_td.append(selector_div);
        row.append(selector_td);
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

        selector_input.focusout(function(e){
            //Make input fields into normal text
            console.log("Lost focus", e);
            var value = $(e.currentTarget).val();
            $(e.currentTarget).parent().parent().html(value);
        });
        head_input.focusout(function(e){
            var value = $(e.currentTarget).val();
            $(e.currentTarget).parent().html(value);
        });

        $('#fields > tbody').append(row);

        fixupTemplateFields();
    }

function saveTemplate(){
    console.log("BEFORE", table_template);
    table_template = new Array();
    $('#fields > tbody tr').each(function(index, value){
        var name = $('td:nth-child(1)', value).text();
        var selector = $('td:nth-child(2)', value).text();

        table_template.push({"head": name, "selector": selector});
    });

    createTableFromTemplate();
    $('#fieldchose').modal('hide')
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
    $('#fields > tbody').on('click', 'tr button.btn-delete', deleteTemplateField);
    $('#fields > tbody').on('click', 'tr button.btn-up', moveTemplateFieldUp);
    $('#fields > tbody').on('click', 'tr button.btn-down', moveTemplateFieldDown);

    $('#addtemplatefield').click(appendTemplateTableRow);
    $('#saveTemplate').click(saveTemplate);

    var elm = document.getElementById('filters-code');

    editor = CodeMirror.fromTextArea(elm, {
        value: "{ return true; }",
        mode : "javascript",
        lineNumbers: true,
        tabSize: 4,
        indentUnit: 4
    });
    editor.setOption("theme", "default");
    editor.refresh();

    var debug = "JOHN";
});

