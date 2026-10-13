import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const ROSA = '#FF7FA3';
const AZUL = '#42A5D5';
const TEXTO = '#30475D';
const categorias = ['Comunicação', 'Alimentação', 'Escola', 'Sensorial', 'Rotina', 'Outros'];
const tipos = [
  { nome: 'Conquista', icone: 'sparkles-outline' as const, descricao: 'Um avanço ou algo especial' },
  { nome: 'Dificuldade', icone: 'cloud-outline' as const, descricao: 'Um desafio que surgiu' },
  { nome: 'Momento', icone: 'sunny-outline' as const, descricao: 'Uma vivência do cotidiano' },
];

type Registro = {
  titulo?: string;
  tipo?: string;
  categoria?: string;
  data?: string;
  horario?: string;
  descricao?: string;
  observacoes?: string;
};

function dataHoje() {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
}
function formatarData(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}
function dataValida(valor: string) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);

    if (!partes) return false;

    const dia = Number(partes[1]);
    const mes = Number(partes[2]);
    const ano = Number(partes[3]);

    if (ano < 1900 || mes < 1 || mes > 12 || dia < 1) {
        return false;
    }

    const dataInformada = new Date(ano, mes - 1, dia);

    return (
        dataInformada.getFullYear() === ano &&
        dataInformada.getMonth() === mes - 1 &&
        dataInformada.getDate() === dia &&
        dataInformada.getTime() <= new Date().setHours(23, 59, 59, 999)
    );
}
function formatarHorario(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 4);
  return n.length <= 2 ? n : `${n.slice(0, 2)}:${n.slice(2)}`;
}
function horarioValido(valor: string) {
    const partes = /^(\d{2}):(\d{2})$/.exec(valor);

    if (!partes) return false;

    const horas = Number(partes[1]);
    const minutos = Number(partes[2]);

    return (
        horas >= 0 &&
        horas <= 23 &&
        minutos >= 0 &&
        minutos <= 59
    );
}

export default function NovaAtividadeScreen() {
  const parametros = useLocalSearchParams();
  const idParametro = Array.isArray(parametros.id) ? parametros.id[0] : parametros.id;
  const modoEdicao = Boolean(idParametro);
  const [tipo, setTipo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [data, setData] = useState(dataHoje());
  const [horario, setHorario] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroData, setErroData] = useState(false);
const [erroHorario, setErroHorario] = useState(false);

  useEffect(() => {
    if (!idParametro) return;
    let ativo = true;
    async function carregar() {
      const usuario = auth.currentUser;
      if (!usuario || !idParametro) return;
      setCarregando(true);
      try {
        const snapshot = await getDoc(doc(db, 'usuarios', usuario.uid, 'atividades', idParametro));
        if (!snapshot.exists()) {
          Alert.alert('Registro não encontrado', 'Não foi possível encontrar este registro.');
          return;
        }
        if (!ativo) return;
        const registro = snapshot.data() as Registro;
        setTipo(registro.tipo ?? '');
        setCategoria(registro.categoria ?? '');
        setTitulo(registro.titulo ?? '');
        setDescricao(registro.descricao ?? '');
        setObservacoes(registro.observacoes ?? '');
        setData(registro.data ?? dataHoje());
        setHorario(registro.horario ?? '');
      } catch (erro) {
        console.log('Erro ao carregar registro:', erro);
        Alert.alert('Erro', 'Não foi possível carregar o registro.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [idParametro]);

  async function salvar() {
    if (!tipo || !categoria || !descricao.trim()) {
      Alert.alert('Faltam informações', 'Selecione o tipo e a área e descreva o que aconteceu.');
      return;
    }
    if (!dataValida(data)) {
      Alert.alert('Data inválida', 'Informe uma data válida, que não seja futura.');
      return;
    }
    if (horario.trim() && !horarioValido(horario)) {
      Alert.alert('Horário inválido', 'Use um horário entre 00:00 e 23:59.');
      return;
    }
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Acesso necessário', 'Entre na sua conta para salvar o registro.');
      return;
    }
    setSalvando(true);
    try {
      const dados = {
        tipo,
        categoria,
        titulo: titulo.trim() || `${tipo} • ${categoria}`,
        descricao: descricao.trim(),
        observacoes: observacoes.trim(),
        data,
        horario: horario.trim(),
      };
      const id = modoEdicao && idParametro ? idParametro : Date.now().toString();
      await setDoc(doc(db, 'usuarios', usuario.uid, 'atividades', id), dados);
      Alert.alert(modoEdicao ? 'Registro atualizado!' : 'Registro salvo!', 'Seu diário foi atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/atividades') },
      ]);
    } catch (erro) {
      console.log('Erro ao salvar registro:', erro);
      Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <View pointerEvents="none" style={styles.decoracao}>
        <View style={styles.rosaTopo} /><View style={styles.azulTopo} />
        <View style={styles.rosaBaixo} /><View style={styles.azulBaixo} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.cabecalho}>
            <Pressable style={styles.voltar} onPress={() => router.back()} accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={22} color={ROSA} />
            </Pressable>
            <Text style={styles.tituloPagina}>{modoEdicao ? 'Editar registro' : 'Novo registro'}</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.introducao}>
            <View style={styles.iconeIntroducao}><Ionicons name="book-outline" size={23} color={ROSA} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitulo}>Um momento para guardar</Text>
              <Text style={styles.introTexto}>Registre conquistas, desafios e vivências da criança, no seu tempo.</Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.secao}>O que aconteceu? <Text style={styles.asterisco}>*</Text></Text>
            <View style={styles.tipos}>
              {tipos.map(item => {
                const ativo = tipo === item.nome;
                return (
                  <Pressable key={item.nome} onPress={() => setTipo(item.nome)} style={[styles.tipo, ativo && styles.tipoAtivo]}>
                    <Ionicons name={item.icone} size={22} color={ativo ? ROSA : AZUL} />
                    <Text style={[styles.tipoNome, ativo && styles.tipoNomeAtivo]}>{item.nome}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.label}>Área relacionada <Text style={styles.asterisco}>*</Text></Text>
            <View style={styles.categorias}>
              {categorias.map((item) => (
                <Pressable key={item} onPress={() => setCategoria(item)} style={[styles.categoria, categoria === item && styles.categoriaAtiva]}>
                  <Text style={[styles.categoriaTexto, categoria === item && styles.categoriaTextoAtivo]}>{item}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Conte o que aconteceu <Text style={styles.asterisco}>*</Text></Text>
            <TextInput style={[styles.input, styles.textarea]} value={descricao} onChangeText={setDescricao} multiline textAlignVertical="top" placeholder="Ex.: Hoje conseguiu pedir ajuda usando palavras..." placeholderTextColor="#9AABB6" />
            <Text style={styles.label}>Título (opcional)</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Ex.: Um novo jeito de se comunicar" placeholderTextColor="#9AABB6" />
            <View style={styles.linha}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Data <Text style={styles.asterisco}>*</Text></Text>
                <TextInput style={styles.input} value={data} onChangeText={t => setData(formatarData(t))} placeholder="DD/MM/AAAA" placeholderTextColor="#9AABB6" keyboardType="numeric" maxLength={10} onBlur={() => setErroData(!dataValida(data))}/>
                    {erroData && (
    <Text style={{ color: '#E65D83', fontSize: 11, marginTop: -10, marginBottom: 12 }}>
        Informe uma data válida.
    </Text>
)}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Horário (opcional)</Text>
                <TextInput style={styles.input} value={horario} onChangeText={t => setHorario(formatarHorario(t))} placeholder="HH:MM" placeholderTextColor="#9AABB6" keyboardType="numeric" maxLength={5} onBlur={() =>
    setErroHorario(
        horario.trim() !== '' && !horarioValido(horario)
    )
}/>
                    {erroHorario && (
    <Text style={{ color: '#E65D83', fontSize: 11, marginTop: -10, marginBottom: 12 }}>
        Informe um horário válido.
    </Text>
)}
              </View>
            </View>
            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput style={[styles.input, styles.observacoes]} value={observacoes} onChangeText={setObservacoes} multiline textAlignVertical="top" placeholder="Algo mais que você queira lembrar?" placeholderTextColor="#9AABB6" />
            <Text style={styles.ajuda}>* Campos obrigatórios</Text>
            <Pressable style={[styles.salvar, (salvando || carregando) && { opacity: 0.6 }]} onPress={salvar} disabled={salvando || carregando}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.salvarTexto}>{salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Salvar no diário'}</Text>
            </Pressable>
          </View>
          <Text style={styles.rodape}>Cada pequeno momento tem seu valor.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F9FCFD' },
  decoracao: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' },
  rosaTopo: { position: 'absolute', top: -115, left: -95, width: 285, height: 240, borderRadius: 150, backgroundColor: '#FFE9F1' },
  azulTopo: { position: 'absolute', top: -130, right: -100, width: 280, height: 240, borderRadius: 150, backgroundColor: '#E4F5FC' },
  rosaBaixo: { position: 'absolute', bottom: -150, left: -120, width: 320, height: 245, borderRadius: 170, backgroundColor: '#FFE8F0' },
  azulBaixo: { position: 'absolute', bottom: -155, right: -130, width: 340, height: 245, borderRadius: 180, backgroundColor: '#DFF4FC' },
  conteudo: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 36 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  voltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tituloPagina: { color: TEXTO, fontSize: 19, fontWeight: '700' },
  introducao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F5', borderRadius: 22, padding: 15, marginBottom: 18, borderWidth: 1, borderColor: '#FFE1EB' },
  iconeIntroducao: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FFE0EA', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  introTitulo: { color: TEXTO, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  introTexto: { color: '#7F8D9A', fontSize: 11, lineHeight: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 23, borderWidth: 1, borderColor: '#EAF0F4', padding: 17, shadowColor: '#355C6D', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 9, elevation: 2 },
  secao: { color: TEXTO, fontSize: 15, fontWeight: '700', marginBottom: 13 },
  asterisco: { color: ROSA },
  tipos: { flexDirection: 'row', gap: 7, marginBottom: 23 },
  tipo: { flex: 1, minHeight: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#F0F9FD', borderWidth: 1, borderColor: '#E3F0F6', gap: 7, paddingHorizontal: 3 },
  tipoAtivo: { backgroundColor: '#FFF0F5', borderColor: ROSA },
  tipoNome: { color: TEXTO, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  tipoNomeAtivo: { color: '#D95E84', fontWeight: '700' },
  label: { color: TEXTO, fontSize: 12, fontWeight: '700', marginBottom: 9 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 21 },
  categoria: { paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#F0F9FD', borderRadius: 18, borderWidth: 1, borderColor: '#E3F0F6' },
  categoriaAtiva: { backgroundColor: '#FFE8F0', borderColor: ROSA },
  categoriaTexto: { fontSize: 11, color: '#647C8B', fontWeight: '600' },
  categoriaTextoAtivo: { color: '#D95E84', fontWeight: '700' },
  input: { minHeight: 46, backgroundColor: '#F7FBFD', borderRadius: 14, borderWidth: 1, borderColor: '#DFEDF3', paddingHorizontal: 13, color: TEXTO, fontSize: 13, marginBottom: 18 },
  textarea: { minHeight: 112, paddingTop: 12 },
  observacoes: { minHeight: 75, paddingTop: 12 },
  linha: { flexDirection: 'row' },
  ajuda: { color: '#96A6B1', fontSize: 10, marginTop: -4, marginBottom: 17 },
  salvar: { minHeight: 50, borderRadius: 15, backgroundColor: ROSA, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: ROSA, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 6, elevation: 2 },
  salvarTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  rodape: { color: '#93A4AF', fontSize: 11, textAlign: 'center', marginTop: 19 },
});
