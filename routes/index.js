var express = require('express');
var router = express.Router();
let userModel = require("./users");
let passport = require('passport');
let postModel = require("./post");
let localstrategy = require("passport-local");
const upload = require('./multer');
/* GET home page. */
passport.use(new localstrategy(userModel.authenticate()));
router.get('/', function(req, res, next) {
  let error = req.flash("error");
  if(error){
  return res.render('index',{error,nav:false});
  }
  res.render('index',{nav:false,error:null});
});
router.get("/register", (req, res) => {
  const error = req.flash("error");
  res.render("register", {
    error: error.length > 0 ? error[0] : null,
    nav: false,
  });
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, contact, password } = req.body;

    // Field validations
    if (!username || !email || !contact || !password) {
      req.flash("error", "All fields are required.");
      return res.redirect("/register");
    }

    if (password.length < 8) {
      req.flash("error", "Password must be at least 8 characters.");
      return res.redirect("/register");
    }

    // Check if user already exists
    const alreadyExist = await userModel.findOne({ username });
    const emailEx = await userModel.findOne({ email });

    if (alreadyExist) {
      req.flash("error", "User already registered with this Username.");
      return res.redirect("/register");
    }

    if (emailEx) {
      req.flash("error", "User already registered with this Email.");
      return res.redirect("/register");
    }

    const userdata = new userModel({ username, email, contact });

    const registeredUser = await userModel.register(userdata, password);

    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });

  } catch (err) {
    console.error("Registration error:", err);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/register");
  }
});

//
//router.post("/register", async (req, res, next) => {
//  try {
//    const { username, email, contact, password } = req.body;
//
//    // Validate fields
//    if (!username || !email || !contact || !password) {
//      req.flash("error", "All fields are required.");
//      return res.redirect("/register",{nav:false});  
//    }
//
//    if (password.length < 6) {
//      req.flash("error", "Password Must be 6 Characters.");
//      return res.redirect("/register",{nav:false,});  
//    }
//
//    // Check if user already exists
//    const alreadyExist = await userModel.findOne({ username});
//    const emailEx = await userModel.findOne({email});
//    if (alreadyExist) {
//      req.flash("error","User already registered with this Username.")
//      return res.render("register", {
//        nav: false
//      });
//    }
//    if (emailEx) {
//      req.flash("error","User already registered with this Email.")
//      return res.render("register", {
//        nav: false
//      });
//    }
//
//    const userdata = new userModel({ username, email, contact });
//
//    // Register the user
//    const registeredUser = await userModel.register(userdata, password);
//
//    // Auto login
//    passport.authenticate("local")(req, res, function () {
//      res.redirect("/profile");
//    });
//
//  } catch (err) {
//    console.error("Registration error:", err);
//    return res.render("register", {
//      error: "Something went wrong. Please try again.",
//      nav: false
//    });
//  }
//});


router.get("/profile",isLoggedIn, async (req,res)=>{
  const user = await  userModel.findOne({username:req.session.passport.user})
      .populate("posts");
  res.render("profile",{user,nav:true});
})
router.get("/user/posts",isLoggedIn, async (req,res)=>{
   const user = await userModel.findOne({username:req.session.passport.user})
  .populate("posts");
  res.render("posts",{user,nav:true}); 
})
router.get("/feed",isLoggedIn,async (req,res)=>{
 // const post = await userModel.findOne({username:req.session.passport.user})
 // .populate("user");
  const posts = await postModel.find().populate("user");
  //console.log(posts.user.username);
  const admin = "imran";
  const user = await userModel.findOne({username:req.session.passport.user})
  //console.log(posts)
  if(user.username === admin){
 return res.render("feed",{posts,nav:true,isAdmin:true});
  }
  res.render("feed",{posts,nav:true,isAdmin:false});
})
router.get("/delete/:postId",isLoggedIn,async (req,res)=>{
  let post = await postModel.findOneAndDelete({_id:req.params.postId});
   console.log(post);
   res.redirect("/feed");

})
router.get("/edit",isLoggedIn,async (req,res)=>{
  res.render("edit",{nav:true});
})
router.post("/edit",isLoggedIn,async (req,res)=>{
  const {newname,newpassword} = req.body;
try{
  const user = await userModel.findOneAndUpdate({username:req.session.passport.user});
//console.log(user);
if(!user){
 return res.status(404).json({
    message:"Error User not found",
  })
}

if(newname){
  user.username = newname;
//  user.password = newpassword
}
if (newpassword) {
  user.password = newpassword; // Automatically hashed by passport-local-mongoose or similar plugin
}
await user.save();
 // Optionally, update the session if the username was changed
 if (newname && newpassword) {
  req.session.passport.user = newname; // Update session to reflect new username
}
  res.redirect("/profile");
} catch(err){
  console.log(err.message);
}
})
router.post("/login",passport.authenticate("local",{
  failureRedirect:"/",
  failureFlash: true, // 🔥 this enables flash message
  successRedirect:"/profile",
}),function(req,res){})

// router.post("/login", (req, res, next) => {
//  passport.authenticate("local", function(err, user, info) {
//    if (err) return next(err);
//    if (!user) {
//      // Custom render with error message
//      return res.render("login", { error: "Invalid username or password." });
//    }
//    req.logIn(user, function(err) {
//      if (err) return next(err);
//      return res.redirect("/profile");
//    });
//  })(req, res, next);
//});

router.get('/logout',(req,res,next)=>{
  req.logOut(function(err){
 if(err){ return next(err)}
 res.redirect("/");
  })
})
router.post("/fileupload",isLoggedIn,upload.single("image"),async (req,res)=>{
 const user = await  userModel.findOne({username:req.session.passport.user})
 user.profileImage = req.file.filename;
  //let file = req.file;
  await user.save();
  res.redirect("/profile")  
})
router.get("/add",isLoggedIn,(req,res)=>{
  res.render('add',{nav:true});
})

router.post("/createpost",upload.single("postimage"),isLoggedIn,async (req,res)=>{
//  let {title,desc,image} = req.body;
  const user = await  userModel.findOne({username:req.session.passport.user})
  const post = await postModel.create({
    user:user._id,
    title:req.body.title,
    desc:req.body.desc,
    image:req.file.filename,
  })
user.posts.push(post._id);
await user.save();
//user.profileImage = req.file.filename;
  res.redirect("/profile")
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}
module.exports = router;
