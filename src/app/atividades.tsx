import { Ionicons } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';

import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';

import { useCallback, useMemo, useState } from 'react';

import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../config/firebase';



type Registro = {

  id: string;

  titulo?: string;

  categoria?: string;

  data?: string;

  horario?: string;

  descricao?: string;

  observacoes?: string;

  tipo?: string;

};



type Icone = React.ComponentProps<typeof Ionicons>['name'];



const AZUL = '#42A5D5';

const ROSA = '#FF7FA3';

const TEXTO = '#30475D';

const categorias = ['Todas', 'Comunicação', 'Alimentação', 'Escola', 'Sensorial', 'Rotina', 'Outros'];

const filtros = ['Todos', 'Conquistas', 'Dificuldades', 'Momentos'];



function tipoRegistro(item: Registro) {

  const valor = (item.tipo || '').trim().toLowerCase();

  if (valor === 'conquista') return 'Conquista';

  if (valor === 'dificuldade') return 'Dificuldade';

  if (valor === 'momento' || valor === 'momento do dia a dia') return 'Momento';

  return 'Registro';

}



function iconeCategoria(categoria?: string): Icone {

  switch (categoria) {

    case 'Comunicação': return 'chatbubble-ellipses-outline';

    case 'Alimentação': return 'restaurant-outline';

    case 'Escola': return 'school-outline';

    case 'Sensorial': return 'options-outline';

    case 'Rotina': return 'repeat-outline';

    default: return 'book-outline';

  }

}



function chaveData(item: Registro) {

  const partes = (item.data || '').split('/');

  if (partes.length === 3) {

    const [dia, mes, ano] = partes;

    return `${ano.padStart(4, '0')}${mes.padStart(2, '0')}${dia.padStart(2, '0')}${(item.horario || '').replace(':', '').padStart(4, '0')}`;

  }

  return `${item.data || ''}${item.horario || ''}`;

}



export default function AtividadesScreen() {

  const [registros, setRegistros] = useState<Registro[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [filtro, setFiltro] = useState('Todos');

  const [categoria, setCategoria] = useState('Todas');
  const [areasAbertas, setAreasAbertas] = useState(false);



  const carregarRegistros = useCallback(async () => {

    try {

      const usuario = auth.currentUser;

      if (!usuario) {

        setRegistros([]);

        return;

      }

      const referencia = collection(db, 'usuarios', usuario.uid, 'atividades');

      const resultado = await getDocs(referencia);

      const lista: Registro[] = resultado.docs.map((documento) => ({

        ...(documento.data() as Omit<Registro, 'id'>),

        id: documento.id,

      }));

      lista.sort((a, b) => chaveData(b).localeCompare(chaveData(a)));

      setRegistros(lista);

    } catch (erro) {

      console.log('Erro ao carregar diário:', erro);

      Alert.alert('Erro', 'Não foi possível carregar os registros do diário.');

    } finally {

      setCarregando(false);

    }

  }, []);



  useFocusEffect(useCallback(() => {

    setCarregando(true);

    void carregarRegistros();

  }, [carregarRegistros]));



  const registrosFiltrados = useMemo(() => registros.filter((item) => {

    const tipo = tipoRegistro(item);

    const correspondeTipo = filtro === 'Todos' ||

      (filtro === 'Conquistas' && tipo === 'Conquista') ||

      (filtro === 'Dificuldades' && tipo === 'Dificuldade') ||

      (filtro === 'Momentos' && tipo === 'Momento');

    const correspondeCategoria = categoria === 'Todas' || item.categoria === categoria;

    return correspondeTipo && correspondeCategoria;

  }), [registros, filtro, categoria]);



  async function excluirRegistro(id: string) {

    try {

      const usuario = auth.currentUser;

      if (!usuario) {

        Alert.alert('Acesso necessário', 'Entre na sua conta para continuar.');

        return;

      }

      await deleteDoc(doc(db, 'usuarios', usuario.uid, 'atividades', id));

      setRegistros((atual) => atual.filter((item) => item.id !== id));

    } catch (erro) {

      console.log('Erro ao excluir registro:', erro);

      Alert.alert('Erro', 'Não foi possível excluir o registro.');

    }

  }



  function confirmarExclusao(item: Registro) {

    Alert.alert('Excluir registro', 'Deseja realmente excluir este registro do diário?', [

      { text: 'Cancelar', style: 'cancel' },

      { text: 'Excluir', style: 'destructive', onPress: () => void excluirRegistro(item.id) },

    ]);

  }



  function abrirOpcoes(item: Registro) {

    Alert.alert(item.titulo || 'Registro do diário', 'O que deseja fazer?', [

      {

        text: 'Editar',

        onPress: () => router.push({ pathname: '/nova-atividade', params: { id: item.id } }),

      },

      { text: 'Excluir', style: 'destructive', onPress: () => confirmarExclusao(item) },

      { text: 'Cancelar', style: 'cancel' },

    ]);

  }



  return (

    <SafeAreaView style={styles.container}>

      <View pointerEvents="none" style={styles.decoracao}>

        <View style={styles.rosaTopo} />

        <View style={styles.azulTopo} />

        <View style={styles.rosaBaixo} />

        <View style={styles.azulBaixo} />

      </View>



      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>

        <View style={styles.cabecalho}>

          <Pressable onPress={() => router.replace('/home')} style={styles.voltar} accessibilityLabel="Voltar para início">

            <Ionicons name="chevron-back" size={22} color={ROSA} />

          </Pressable>

          <Text style={styles.tituloPagina}>Meu Diário</Text>

          <View style={styles.espacoCabecalho} />

        </View>



        <View style={styles.introducao}>

          <View style={styles.iconeIntroducao}>

            <Ionicons name="book-outline" size={25} color={ROSA} />

          </View>

          <View style={styles.introducaoTexto}>

            <Text style={styles.introducaoTitulo}>Cada momento importa</Text>

            <Text style={styles.introducaoSubtitulo}>Guarde conquistas, desafios e momentos especiais da rotina.</Text>

          </View>

        </View>



        <View style={styles.cabecalhoSecao}>

          <View>

            <Text style={styles.tituloSecao}>Registros do dia a dia</Text>

            <Text style={styles.subtituloSecao}>Um histórico para acompanhar com carinho.</Text>

          </View>

          <Text style={styles.contador}>{registros.length}</Text>

        </View>



        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosRolagem} contentContainerStyle={styles.filtros}>
          {filtros.map((opcao) => (
            <Pressable key={opcao} onPress={() => setFiltro(opcao)} style={[styles.filtro, filtro === opcao && styles.filtroAtivo]}>
              <Text style={[styles.filtroTexto, filtro === opcao && styles.filtroTextoAtivo]}>{opcao}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.categoriasLinha}>
          <Text style={styles.categoriasRotulo}>Filtrar por área</Text>
          <Pressable
            style={[styles.seletorArea, areasAbertas && styles.seletorAreaAberto]}
            onPress={() => setAreasAbertas((aberto) => !aberto)}
            accessibilityRole="button"
            accessibilityLabel={`Área: ${categoria === 'Todas' ? 'Todas as áreas' : categoria}`}
            accessibilityState={{ expanded: areasAbertas }}
          >
            <View style={styles.seletorAreaEsquerda}>
              <Ionicons name="options-outline" size={18} color={AZUL} />
              <Text style={styles.seletorAreaTexto}>{categoria === 'Todas' ? 'Todas as áreas' : categoria}</Text>
            </View>
            <Ionicons name={areasAbertas ? 'chevron-up' : 'chevron-down'} size={18} color="#77909D" />
          </Pressable>
          {areasAbertas && (
            <View style={styles.listaAreas}>
              {categorias.map((opcao, indice) => (
                <Pressable
                  key={opcao}
                  style={[styles.opcaoArea, indice < categorias.length - 1 && styles.opcaoAreaDivisoria]}
                  onPress={() => { setCategoria(opcao); setAreasAbertas(false); }}
                  accessibilityRole="button"
                >
                  <Text style={[styles.opcaoAreaTexto, categoria === opcao && styles.opcaoAreaAtiva]}>
                    {opcao === 'Todas' ? 'Todas as áreas' : opcao}
                  </Text>
                  {categoria === opcao && <Ionicons name="checkmark" size={18} color={AZUL} />}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {carregando ? (

          <View style={styles.vazio}><Text style={styles.vazioTexto}>Carregando seu diário...</Text></View>

        ) : registrosFiltrados.length === 0 ? (

          <View style={styles.vazio}>

            <View style={styles.vazioIcone}><Ionicons name="book-outline" size={29} color={AZUL} /></View>

            <Text style={styles.vazioTitulo}>{registros.length === 0 ? 'Seu diário começa aqui' : 'Nenhum registro neste filtro'}</Text>

            <Text style={styles.vazioTexto}>{registros.length === 0 ? 'Registre uma conquista, uma dificuldade ou um momento importante.' : 'Experimente selecionar outro tipo ou categoria.'}</Text>

          </View>

        ) : (

          <View style={styles.lista}>

            {registrosFiltrados.map((item) => {

              const tipo = tipoRegistro(item);

              const rosa = tipo === 'Conquista' || tipo === 'Momento';

              return (

                <View key={item.id} style={styles.registro}>

                  <View style={[styles.registroIcone, rosa ? styles.fundoRosa : styles.fundoAzul]}>

                    <Ionicons name={tipo === 'Conquista' ? 'sparkles-outline' : tipo === 'Dificuldade' ? 'leaf-outline' : iconeCategoria(item.categoria)} size={22} color={rosa ? ROSA : AZUL} />

                  </View>

                  <View style={styles.registroConteudo}>

                    <View style={styles.registroTopo}>

                      <Text style={[styles.tipo, { color: rosa ? '#DC6B94' : '#368FBC' }]}>{tipo}</Text>

                      <Pressable style={styles.opcoes} onPress={() => abrirOpcoes(item)} accessibilityLabel="Opções do registro">

                        <Ionicons name="ellipsis-horizontal" size={21} color="#8B9CA7" />

                      </Pressable>

                    </View>

                    <Text style={styles.registroTitulo}>{item.titulo || 'Momento registrado'}</Text>

                    {!!item.descricao && <Text style={styles.registroDescricao}>{item.descricao}</Text>}

                    {!!item.observacoes && <Text style={styles.registroObservacoes}>{item.observacoes}</Text>}

                    <View style={styles.metadados}>

                      {!!item.categoria && <Text style={styles.metadado}>{item.categoria}</Text>}

                      {!!item.data && <Text style={styles.metadado}>{item.data}{item.horario ? ` · ${item.horario}` : ''}</Text>}

                    </View>

                  </View>

                </View>

              );

            })}

          </View>

        )}

      </ScrollView>



      <View style={styles.rodapeAcao}>

        <Pressable style={styles.botaoNovo} onPress={() => router.push('/nova-atividade')}>

          <Ionicons name="add" size={22} color="#FFFFFF" />

          <Text style={styles.botaoNovoTexto}>Novo registro</Text>

        </Pressable>

      </View>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#F9FCFD' },

  decoracao: {

    position: 'absolute',

    top: 0,

    bottom: 0,

    left: 0,

    right: 0,

    overflow: 'hidden',

},

  rosaTopo: { position: 'absolute', top: -115, left: -100, width: 275, height: 240, borderRadius: 140, backgroundColor: '#FCE8F0' },

  azulTopo: { position: 'absolute', top: -120, right: -110, width: 280, height: 230, borderRadius: 145, backgroundColor: '#E5F5FC' },

  rosaBaixo: { position: 'absolute', bottom: -150, left: -120, width: 310, height: 235, borderRadius: 160, backgroundColor: '#FCE8F0' },

  azulBaixo: { position: 'absolute', bottom: -145, right: -130, width: 320, height: 240, borderRadius: 160, backgroundColor: '#E5F5FC' },

  conteudo: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 110 },

  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 38 },

  voltar: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },

  tituloPagina: { color: TEXTO, fontSize: 19, fontWeight: '700' },

  espacoCabecalho: { width: 39 },

  introducao: { backgroundColor: '#FFF0F5', borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', marginBottom: 28, borderWidth: 1, borderColor: '#FBE3EB' },

  iconeIntroducao: { width: 49, height: 49, borderRadius: 16, backgroundColor: '#FFE1EC', alignItems: 'center', justifyContent: 'center', marginRight: 13 },

  introducaoTexto: { flex: 1 },

  introducaoTitulo: { color: TEXTO, fontSize: 15, fontWeight: '700', marginBottom: 5 },

  introducaoSubtitulo: { color: '#788B97', fontSize: 11, lineHeight: 16 },

  cabecalhoSecao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },

  tituloSecao: { color: TEXTO, fontSize: 17, fontWeight: '700' },

  subtituloSecao: { color: '#8799A4', fontSize: 11, marginTop: 4 },

  contador: { color: AZUL, fontSize: 13, fontWeight: '700' },

  filtrosRolagem: { marginBottom: 16, flexGrow: 0 },
  filtros: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  filtro: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#E7EFF3', alignItems: 'center' },
  filtroAtivo: { backgroundColor: ROSA, borderColor: ROSA },
  filtroTexto: { color: '#6C8190', fontSize: 12, fontWeight: '600' },
  filtroTextoAtivo: { color: '#FFFFFF' },
  categoriasLinha: { marginBottom: 20 },
  categoriasRotulo: { color: '#748A98', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  seletorArea: { minHeight: 47, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E3EDF2', borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seletorAreaAberto: { borderColor: '#A8D9EE' },
  seletorAreaEsquerda: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seletorAreaTexto: { fontSize: 13, fontWeight: '600', color: TEXTO },
  listaAreas: { marginTop: 7, backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#E3EDF2', overflow: 'hidden' },
  opcaoArea: { paddingHorizontal: 15, minHeight: 43, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  opcaoAreaDivisoria: { borderBottomWidth: 1, borderBottomColor: '#F0F4F6' },
  opcaoAreaTexto: { color: '#617889', fontSize: 13 },
  opcaoAreaAtiva: { color: AZUL, fontWeight: '700' },

  lista: { gap: 13 },

  registro: { backgroundColor: '#FFFFFF', borderRadius: 21, padding: 17, flexDirection: 'row', borderWidth: 1, borderColor: '#EDF3F6' },

  registroIcone: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },

  fundoRosa: { backgroundColor: '#FFF0F5' },

  fundoAzul: { backgroundColor: '#EAF7FC' },

  registroConteudo: { flex: 1 },

  registroTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  tipo: { fontSize: 10, fontWeight: '700' },

  opcoes: { paddingHorizontal: 6, paddingVertical: 3 },

  registroTitulo: { color: TEXTO, fontSize: 14, fontWeight: '700', marginTop: 3 },

  registroDescricao: { color: '#647A89', fontSize: 12, lineHeight: 19, marginTop: 8 },

  registroObservacoes: { color: '#80919C', fontSize: 11, lineHeight: 17, marginTop: 7 },

  metadados: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },

  metadado: { color: '#92A1AA', fontSize: 10 },

  vazio: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#EDF3F6' },

  vazioIcone: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#EAF7FC', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },

  vazioTitulo: { color: TEXTO, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 6 },

  vazioTexto: { color: '#8396A2', fontSize: 12, lineHeight: 18, textAlign: 'center' },

  rodapeAcao: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 13, backgroundColor: '#F9FCFD', borderTopWidth: 1, borderTopColor: '#EAF0F3' },

  botaoNovo: { backgroundColor: ROSA, height: 48, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, elevation: 2 },

  botaoNovoTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

});
