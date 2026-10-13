import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../config/firebase';

type OrientacaoDetalhada = {
  id: string;
  titulo: string;
  categoria: string;
  icone?: string;
  introducao?: string;
  dicas?: string[];
  lembrete?: string;
};

const ROSA = '#FF7FA3';
const AZUL = '#42A5D5';
const TEXTO = '#344B5E';

function iconeCategoria(categoria?: string): keyof typeof Ionicons.glyphMap {
  switch (categoria) {
    case 'Crise Sensorial': return 'options-outline';
    case 'Comunicação': return 'chatbubble-ellipses-outline';
    case 'Rotinas': return 'time-outline';
    case 'Direitos': return 'document-text-outline';
    case 'Comportamento': return 'people-outline';
    default: return 'book-outline';
  }
}

export default function OrientacaoDetalhesScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [orientacao, setOrientacao] = useState<OrientacaoDetalhada | null>(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      try {
        if (!id) {
          if (ativo) setOrientacao(null);
          return;
        }
        const resultado = await getDoc(doc(db, 'orientacoes', id));
        if (ativo) {
          setOrientacao(resultado.exists()
            ? { id: resultado.id, ...(resultado.data() as Omit<OrientacaoDetalhada, 'id'>) }
            : null);
        }
      } catch (erro) {
        console.log('Erro ao carregar orientação:', erro);
        if (ativo) setOrientacao(null);
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [id]));

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.decoracao}>
        <View style={styles.bolaRosa} />
        <View style={styles.bolaAzul} />
      </View>
      <View style={styles.cabecalho}>
        <Pressable style={styles.voltar} onPress={() => router.back()} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={22} color={AZUL} />
        </Pressable>
        <Text style={styles.tituloCabecalho}>Orientação</Text>
        <View style={{ width: 36 }} />
      </View>
      {carregando ? (
        <View style={styles.estado}>
          <Ionicons name="book-outline" size={32} color={AZUL} />
          <Text style={styles.estadoTitulo}>Carregando orientação...</Text>
        </View>
      ) : !orientacao ? (
        <View style={styles.estado}>
          <Ionicons name="alert-circle-outline" size={34} color={AZUL} />
          <Text style={styles.estadoTitulo}>Orientação não encontrada</Text>
          <Text style={styles.estadoDescricao}>Não foi possível abrir este conteúdo.</Text>
          <Pressable style={styles.botaoVoltar} onPress={() => router.back()}>
            <Text style={styles.botaoVoltarTexto}>Voltar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.conteudo}>
          <View style={styles.apresentacao}>
            <View style={styles.iconePrincipal}>
              <Ionicons name={iconeCategoria(orientacao.categoria)} size={25} color={AZUL} />
            </View>
            <View style={styles.apresentacaoTexto}>
              <Text style={styles.categoria}>{orientacao.categoria || 'Orientação'}</Text>
              <Text style={styles.titulo}>{orientacao.titulo}</Text>
            </View>
          </View>

          <View style={styles.secao}>
            <View style={styles.tituloLinha}>
              <Ionicons name="information-circle-outline" size={20} color={AZUL} />
              <Text style={styles.tituloSecao}>Entenda</Text>
            </View>
            <Text style={styles.paragrafo}>{orientacao.introducao?.trim() || 'Nenhuma introdução cadastrada.'}</Text>
          </View>

          <View style={styles.secao}>
            <View style={styles.tituloLinha}>
              <Ionicons name="bulb-outline" size={20} color={ROSA} />
              <Text style={styles.tituloSecao}>O que pode ajudar?</Text>
            </View>
            {Array.isArray(orientacao.dicas) && orientacao.dicas.length > 0 ? (
              orientacao.dicas.map((dica, index) => (
                <View key={index} style={styles.dica}>
                  <View style={styles.numero}><Text style={styles.numeroTexto}>{index + 1}</Text></View>
                  <Text style={styles.textoDica}>{dica}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.paragrafo}>Nenhuma dica cadastrada.</Text>
            )}
          </View>

          <View style={styles.lembrete}>
            <View style={styles.lembreteIcone}>
              <Ionicons name="bookmark-outline" size={21} color={ROSA} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lembreteTitulo}>Lembre-se</Text>
              <Text style={styles.lembreteTexto}>{orientacao.lembrete?.trim() || 'Nenhum lembrete cadastrado.'}</Text>
            </View>
          </View>

          <Pressable style={styles.botaoVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={18} color="#FFFFFF" />
            <Text style={styles.botaoVoltarTexto}>Voltar às orientações</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FCFD' },
  decoracao: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, overflow: 'hidden' },
  bolaRosa: { position: 'absolute', width: 230, height: 180, borderRadius: 120, top: -100, left: -65, backgroundColor: '#FFEAF1' },
  bolaAzul: { position: 'absolute', width: 245, height: 180, borderRadius: 130, top: -105, right: -80, backgroundColor: '#E6F7FC' },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 8, marginBottom: 26 },
  voltar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  tituloCabecalho: { fontSize: 17, fontWeight: '700', color: TEXTO },
  conteudo: { paddingHorizontal: 20, paddingBottom: 40 },
  apresentacao: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF1F6', borderRadius: 19, padding: 16, marginBottom: 22, gap: 12 },
  iconePrincipal: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  apresentacaoTexto: { flex: 1 },
  categoria: { fontSize: 11, fontWeight: '700', color: AZUL, marginBottom: 4 },
  titulo: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: TEXTO },
  secao: { backgroundColor: '#FFFFFF', borderRadius: 19, padding: 18, marginBottom: 13, borderWidth: 1, borderColor: '#EDF2F5' },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 },
  tituloSecao: { fontSize: 15, fontWeight: '700', color: TEXTO },
  paragrafo: { fontSize: 13, lineHeight: 21, color: '#607582' },
  dica: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 13, gap: 11 },
  numero: { width: 25, height: 25, borderRadius: 13, backgroundColor: '#E8F7FC', justifyContent: 'center', alignItems: 'center' },
  numeroTexto: { fontSize: 11, fontWeight: '700', color: AZUL },
  textoDica: { flex: 1, fontSize: 13, lineHeight: 20, color: '#607582' },
  lembrete: { flexDirection: 'row', backgroundColor: '#FFF1F6', borderRadius: 19, padding: 17, gap: 11, marginTop: 2, marginBottom: 22 },
  lembreteIcone: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  lembreteTitulo: { fontSize: 14, fontWeight: '700', color: TEXTO, marginBottom: 5 },
  lembreteTexto: { fontSize: 12, lineHeight: 19, color: '#607582' },
  botaoVoltar: { height: 51, backgroundColor: ROSA, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  botaoVoltarTexto: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  estado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 25 },
  estadoTitulo: { fontSize: 16, fontWeight: '700', color: TEXTO, marginTop: 12, textAlign: 'center' },
  estadoDescricao: { fontSize: 12, color: '#81919B', marginTop: 6, marginBottom: 20, textAlign: 'center' },
});
