const express = require("express");
const get_route = express();

const user_controller = require("../controllers/userController");
const product_controller = require("../controllers/productController");


get_route.set('view engine', 'ejs');
get_route.set('views', "./views/users");
//get_route.set('views', __dirname + '/views/users');

const bodyParser = require("body-parser");
get_route.use(bodyParser.json());
get_route.use(bodyParser.urlencoded({ extended: true }));
const auth = require("../middleware/auth");

const multer = require("multer");
const path = require("path");


get_route.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'), function (err, success) {

            if (err) {
                throw err
            }

        });
    },

    filename: function (req, file, cb) {

        const name = Date.now() + '-' + file.originalname;
        cb(null, name, function (error, success) {

            if (error) {
                throw error
            }

        });

    }
});

const upload = multer({ storage: storage });

get_route.get('/getAllData', product_controller.getdetail);
get_route.get('/getData/:id', product_controller.getdetailbyid);
get_route.post('/register', user_controller.register_user);
get_route.post('/login', user_controller.user_login);
get_route.post('/insertData', upload.single('images'), product_controller.insertproduct);
get_route.post('/updateData', upload.single('images'), product_controller.updateproduct);
get_route.post('/deleteData/:id', product_controller.deleteproduct);
get_route.get('/getImages/:image', product_controller.getimage);
get_route.get('/getUser', user_controller.getuser);
get_route.post('/change-password/:token', auth, user_controller.resetpassword);
get_route.post('/logout/:token', auth, user_controller.logoutAllDevice);
get_route.post('/logoutOne/:token', auth, user_controller.logout);
get_route.post('/forgot-password', user_controller.forget_password);
//get_route.get('/get-imagebyid/:id', auth, user_controller.getimagebyid);

//review_routes.post('/updatereview', ratecontroller.updatereviewp);

get_route.get('/resetpassword', user_controller.emailforgot);
//get_route.post('/resetpassword', user_controller.e);
get_route.post('/resetpassword', user_controller.forgetuser);


module.exports = get_route;

// const auth= require("../middleware/auth");
// product_route.post('/add-product', upload.array('images', 8), auth, product_controller.addproduct);
//get_route.get('/get-data', user_controller.product);