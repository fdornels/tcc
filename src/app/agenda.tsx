import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';

type Compromisso = {
  id: string;
  titulo: string;
  tipo: string;
  data: string;
  horario: string;
  local: string;
  observacoes: string;
};

const ROSA = '#FF7FA3';
const AZUL = '#42A5D5';
const TEXTO = '#354C60';
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function dataDoCompromisso(valor: string): Date | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor ?? '');
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;
  return data;
}

function iconeDoTipo(tipo?: string): keyof typeof Ionicons.glyphMap {
  const t = (tipo ?? '').toLowerCase();
  if (t.includes('fono')) return 'chatbubble-ellipses-outline';
  if (t.includes('terapia')) return 'heart-outline';
  if (t.includes('consulta')) return 'medkit-outline';
  if (t.includes('escola')) return 'school-outline';
  return 'calendar-outline';
}

export default function AgendaScreen() {
  const hoje = new Date();
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState(hoje.getDate());

  const carregarCompromissos = useCallback(async () => {
    try {
      const usuario = auth.currentUser;
      if (!usuario) { setCompromissos([]); return; }
      const resultado = await getDocs(collection(db, 'usuarios', usuario.uid, 'compromissos'));
      setCompromissos(resultado.docs.map((documento) => ({
        id: documento.id,
        ...(documento.data() as Omit<Compromisso, 'id'>),
      })));
    } catch (erro) {
      console.log('Erro ao carregar compromissos:', erro);
      Alert.alert('Erro', 'Não foi possível carregar os compromissos.');
    }
  }, []);

  useFocusEffect(useCallback(() => { void carregarCompromissos(); }, [carregarCompromissos]));

  async function excluirCompromisso(id: string) {
    try {
      const usuario = auth.currentUser;
      if (!usuario) { Alert.alert('Erro', 'Você precisa estar conectado(a).'); return; }
      await deleteDoc(doc(db, 'usuarios', usuario.uid, 'compromissos', id));
      setCompromissos((lista) => lista.filter((item) => item.id !== id));
    } catch (erro) {
      console.log('Erro ao excluir compromisso:', erro);
      Alert.alert('Erro', 'Não foi possível excluir o compromisso.');
    }
  }

  function confirmarExclusao(item: Compromisso) {
    Alert.alert('Excluir compromisso', `Deseja realmente excluir "${item.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluirCompromisso(item.id) },
    ]);
  }

  function abrirOpcoes(item: Compromisso) {
    Alert.alert(item.titulo, 'O que você deseja fazer?', [
      { text: 'Editar', onPress: () => router.push({ pathname: '/novo-compromisso', params: { id: item.id } }) },
      { text: 'Excluir', style: 'destructive', onPress: () => confirmarExclusao(item) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function mudarMes(direcao: number) {
    const novaData = new Date(anoAtual, mesAtual + direcao, 1);
    setMesAtual(novaData.getMonth());
    setAnoAtual(novaData.getFullYear());
    setDiaSelecionado(1);
  }

  const diasCalendario = useMemo(() => {
    const inicio = new Date(anoAtual, mesAtual, 1).getDay();
    const total = new Date(anoAtual, mesAtual + 1, 0).getDate();
    const dias: (number | null)[] = Array(inicio).fill(null);
    for (let dia = 1; dia <= total; dia++) dias.push(dia);
    return dias;
  }, [anoAtual, mesAtual]);

  const dataSelecionada = `${String(diaSelecionado).padStart(2, '0')}/${String(mesAtual + 1).padStart(2, '0')}/${anoAtual}`;
  const compromissosDoDia = compromissos.filter((item) => item.data === dataSelecionada)
    .sort((a, b) => (a.horario ?? '').localeCompare(b.horario ?? ''));

  const compromissosFuturos = compromissos.filter((item) => {
    const data = dataDoCompromisso(item.data);
    if (!data) return false;
    const hojeSemHora = new Date();
    hojeSemHora.setHours(0, 0, 0, 0);
    return data >= hojeSemHora;
  }).sort((a, b) => {
    const diferenca = (dataDoCompromisso(a.data)?.getTime() ?? 0) - (dataDoCompromisso(b.data)?.getTime() ?? 0);
    return diferenca || (a.horario ?? '').localeCompare(b.horario ?? '');
  });

  function renderizarCompromisso(item: Compromisso, prefixo: string) {
    return (
      <View key={`${prefixo}-${item.id}`} style={styles.compromisso}>
        <View style={styles.iconeCompromisso}>
          <Ionicons name={iconeDoTipo(item.tipo)} size={21} color={AZUL} />
        </View>
        <View style={styles.infoCompromisso}>
          <Text style={styles.nomeCompromisso} numberOfLines={2}>{item.titulo}</Text>
          <Text style={styles.dataCompromisso}>{item.data}  •  {item.horario}</Text>
          {!!item.local && <Text style={styles.localCompromisso} numberOfLines={1}>{item.local}</Text>}
        </View>
        <Pressable style={styles.botaoMais} onPress={() => abrirOpcoes(item)} accessibilityLabel={`Opções de ${item.titulo}`}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#9AAAB5" />
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.decoracaoFundo}>
        <View style={styles.manchaRosaTopo} />
        <View style={styles.manchaAzulTopo} />
      </View>

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <Pressable style={styles.botaoVoltar} onPress={() => router.replace('/home')}>
            <Ionicons name="chevron-back" size={22} color={ROSA} />
          </Pressable>
          <Text style={styles.titulo}>Minha Agenda</Text>
          <View style={styles.espacoCabecalho} />
        </View>

        <View style={styles.introducao}>
          <View style={styles.iconeIntro}><Ionicons name="calendar-clear-outline" size={22} color={AZUL} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tituloIntro}>Um dia de cada vez</Text>
            <Text style={styles.subtituloIntro}>Acompanhe seus compromissos com tranquilidade.</Text>
          </View>
        </View>

        <View style={styles.calendario}>
          <View style={styles.mesArea}>
            <Pressable style={styles.botaoMes} onPress={() => mudarMes(-1)}><Ionicons name="chevron-back" size={18} color={AZUL} /></Pressable>
            <Text style={styles.mes}>{MESES[mesAtual]} {anoAtual}</Text>
            <Pressable style={styles.botaoMes} onPress={() => mudarMes(1)}><Ionicons name="chevron-forward" size={18} color={AZUL} /></Pressable>
          </View>
          <View style={styles.diasSemana}>
            {SEMANA.map((dia, index) => <Text key={index} style={styles.diaSemana}>{dia}</Text>)}
          </View>
          <View style={styles.gradeCalendario}>
            {diasCalendario.map((dia, index) => {
              const dataDoDia = dia === null ? '' : `${String(dia).padStart(2, '0')}/${String(mesAtual + 1).padStart(2, '0')}/${anoAtual}`;
              const temCompromisso = dia !== null && compromissos.some((item) => item.data === dataDoDia);
              const selecionado = dia === diaSelecionado;
              const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
              return (
                <Pressable key={index} style={styles.diaContainer} disabled={dia === null} onPress={() => dia !== null && setDiaSelecionado(dia)}>
                  <View style={[styles.dia, ehHoje && !selecionado && styles.diaHoje, selecionado && styles.diaSelecionado]}>
                    <Text style={[styles.numeroDia, selecionado && styles.numeroSelecionado]}>{dia ?? ''}</Text>
                    {temCompromisso && <View style={[styles.bolinhaCompromisso, selecionado && styles.bolinhaSelecionada]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.legenda}><View style={styles.pontoLegenda} /><Text style={styles.textoLegenda}>Dia com compromisso</Text></View>
        </View>

        <View style={styles.tituloLinha}>
          <Text style={styles.tituloSecao}>Compromissos do dia</Text>
          <Text style={styles.dataSecao}>{String(diaSelecionado).padStart(2, '0')}/{String(mesAtual + 1).padStart(2, '0')}</Text>
        </View>
        {compromissosDoDia.length === 0 ? (
          <View style={styles.semCompromissos}>
            <View style={styles.iconeVazio}><Ionicons name="calendar-outline" size={23} color={AZUL} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.textoVazio}>Nenhum compromisso neste dia</Text>
              <Text style={styles.subtextoVazio}>Um espacinho livre na agenda.</Text>
            </View>
          </View>
        ) : compromissosDoDia.map((item) => renderizarCompromisso(item, 'dia'))}

        <View style={[styles.tituloLinha, { marginTop: 23 }]}>
          <Text style={styles.tituloSecao}>Próximos compromissos</Text>
          <Text style={styles.contador}>{compromissosFuturos.length}</Text>
        </View>
        {compromissosFuturos.length === 0 ? (
          <View style={styles.semCompromissos}><Text style={styles.subtextoVazio}>Nenhum compromisso futuro cadastrado.</Text></View>
        ) : compromissosFuturos.map((item) => renderizarCompromisso(item, 'futuro'))}
      </ScrollView>

      <Pressable style={styles.botaoAdicionar} onPress={() => router.push('/novo-compromisso')} accessibilityLabel="Adicionar compromisso">
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FCFD' },
  decoracaoFundo: { position: 'absolute', top: 0, right: 0, left: 0, height: 130, overflow: 'hidden' },
  manchaRosaTopo: { position: 'absolute', width: 235, height: 175, borderRadius: 120, backgroundColor: '#FFEAF1', top: -90, left: -75 },
  manchaAzulTopo: { position: 'absolute', width: 250, height: 180, borderRadius: 130, backgroundColor: '#E5F6FC', top: -100, right: -100 },
  conteudo: { paddingHorizontal: 19, paddingBottom: 135 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 37 },
  botaoVoltar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  titulo: { color: TEXTO, fontSize: 17, fontWeight: '700' },
  espacoCabecalho: { width: 36 },
  introducao: { backgroundColor: '#FFF0F5', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: '#FFE2EB' },
  iconeIntro: { width: 43, height: 43, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tituloIntro: { color: TEXTO, fontSize: 13, fontWeight: '700' },
  subtituloIntro: { color: '#8193A1', fontSize: 11, lineHeight: 16, marginTop: 3 },
  calendario: { backgroundColor: '#FFFFFF', borderRadius: 21, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 12, marginBottom: 22, borderWidth: 1, borderColor: '#EDF1F4' },
  mesArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  botaoMes: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2FAFD' },
  mes: { color: TEXTO, fontSize: 14, fontWeight: '700' },
  diasSemana: { flexDirection: 'row', marginBottom: 4 },
  diaSemana: { width: '14.2857%', textAlign: 'center', color: '#9AAAB5', fontSize: 10, fontWeight: '700' },
  gradeCalendario: { flexDirection: 'row', flexWrap: 'wrap' },
  diaContainer: { width: '14.2857%', alignItems: 'center', paddingVertical: 3 },
  dia: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  diaHoje: { borderWidth: 1, borderColor: '#FFD2E0' },
  diaSelecionado: { backgroundColor: ROSA },
  numeroDia: { color: '#526576', fontSize: 12, fontWeight: '500' },
  numeroSelecionado: { color: '#FFFFFF', fontWeight: '700' },
  bolinhaCompromisso: { width: 4, height: 4, borderRadius: 2, backgroundColor: ROSA, position: 'absolute', bottom: 3 },
  bolinhaSelecionada: { backgroundColor: '#FFFFFF' },
  legenda: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 6 },
  pontoLegenda: { width: 5, height: 5, borderRadius: 3, backgroundColor: ROSA },
  textoLegenda: { color: '#97A6B0', fontSize: 10 },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  tituloSecao: { color: TEXTO, fontSize: 15, fontWeight: '700' },
  dataSecao: { color: AZUL, fontSize: 12, fontWeight: '700' },
  contador: { color: AZUL, fontSize: 12, fontWeight: '700' },
  compromisso: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF1F4', borderRadius: 17, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center' },
  iconeCompromisso: { width: 43, height: 43, borderRadius: 13, backgroundColor: '#EAF7FC', alignItems: 'center', justifyContent: 'center' },
  infoCompromisso: { flex: 1, marginLeft: 12 },
  nomeCompromisso: { color: TEXTO, fontSize: 13, fontWeight: '700' },
  dataCompromisso: { color: '#7F919E', fontSize: 11, marginTop: 5 },
  localCompromisso: { color: AZUL, fontSize: 11, marginTop: 4 },
  botaoMais: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center' },
  semCompromissos: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF1F4', borderRadius: 17, paddingVertical: 17, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeVazio: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EAF7FC', alignItems: 'center', justifyContent: 'center' },
  textoVazio: { color: TEXTO, fontSize: 12, fontWeight: '700' },
  subtextoVazio: { color: '#8B9BA7', fontSize: 11, marginTop: 4 },
  botaoAdicionar: { position: 'absolute', right: 23, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: ROSA, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: ROSA, shadowOpacity: 0.2, shadowRadius: 9, shadowOffset: { width: 0, height: 4 } },
});
