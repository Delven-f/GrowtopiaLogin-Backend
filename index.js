const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

// Path untuk growid.json
const growidFilePath = './growid.json';

// Middleware untuk memvalidasi token login
app.post('/validate-token', (req, res) => {
    const { token, growId } = req.body;

    // Validasi input
    if (!token || !growId) {
        return res.status(400).send({
            status: "error",
            message: "Token atau GrowID tidak boleh kosong",
        });
    }

    // Membaca file growid.json
    fs.readFile(growidFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error membaca file growid.json:', err);
            return res.status(500).send({
                status: "error",
                message: "Server gagal membaca data",
            });
        }

        try {
            const growidData = JSON.parse(data);

            // Cari GrowID dalam file JSON
            const user = growidData.find(user => user.growId === growId);

            if (!user) {
                return res.status(404).send({
                    status: "error",
                    message: "GrowID tidak ditemukan",
                });
            }

            // Validasi token
            if (user.token === token) {
                return res.send({
                    status: "success",
                    message: "Token valid",
                });
            } else {
                return res.status(401).send({
                    status: "error",
                    message: "Token tidak valid",
                });
            }
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).send({
                status: "error",
                message: "Server gagal memproses data",
            });
        }
    });
});

// Jalankan server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
