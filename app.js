const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    const directoryPath = path.join(__dirname, 'files');
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) return res.status(500).send("No Hisaab Yet", err);

        // Filter out non-file items if needed (optional)
        // files = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile());

        res.render("index", { files });
    });
});

app.post("/create", (req, res, next) => {
    try {
        const data = req.body.data || "Default Content";
        const today = new Date();
    
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
        const year = today.getFullYear();
        
        const formattedDate = `${day}-${month}-${year}`;

        fs.writeFile(`./files/${formattedDate}.txt`, data, (err) => {
            if (err) {
                console.error("Error while writing file:", err);
                res.status(500).send("Error while writing file: " + err.message);
            } else {
                console.log("File Created and Data Saved");
                res.send("File Created and Data Saved");
            }
        });
    } catch (error) {
        console.error("Error while creating file:", error);
        next(error)
    }
});

app.get("/read/:filename", (req, res, next) => {
    try {
        const filename = req.params.filename;
        console.log(filename);
        
        fs.readFile(`./files/${filename}`, "utf-8", (err, data) => {
            if (err) {
                console.error("Error while reading file:", err);
                res.status(404).send("File Not Found");
            } else {
                res.render("show", {filename, data});
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.get("/edit/:filename", (req, res, next) => {
    try {
        const filename = req.params.filename;
        fs.readFile(`./files/${filename}`, "utf-8" , (err, data) => {
            if (err) {
                console.error("Error while reading file:", err);
                res.status(404).send("File Not Found");
            } else {
                res.render("edit", {data, filename});
            }
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.post("/update/:filename", (req, res, next) => {
    try {
        const filename = req.params.filename;
        const data = req.body.data;
        fs.writeFile(`./files/${filename}`, data, (err) => {
            if (err) {
                console.error("Error while updating file:", err);
                res.status(500).send("Error while updating file: " + err.message);
            } else {
                console.log("File Updated");
                res.redirect("/");
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.get("/delete/:filename", (req, res, next) => {
    try {
        const filename = req.params.filename;
        fs.unlink(`./files/${filename}`, (err) => {
            if (err) {
                console.error("Error while deleting file:", err);
                res.status(500).send("Error while deleting file: " + err.message);
            } else {
                console.log("File Deleted");
                res.redirect("/");
            };
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

app.listen(3000);