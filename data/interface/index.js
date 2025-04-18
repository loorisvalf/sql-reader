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
      const total = Math.round(((performance.now() - config.time.start) / 1000) * 100) / 100 || "0.00";
    	if (e) {
        config.sql.info.textContent = e + (r ? ": " + total + " sec" : '');
      }
    }
  },
  "loader": {
    "start": function () {
      const loader = document.getElementById("loader");
      const img = loader.querySelector("img");
      img.style.display = "initial";
    },
    "stop": function () {
      const loader = document.getElementById("loader");
      const img = loader.querySelector("img");
      img.style.display = "none";
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
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
      const context = document.documentElement.getAttribute("context");
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
          let tmp = {};
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
  "create": {
    "table": function () {
      const _add = function (a, b, c) {
        if (a) {
          var parent = document.createElement(c);
          for (let i = 0; i < a.length; i++) {
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
        const table  = document.createElement("table");
        table.appendChild(_add(columns, "th", "thead"));
        for (let i = 0; i < values.length; i++) {
          table.appendChild(_add(values[i], "td", "tr"));
        }
        /*  */
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
    "exec": function () {
      config.app.execute(config.sql.beautifier.getValue() + ';');
    },
    "size": function (s) {
      if (s) {
        if (s >= Math.pow(2, 30)) {return (s / Math.pow(2, 30)).toFixed(1) + "GB"};
        if (s >= Math.pow(2, 20)) {return (s / Math.pow(2, 20)).toFixed(1) + "MB"};
        if (s >= Math.pow(2, 10)) {return (s / Math.pow(2, 10)).toFixed(1) + "KB"};
        /*  */
        return s + "B";
      } else {
        return '';
      }
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
  CREATE TABLE colleagues(id integer, Name text, Title text, manager integer, Hired date, Salary integer, commission float, dept integer);
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

  SELECT Name, Hired FROM colleagues ORDER BY Hired ASC;
  SELECT Title, COUNT(*) AS Count, (AVG(Salary)) AS Salary FROM colleagues GROUP BY Title ORDER BY Salary DESC;`
    }
  },
  "load": function () {
    const print = document.getElementById("print");
    const clear = document.getElementById("clear");
    const theme = document.getElementById("theme");
    const reload = document.getElementById("reload");
    const sample = document.getElementById("sample");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    support.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage();
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage() + "?reason=support";
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    theme.addEventListener("click", function () {
      const attribute = document.documentElement.getAttribute("theme");
      /*  */
      config.app.theme = attribute === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("theme", config.app.theme);
      config.sql.beautifier.setOption("theme", config.app.theme === "dark" ? "material-darker" : "default");
      config.storage.write("theme", config.app.theme);
    }, false);
    /*  */
    print.addEventListener("click", function () {window.print()});
    clear.addEventListener("click", function () {config.app.clear()});
    reload.addEventListener("click", function () {document.location.reload()});
    sample.addEventListener("click", function () {config.sql.beautifier.setValue(config.sql.sample.code)});
    /*  */
    document.addEventListener("scroll", function () {
      if (window.scrollY) {
        document.documentElement.setAttribute("scroll", '');
      } else {
        document.documentElement.removeAttribute("scroll");
      }
    });
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  },
  "app": {
    "theme": "light",
    "error": function (e) {
      config.time.toc(e.message, false);
    },
    "savedb": function () {
    	config.time.tic();
    	config.app.worker.instance.postMessage({"id": "export", "action": "export"});
    },
    "clear": function () {
      config.time.tic();
      config.sql.info.textContent = '';
      config.sql.output.textContent = '';
      document.documentElement.removeAttribute("result", '');
      /*  */
      config.time.toc('', false);
    },
    "execute": function (cmd) {
      config.time.tic();
      document.documentElement.removeAttribute("result", '');
      config.sql.output.textContent = "Loading, please wait...";
      /*  */
      window.setTimeout(function () {
        config.app.worker.instance.postMessage({"id": "exec", "action": "exec", "sql": cmd});
      }, 300);
    },
    "start": function () {
      config.app.worker.listener.register();
      config.app.worker.instance.onerror = config.app.error;
      config.app.theme = config.storage.read("theme") !== undefined ? config.storage.read("theme") : "light";
      /*  */
      config.sql.run.addEventListener("click", config.sql.exec, true);
      config.sql.save.addEventListener("click", config.app.savedb, true);
      config.sql.dbfile.addEventListener("change", function (e) {
        const reader = new FileReader();
        reader.onload = function (e) {
          config.time.tic();
          config.sql.info.textContent = "Loading database, please wait...";
          const buffer = e.target.result;
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
        const fileinfo = document.getElementById("fileinfo");
        fileinfo.textContent = config.sql.file.name + ' - ' + config.sql.size(config.sql.file.size);
        if (config.sql.file) {
          reader.readAsArrayBuffer(config.sql.file);
        }
      });
      /*  */
      config.time.tic();
      config.app.worker.instance.postMessage({"id": "load", "action": "open"});
      config.sql.beautifier.setOption("theme", config.app.theme === "dark" ? "material-darker" : "default");
      document.documentElement.setAttribute("theme", config.app.theme !== undefined ? config.app.theme : "light");
    },
    "worker": {
      "instance": new Worker("vendor/sql/wasm/worker.sql-wasm.js"),
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
            } else if (e.data.id === "exec") {
              config.time.tic();
              config.sql.output.textContent = '';
              /*  */
              const results = e.data.results;
              const details = [...document.querySelectorAll("details")];
              if (results && results.length) {
                config.sql.info.textContent = "Rendering results, please wait...";
                for (let i = 0; i < results.length; i++) {
                  config.sql.output.appendChild(config.create.table(results[i].columns, results[i].values));
                }
                /*  */
                details[0].open = false;
                config.sql.info.textContent = '';
                config.time.toc("Result is ready, total", true);
                document.documentElement.setAttribute("result", '');
              } else {
                config.sql.info.textContent = "No result to show!";
                config.time.toc("Please try a different database.", false);
              }
            } else if (e.data.id === "export") {
              config.time.tic();
              config.sql.info.textContent = "Exporting database, please wait...";
              /*  */
              const arraybuffer = e.data.buffer;
              if (arraybuffer && arraybuffer.byteLength) {              
                const a = document.createElement('a');
                const blob = new Blob([arraybuffer], {"type": "octet/stream"});
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
