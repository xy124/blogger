"use strict"

var fs = require('fs'),
    path = require('path');

var INDEX_FILE = 'pictures.json';
var indexFileName = '';


/* blueprint:
   files = [
   {
   "name",
   "number",
   "description"
   }
   ]
// Problem: i cannot test as netbook is too slow?!
// TODO: make saveable, loadable!
// TODO: create viewer for that format, that e.g. exports to markdown presentation or whatever and then to html or directly to html...
*/

function chooseFile(name) {
        var chooser = $(name);
        chooser.unbind('change');
        chooser.change(function(evt) {
                var folder = $(this).val();
                console.log(folder);
                generateThumbnails(folder);
        });

        chooser.trigger('click');
}

function fillTable(list) {
        list.forEach((it) => {
                var newRow = '<tr><td><input type="checkbox" checked="'+it.checked+'" /></td><td><img src="file://'+it.name+'" class="thumbnail" alt="'+it.name+'" /></td><td><textarea>'+it.description+'</textarea></td></tr>';
                $('#thumbnail-table tbody').append(newRow);
        });
}

function makeEntry(filename, text, checked) {
        return {"name": filename, "description": text || '', "checked": checked !== false};
}


function generateThumbnails(p) {
        try {
                indexFileName = path.join(p, INDEX_FILE);
                var list = fs.readFileSync(indexFileName, {encoding: 'utf8'});
                fillTable(JSON.parse(list));
        } catch (err) {
                console.log('could not read pictures.json ... so loading all jpgs!');


                fs.readdir(p, (err, files) => {
                        var list = files.filter((filename) => { return filename.match(/.*\.jpg/i); })
                                .map((filename) => {
                                        return makeEntry(path.join(p, filename));
                                });

                        fillTable(list);
                });
        }



}

$(() => {
        require('nw.gui').Window.get().showDevTools();
        $("tbody").sortable({
                items: "> tr",
                appendTo: "parent",
                helper: "clone"
        }).disableSelection();

        $("#tabs ul li a").droppable({
                hoverClass: "drophover",
                tolerance: "pointer",
                drop: function(e, ui) {
                        var tabdiv = $(this).attr("href");
                        console.log("asdf");
                        $(tabdiv + " table tr:last").after("<tr>" + ui.draggable.html() + "</tr>");
                        ui.draggable.remove();
                }
        });
        console.log('here');

        generateThumbnails("/home/xy124/Pictures/2014");
});

function generateJSON() {
        console.log("table: ");
        var list = [];
        $('#thumbnail-table tbody tr').each((it, obj) => {
                list.push(makeEntry(
                                        $(obj).find('img')[0].src,
                                        $($(obj).find('textarea')[0]).val(),
                                        $(obj).find('input')[0].checked
                                   ));
        });




        console.log(list);

        fs.writeFile(indexFileName, JSON.stringify(list), (err) =>
                        {
                                if (!err) {
                                        console.log('successfully saved to ' + indexFileName);
                                } else {
                                        var msg ="oh no could not save to "+ indexFileName;
                                        alert(msg);
                                        throw err;
                                }
                        });


}
