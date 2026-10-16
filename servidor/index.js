

require('dotenv').config();



const express = require('express');

const cors = require('cors');

const cloudinary = require('cloudinary').v2;

const { initializeApp, cert } = require('firebase-admin/app');

const { getAuth } = require('firebase-admin/auth');

const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const { randomBytes, createHash, randomInt } = require('node:crypto');

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



  let codigo = '';



  for (let i = 0; i < 8; i++) {

    codigo += caracteres[randomInt(caracteres.length)];

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

app.post('/vinculos/solicitar', verificarLogin, async (req, res) => {

  try {

    const profissionalUid = req.usuario.uid;

    const codigo = String(req.body.codigo || '').trim().toUpperCase();



    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) {

      return res.status(400).json({

        erro: 'Código inválido.',

      });

    }



    const banco = getFirestore();



    const profissionalDoc = await banco

      .collection('usuarios')

      .doc(profissionalUid)

      .get();



    if (

      !profissionalDoc.exists ||

      profissionalDoc.data().tipoConta !== 'profissional'

    ) {

      return res.status(403).json({

        erro: 'Apenas profissionais podem solicitar vínculos.',

      });

    }



    const codigoRef = banco

      .collection('codigosVinculacao')

      .doc(hashCodigo(codigo));





    const solicitacaoRef = banco.collection('solicitacoesVinculo').doc();

    const resultado = await banco.runTransaction(async (transacao) => {
      const codigoDoc = await transacao.get(codigoRef);
      if (!codigoDoc.exists) {
        return { erro: 'Código não encontrado ou inválido.', status: 404 };
      }

      const dados = codigoDoc.data();
      if (
        dados.utilizado ||
        !dados.expiraEm ||
        dados.expiraEm.toMillis() <= Date.now()
      ) {
        return { erro: 'Código expirado ou já utilizado.', status: 400 };
      }
      if (dados.responsavelUid === profissionalUid) {
        return { erro: 'Não é possível vincular sua própria conta.', status: 400 };
      }

      // Um único documento de controle por par, mantendo solicitações como histórico.
      const controleRef = banco.collection('vinculosAtivos')
        .doc(`${dados.responsavelUid}_${profissionalUid}`);
      const controleDoc = await transacao.get(controleRef);
      const statusAtual = controleDoc.exists ? controleDoc.data().status : null;
      if (statusAtual === 'aprovado') {
        return { erro: 'Este profissional já possui acesso autorizado.', status: 409 };
      }
      if (statusAtual === 'pendente') {
        return { erro: 'Já existe uma solicitação aguardando aprovação.', status: 409 };
      }

      transacao.update(codigoRef, { utilizado: true, utilizadoPor: profissionalUid });
      transacao.create(solicitacaoRef, {
        responsavelUid: dados.responsavelUid,
        profissionalUid,
        status: 'pendente',
        criadoEm: Timestamp.now(),
      });
      transacao.set(controleRef, {
        responsavelUid: dados.responsavelUid,
        profissionalUid,
        status: 'pendente',
        solicitacaoId: solicitacaoRef.id,
        solicitadoEm: Timestamp.now(),
      });
      return { sucesso: true };
    });

    if (resultado.erro) {

      return res.status(resultado.status).json({

        erro: resultado.erro,

      });

    }



    return res.status(201).json({

      mensagem: 'Solicitação enviada! Aguarde a aprovação do responsável.',

    });

  } catch (erro) {

    console.error('Erro ao solicitar vínculo:', erro);



    return res.status(500).json({

      erro: 'Não foi possível solicitar o vínculo.',

    });

  }

});

// Listar solicitações pendentes do responsável

app.get('/vinculos/solicitacoes', verificarLogin, async (req, res) => {

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

        erro: 'Acesso permitido apenas para responsáveis.',

      });

    }



    const resultado = await banco

      .collection('solicitacoesVinculo')

      .where('responsavelUid', '==', uid)

      .where('status', '==', 'pendente')

      .get();



    const solicitacoes = [];



    for (const documento of resultado.docs) {

      const dados = documento.data();



      const profissionalDoc = await banco

        .collection('usuarios')

        .doc(dados.profissionalUid)

        .get();



      const profissional = profissionalDoc.exists

        ? profissionalDoc.data()

        : {};



      solicitacoes.push({

        id: documento.id,

        nomeProfissional: profissional.nome || 'Profissional',

        status: dados.status,

      });

    }



    return res.json({ solicitacoes });

  } catch (erro) {

    console.error('Erro ao listar solicitações:', erro);



    return res.status(500).json({

      erro: 'Não foi possível carregar as solicitações.',

    });

  }

});

app.post('/vinculos/responder', verificarLogin, async (req, res) => {

  try {

    const uid = req.usuario.uid;

    const { solicitacaoId, decisao } = req.body;



    if (

      typeof solicitacaoId !== 'string' ||

      !['aprovar', 'recusar'].includes(decisao)

    ) {

      return res.status(400).json({ erro: 'Dados inválidos.' });

    }



    const banco = getFirestore();

    const solicitacaoRef = banco.collection('solicitacoesVinculo').doc(solicitacaoId);



    const resultado = await banco.runTransaction(async (transacao) => {

      const solicitacaoDoc = await transacao.get(solicitacaoRef);



      if (!solicitacaoDoc.exists) {

        return { status: 404, erro: 'Solicitação não encontrada.' };

      }



      const dados = solicitacaoDoc.data();

      const vinculoControleRef = banco

    .collection('vinculosAtivos')

    .doc(`${dados.responsavelUid}_${dados.profissionalUid}`);

    const vinculoControleDoc = await transacao.get(vinculoControleRef);



      if (dados.responsavelUid !== uid) {

        return { status: 403, erro: 'Você não pode responder a esta solicitação.' };

      }



      if (dados.status !== 'pendente') {

        return { status: 400, erro: 'Solicitação já respondida.' };

      }

          if (
      !vinculoControleDoc.exists ||
      vinculoControleDoc.data().status !== 'pendente' ||
      vinculoControleDoc.data().solicitacaoId !== solicitacaoId
    ) {
      return { status: 409, erro: 'Esta solicitação não é a solicitação pendente atual.' };
    }

if (

    decisao === 'aprovar' &&

    vinculoControleDoc.exists &&

    vinculoControleDoc.data().status === 'aprovado'

) {

    return {

        status: 409,

        erro: 'Este profissional já possui acesso autorizado.',

    };

}

if (decisao === 'aprovar') {

    const vinculosExistentes = await transacao.get(

        banco

            .collection('solicitacoesVinculo')

            .where('responsavelUid', '==', uid)

            .where('profissionalUid', '==', dados.profissionalUid)

            .where('status', '==', 'aprovado')

    );



    if (!vinculosExistentes.empty) {

        return {

            status: 409,

            erro: 'Este profissional já possui acesso autorizado.',

        };

    }

}

      transacao.update(solicitacaoRef, {

        status: decisao === 'aprovar' ? 'aprovado' : 'recusado',

        respondidoEm: Timestamp.now(),

      });

if (decisao === 'aprovar') {
  transacao.update(vinculoControleRef, {
    status: 'aprovado',
    aprovadoEm: Timestamp.now(),
  });
} else {
  transacao.update(vinculoControleRef, {
    status: 'recusado',
    respondidoEm: Timestamp.now(),
  });
}

      return { sucesso: true };

    });



    if (resultado.erro) {

      return res.status(resultado.status).json({ erro: resultado.erro });

    }



    return res.json({ mensagem: 'Solicitação respondida com sucesso.' });

  } catch (erro) {

    console.error('Erro ao responder solicitação:', erro);

    return res.status(500).json({ erro: 'Não foi possível responder.' });

  }

});

// Revogar acesso de um profissional

app.post('/vinculos/revogar', verificarLogin, async (req, res) => {

  try {

    const responsavelUid = req.usuario.uid;

    const { solicitacaoId } = req.body || {};



    if (typeof solicitacaoId !== 'string' || !solicitacaoId.trim()) {

      return res.status(400).json({

        erro: 'Solicitação inválida.',

      });

    }



    const banco = getFirestore();

    const solicitacaoRef = banco

      .collection('solicitacoesVinculo')

      .doc(solicitacaoId);



    const resultado = await banco.runTransaction(async (transacao) => {

      const documento = await transacao.get(solicitacaoRef);



      if (!documento.exists) {

        return { status: 404, erro: 'Vínculo não encontrado.' };

      }



      const dados = documento.data();

      const profissionalUid = dados.profissionalUid;

      const vinculoControleRef = banco

    .collection('vinculosAtivos')

    .doc(`${dados.responsavelUid}_${profissionalUid}`);



      if (dados.responsavelUid !== responsavelUid) {

        return { status: 403, erro: 'Você não pode revogar este vínculo.' };

      }



      if (dados.status !== 'aprovado') {

        return { status: 400, erro: 'Este vínculo não está ativo.' };

      }

const vinculoControleDoc = await transacao.get(vinculoControleRef);



if (

    !vinculoControleDoc.exists ||

    vinculoControleDoc.data().status !== 'aprovado' ||

    vinculoControleDoc.data().solicitacaoId !== solicitacaoId

) {

    return {

        status: 409,

        erro: 'Esta solicitação não corresponde ao vínculo ativo.',

    };

}



const outrosVinculos = await transacao.get(

    banco

        .collection('solicitacoesVinculo')

        .where('responsavelUid', '==', responsavelUid)

        .where('profissionalUid', '==', profissionalUid)

        .where('status', '==', 'aprovado')

);



outrosVinculos.docs.forEach((vinculo) => {

    transacao.update(vinculo.ref, {

        status: 'revogado',

        revogadoEm: Timestamp.now(),

    });

});



transacao.update(vinculoControleRef, {

    status: 'revogado',

    revogadoEm: Timestamp.now(),

});



    return { sucesso: true };

  });



  if (resultado.erro) {

    return res.status(resultado.status).json({

      erro: resultado.erro,

    });

  }



  return res.json({

    mensagem: 'Acesso do profissional revogado com sucesso.',

  });

} catch (erro) {

  console.error('Erro ao revogar vínculo:', erro);



  return res.status(500).json({

    erro: 'Não foi possível revogar o acesso.',

  });

}

});



// Listar profissionais autorizados pelo responsável

app.get('/vinculos/aprovados', verificarLogin, async (req, res) => {

  try {

    const uid = req.usuario.uid;

    const banco = getFirestore();



    const usuarioDoc = await banco.collection('usuarios').doc(uid).get();



    if (

      !usuarioDoc.exists ||

      usuarioDoc.data().tipoConta !== 'responsavel'

    ) {

      return res.status(403).json({

        erro: 'Acesso permitido apenas para responsáveis.',

      });

    }



    const resultado = await banco

    .collection('vinculosAtivos')

    .where('responsavelUid', '==', uid)

    .where('status', '==', 'aprovado')

    .get();



    const profissionais = await Promise.all(

      resultado.docs.map(async (documento) => {

        const dados = documento.data();



        const perfil = await banco

          .collection('usuarios')

          .doc(dados.profissionalUid)

          .get();



        return {

    solicitacaoId: dados.solicitacaoId,

    nome: perfil.exists

        ? perfil.data().nome || 'Profissional'

        : 'Profissional',

};

      })

    );



    return res.json({ profissionais });

  } catch (erro) {

    console.error('Erro ao listar profissionais:', erro);



    return res.status(500).json({

      erro: 'Não foi possível carregar os profissionais.',

    });

  }

});

// Verifica se o profissional tem autorização do responsável
// Listar crianças autorizadas para o profissional
app.get('/profissional/vinculos', verificarLogin, async (req, res) => {
  try {
    const profissionalUid = req.usuario.uid;
    const banco = getFirestore();

    const profissionalDoc = await banco
      .collection('usuarios')
      .doc(profissionalUid)
      .get();

    if (
      !profissionalDoc.exists ||
      profissionalDoc.data().tipoConta !== 'profissional'
    ) {
      return res.status(403).json({
        erro: 'Acesso permitido apenas para profissionais.',
      });
    }

    const vinculos = await banco
      .collection('vinculosAtivos')
      .where('profissionalUid', '==', profissionalUid)
      .where('status', '==', 'aprovado')
      .get();

    const criancas = [];

    for (const vinculo of vinculos.docs) {
      const { responsavelUid } = vinculo.data();

      const criancaDoc = await banco
        .collection('usuarios')
        .doc(responsavelUid)
        .collection('crianca')
        .doc('dados')
        .get();

      if (!criancaDoc.exists) continue;

      const dados = criancaDoc.data();

      criancas.push({
        responsavelUid,
        nome: dados.nome || 'Criança sem nome',
      });
    }

    return res.json({ criancas });
  } catch (erro) {
    console.error('Erro ao listar crianças vinculadas:', erro);

    return res.status(500).json({
      erro: 'Não foi possível carregar as crianças vinculadas.',
    });
  }
});
async function verificarVinculoAprovado(profissionalUid, responsavelUid) {

    const banco = getFirestore();



    const vinculoRef = banco

        .collection('vinculosAtivos')

        .doc(`${responsavelUid}_${profissionalUid}`);



    const vinculoDoc = await vinculoRef.get();



    if (!vinculoDoc.exists) {

        return false;

    }



    const dados = vinculoDoc.data();



    return (

        dados.status === 'aprovado' &&

        dados.responsavelUid === responsavelUid &&

        dados.profissionalUid === profissionalUid

    );

}

// Consultar diário de uma criança vinculada

app.get('/profissional/diario/:responsavelUid', verificarLogin, async (req, res) => {

  try {

    const profissionalUid = req.usuario.uid;

    const { responsavelUid } = req.params;

    const banco = getFirestore();



    const profissionalDoc = await banco

      .collection('usuarios')

      .doc(profissionalUid)

      .get();



    if (

      !profissionalDoc.exists ||

      profissionalDoc.data().tipoConta !== 'profissional'

    ) {

      return res.status(403).json({

        erro: 'Acesso permitido apenas para profissionais.',

      });

    }



    const autorizado = await verificarVinculoAprovado(

      profissionalUid,

      responsavelUid

    );



    if (!autorizado) {

      return res.status(403).json({

        erro: 'Você não possui autorização para acessar este diário.',

      });

    }



    const resultado = await banco

      .collection('usuarios')

      .doc(responsavelUid)

      .collection('atividades')

      .get();



    const registros = resultado.docs.map((documento) => ({

      id: documento.id,

      ...documento.data(),

    }));



    return res.json({ registros });

  } catch (erro) {

    console.error('Erro ao consultar diário profissional:', erro);



    return res.status(500).json({

      erro: 'Não foi possível carregar o diário.',

    });

  }

});

// Consultar perfil de uma criança vinculada

app.get('/profissional/crianca/:responsavelUid', verificarLogin, async (req, res) => {

  try {

    const profissionalUid = req.usuario.uid;

    const { responsavelUid } = req.params;

    const banco = getFirestore();



    const profissionalDoc = await banco

      .collection('usuarios')

      .doc(profissionalUid)

      .get();



    if (

      !profissionalDoc.exists ||

      profissionalDoc.data().tipoConta !== 'profissional'

    ) {

      return res.status(403).json({

        erro: 'Acesso permitido apenas para profissionais.',

      });

    }



    const autorizado = await verificarVinculoAprovado(

      profissionalUid,

      responsavelUid

    );



    if (!autorizado) {

      return res.status(403).json({

        erro: 'Você não possui autorização para acessar esta criança.',

      });

    }



    const criancaDoc = await banco

      .collection('usuarios')

      .doc(responsavelUid)

      .collection('crianca')

      .doc('dados')

      .get();



    if (!criancaDoc.exists) {

      return res.status(404).json({

        erro: 'Perfil da criança não encontrado.',

      });

    }



    return res.json({

      crianca: criancaDoc.data(),

    });

  } catch (erro) {

    console.error('Erro ao consultar perfil da criança:', erro);



    return res.status(500).json({

      erro: 'Não foi possível carregar o perfil da criança.',

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
