import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

type Orientacao = {
  id: string;
  titulo: string;
  categoria: string;
  icone?: string;
  introducao?: string;
  dicas?: string[];
  lembrete?: string;
};

type NomeIcone = React.ComponentProps<typeof Ionicons>['name'];
const ROSA = '#FF7FA3';
const AZUL = '#42A5D5';
const TEXTO = '#334A5F';
const categorias: { nome: string; descricao: string; icone: NomeIcone; cor: string; fundo: string }[] = [
  { nome: 'Crise Sensorial', descricao: 'Acolhimento e estratégias', icone: 'options-outline', cor: AZUL, fundo: '#EAF7FC' },
  { nome: 'Comunicação', descricao: 'Conexão e expressão', icone: 'chatbubble-ellipses-outline', cor: ROSA, fundo: '#FFF0F5' },
  { nome: 'Rotinas', descricao: 'Organização do dia a dia', icone: 'time-outline', cor: AZUL, fundo: '#EAF7FC' },
  { nome: 'Direitos', descricao: 'Informações e benefícios', icone: 'document-text-outline', cor: ROSA, fundo: '#FFF0F5' },
];

function iconeCategoria(categoria: string): NomeIcone {
  return categorias.find((item) => item.nome === categoria)?.icone ?? 'book-outline';
}

export default function OrientacoesScreen() {
  const [busca, setBusca] = useState('');
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    async function carregar() {
      try {
        const resultado = await getDocs(collection(db, 'orientacoes'));
        if (ativo) setOrientacoes(resultado.docs.map((documento) => ({
          id: documento.id,
          ...(documento.data() as Omit<Orientacao, 'id'>),
        })));
      } catch (erro) {
        console.log('Erro ao carregar orientações:', erro);
        if (ativo) Alert.alert('Erro', 'Não foi possível carregar as orientações.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    setCarregando(true);
    carregar();
    return () => { ativo = false; };
  }, []));

  const textoBusca = busca.trim().toLocaleLowerCase('pt-BR');
  const pesquisando = textoBusca.length > 0;
  const resultados = useMemo(() => orientacoes.filter((item) => {
    const conteudo = [item.titulo, item.introducao, item.categoria, ...(item.dicas ?? []), item.lembrete]
      .filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    return conteudo.includes(textoBusca);
  }), [orientacoes, textoBusca]);

  function abrirOrientacao(id: string) {
    router.push({ pathname: '/orientacao-detalhes', params: { id } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.decoracao}>
        <View style={styles.bolaRosa} />
        <View style={styles.bolaAzul} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Pressable style={styles.voltar} onPress={() => router.back()} accessibilityLabel="Voltar">
            <Ionicons name="chevron-back" size={22} color={ROSA} />
          </Pressable>
          <Text style={styles.titulo}>Orientações</Text>
          <View style={styles.espaco} />
        </View>

        <View style={styles.introducao}>
          <View style={styles.introducaoIcone}><Ionicons name="book-outline" size={22} color={ROSA} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.introducaoTitulo}>Informação que acolhe</Text>
            <Text style={styles.introducaoTexto}>Encontre orientações para diferentes momentos da rotina.</Text>
          </View>
        </View>

        <View style={styles.busca}>
          <Ionicons name="search-outline" size={19} color={AZUL} />
          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar orientações..."
            placeholderTextColor="#96A5AF"
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
          {pesquisando && (
            <Pressable onPress={() => setBusca('')} style={styles.limpar} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={19} color="#9AAAB3" />
            </Pressable>
          )}
        </View>

        {pesquisando ? (
          <>
            <View style={styles.linhaTitulo}>
              <Text style={styles.tituloSecao}>Resultados</Text>
              <Text style={styles.contador}>{resultados.length} encontrado{resultados.length === 1 ? '' : 's'}</Text>
            </View>
            {resultados.length === 0 ? (
              <View style={styles.vazio}>
                <Ionicons name="search-outline" size={27} color={AZUL} />
                <Text style={styles.vazioTitulo}>Nenhuma orientação encontrada</Text>
                <Text style={styles.vazioTexto}>Tente pesquisar por outro termo.</Text>
              </View>
            ) : resultados.map((item, index) => (
              <Pressable key={item.id} style={styles.cardOrientacao} onPress={() => abrirOrientacao(item.id)}>
                <View style={[styles.iconeCard, { backgroundColor: index % 2 === 0 ? '#EAF7FC' : '#FFF0F5' }]}>
                  <Ionicons name={iconeCategoria(item.categoria)} size={22} color={index % 2 === 0 ? AZUL : ROSA} />
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.categoriaCard}>{item.categoria}</Text>
                  <Text style={styles.nomeCard} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={styles.resumoCard} numberOfLines={2}>{item.introducao || 'Toque para conhecer esta orientação.'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#A4B3BD" />
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.tituloSecao}>Explore por categoria</Text>
            <View style={styles.grade}>
              {categorias.map((categoria) => (
                <Pressable
                  key={categoria.nome}
                  style={[styles.cardCategoria, { backgroundColor: categoria.fundo }]}
                  onPress={() => router.push({ pathname: '/lista-orientacoes', params: { categoria: categoria.nome } })}
                >
                  <View style={styles.linhaCategoria}>
                    <View style={styles.iconeCategoria}><Ionicons name={categoria.icone} size={21} color={categoria.cor} /></View>
                    <Ionicons name="arrow-forward-outline" size={14} color={categoria.cor} />
                  </View>
                  <Text style={styles.nomeCategoria}>{categoria.nome}</Text>
                  <Text style={styles.descricaoCategoria} numberOfLines={2}>{categoria.descricao}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.linhaTitulo}>
              <Text style={styles.tituloSecao}>Orientações disponíveis</Text>
              <Text style={styles.contador}>{orientacoes.length}</Text>
            </View>
            {carregando ? (
              <Text style={styles.mensagem}>Carregando orientações...</Text>
            ) : orientacoes.length === 0 ? (
              <View style={styles.vazio}>
                <Ionicons name="book-outline" size={27} color={AZUL} />
                <Text style={styles.vazioTitulo}>Nenhuma orientação cadastrada</Text>
                <Text style={styles.vazioTexto}>As orientações aparecerão aqui quando forem publicadas.</Text>
              </View>
            ) : orientacoes.map((item, index) => (
              <Pressable key={item.id} style={styles.cardOrientacao} onPress={() => abrirOrientacao(item.id)}>
                <View style={[styles.iconeCard, { backgroundColor: index % 2 === 0 ? '#EAF7FC' : '#FFF0F5' }]}>
                  <Ionicons name={iconeCategoria(item.categoria)} size={22} color={index % 2 === 0 ? AZUL : ROSA} />
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.categoriaCard}>{item.categoria}</Text>
                  <Text style={styles.nomeCard} numberOfLines={2}>{item.titulo}</Text>
                  <Text style={styles.resumoCard} numberOfLines={2}>{item.introducao || 'Toque para conhecer esta orientação.'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#A4B3BD" />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FCFE' },
  decoracao: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  bolaRosa: { position: 'absolute', width: 230, height: 160, borderRadius: 120, backgroundColor: '#FFE9F1', top: -85, left: -75 },
  bolaAzul: { position: 'absolute', width: 240, height: 160, borderRadius: 125, backgroundColor: '#E4F6FC', top: -90, right: -90 },
  conteudo: { paddingHorizontal: 20, paddingBottom: 45 },
  cabecalho: { marginTop: 9, marginBottom: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voltar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  espaco: { width: 36 },
  titulo: { fontSize: 18, fontWeight: '700', color: TEXTO },
  introducao: { backgroundColor: '#FFF1F6', borderRadius: 19, borderWidth: 1, borderColor: '#FFE4ED', padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  introducaoIcone: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#FFE3ED', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  introducaoTitulo: { fontSize: 13, fontWeight: '700', color: TEXTO, marginBottom: 4 },
  introducaoTexto: { fontSize: 11, lineHeight: 16, color: '#7E8F9B' },
  busca: { height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6F0F5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 24 },
  inputBusca: { flex: 1, fontSize: 13, color: TEXTO, marginLeft: 9 },
  limpar: { padding: 5 },
  tituloSecao: { fontSize: 15, fontWeight: '700', color: TEXTO, marginBottom: 13 },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { fontSize: 12, color: AZUL, fontWeight: '700', marginBottom: 13 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  cardCategoria: { width: '48.5%', minHeight: 118, borderRadius: 18, padding: 13, marginBottom: 10, justifyContent: 'space-between' },
  linhaCategoria: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  iconeCategoria: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#FFFFFFAA', alignItems: 'center', justifyContent: 'center' },
  nomeCategoria: { fontSize: 12, fontWeight: '700', color: TEXTO, marginBottom: 4 },
  descricaoCategoria: { fontSize: 10, lineHeight: 14, color: '#7B8D98' },
  cardOrientacao: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#EDF3F6' },
  iconeCard: { width: 45, height: 45, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoCard: { flex: 1, paddingRight: 8 },
  categoriaCard: { fontSize: 10, fontWeight: '600', color: AZUL, marginBottom: 3 },
  nomeCard: { fontSize: 13, fontWeight: '700', color: TEXTO, marginBottom: 3 },
  resumoCard: { fontSize: 11, lineHeight: 15, color: '#81919B' },
  vazio: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 28, alignItems: 'center' },
  vazioTitulo: { fontSize: 13, fontWeight: '700', color: TEXTO, marginTop: 10, textAlign: 'center' },
  vazioTexto: { fontSize: 11, color: '#81919B', marginTop: 5, textAlign: 'center' },
  mensagem: { color: '#81919B', fontSize: 12, textAlign: 'center', paddingVertical: 20 },
});
