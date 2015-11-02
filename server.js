const port          = process.env.PORT || 9999;
const express       = require('express');
const http          = require('http');
const colors        = require('colors');
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const session       = require('express-session');
const dotenv        = require('dotenv');
const app           = express();
const server        = http.createServer(app);

dotenv.load()
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'zip zap foo'));
app.use(session({'cookie':{'maxAge':604800000}, 'secret': process.env.COOKIE_SECRET || 'zip zap foo'}));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('views', __dirname + '/views');


server.listen(port);

console.log('Started server on port:'.green, port);
