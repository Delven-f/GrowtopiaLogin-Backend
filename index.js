const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');

// Middleware untuk kompresi
app.use(
  compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
);

// Setting view engine menjadi ejs
app.set('view engine', 'ejs');
app.set('trust proxy', 1);

// Middleware untuk CORS dan logging
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  console.log(
    `[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`,
  );
  next();
});

// Middleware untuk parsing body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }),
);

// Endpoint untuk dashboard login
app.all('/player/login/dashboard', function (req, res) {
  const tData = {};
  try {
    const uData = JSON.stringify(req.body).split('"')[1].split('\\n');
    const uName = uData[0].split('|');
    const uPass = uData[1].split('|');
    for (let i = 0; i < uData.length - 1; i++) {
      const d = uData[i].split('|');
      tData[d[0]] = d[1];
    }
    if (uName[1] && uPass[1]) {
      res.redirect('/player/growid/login/validate');
    }
  } catch (why) {
    console.log(`Warning: ${why}`);
  }

  res.render(__dirname + '/public/html/dashboard.ejs', { data: tData });
});

// Endpoint untuk validasi login GrowID
app.all('/player/growid/login/validate', (req, res) => {
  const _token = req.body._token;
  const growId = req.body.growId;
  const password = req.body.password;

  // Validasi GrowID dan Password
  if (!growId || !password) {
    return res.status(400).send({
      status: "error",
      message: "GrowID atau password tidak boleh kosong.",
    });
  }

  // Simulasi validasi GrowID di database (contoh hardcoded)
  const validGrowId = "Player123"; // Ganti dengan GrowID yang valid
  const validPassword = "password123"; // Ganti dengan password yang valid

  if (growId === validGrowId && password === validPassword) {
    // Jika valid, buat token
    const token = Buffer.from(
      `_token=${_token}&growId=${growId}&password=${password}`,
    ).toString('base64');

  res.send(
        {"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia"},
    );
});
res.send('/growid/checktoken', (req, res) => {
    res.send({"status":"success","message":"Account Validated.","token":"${req.body.refreshToken}","url":"","accountType":"growtopia"},);
});
  } else {
    // Jika tidak valid
    return res.status(401).send({
      status: "error",
      message: "GrowID atau password salah. Silakan coba lagi.",
    });
  }
});

// Redirect untuk semua endpoint /player/*
app.all('/player/*', function (req, res) {
  res
    .status(301)
    .redirect('https://api.yoruakio.tech/player/' + req.path.slice(8));
});

// Endpoint default
app.get('/', function (req, res) {
  res.send('Hello World!');
});

// Server listen di port 5000
app.listen(5000, function () {
  console.log('Listening on port 5000');
});
