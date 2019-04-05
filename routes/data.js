const express = require('express');
const router = express.Router();
const mData = require('../models/data')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/bukti/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({storage: storage})

router.get('/tarif', mData.getTarif);
router.post('/tarif', mData.setTarif);
router.put('/tarif/:id', mData.updTarif);
router.delete('/tarif/:id', mData.delTarif);

router.get('/penggunaan', mData.getPenggunaan);
router.get('/penggunaan/:id', mData.getDetailPenggunaan);
router.post('/penggunaan', mData.setPenggunaan);
router.put('/penggunaan/:id', mData.updPenggunaan);
router.delete('/penggunaan/:id', mData.delPenggunaan);

router.get('/pembayaran', mData.getAllPembayaran);
router.get('/pembayaran/laporan/:bulan/:tahun', mData.getLaporan);
router.get('/pembayaran/:type', mData.getPembayaranByStatus);
router.post('/pembayaran/:id', upload.single('bukti_pembayaran'), mData.setPembayaran);
router.post('/pembayaran/ulang/:id', upload.single('bukti_pembayaran'), mData.re_Pembayaran);
router.get('/pembayaran/ver/accept/:id', mData.accPembayaran);
router.get('/pembayaran/ver/decline/:id', mData.decPembayaran);

router.get('/tagihan/:id', mData.getTagihan);
router.get('/tahun', mData.getTahun);


module.exports = router;