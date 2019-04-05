const db = require('../config').db
const dataFunc = {
    // tarif
    getTarif : (req, res) => {
        if(req.query.id) {
            db.query(`SELECT * FROM tarif WHERE id_tarif = ${req.query.id}`,
            function (error, results, fields) {
                if (error) res.status(500).json(error);;
                res.status(200).json(results[0])
            })
        } else {
            db.query(`SELECT * FROM tarif`,
            function (error, results, fields) {
                if (error) res.status(500).json(error);;
                res.status(200).json(results)
            })
        }
    },
    
    setTarif : (req, res) => {
        var data = {
            daya : req.body.daya,
            tarifperkwh : req.body.tarifperkwh
        }
        db.query(`INSERT INTO tarif SET ?`, data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);;
            res.status(201).json(results)
        })        
    },
    
    delTarif : (req, res) => {
        var id = req.params.id;
        if(!id) return res.status(404).json({msg : "parameter id tidak ditemukan"})
        db.query(`DELETE FROM tarif WHERE id_tarif = '${id}'`,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results)
        })      
    }, 
    
    updTarif : (req, res) => {
        var id = req.params.id;
        if(!id) return res.status(404).json({msg : "parameter id tidak ditemukan"})
        var data = {
            daya : req.body.daya,
            tarifperkwh : req.body.tarifperkwh
        }
        db.query(`UPDATE tarif SET ? WHERE id_tarif = ${id}`, data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);;
            res.status(200).json(results)
        })        
    },
    
    // penggunaan
    getPenggunaan: (req, res) => {
        if (req.query.limit) {
            db.query(`SELECT * FROM penggunaan 
            JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan 
            JOIN tagihan ON tagihan.id_penggunaan = penggunaan.id_penggunaan
            LIMIT ${req.query.limit} OFFSET ${req.query.offset || 0}`, 
            function (error, results, fields) {
                if (error) res.status(500).json(error);
                res.status(200).json(results)
            })    
        } else {
            if (req.query.id) {
                db.query(`SELECT * FROM penggunaan
                JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan
                JOIN tagihan ON penggunaan.id_penggunaan = tagihan.id_penggunaan
                WHERE penggunaan.id_penggunaan = ${req.query.id}`, 
                function (error, results, fields) {
                    if (error) res.status(500).json(error);
                    res.status(200).json(results[0])
                })  
            } else {
                db.query(`SELECT * FROM penggunaan
                JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan
                JOIN tagihan ON penggunaan.id_penggunaan = tagihan.id_penggunaan`, 
                function (error, results, fields) {
                    if (error) res.status(500).json(error);
                    res.status(200).json(results)
                })    
            }
        }
        
    },
    
    setPenggunaan: (req, res) => {
        var data = {
            id_pelanggan : req.body.pelanggan,
            bulan : req.body.bulan,
            tahun : req.body.tahun,
            meter_awal : req.body.meter_awal,
            meter_akhir : req.body.meter_akhir
        }
        db.query('INSERT INTO penggunaan SET ?', data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            db.query(`SELECT * FROM pelanggan 
            JOIN tarif ON tarif.id_tarif = pelanggan.id_tarif 
            WHERE pelanggan.id_pelanggan = ${req.body.pelanggan}`, 
            function (error2, pelanggan, fields2) {
                if (error2) res.status(500).json(error);
                db.query(`INSERT INTO tagihan SET ?`, {
                    id_penggunaan : results.insertId,
                    jumlah_meter : data.meter_akhir - data.meter_awal,
                    total_bayar : (data.meter_akhir - data.meter_awal) * pelanggan[0].tarifperkwh,
                    biaya_admin : ((data.meter_akhir - data.meter_awal) * pelanggan[0].tarifperkwh) * 5 /100,
                    status: 0 // 0 = unpaid, 1 = pending, 2 = paid, 3 = failed
                },
                function (error3, results3, fields3) {
                    if (error3) res.status(500).json(error3);
                    res.status(201).json(results3)
                })
            })
        })
    },
    
    updPenggunaan: (req, res) => {
        var id = req.params.id;
        if(!id) return res.status(404).json({msg : "parameter id tidak ditemukan"})
        var data = {
            id_pelanggan : req.body.pelanggan,
            bulan : req.body.bulan,
            tahun : req.body.tahun,
            meter_awal : req.body.meter_awal,
            meter_akhir : req.body.meter_akhir
        }
        db.query(`UPDATE penggunaan SET ? WHERE id_penggunaan = ${req.params.id}`, data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            db.query(`SELECT * FROM pelanggan 
            JOIN tarif ON tarif.id_tarif = pelanggan.id_tarif 
            WHERE pelanggan.id_pelanggan = ${req.body.pelanggan}`, 
            function (error2, pelanggan, fields2) {
                if (error2) res.status(500).json(error);
                db.query(`UPDATE tagihan SET ? WHERE id_penggunaan = ${req.params.id}`, {
                    id_penggunaan : req.params.id,
                    jumlah_meter : data.meter_akhir - data.meter_awal,
                    total_bayar : ((data.meter_akhir - data.meter_awal) / 1000) * pelanggan[0].tarifperkwh,
                    biaya_admin : (((data.meter_akhir - data.meter_awal) / 1000) * pelanggan[0].tarifperkwh) * 5 /100,
                },
                function (error3, results3, fields3) {
                    if (error3) res.status(500).json(error3);
                    res.status(201).json(results3)
                })
            })
        })
    },
    
    delPenggunaan: (req, res) => {
        var id = req.params.id;
        if(!id) return res.status(404).json({msg : "parameter id tidak ditemukan"})
        db.query(`DELETE FROM penggunaan WHERE id_penggunaan = '${id}'`,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results)
        })      
    }, 
    
    getDetailPenggunaan: (req,res) => {
        db.query(`SELECT * FROM penggunaan
        WHERE penggunaan.id_pelanggan = ${req.params.id}
        ORDER BY penggunaan.id_penggunaan DESC LIMIT 1`, 
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results[0])
        })    
    },
    
    getAllPembayaran: (req, res) => {
        db.query(`SELECT tagihan.id_tagihan, nama, bulan, tahun, total_bayar, biaya_admin, biaya_admin+total_bayar AS total_akhir, tanggal_pembayaran, status 
        FROM tagihan
        LEFT JOIN pembayaran ON pembayaran.id_tagihan = tagihan.id_tagihan
        JOIN penggunaan ON penggunaan.id_penggunaan = tagihan.id_penggunaan
        JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan `,
        function (error, results, fields) {
            if (error) res.status(500).json(error)
            res.status(200).json(results)
        })
    },
    
    getPembayaranByStatus: (req, res) => {
        let status
        if (req.params.type === "unpaid") {
            status = 0            
        } else if (req.params.type === "pending") {
            status = 1
        } else if (req.params.type === "paid") {
            status = 2
        } else if (req.params.type === "failed") {
            status = 3
        } else {
            return res.status(400).json({msg : "status tidak ada"})
        }
        if (!req.query.limit) {   
            db.query(`SELECT tagihan.id_tagihan, nama, bulan, tahun, total_bayar, biaya_admin, biaya_admin+total_bayar AS total_akhir, tanggal_pembayaran, status 
            FROM tagihan
            LEFT JOIN pembayaran ON pembayaran.id_tagihan = tagihan.id_tagihan
            JOIN penggunaan ON penggunaan.id_penggunaan = tagihan.id_penggunaan
            JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan 
            WHERE status = ${status}`,
            function (error, results, fields) {
                if (error) res.status(500).json(error)
                res.status(200).json(results)
            })
        } else {
            db.query(`SELECT tagihan.id_tagihan, nama, bulan, tahun, total_bayar, biaya_admin, biaya_admin+total_bayar AS total_akhir, tanggal_pembayaran, status 
            FROM tagihan
            LEFT JOIN pembayaran ON pembayaran.id_tagihan = tagihan.id_tagihan
            JOIN penggunaan ON penggunaan.id_penggunaan = tagihan.id_penggunaan
            JOIN pelanggan ON penggunaan.id_pelanggan = pelanggan.id_pelanggan 
            WHERE status = ${status} LIMIT ${req.query.limit} OFFSET ${req.query.offset}`,
            function (error, results, fields) {
                if (error) res.status(500).json(error)
                res.status(200).json(results)
            })  
        }
    },
    
    setPembayaran: (req, res) => {
        var data = {
            id_tagihan: req.params.id,
            tanggal_pembayaran : req.body.tanggal_pembayaran,
            bukti_pembayaran : req.file.filename            
        }
        db.query('INSERT INTO pembayaran SET ?', data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            db.query(`UPDATE tagihan SET ? WHERE id_tagihan = ${data.id_tagihan}`, 
            { 'status' : 1 },
            function (error2, results2, fields2) {
                if (error2) res.status(500).json(error);
                res.status(201).json({msg : "pembayaran sukses"})
            })
        })
    },
    
    re_Pembayaran: (req, res) => {
        var data = {
            id_tagihan: req.params.id,
            tanggal_pembayaran : req.body.tanggal_pembayaran,
            bukti_pembayaran : req.file.filename            
        }
        db.query('UPDATE pembayaran SET ?', data,
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            db.query(`UPDATE tagihan SET ? WHERE id_tagihan = ${data.id_tagihan}`, 
            { 'status' : 1 },
            function (error2, results2, fields2) {
                if (error2) res.status(500).json(error);
                res.status(201).json({msg : "pembayaran sukses"})
            })
        })
    },
    
    accPembayaran: (req, res) => {
        db.query(`UPDATE tagihan SET ? WHERE id_tagihan = ${req.params.id}`, 
        { 'status' : 2 },
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json({msg : "pembayaran berhasil diterima"})
        })
    },
    
    decPembayaran: (req, res) => {
        db.query(`UPDATE tagihan SET ? WHERE id_tagihan = ${req.params.id}`, 
        { 'status' : 3 },
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json({msg : "pembayaran telah ditolak"})
        })
    },
    getLaporan: (req, res) => {
        db.query(`CALL getPaymentByMonthAndYear(${req.params.bulan}, ${req.params.tahun})`, 
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results[0])
        })
    },
    //tagihan
    getTagihan: (req, res) => {
        db.query(`SELECT *, tagihan.id_tagihan FROM tagihan
        LEFT JOIN penggunaan ON tagihan.id_penggunaan = penggunaan.id_penggunaan
        LEFT JOIN pembayaran ON pembayaran.id_tagihan = tagihan.id_tagihan 
        WHERE penggunaan.id_pelanggan = ${req.params.id}
        ORDER BY tagihan.id_tagihan DESC`, 
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results)
        })        
    },

    getTahun: (req, res) => {
        db.query(`SELECT tahun FROM penggunaan GROUP BY tahun
        ORDER BY tahun ASC`, 
        function (error, results, fields) {
            if (error) res.status(500).json(error);
            res.status(200).json(results)
        })        
    }
}

module.exports = dataFunc