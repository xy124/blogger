"use strict"

var fs = require('fs'),
    path = require('path'),
    gui = require('nw.gui');

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
                var newRow = '<tr><td><input type="checkbox" '+(it.checked ? 'checked' : '')+' /></td><td><img src="'+it.name+'" class="thumbnail" alt="'+it.filename+'" /></td><td><textarea>'+it.description+'</textarea></td></tr>';
                $('#thumbnail-table tbody').append(newRow);
        });
}

function makeEntry(filename, text, checked) {
        return {"name": 'file://' + filename, "filename": filename,  "description": text || '', "checked": checked !== false};
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
    var argv = gui.App.argv;
    if (argv.indexOf('--debug') != -1) {
        gui.Window.get().showDevTools();
    }
    if (argv.indexOf('--export-only') != -1) {
        var found = '';
        exporters.some((elm) => {
            if (argv.indexOf(elm.name) != -1) {
                found = elm;
                return true;
            } else {
                return false;
            }
        });

        if (found) {
            found.doExport();
        } else {
            console.error('Found no valid Exporter!');
        }

        gui.App.quit();


    } else {

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

        //generateThumbnails("/home/xy124/Pictures/2016/trondheim");
        generateThumbnails(process.env.PWD);
    }
});


function generateList() {
        var list = [];
        $('#thumbnail-table tbody tr').each((it, obj) => {
                list.push(makeEntry(
                                        decodeURI($(obj).find('img')[0].alt),
                                        $($(obj).find('textarea')[0]).val(),
                                        $(obj).find('input')[0].checked
                                   ));
        });
        return list;
}


function makeFileErrorHandler(filename) {
  return (err) =>
  {
    if (!err) {
      console.log('successfully saved to ' + filename);
    } else {
      var msg = 'oh no! could not save to ' + filename;
      alert(msg);
      throw err;
    }
  };
}

function exportJSON() {
  var list = generateList();
  fs.writeFile(indexFileName, JSON.stringify(list), makeFileErrorHandler(indexFileName));
}


var Hogan = require('hogan.js'),
    reveal_template = Hogan.compile(fs.readFileSync('./revealjs.tpl.html', {encoding: 'utf8'})),
    simple_html_template = Hogan.compile(fs.readFileSync('./simple_html.tpl.html', {encoding: 'utf8'})),
    lightview_template = Hogan.compile(fs.readFileSync('./lightview.tpl.html', {encoding: 'utf8'}));


function getCheckedPictures() {
  var list = generateList().filter((elem) => {
    return elem.checked;
  });
  return list;
}

function isRelativePaths() {
    return document.getElementById('relativePathsCheckBox').checked;
}

function doExport(what) {
    exporters.some((elm) => {
        if (elm.name == what) {
            elm.doExport();
            return true;
        } else {
            return false;
        }
    });
}

var exporters = [
{
    name: 'revealJs',
    doExport: () => {
        var p = path.join(require.resolve('reveal.js'), '../..');

        exportHTML(reveal_template, './pictures.html', p);
    }
},
{
    name: 'simpleHTML',
    doExport: () => {
        var filename = './pictures_simple.html';
        exportHTML(simple_html_template, filename, process.env.PWD);
    }
},
{
    name: 'lightview',
    doExport: () => {
        var filename = './lightview.html';
        exportHTML(lightview_template, filename, process.env.PWD);
    }
}
];

function exportHTML(template, filename, p) {
    var pictures = getCheckedPictures();
    if (isRelativePaths()) {
        console.log('Using relative paths');
        pictures = pictures.map(function(elem) {
            return {
                description: elem.description,
                name: path.relative(p, elem.filename)
            };
        });
    } else {
        pictures = pictures.map(function(elem) {
            return {
                description: elem.description,
                name: elem.name
            };
        });
    }


    var output = template.render({pictures: pictures});

    fs.writeFile(path.join(p, filename), output, {encoding: 'ascii'}, makeFileErrorHandler(filename));
}
