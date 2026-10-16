
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { randomBytes, createHash } = require('node:crypto');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Apenas imagens JPG ou PNG são permitidas.'));
    }
  },
});

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const app = express();

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get('/', (req, res) => {
  res.json({
    mensagem: 'Servidor do TEAjudo funcionando!',
  });
});

async function verificarLogin(req, res, next) {
  const autorizacao = req.headers.authorization || '';

  if (!autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Usuário não autenticado.',
    });
  }

  const token = autorizacao.substring(7);

  try {
    const usuario = await getAuth().verifyIdToken(token, true);
    req.usuario = usuario;
    next();
  } catch (erro) {
    return res.status(401).json({
      erro: 'Login inválido ou expirado.',
    });
  }
}
function gerarCodigoVinculacao() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(8);

  let codigo = '';

  for (const byte of bytes) {
    codigo += caracteres[byte % caracteres.length];
  }

  return codigo.slice(0, 4) + '-' + codigo.slice(4);
}

function hashCodigo(codigo) {
  return createHash('sha256')
    .update(codigo)
    .digest('hex');
}
app.post('/vinculos/gerar-codigo', verificarLogin, async (req, res) => {
  try {
    const uid = req.usuario.uid;
    const banco = getFirestore();

    const usuarioDoc = await banco
      .collection('usuarios')
      .doc(uid)
      .get();

    if (
      !usuarioDoc.exists ||
      usuarioDoc.data().tipoConta !== 'responsavel'
    ) {
      return res.status(403).json({
        erro: 'Apenas responsáveis podem gerar códigos.',
      });
    }

    const criancaDoc = await banco
      .collection('usuarios')
      .doc(uid)
      .collection('crianca')
      .doc('dados')
      .get();

    if (!criancaDoc.exists) {
      return res.status(404).json({
        erro: 'Nenhuma criança cadastrada.',
      });
    }

    const codigo = gerarCodigoVinculacao();

    const expiraEm = Date.now() + 15 * 60 * 1000;

    await banco
      .collection('codigosVinculacao')
      .doc(hashCodigo(codigo))
      .create({
        responsavelUid: uid,
        criadoEm: Timestamp.now(),
        expiraEm: Timestamp.fromMillis(expiraEm),
        utilizado: false,
      });

    return res.json({
      codigo,
      expiraEm,
    });
  } catch (erro) {
    console.error('Erro ao gerar código:', erro);

    return res.status(500).json({
      erro: 'Não foi possível gerar o código.',
    });
  }
});
app.get('/teste-autenticacao', verificarLogin, (req, res) => {
  res.json({
    mensagem: 'Autenticação funcionando!',
    uid: req.usuario.uid,
  });
});

app.post(
  '/fotos/crianca',
  verificarLogin,
  upload.single('foto'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          erro: 'Nenhuma foto enviada.',
        });
      }

      const uid = req.usuario.uid;

      const fotoUrl = await new Promise((resolve, reject) => {
        const envio = cloudinary.uploader.upload_stream(
          {
            folder: 'teajudo/criancas',
            public_id: uid,
            overwrite: true,
            resource_type: 'image',
          },
          (erro, resultado) => {
            if (erro) return reject(erro);
            resolve(resultado.secure_url);
          }
        );

        envio.end(req.file.buffer);
      });

      res.json({ fotoUrl });
    } catch (erro) {
      console.error('Erro no upload:', erro.message);

      res.status(500).json({
        erro: 'Não foi possível enviar a foto.',
      });
    }
  }
);

app.delete('/fotos/crianca', verificarLogin, async (req, res) => {
  try {
    const uid = req.usuario.uid;

    const resultado = await cloudinary.uploader.destroy(
      `teajudo/criancas/${uid}`,
      {
        resource_type: 'image',
        invalidate: true,
      }
    );

    if (resultado.result !== 'ok' && resultado.result !== 'not found') {
      return res.status(500).json({
        erro: 'Não foi possível excluir a foto.',
      });
    }

    res.json({
      mensagem: 'Foto excluída do Cloudinary.',
    });
  } catch (erro) {
    console.error('Erro ao excluir foto:', erro.message);

    res.status(500).json({
      erro: 'Não foi possível excluir a foto.',
    });
  }
});
// Enviar foto do responsável para o Cloudinary
app.post(
  '/fotos/responsavel',
  verificarLogin,
  upload.single('foto'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          erro: 'Nenhuma foto enviada.',
        });
      }

      const uid = req.usuario.uid;

      const fotoUrl = await new Promise((resolve, reject) => {
        const envio = cloudinary.uploader.upload_stream(
          {
            folder: 'teajudo/responsaveis',
            public_id: uid,
            overwrite: true,
            resource_type: 'image',
            invalidate: true,
          },
          (erro, resultado) => {
            if (erro) return reject(erro);
            resolve(resultado.secure_url);
          }
        );

        envio.end(req.file.buffer);
      });

      res.json({ fotoUrl });
    } catch (erro) {
      console.error('Erro ao enviar foto do responsável:', erro);

      res.status(500).json({
        erro: 'Não foi possível enviar a foto do responsável.',
      });
    }
  }
);

// Excluir foto do responsável do Cloudinary
app.delete('/fotos/responsavel', verificarLogin, async (req, res) => {
  try {
    const uid = req.usuario.uid;

    const resultado = await cloudinary.uploader.destroy(
      `teajudo/responsaveis/${uid}`,
      {
        resource_type: 'image',
        invalidate: true,
      }
    );

    if (resultado.result !== 'ok' && resultado.result !== 'not found') {
      return res.status(500).json({
        erro: 'Não foi possível excluir a foto.',
      });
    }

    res.json({
      mensagem: 'Foto do responsável excluída com sucesso.',
    });
  } catch (erro) {
    console.error('Erro ao excluir foto do responsável:', erro);

    res.status(500).json({
      erro: 'Não foi possível excluir a foto.',
    });
  }
});
const PORT = 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor TEAjudo rodando na porta ${PORT}`);
});
