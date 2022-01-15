var config = {
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "time": {
    "start": null,
    "tic": function () {
      config.loader.start();
      config.time.start = performance.now();
    },
    "toc": function (e, r) {
      config.loader.stop();
      var total = Math.round(((performance.now() - config.time.start) / 1000) * 100) / 100 || "0.00";
    	if (e) config.sql.info.textContent = config.sql.info.textContent + ' ' + e + (r ? ": " + total + "sec" : '');
    }
  },
  "loader": {
    "start": function () {
      var loader = document.getElementById("loader");
      var img = loader.querySelector("img");
      img.style.display = "initial";
    },
    "stop": function () {
      var loader = document.getElementById("loader");
      var img = loader.querySelector("img");
      img.style.display = "none";
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          var current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      var context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?tab") config.port.name = "tab";
            if (document.location.search === "?win") config.port.name = "win";
            /*  */
            chrome.runtime.connect({
              "name": config.port.name
            });
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          var tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "load": function () {
    var print = document.getElementById("print");
    var clear = document.getElementById("clear");
    var reload = document.getElementById("reload");
    var sample = document.getElementById("sample");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    /*  */
    support.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        var url = config.addon.homepage();
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        var url = config.addon.homepage() + "?reason=support";
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    print.addEventListener("click", function () {window.print()});
    clear.addEventListener("click", function () {config.app.clear()});
    reload.addEventListener("click", function () {document.location.reload()});
    sample.addEventListener("click", function () {config.sql.beautifier.setValue(config.sql.sample.code)});
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "create": {
    "table": function () {
      var add = function (a, b, c) {
        if (a) {
          var parent = document.createElement(c);
          for (var i = 0; i < a.length; i++) {
            var tmp = document.createElement(b);
            tmp.textContent = a[i];
            parent.appendChild(tmp);
          }
          return parent;
        }
        /*  */
        var parent = document.createElement(c);
        var tmp = document.createElement(b);
        tmp.textContent = "null";
        parent.appendChild(tmp);
        return parent;
      };
      /*  */
      return function (columns, values) {
        var table  = document.createElement("table");
        table.appendChild(add(columns, "th", "thead"));
        for (var i = 0; i < values.length; i++) table.appendChild(add(values[i], "td", "tr"));
        return table;
      }
    }()
  },
  "sql": {
    "file": null,
    "info": document.getElementById("info"),
    "save": document.getElementById("save"),
    "run": document.getElementById("execute"),
    "dbfile": document.getElementById("dbfile"),
    "output": document.getElementById("output"),
    "exec": function () {config.app.execute(config.sql.beautifier.getValue() + ';')},
    "size": function (s) {
      if (s) {
        if (s >= Math.pow(2, 30)) {return (s / Math.pow(2, 30)).toFixed(1) + "GB"};
        if (s >= Math.pow(2, 20)) {return (s / Math.pow(2, 20)).toFixed(1) + "MB"};
        if (s >= Math.pow(2, 10)) {return (s / Math.pow(2, 10)).toFixed(1) + "KB"};
        return s + "B";
      } else return '';
    },
    "beautifier": CodeMirror.fromTextArea(document.getElementById("commands"), {
      "autofocus": true,
      "smartIndent": true,
      "lineNumbers": true,
      "matchBrackets": true,
      "indentWithTabs": true,
      "mode": "text/x-mysql",
      "viewportMargin": Infinity
    }),
    "sample": {
      "code": `DROP TABLE IF EXISTS colleagues;
  CREATE TABLE colleagues(id integer, name text, title text, manager integer, hired date, salary integer, commission float, dept integer);
    INSERT INTO colleagues VALUES (1,'JOHNSON','ADMIN',6,'2011-12-17',18000,NULL,4);
    INSERT INTO colleagues VALUES (2,'HARDING','MANAGER',9,'2011-02-02',52000,300,3);
    INSERT INTO colleagues VALUES (3,'TAFT','SALES I',2,'2015-01-02',25000,500,3);
    INSERT INTO colleagues VALUES (4,'HOOVER','SALES II',2,'2011-04-02',27000,NULL,3);
    INSERT INTO colleagues VALUES (5,'LINCOLN','TECH',6,'2012-06-23',22500,1400,4);
    INSERT INTO colleagues VALUES (6,'GARFIELD','MANAGER',9,'2013-05-01',54000,NULL,4);
    INSERT INTO colleagues VALUES (7,'POLK','TECH',6,'2014-09-22',25000,NULL,4);
    INSERT INTO colleagues VALUES (8,'GRANT','ENGINEER',10,'2014-03-30',32000,NULL,2);
    INSERT INTO colleagues VALUES (9,'JACKSON','CEO',NULL,'2011-01-01',75000,NULL,4);
    INSERT INTO colleagues VALUES (10,'FILLMORE','MANAGER',9,'2012-08-09',56000,NULL,2);
    INSERT INTO colleagues VALUES (11,'ADAMS','ENGINEER',10,'2015-03-15',34000,NULL,2);
    INSERT INTO colleagues VALUES (12,'WASHINGTON','ADMIN',6,'2011-04-16',18000,NULL,4);
    INSERT INTO colleagues VALUES (13,'MONROE','ENGINEER',10,'2017-12-03',30000,NULL,2);
    INSERT INTO colleagues VALUES (14,'ROOSEVELT','CPA',9,'2016-10-12',35000,NULL,1);

  SELECT name, hired FROM colleagues ORDER BY hired ASC;
  SELECT title, COUNT(*) AS count, (AVG(salary)) AS salary FROM colleagues GROUP BY title ORDER BY salary DESC;`
    }
  },
  "app": {
    "error": function (e) {config.time.toc(e.message, false)},
    "savedb": function () {
    	config.time.tic();
    	config.app.worker.instance.postMessage({"id": "export", "action": "export"});
    },
    "execute": function (cmd) {
      config.time.tic();
      config.sql.output.textContent = "Loading, please wait...";
      config.app.worker.instance.postMessage({"id": "exec", "action": "exec", "sql": cmd});
    },
    "clear": function () {
      config.time.tic();
      config.sql.info.textContent = '';
      config.sql.output.textContent = '';
      config.time.toc('', false);
    },
    "start": function () {
      config.app.worker.listener.register();
      config.app.worker.instance.onerror = config.app.error;
      /*  */
      config.sql.run.addEventListener("click", config.sql.exec, true);
      config.sql.save.addEventListener("click", config.app.savedb, true);
      config.sql.dbfile.addEventListener("change", function (e) {
        var reader = new FileReader();
        reader.onload = function (e) {
          config.time.tic();
          config.sql.info.textContent = "Loading database, please wait...";
          var buffer = e.target.result;
          if (buffer && buffer.byteLength) {
            config.sql.info.textContent = "The database is loaded successfully!";
            try {
              config.app.worker.instance.postMessage({"id": "open", "action": "open", "buffer": buffer}, [buffer]);
            } catch (e) {
              config.app.worker.instance.postMessage({"id": "open", "action": "open", "buffer": buffer});
            }
          } else {
            config.time.toc("Could not load the database!", false);
          }
        }
        /*  */
        config.sql.file = e.target.files[0];
        var fileinfo = document.getElementById("fileinfo");
        fileinfo.textContent = config.sql.file.name + ' - ' + config.sql.size(config.sql.file.size);
        if (config.sql.file) {
          reader.readAsArrayBuffer(config.sql.file);
        }
      });
      /*  */
      config.time.tic();
      config.app.worker.instance.postMessage({"id": "load", "action": "open"});
    },
    "worker": {
      "instance": new Worker("vendor/sql/worker.sql-asm.js"),
      "listener": {
        "register": function () {
          config.app.worker.instance.onmessage = function (e) {
            if (e.data.id === "load") {
              config.time.toc("SQLite Reader is ready! Please click on the top input area to import a file (SQLite database).", false);
              config.sql.beautifier.setValue('');
            } else if (e.data.id === "open") {
              config.time.toc("Please press on the - Execute - button above to execute the database and generate results.", false);
              config.sql.beautifier.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
            } if ("error" in e.data) {
              config.time.toc("An unexpected error occurred", false);
              config.sql.output.textContent = e.data.error || "N/A";
              config.sql.beautifier.setValue('');
            } else if (e.data.id === "exec") {
              config.time.tic();
              config.sql.output.textContent = '';
              /*  */
              var results = e.data.results;
              if (results && results.length) {
                config.sql.info.textContent = "Rendering results, please wait...";
                for (var i = 0; i < results.length; i++) {
                  config.sql.output.appendChild(config.create.table(results[i].columns, results[i].values));
                }
                /*  */
                config.sql.info.textContent = '';
                config.time.toc("Result is ready, total", true);
              } else {
                config.sql.info.textContent = "No result to show!";
                config.time.toc("Please try a different database.", false);
              }
            } else if (e.data.id === "export") {
              config.time.tic();
              config.sql.info.textContent = "Exporting database, please wait...";
              /*  */
              var arraybuffer = e.data.buffer;
              if (arraybuffer && arraybuffer.byteLength) {              
                var a = document.createElement('a');
                var blob = new Blob([arraybuffer], {"type": "octet/stream"});
                /*  */
                a.download = "db.sqlite";
                a.href = window.URL.createObjectURL(blob);
                document.body.appendChild(a);
                a.onclick = function () {
                  window.setTimeout(function () {
                    window.URL.revokeObjectURL(a.href);
                    a.remove();
                  }, 1500);
                };
                /*  */
                a.click();
                config.time.toc("Database is saved to disk", true);
              } else {
                config.sql.info.textContent = '';
                config.time.toc("Could not write the database to disk!", false);
              }
            }
          }
        }
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("resize", config.resize.method, false);
