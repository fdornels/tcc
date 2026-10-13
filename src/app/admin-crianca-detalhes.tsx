import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

const AZUL = '#42A5D5';
const ROSA = '#FF7FA3';
const TEXTO = '#344B59';

type Icone = React.ComponentProps<typeof Ionicons>['name'];

function LinhaInformacao({ icone, titulo, valor, ultimo = false }: {
  icone: Icone;
  titulo: string;
  valor: string;
  ultimo?: boolean;
}) {
  return (
    <View style={[styles.linha, ultimo && styles.semBorda]}>
      <View style={styles.iconeFundo}><Ionicons name={icone} size={19} color={AZUL} /></View>
      <View style={styles.linhaTexto}>
        <Text style={styles.rotulo}>{titulo}</Text>
        <Text style={styles.valor}>{valor.trim() || 'Não informado'}</Text>
      </View>
    </View>
  );
}

export default function AdminCriancaDetalhesScreen() {
  const params = useLocalSearchParams();
  const ler = (valor: string | string[] | undefined) =>
    typeof valor === 'string' ? valor : Array.isArray(valor) ? valor[0] ?? '' : '';

  const nome = ler(params.nome);
  const apelido = ler(params.apelido);
  const dataNascimento = ler(params.dataNascimento);
  const sexo = ler(params.sexo);
  const escola = ler(params.escola);
  const comunicacao = ler(params.comunicacao);
  const preferencias = ler(params.preferencias);
  const sensibilidades = ler(params.sensibilidades);
  const observacoes = ler(params.observacoes);
  const uid = ler(params.uid) || ler(params.responsavelId) || ler(params.responsavel_id);
  const fotoRecebida = ler(params.fotoUrl);
  const [fotoUrl, setFotoUrl] = useState(fotoRecebida);
  const [falhaFoto, setFalhaFoto] = useState(false);

  useEffect(() => {
    let ativo = true;
    setFotoUrl(fotoRecebida);
    setFalhaFoto(false);
    if (!uid) return () => { ativo = false; };
    getDoc(doc(db, 'usuarios', uid, 'crianca', 'dados'))
      .then((snapshot) => {
        if (ativo && snapshot.exists()) {
          const url = snapshot.data()?.fotoUrl;
          if (typeof url === 'string') setFotoUrl(url);
        }
      })
      .catch((erro) => console.log('Não foi possível consultar foto da criança:', erro));
    return () => { ativo = false; };
  }, [uid, fotoRecebida]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.decoracaoAzul} />
      <View style={styles.decoracaoRosa} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={22} color={AZUL} />
          </Pressable>
          <Text style={styles.tituloPagina}>Detalhes da criança</Text>
          <View style={styles.espacoCabecalho} />
        </View>

        <View style={styles.perfil}>
          <View style={styles.avatarBorda}>
            {fotoUrl && !falhaFoto ? (
              <Image source={{ uri: fotoUrl }} style={styles.foto} onError={() => setFalhaFoto(true)} />
            ) : (
              <View style={styles.avatarVazio}>
                <Ionicons name="person-outline" size={48} color={AZUL} />
              </View>
            )}
          </View>
          <Text style={styles.nome}>{nome || 'Criança'}</Text>
          {!!apelido && <Text style={styles.apelido}>{apelido}</Text>}
          <View style={styles.etiqueta}><Ionicons name="eye-outline" size={14} color={AZUL} /><Text style={styles.etiquetaTexto}>Visualização administrativa</Text></View>
        </View>

        <Text style={styles.tituloSecao}>Dados pessoais</Text>
        <View style={styles.card}>
          <LinhaInformacao icone="calendar-outline" titulo="Data de nascimento" valor={dataNascimento} />
          <LinhaInformacao icone="person-outline" titulo="Identificação" valor={sexo} />
          <LinhaInformacao icone="school-outline" titulo="Escola" valor={escola} ultimo />
        </View>

        <Text style={styles.tituloSecao}>Comunicação</Text>
        <View style={styles.card}>
          <LinhaInformacao icone="chatbubble-ellipses-outline" titulo="Como se comunica" valor={comunicacao} ultimo />
        </View>

        <Text style={styles.tituloSecao}>Preferências e sensibilidades</Text>
        <View style={styles.card}>
          <LinhaInformacao icone="heart-outline" titulo="Preferências" valor={preferencias} />
          <LinhaInformacao icone="options-outline" titulo="Sensibilidades" valor={sensibilidades} ultimo />
        </View>

        <Text style={styles.tituloSecao}>Observações</Text>
        <View style={styles.cardObservacoes}>
          <View style={[styles.iconeFundo, styles.iconeRosa]}><Ionicons name="document-text-outline" size={19} color={ROSA} /></View>
          <Text style={styles.textoObservacoes}>{observacoes.trim() || 'Nenhuma observação informada.'}</Text>
        </View>

        <View style={styles.aviso}>
          <Ionicons name="lock-closed-outline" size={19} color={AZUL} />
          <View style={styles.avisoTexto}>
            <Text style={styles.avisoTitulo}>Somente para consulta</Text>
            <Text style={styles.avisoDescricao}>As informações desta criança estão disponíveis para visualização administrativa.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FCFD' },
  decoracaoAzul: { position: 'absolute', top: -105, right: -105, width: 265, height: 265, borderRadius: 140, backgroundColor: '#E7F5FC' },
  decoracaoRosa: { position: 'absolute', top: 210, left: -105, width: 170, height: 170, borderRadius: 90, backgroundColor: '#FFF0F5' },
  conteudo: { paddingHorizontal: 22, paddingBottom: 42 },
  cabecalho: { height: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voltar: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8F1F6' },
  espacoCabecalho: { width: 42 },
  tituloPagina: { color: TEXTO, fontSize: 18, fontWeight: '700' },
  perfil: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 25, padding: 24, marginTop: 12, marginBottom: 26, borderWidth: 1, borderColor: '#EDF3F6' },
  avatarBorda: { width: 110, height: 110, borderRadius: 55, padding: 4, backgroundColor: '#EAF7FD', marginBottom: 13, overflow: 'hidden' },
  foto: { width: '100%', height: '100%', borderRadius: 52 },
  avatarVazio: { flex: 1, borderRadius: 52, backgroundColor: '#F3FAFD', alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 22, fontWeight: '800', color: TEXTO, textAlign: 'center' },
  apelido: { fontSize: 14, color: '#8298A5', marginTop: 5 },
  etiqueta: { marginTop: 15, backgroundColor: '#EDF8FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  etiquetaTexto: { color: '#428AB0', fontSize: 11, fontWeight: '600' },
  tituloSecao: { color: TEXTO, fontSize: 16, fontWeight: '700', marginBottom: 11, marginLeft: 3 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, paddingHorizontal: 17, marginBottom: 23, borderWidth: 1, borderColor: '#EDF3F6' },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EFF3F5' },
  semBorda: { borderBottomWidth: 0 },
  iconeFundo: { width: 41, height: 41, borderRadius: 14, backgroundColor: '#EBF7FC', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  linhaTexto: { flex: 1 },
  rotulo: { fontSize: 12, color: '#899BA6', marginBottom: 4 },
  valor: { fontSize: 14, fontWeight: '600', color: TEXTO, lineHeight: 21 },
  cardObservacoes: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 17, marginBottom: 22, borderWidth: 1, borderColor: '#EDF3F6' },
  iconeRosa: { backgroundColor: '#FFF0F5' },
  textoObservacoes: { flex: 1, color: '#536B79', fontSize: 14, lineHeight: 22, paddingTop: 7 },
  aviso: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF8FC', borderRadius: 18, padding: 17, gap: 11 },
  avisoTexto: { flex: 1 },
  avisoTitulo: { fontSize: 13, fontWeight: '700', color: TEXTO, marginBottom: 4 },
  avisoDescricao: { color: '#6E8796', fontSize: 12, lineHeight: 18 },
});
