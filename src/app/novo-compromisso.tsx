import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

const ROSA = '#FF7FA3';
const AZUL = '#42A5D5';
const TEXTO = '#30475D';

type Compromisso = {
  titulo: string;
  tipo: string;
  data: string;
  horario: string;
  local: string;
  observacoes: string;
};

function formatarData(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

function formatarHorario(texto: string) {
  const n = texto.replace(/\D/g, '').slice(0, 4);
  return n.length <= 2 ? n : `${n.slice(0, 2)}:${n.slice(2)}`;
}

function dataValida(valor: string) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!partes) return false;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  if (ano < 1900 || mes < 1 || mes > 12 || dia < 1) return false;
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

function horarioValido(valor: string) {
  const partes = /^(\d{2}):(\d{2})$/.exec(valor);
  if (!partes) return false;
  return Number(partes[1]) <= 23 && Number(partes[2]) <= 59;
}

export default function NovoCompromissoScreen() {
  const parametros = useLocalSearchParams();
  const idParametro = Array.isArray(parametros.id) ? parametros.id[0] : parametros.id;
  const modoEdicao = Boolean(idParametro);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [local, setLocal] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erroData, setErroData] = useState(false);
  const [erroHorario, setErroHorario] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!idParametro) return;
    let ativo = true;
    async function carregar() {
      try {
        const usuario = auth.currentUser;
        if (!usuario) {
          Alert.alert('Acesso necessário', 'Entre na sua conta para continuar.');
          return;
        }
        const documento = await getDoc(doc(db, 'usuarios', usuario.uid, 'compromissos', idParametro!));
        if (!documento.exists()) {
          Alert.alert('Não encontrado', 'Não foi possível encontrar este compromisso.');
          return;
        }
        if (!ativo) return;
        const c = documento.data() as Partial<Compromisso>;
        setTitulo(c.titulo ?? '');
        setTipo(c.tipo ?? '');
        setData(c.data ?? '');
        setHorario(c.horario ?? '');
        setLocal(c.local ?? '');
        setObservacoes(c.observacoes ?? '');
      } catch (erro) {
        console.log('Erro ao carregar compromisso:', erro);
        Alert.alert('Erro', 'Não foi possível carregar o compromisso.');
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, [idParametro]);

  async function salvarCompromisso() {
    if (salvando) return;
    if (!titulo.trim() || !data.trim() || !horario.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o título, a data e o horário.');
      return;
    }
    if (!dataValida(data)) {
      setErroData(true);
      Alert.alert('Data inválida', 'Informe uma data existente no formato DD/MM/AAAA.');
      return;
    }
    if (!horarioValido(horario)) {
      setErroHorario(true);
      Alert.alert('Horário inválido', 'Informe um horário entre 00:00 e 23:59.');
      return;
    }
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Acesso necessário', 'Entre na sua conta para continuar.');
      return;
    }
    setSalvando(true);
    try {
      const dados: Compromisso = {
        titulo: titulo.trim(), tipo: tipo.trim(), data: data.trim(),
        horario: horario.trim(), local: local.trim(), observacoes: observacoes.trim(),
      };
      const id = modoEdicao && idParametro ? idParametro : Date.now().toString();
      await setDoc(doc(db, 'usuarios', usuario.uid, 'compromissos', id), dados);
      Alert.alert(
        modoEdicao ? 'Alterações salvas!' : 'Compromisso salvo!',
        modoEdicao ? 'Seu compromisso foi atualizado.' : 'Seu compromisso foi adicionado à agenda.',
        [{ text: 'OK', onPress: () => router.replace('/agenda') }]
      );
    } catch (erro) {
      console.log('Erro ao salvar compromisso:', erro);
      Alert.alert('Erro', 'Não foi possível salvar o compromisso. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.decoracao}>
        <View style={styles.rosaTopo} />
        <View style={styles.azulTopo} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Pressable onPress={() => router.back()} style={styles.voltar} accessibilityLabel="Voltar">
              <Ionicons name="chevron-back" size={22} color={ROSA} />
            </Pressable>
            <Text style={styles.tituloPagina}>{modoEdicao ? 'Editar compromisso' : 'Novo compromisso'}</Text>
            <View style={styles.espacoCabecalho} />
          </View>

          <View style={styles.introducao}>
            <View style={styles.iconeIntroducao}>
              <Ionicons name="calendar-outline" size={25} color={ROSA} />
            </View>
            <View style={styles.introducaoTexto}>
              <Text style={styles.introducaoTitulo}>Um cuidado de cada vez</Text>
              <Text style={styles.introducaoSubtitulo}>
                {modoEdicao ? 'Atualize os detalhes deste compromisso.' : 'Organize consultas, terapias e momentos importantes.'}
              </Text>
            </View>
          </View>

          <View style={styles.formulario}>
            <Text style={styles.label}>Nome do compromisso <Text style={styles.asterisco}>*</Text></Text>
            <TextInput style={styles.input} placeholder="Ex.: Terapia ocupacional" placeholderTextColor="#A0AFB8" value={titulo} onChangeText={setTitulo} />

            <Text style={styles.label}>Tipo de compromisso</Text>
            <TextInput style={styles.input} placeholder="Ex.: Consulta, terapia, escola..." placeholderTextColor="#A0AFB8" value={tipo} onChangeText={setTipo} />

            <View style={styles.linha}>
              <View style={styles.metade}>
                <Text style={styles.label}>Data <Text style={styles.asterisco}>*</Text></Text>
                <TextInput
                  style={[styles.input, erroData && styles.inputErro]}
                  placeholder="DD/MM/AAAA" placeholderTextColor="#A0AFB8"
                  value={data} onChangeText={(valor) => { setData(formatarData(valor)); setErroData(false); }}
                  onBlur={() => setErroData(data.length > 0 && !dataValida(data))}
                  keyboardType="numeric" maxLength={10}
                />
                {erroData && <Text style={styles.erro}>Data inválida</Text>}
              </View>
              <View style={styles.metade}>
                <Text style={styles.label}>Horário <Text style={styles.asterisco}>*</Text></Text>
                <TextInput
                  style={[styles.input, erroHorario && styles.inputErro]}
                  placeholder="HH:MM" placeholderTextColor="#A0AFB8"
                  value={horario} onChangeText={(valor) => { setHorario(formatarHorario(valor)); setErroHorario(false); }}
                  onBlur={() => setErroHorario(horario.length > 0 && !horarioValido(horario))}
                  keyboardType="numeric" maxLength={5}
                />
                {erroHorario && <Text style={styles.erro}>Horário inválido</Text>}
              </View>
            </View>

            <Text style={styles.label}>Local ou profissional</Text>
            <TextInput style={styles.input} placeholder="Ex.: Clínica Vida" placeholderTextColor="#A0AFB8" value={local} onChangeText={setLocal} />

            <Text style={styles.label}>Observações</Text>
            <TextInput style={[styles.input, styles.observacoes]} placeholder="Alguma informação importante?" placeholderTextColor="#A0AFB8" value={observacoes} onChangeText={setObservacoes} multiline textAlignVertical="top" />

            <Text style={styles.aviso}>* Campos obrigatórios</Text>
            <Pressable style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]} onPress={() => void salvarCompromisso()} disabled={salvando}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.textoSalvar}>{salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Salvar compromisso'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FCFD' },
  flex: { flex: 1 },
  decoracao: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  rosaTopo: { position: 'absolute', top: -135, left: -110, width: 280, height: 225, borderRadius: 145, backgroundColor: '#FCEAF1' },
  azulTopo: { position: 'absolute', top: -140, right: -120, width: 295, height: 230, borderRadius: 150, backgroundColor: '#E4F5FC' },
  conteudo: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 34 },
  voltar: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  tituloPagina: { color: TEXTO, fontSize: 19, fontWeight: '700' },
  espacoCabecalho: { width: 39 },
  introducao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F5', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#FBE3EB', marginBottom: 24 },
  iconeIntroducao: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#FFE1EC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  introducaoTexto: { flex: 1 },
  introducaoTitulo: { color: TEXTO, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  introducaoSubtitulo: { color: '#788B97', fontSize: 11, lineHeight: 16 },
  formulario: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#EDF3F6' },
  label: { fontSize: 12, fontWeight: '700', color: '#40576A', marginBottom: 8 },
  asterisco: { color: ROSA },
  input: { minHeight: 48, backgroundColor: '#FAFCFD', borderRadius: 13, borderWidth: 1, borderColor: '#E3EDF2', paddingHorizontal: 13, fontSize: 13, color: TEXTO, marginBottom: 17 },
  inputErro: { borderColor: '#E65D83' },
  linha: { flexDirection: 'row', gap: 11 },
  metade: { flex: 1 },
  erro: { color: '#E65D83', fontSize: 10, marginTop: -12, marginBottom: 10 },
  observacoes: { minHeight: 94, paddingTop: 13 },
  aviso: { fontSize: 10, color: '#91A0AA', marginBottom: 17 },
  botaoSalvar: { height: 50, borderRadius: 15, backgroundColor: ROSA, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  botaoDesabilitado: { opacity: 0.6 },
  textoSalvar: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
