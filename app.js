//-----------------------------------------------------------
// REQUIREMENTS
//-----------------------------------------------------------
var bodyParser      = require("body-parser");
var methodOverride      = require("method-override");
var expressSanitizer    = require("express-sanitizer");
var mongoose            = require("mongoose");
var express             = require("express");
var app                 = express();
var passport                = require("passport");
var User                    = require("./models/user");
var LocalStrategy           = require ("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");
const port          = 3000;

//-----------------------------------------------------------
// Connecting to Addressbook Database
//-----------------------------------------------------------
mongoose.connect(process.env.DATABASEURL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    }).then(() => { console.log('Database is connected') }, err => { console.log('Can not connect to the database' + err) });

//-----------------------------------------------------------
// APP CONFIG
//-----------------------------------------------------------
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//-----------------------------------------------------------
//  MONGOOSE/MODEL CONFIG
//-----------------------------------------------------------
var adresSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    street: String,
    place: String,
    email: String,
    website: String,
    created:  {type: Date, default: Date.now}

});
var Adres = mongoose.model("Adres", adresSchema);


//-----------------------------------------------------------
// Set Passport
//-----------------------------------------------------------

app.use(require("express-session")({
    secret: "My name is Jelle",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());












//==========================================================================
// Auth Routes
//==========================================================================
app.get("/register",isLoggedIn, function(req, res){
    res.render("register");
});

//
app.post("/register", function(req, res){
    req.body.username
    req.body.password
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/geregistreerd");
        });
    });
});

//==========================================================================
//Login route
//==========================================================================
app.get("/login", function(req, res){
    res.render("login");
});

app.get("/geentoegang", function(req, res){
    res.render("geentoegang");
});


//==========================================================================
// Login Logic
//==========================================================================
app.post("/login", passport.authenticate("local", { 
    
    successRedirect: "/secret",
    failureRedrect: "/geentoegang",
}) ,function(req, res){
});

//==========================================================================
//LOGOUT
//==========================================================================

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");  
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



















//-----------------------------------------------------------
// RESTFUL ROUTES
//-----------------------------------------------------------
app.get("/", function(req, res){
    res.redirect("/adressen");
});

// INDEX ROUTE -> List ASC
app.get("/adressen", function(req, res){
    Adres.find({}, function(err, adressen){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("landing", {adressen: adressen});
        }
    })
});

// INDEX ROUTE -> List ASC
app.get("/adressen/asc", function(req, res){
    Adres.find({}, function(err, adressen){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {adressen: adressen});
        }
    }).sort({ firstname: 'asc' });
});

// INDEX ROUTE -> List DESC
app.get("/adressen/desc", function(req, res){
    Adres.find({}, function(err, adressen){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index", {adressen: adressen});
        }
    }).sort({ firstname: 'desc' });
});

// NEW ROUTE
app.get("/adressen/new", function(req, res){
    res.render("new");
});

// CREATE ROUTE
app.post("/adressen", function(req, res){
    //create blog
   req.body.adres.body = req.sanitize(req.body.adres.body)
    Adres.create(req.body.adres, function(err, newAdres){
        if(err){
            res.render("new");
        } else {
                //redirect
            res.redirect("/adressen/asc");
        }
    });
});

//SHOW ROUTE
app.get("/adressen/:id", function(req, res){
    Adres.findById(req.params.id, function(err, foundAdres){
        if(err){
            res.redirect("/adressen");
        } else {
            res.render("show", {adres: foundAdres});
        }
    })
});

//EDIT ROUTE
app.get("/adressen/:id/edit", function(req, res){
    Adres.findById(req.params.id, function(err, foundAdres){
        if(err){
            res.redirect("/adressen/asc");
        } else{
            res.render("edit", {adres: foundAdres});
        }
    })
})

//UPDATE ROUTE
app.put("/adressen/:id", function(req, res){
    req.body.adres.body = req.sanitize(req.body.adres.body)
    Adres.findByIdAndUpdate(req.params.id, req.body.adres, function(err, updatedAdres){
        if(err){
            res.redirect("/adressen/asc");
        } else {
                res.redirect("/adressen//asc" + req.params.id);

            }
    });
});

//DELETE ROUTE
app.delete("/adressen/:id", function(req, res){
    Adres.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/adressen/asc");
        } else{
            res.redirect("/adressen/asc");
        }
    })

});

//==========================================================================
//PORT 3000
//==========================================================================
app.listen(process.env.PORT, process.env.IP, function () {
    console.log("The server has started");
  });